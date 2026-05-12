<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Repository;

use PurePep\Affiliate\Schema;
use PurePep\Affiliate\Support\CodeGenerator;

final class CodesRepository
{
    public function findById(int $id): ?array
    {
        global $wpdb;
        $table = Schema::tableCodes();
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $id),
            ARRAY_A
        );
        return $row ?: null;
    }

    public function findByCode(string $code): ?array
    {
        global $wpdb;
        $table = Schema::tableCodes();
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE code = %s", $code),
            ARRAY_A
        );
        return $row ?: null;
    }

    public function findActiveByCode(string $code): ?array
    {
        $row = $this->findByCode($code);
        if (!$row || $row['status'] !== 'active') {
            return null;
        }
        return $row;
    }

    public function getActiveForUser(int $userId): ?array
    {
        global $wpdb;
        $table = Schema::tableCodes();
        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE user_id = %d AND status = 'active' LIMIT 1",
                $userId
            ),
            ARRAY_A
        );
        return $row ?: null;
    }

    /**
     * Deactivate any active codes for a user.
     */
    public function deactivateAllForUser(int $userId): int
    {
        global $wpdb;
        $table = Schema::tableCodes();
        $result = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table} SET status = 'inactive' WHERE user_id = %d AND status = 'active'",
                $userId
            )
        );
        return (int) $result;
    }

    /**
     * Create a new active code for the user with collision retry.
     */
    public function createActiveForUser(int $userId, int $maxAttempts = 8): array
    {
        global $wpdb;
        $table = Schema::tableCodes();
        $now = current_time('mysql', true);

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $code = CodeGenerator::generate();
            $inserted = $wpdb->insert(
                $table,
                [
                    'user_id' => $userId,
                    'code' => $code,
                    'status' => 'active',
                    'created_at' => $now,
                ],
                ['%d', '%s', '%s', '%s']
            );
            if ($inserted) {
                $id = (int) $wpdb->insert_id;
                $row = $this->findById($id);
                if ($row !== null) {
                    return $row;
                }
            }
            // else: assume UNIQUE collision on `code`; retry.
        }

        throw new \RuntimeException('Failed to generate a unique referral code.');
    }

    /**
     * Atomically replace the user's active code with a fresh one.
     */
    public function regenerateForUser(int $userId): array
    {
        $this->deactivateAllForUser($userId);
        return $this->createActiveForUser($userId);
    }
}
