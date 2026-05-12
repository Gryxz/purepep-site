<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Support;

final class Cookie
{
    public const NAME = 'pp_ref';

    public static function read(): ?string
    {
        if (!isset($_COOKIE[self::NAME])) {
            return null;
        }
        $raw = (string) $_COOKIE[self::NAME];
        $code = CodeGenerator::normalize(sanitize_text_field($raw));
        return CodeGenerator::isWellFormed($code) ? $code : null;
    }

    public static function set(string $code): void
    {
        if (headers_sent()) {
            return;
        }
        $days = (int) get_option('pp_aff_cookie_days', 30);
        if ($days <= 0) {
            $days = 30;
        }
        setcookie(
            self::NAME,
            $code,
            [
                'expires' => time() + ($days * DAY_IN_SECONDS),
                'path' => '/',
                'secure' => is_ssl(),
                'httponly' => false,
                'samesite' => 'Lax',
            ]
        );
        $_COOKIE[self::NAME] = $code;
    }

    public static function clear(): void
    {
        if (headers_sent()) {
            return;
        }
        setcookie(
            self::NAME,
            '',
            [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => is_ssl(),
                'httponly' => false,
                'samesite' => 'Lax',
            ]
        );
        unset($_COOKIE[self::NAME]);
    }
}
