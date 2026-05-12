<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Support;

final class CodeGenerator
{
    /** Unambiguous alphanumeric: excludes 0, O, 1, I. */
    private const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    private const LENGTH = 8;

    /**
     * Generate a single random 8-char code. Callers are responsible for
     * collision checks against persisted codes.
     */
    public static function generate(): string
    {
        $alphabet = self::ALPHABET;
        $max = strlen($alphabet) - 1;
        $out = '';
        for ($i = 0; $i < self::LENGTH; $i++) {
            $out .= $alphabet[random_int(0, $max)];
        }
        return $out;
    }

    public static function isWellFormed(string $code): bool
    {
        return (bool) preg_match('/^[A-Z0-9]{8}$/', $code);
    }

    public static function normalize(string $code): string
    {
        return strtoupper(trim($code));
    }
}
