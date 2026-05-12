<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Repository;

use PurePep\Affiliate\Schema;

final class PayoutsRepository
{
    public function findById(int $id): ?array
    {
        global $wpdb;
        $table = Schema::tablePayouts();
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $id),
            ARRAY_A
        );
        return $row ?: null;
    }

    public function create(int $userId, int $amountCents, string $currency = 'USD'): int
    {
        global $wpdb;
        $table = Schema::tablePayouts();
        $now = current_time('mysql', true);
        $ok = $wpdb->insert(
            $table,
            [
                'user_id' => $userId,
                'amount_cents' => $amountCents,
                'currency' => $currency,
                'status' => 'requested',
                'requested_at' => $now,
            ],
            ['%d', '%d', '%s', '%s', '%s']
        );
        if (!$ok) {
            throw new \RuntimeException('Failed to create payout request.');
        }
        return (int) $wpdb->insert_id;
    }

    public function markPaid(int $id, int $adminUserId, ?string $adminNote): bool
    {
        global $wpdb;
        $table = Schema::tablePayouts();
        $now = current_time('mysql', true);
        $note = $adminNote !== null ? mb_substr($adminNote, 0, 2000) : null;

        $result = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table}
                 SET status = 'paid', paid_at = %s, admin_note = %s, admin_user_id = %d
                 WHERE id = %d AND status = 'requested'",
                $now,
                $note,
                $adminUserId,
                $id
            )
        );
        return (int) $result > 0;
    }

    public function reject(int $id, int $adminUserId, string $adminNote): bool
    {
        global $wpdb;
        $table = Schema::tablePayouts();
        $note = mb_substr($adminNote, 0, 2000);

        $result = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table}
                 SET status = 'rejected', admin_note = %s, admin_user_id = %d
                 WHERE id = %d AND status = 'requested'",
                $note,
                $adminUserId,
                $id
            )
        );
        return (int) $result > 0;
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, total: int, limit: int, offset: int}
     */
    public function listForUser(int $userId, int $limit, int $offset): array
    {
        global $wpdb;
        $table = Schema::tablePayouts();
        $limit = max(1, min(100, $limit));
        $offset = max(0, $offset);

        $items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table}
                 WHERE user_id = %d
                 ORDER BY id DESC LIMIT %d OFFSET %d",
                $userId,
                $limit,
                $offset
            ),
            ARRAY_A
        );
        $total = (int) $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE user_id = %d", $userId)
        );
        return [
            'items' => is_array($items) ? $items : [],
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ];
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, total: int, limit: int, offset: int}
     */
    public function adminList(?string $status, int $limit, int $offset): array
    {
        global $wpdb;
        $table = Schema::tablePayouts();
        $limit = max(1, min(100, $limit));
        $offset = max(0, $offset);

        if ($status !== null && in_array($status, ['requested', 'paid', 'rejected'], true)) {
            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$table}
                     WHERE status = %s
                     ORDER BY id DESC LIMIT %d OFFSET %d",
                    $status,
                    $limit,
                    $offset
                ),
                ARRAY_A
            );
            $total = (int) $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE status = %s", $status)
            );
        } else {
            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$table}
                     ORDER BY id DESC LIMIT %d OFFSET %d",
                    $limit,
                    $offset
                ),
                ARRAY_A
            );
            $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
        }

        return [
            'items' => is_array($items) ? $items : [],
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ];
    }

    /**
     * Sum of amounts in 'requested' state for a user (in-flight, locks balance).
     */
    public function reservedCents(int $userId): int
    {
        global $wpdb;
        $table = Schema::tablePayouts();
        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE(SUM(amount_cents), 0) FROM {$table}
                 WHERE user_id = %d AND status = 'requested'",
                $userId
            )
        );
    }
}
