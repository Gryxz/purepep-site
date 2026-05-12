<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Support;

final class Money
{
    public static function dollarsToCents(float|string $dollars): int
    {
        $value = is_string($dollars) ? (float) $dollars : $dollars;
        return (int) round($value * 100);
    }

    public static function centsToDollars(int $cents): float
    {
        return $cents / 100;
    }

    public static function formatCents(int $cents, string $currency = 'USD'): string
    {
        return sprintf('%s %s', number_format($cents / 100, 2, '.', ','), $currency);
    }

    /**
     * Apply a basis-points rate (e.g. 2000 = 20%) to a cents amount with
     * banker's rounding semantics via round().
     */
    public static function applyBps(int $cents, int $bps): int
    {
        return (int) round(($cents * $bps) / 10000);
    }
}
