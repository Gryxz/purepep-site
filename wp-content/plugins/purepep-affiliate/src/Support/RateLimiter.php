<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Support;

/**
 * Transient-backed fixed-window rate limiter. Coarse but sufficient for v1
 * (one bucket per key per window). Storage: WP transients.
 */
final class RateLimiter
{
    /**
     * @return bool true if the request is allowed, false if over limit.
     */
    public static function hit(string $key, int $limit, int $windowSeconds): bool
    {
        $transientKey = 'pp_aff_rl_' . md5($key);
        $count = (int) get_transient($transientKey);

        if ($count >= $limit) {
            return false;
        }

        if ($count === 0) {
            set_transient($transientKey, 1, $windowSeconds);
        } else {
            set_transient($transientKey, $count + 1, $windowSeconds);
        }
        return true;
    }

    public static function clientIp(): string
    {
        // Trust REMOTE_ADDR only; we are not behind a proxy we control. If a
        // reverse-proxy header policy is added later, plumb it here.
        $remote = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
        $sanitized = filter_var($remote, FILTER_VALIDATE_IP);
        return $sanitized !== false ? (string) $sanitized : 'unknown';
    }
}
