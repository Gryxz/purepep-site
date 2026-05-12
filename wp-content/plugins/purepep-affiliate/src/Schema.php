<?php

declare(strict_types=1);

namespace PurePep\Affiliate;

final class Schema
{
    public const VERSION = '1';

    public static function tableCodes(): string
    {
        global $wpdb;
        return $wpdb->prefix . 'purepep_aff_codes';
    }

    public static function tableCommissions(): string
    {
        global $wpdb;
        return $wpdb->prefix . 'purepep_aff_commissions';
    }

    public static function tablePayouts(): string
    {
        global $wpdb;
        return $wpdb->prefix . 'purepep_aff_payouts';
    }

    /**
     * @return string[] DDL strings for dbDelta().
     */
    public static function ddl(): array
    {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        $codes = self::tableCodes();
        $commissions = self::tableCommissions();
        $payouts = self::tablePayouts();

        return [
            "CREATE TABLE {$codes} (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                user_id BIGINT UNSIGNED NOT NULL,
                code VARCHAR(8) NOT NULL,
                status VARCHAR(16) NOT NULL DEFAULT 'active',
                created_at DATETIME NOT NULL,
                PRIMARY KEY  (id),
                UNIQUE KEY uniq_code (code),
                KEY idx_user_status (user_id, status)
            ) {$charset};",

            "CREATE TABLE {$commissions} (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                code_id BIGINT UNSIGNED NOT NULL,
                user_id BIGINT UNSIGNED NOT NULL,
                order_id BIGINT UNSIGNED NOT NULL,
                source VARCHAR(16) NOT NULL,
                subtotal_basis_cents INT UNSIGNED NOT NULL,
                commission_cents INT UNSIGNED NOT NULL,
                currency CHAR(3) NOT NULL DEFAULT 'USD',
                status VARCHAR(16) NOT NULL,
                created_at DATETIME NOT NULL,
                approved_at DATETIME NULL DEFAULT NULL,
                reversed_at DATETIME NULL DEFAULT NULL,
                reversed_reason VARCHAR(255) NULL DEFAULT NULL,
                PRIMARY KEY  (id),
                UNIQUE KEY uniq_order (order_id),
                KEY idx_user_status (user_id, status),
                KEY idx_code (code_id)
            ) {$charset};",

            "CREATE TABLE {$payouts} (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                user_id BIGINT UNSIGNED NOT NULL,
                amount_cents INT UNSIGNED NOT NULL,
                currency CHAR(3) NOT NULL DEFAULT 'USD',
                status VARCHAR(16) NOT NULL,
                requested_at DATETIME NOT NULL,
                paid_at DATETIME NULL DEFAULT NULL,
                admin_note TEXT NULL DEFAULT NULL,
                admin_user_id BIGINT UNSIGNED NULL DEFAULT NULL,
                PRIMARY KEY  (id),
                KEY idx_user_status (user_id, status),
                KEY idx_status_requested (status, requested_at)
            ) {$charset};",
        ];
    }
}
