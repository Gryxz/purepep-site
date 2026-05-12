<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Repository;

use PurePep\Affiliate\Schema;

final class CommissionsRepository
{
    public function findById(int $id): ?array
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $id),
            ARRAY_A
        );
        return $row ?: null;
    }

    public function findByOrder(int $orderId): ?array
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE order_id = %d", $orderId),
            ARRAY_A
        );
        return $row ?: null;
    }

    public function create(array $data): int
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        $now = current_time('mysql', true);

        $payload = [
            'code_id' => (int) $data['code_id'],
            'user_id' => (int) $data['user_id'],
            'order_id' => (int) $data['order_id'],
            'source' => (string) $data['source'],
            'subtotal_basis_cents' => (int) $data['subtotal_basis_cents'],
            'commission_cents' => (int) $data['commission_cents'],
            'currency' => (string) ($data['currency'] ?? 'USD'),
            'status' => (string) ($data['status'] ?? 'pending'),
            'created_at' => $now,
        ];
        $formats = ['%d', '%d', '%d', '%s', '%d', '%d', '%s', '%s', '%s'];

        $ok = $wpdb->insert($table, $payload, $formats);
        if (!$ok) {
            throw new \RuntimeException('Failed to insert commission.');
        }
        return (int) $wpdb->insert_id;
    }

    public function approve(int $id): bool
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        $now = current_time('mysql', true);
        $result = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table}
                 SET status = 'approved', approved_at = %s
                 WHERE id = %d AND status = 'pending'",
                $now,
                $id
            )
        );
        return (int) $result > 0;
    }

    public function reverse(int $id, string $reason): bool
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        $now = current_time('mysql', true);
        $reason = mb_substr($reason, 0, 255);
        $result = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table}
                 SET status = 'reversed', reversed_at = %s, reversed_reason = %s
                 WHERE id = %d AND status IN ('pending', 'approved')",
                $now,
                $reason,
                $id
            )
        );
        return (int) $result > 0;
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, total: int, limit: int, offset: int}
     */
    public function listForUser(int $userId, ?string $status, int $limit, int $offset): array
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        $limit = max(1, min(100, $limit));
        $offset = max(0, $offset);

        if ($status !== null && in_array($status, ['pending', 'approved', 'reversed'], true)) {
            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$table}
                     WHERE user_id = %d AND status = %s
                     ORDER BY id DESC LIMIT %d OFFSET %d",
                    $userId,
                    $status,
                    $limit,
                    $offset
                ),
                ARRAY_A
            );
            $total = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$table} WHERE user_id = %d AND status = %s",
                    $userId,
                    $status
                )
            );
        } else {
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
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$table} WHERE user_id = %d",
                    $userId
                )
            );
        }

        return [
            'items' => is_array($items) ? $items : [],
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ];
    }

    /**
     * Admin-facing list with multiple optional filters.
     *
     * @return array{items: array<int, array<string, mixed>>, total: int, limit: int, offset: int}
     */
    public function adminList(array $filters, int $limit, int $offset): array
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        $limit = max(1, min(100, $limit));
        $offset = max(0, $offset);

        $where = ['1=1'];
        $params = [];

        if (!empty($filters['status']) && in_array($filters['status'], ['pending', 'approved', 'reversed'], true)) {
            $where[] = 'status = %s';
            $params[] = $filters['status'];
        }
        if (!empty($filters['user_id'])) {
            $where[] = 'user_id = %d';
            $params[] = (int) $filters['user_id'];
        }
        if (!empty($filters['order_id'])) {
            $where[] = 'order_id = %d';
            $params[] = (int) $filters['order_id'];
        }

        $whereSql = implode(' AND ', $where);

        $countSql = "SELECT COUNT(*) FROM {$table} WHERE {$whereSql}";
        $listSql = "SELECT * FROM {$table} WHERE {$whereSql} ORDER BY id DESC LIMIT %d OFFSET %d";

        $total = $params === []
            ? (int) $wpdb->get_var($countSql)
            : (int) $wpdb->get_var($wpdb->prepare($countSql, $params));

        $listParams = array_merge($params, [$limit, $offset]);
        $items = $wpdb->get_results($wpdb->prepare($listSql, $listParams), ARRAY_A);

        return [
            'items' => is_array($items) ? $items : [],
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ];
    }

    public function approvedBalanceCents(int $userId): int
    {
        global $wpdb;
        $commissions = Schema::tableCommissions();
        $payouts = Schema::tablePayouts();

        $approvedSum = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE(SUM(commission_cents), 0) FROM {$commissions}
                 WHERE user_id = %d AND status = 'approved'",
                $userId
            )
        );
        $reservedSum = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE(SUM(amount_cents), 0) FROM {$payouts}
                 WHERE user_id = %d AND status IN ('requested', 'paid')",
                $userId
            )
        );
        return max(0, $approvedSum - $reservedSum);
    }

    public function pendingBalanceCents(int $userId): int
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE(SUM(commission_cents), 0) FROM {$table}
                 WHERE user_id = %d AND status = 'pending'",
                $userId
            )
        );
    }

    public function lifetimePaidCents(int $userId): int
    {
        global $wpdb;
        $payouts = Schema::tablePayouts();
        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE(SUM(amount_cents), 0) FROM {$payouts}
                 WHERE user_id = %d AND status = 'paid'",
                $userId
            )
        );
    }

    public function attributedOrdersCount(int $userId): int
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table}
                 WHERE user_id = %d AND status IN ('pending', 'approved')",
                $userId
            )
        );
    }

    public function grossReferredRevenueCents(int $userId): int
    {
        global $wpdb;
        $table = Schema::tableCommissions();
        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE(SUM(subtotal_basis_cents), 0) FROM {$table}
                 WHERE user_id = %d AND status IN ('pending', 'approved')",
                $userId
            )
        );
    }
}
