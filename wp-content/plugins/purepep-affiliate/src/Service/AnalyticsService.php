<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Service;

/**
 * Server-side PostHog event emission. All capture calls are best-effort:
 * any failure is logged via error_log and swallowed. Never blocks business
 * logic. Silently no-ops when:
 *  - the PP_POSTHOG_API_KEY constant is missing/empty
 *  - the posthog/posthog-php package is not installed (class missing)
 */
final class AnalyticsService
{
    private bool $initialized = false;

    public function __construct(
        private bool $enabled,
        private string $apiKey,
        private string $host,
    ) {
    }

    public static function fromConfig(): self
    {
        $apiKey = '';
        if (defined('PP_POSTHOG_API_KEY')) {
            $apiKey = (string) constant('PP_POSTHOG_API_KEY');
        }
        $host = 'https://app.posthog.com';
        if (defined('PP_POSTHOG_HOST')) {
            $configured = (string) constant('PP_POSTHOG_HOST');
            if ($configured !== '') {
                $host = $configured;
            }
        }

        $enabled = $apiKey !== '' && class_exists('\\PostHog\\PostHog');
        return new self($enabled, $apiKey, $host);
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * @param array<string, mixed> $properties
     */
    public function capture(string $event, int $userId, array $properties = []): void
    {
        if (!$this->enabled) {
            return;
        }
        if ($userId <= 0) {
            return;
        }
        try {
            $this->ensureInitialized();
            \PostHog\PostHog::capture([
                'distinctId' => (string) $userId,
                'event' => $event,
                'properties' => $properties,
            ]);
        } catch (\Throwable $e) {
            error_log('[purepep-affiliate] PostHog capture failed: ' . $e->getMessage());
        }
    }

    public function flush(): void
    {
        if (!$this->enabled || !$this->initialized) {
            return;
        }
        try {
            \PostHog\PostHog::flush();
        } catch (\Throwable $e) {
            error_log('[purepep-affiliate] PostHog flush failed: ' . $e->getMessage());
        }
    }

    /**
     * Centralized helper so every commission-status transition emits
     * identically shaped properties.
     *
     * @param array<string, mixed> $commissionRow Pre-transition row.
     */
    public function captureCommissionStatusChange(
        array $commissionRow,
        string $toStatus,
        ?string $reason = null,
    ): void {
        $userId = (int) ($commissionRow['user_id'] ?? 0);
        if ($userId <= 0) {
            return;
        }
        $props = [
            'commission_id' => (int) ($commissionRow['id'] ?? 0),
            'order_id' => (int) ($commissionRow['order_id'] ?? 0),
            'from_status' => (string) ($commissionRow['status'] ?? ''),
            'to_status' => $toStatus,
        ];
        if ($reason !== null && $reason !== '') {
            $props['reason'] = $reason;
        }
        $this->capture('commission_status_changed', $userId, $props);
    }

    private function ensureInitialized(): void
    {
        if ($this->initialized) {
            return;
        }
        \PostHog\PostHog::init($this->apiKey, ['host' => $this->host]);
        $this->initialized = true;
    }
}
