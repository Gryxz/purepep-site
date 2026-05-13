<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Admin;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Schema;
use PurePep\Affiliate\Support\Money;
use WP_List_Table;

if (!function_exists('convert_to_screen')) {
    require_once ABSPATH . 'wp-admin/includes/screen.php';
}
if (!class_exists(WP_List_Table::class)) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

final class AffiliatesListTable extends WP_List_Table
{
    public function __construct(
        private CodesRepository $codes,
        private CommissionsRepository $commissions,
    ) {
        parent::__construct([
            'singular' => 'affiliate',
            'plural' => 'affiliates',
            'ajax' => false,
        ]);
    }

    public function get_columns(): array
    {
        return [
            'user' => __('User', 'purepep-affiliate'),
            'code' => __('Active code', 'purepep-affiliate'),
            'orders' => __('Orders', 'purepep-affiliate'),
            'gross' => __('Lifetime gross', 'purepep-affiliate'),
            'pending' => __('Pending', 'purepep-affiliate'),
            'approved' => __('Claimable', 'purepep-affiliate'),
            'paid' => __('Lifetime paid', 'purepep-affiliate'),
        ];
    }

    public function prepare_items(): void
    {
        global $wpdb;
        $table = Schema::tableCodes();
        $perPage = 25;
        $page = max(1, (int) ($_GET['paged'] ?? 1));
        $offset = ($page - 1) * $perPage;

        $search = isset($_GET['s']) ? sanitize_text_field(wp_unslash((string) $_GET['s'])) : '';

        $userIds = [];
        $total = 0;
        if ($search !== '') {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $userIds = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT ID FROM {$wpdb->users}
                     WHERE user_email LIKE %s OR user_login LIKE %s OR display_name LIKE %s",
                    $like,
                    $like,
                    $like
                )
            );
            $userIds = array_map('intval', $userIds ?: []);
            if ($userIds === []) {
                $userIdsByCode = $wpdb->get_col(
                    $wpdb->prepare(
                        "SELECT DISTINCT user_id FROM {$table} WHERE code LIKE %s",
                        $like
                    )
                );
                $userIds = array_map('intval', $userIdsByCode ?: []);
            }
            if ($userIds === []) {
                $this->items = [];
                $this->set_pagination_args(['total_items' => 0, 'per_page' => $perPage]);
                $this->_column_headers = [$this->get_columns(), [], []];
                return;
            }
            $placeholders = implode(',', array_fill(0, count($userIds), '%d'));
            $rows = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT DISTINCT user_id FROM {$table}
                     WHERE user_id IN ({$placeholders})
                     ORDER BY user_id ASC LIMIT %d OFFSET %d",
                    array_merge($userIds, [$perPage, $offset])
                ),
                ARRAY_A
            );
            $total = count($userIds);
        } else {
            $rows = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT DISTINCT user_id FROM {$table}
                     ORDER BY user_id ASC LIMIT %d OFFSET %d",
                    $perPage,
                    $offset
                ),
                ARRAY_A
            );
            $total = (int) $wpdb->get_var("SELECT COUNT(DISTINCT user_id) FROM {$table}");
        }

        $items = [];
        foreach ($rows ?: [] as $row) {
            $uid = (int) $row['user_id'];
            $active = $this->codes->getActiveForUser($uid);
            $items[] = [
                'user_id' => $uid,
                'code' => $active ? (string) $active['code'] : '',
                'orders' => $this->commissions->attributedOrdersCount($uid),
                'gross' => $this->commissions->grossReferredRevenueCents($uid),
                'pending' => $this->commissions->pendingBalanceCents($uid),
                'approved' => $this->commissions->approvedBalanceCents($uid),
                'paid' => $this->commissions->lifetimePaidCents($uid),
            ];
        }
        $this->items = $items;
        $this->set_pagination_args(['total_items' => $total, 'per_page' => $perPage]);
        $this->_column_headers = [$this->get_columns(), [], []];
    }

    public function column_default($item, $column_name): string
    {
        if (!is_array($item)) {
            return '';
        }
        switch ($column_name) {
            case 'user':
                $u = get_userdata((int) $item['user_id']);
                if (!$u) {
                    return esc_html('#' . $item['user_id']);
                }
                $url = get_edit_user_link((int) $item['user_id']);
                return '<a href="' . esc_url($url) . '">' . esc_html($u->display_name)
                    . '</a><br /><small>' . esc_html($u->user_email) . '</small>';
            case 'code':
                return $item['code'] !== '' ? '<code>' . esc_html($item['code']) . '</code>' : '&mdash;';
            case 'orders':
                return esc_html((string) (int) $item['orders']);
            case 'gross':
            case 'pending':
            case 'approved':
            case 'paid':
                return esc_html(Money::formatCents((int) $item[$column_name]));
            default:
                return '';
        }
    }
}
