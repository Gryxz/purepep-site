<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Woo;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Service\AnalyticsService;
use PurePep\Affiliate\Support\CodeGenerator;
use PurePep\Affiliate\Support\Cookie;

/**
 * Captures ?ref=CODE on any front-end request and persists pp_ref. Last-touch
 * wins: a newer valid code overwrites any existing cookie.
 */
final class LandingHandler
{
    public function __construct(
        private CodesRepository $codes,
        private AnalyticsService $analytics,
    ) {
    }

    public function register(): void
    {
        add_action('init', [$this, 'handle'], 1);
    }

    public function handle(): void
    {
        if (is_admin() || (defined('DOING_AJAX') && DOING_AJAX) || (defined('REST_REQUEST') && REST_REQUEST)) {
            return;
        }
        if (!isset($_GET['ref'])) {
            return;
        }
        $raw = sanitize_text_field(wp_unslash((string) $_GET['ref']));
        $code = CodeGenerator::normalize($raw);
        if (!CodeGenerator::isWellFormed($code)) {
            return;
        }
        $row = $this->codes->findActiveByCode($code);
        if ($row === null) {
            return;
        }
        Cookie::set($code);
        $this->analytics->capture('affiliate_link_landed', (int) $row['user_id'], [
            'code' => $code,
            'source' => 'query_param',
        ]);
    }
}
