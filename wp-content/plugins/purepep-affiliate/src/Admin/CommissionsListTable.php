<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Admin;

use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Support\Money;
use WP_List_Table;

if (!function_exists('convert_to_screen')) {
    require_once ABSPATH . 'wp-admin/includes/screen.php';
}
if (!class_exists(WP_List_Table::class)) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

final class CommissionsListTable extends WP_List_Table
{
    public function __construct(private CommissionsRepository $commissions)
    {
        parent::__construct([
            'singular' => 'commission',
            'plural' => 'commissions',
            'ajax' => false,
        ]);
    }

    public function get_columns(): array
    {
        return [
            'cb' => '<input type="checkbox" />',
            'id' => __('ID', 'purepep-affiliate'),
            'affiliate' => __('Affiliate', 'purepep-affiliate'),
            'order' => __('Order', 'purepep-affiliate'),
            'source' => __('Source', 'purepep-affiliate'),
            'basis' => __('Basis', 'purepep-affiliate'),
            'commission' => __('Commission', 'purepep-affiliate'),
            'status' => __('Status', 'purepep-affiliate'),
            'created' => __('Created', 'purepep-affiliate'),
        ];
    }

    public function get_bulk_actions(): array
    {
        return [
            'reverse' => __('Reverse', 'purepep-affiliate'),
        ];
    }

    public function prepare_items(): void
    {
        $perPage = 25;
        $page = max(1, (int) ($_GET['paged'] ?? 1));
        $offset = ($page - 1) * $perPage;

        $filters = [
            'status' => isset($_GET['status']) ? sanitize_text_field(wp_unslash((string) $_GET['status'])) : null,
            'user_id' => isset($_GET['user_id']) ? (int) $_GET['user_id'] : null,
            'order_id' => isset($_GET['order_id']) ? (int) $_GET['order_id'] : null,
        ];

        $result = $this->commissions->adminList($filters, $perPage, $offset);
        $this->items = $result['items'];
        $this->set_pagination_args(['total_items' => $result['total'], 'per_page' => $perPage]);
        $this->_column_headers = [$this->get_columns(), [], []];
    }

    public function column_cb($item): string
    {
        if (!is_array($item)) {
            return '';
        }
        return '<input type="checkbox" name="ids[]" value="' . esc_attr((string) (int) $item['id']) . '" />';
    }

    public function column_default($item, $column_name): string
    {
        if (!is_array($item)) {
            return '';
        }
        switch ($column_name) {
            case 'id':
                return esc_html((string) (int) $item['id']);
            case 'affiliate':
                $u = get_userdata((int) $item['user_id']);
                return $u
                    ? esc_html($u->display_name) . ' <small>#' . esc_html((string) $u->ID) . '</small>'
                    : esc_html('#' . $item['user_id']);
            case 'order':
                $orderId = (int) $item['order_id'];
                $url = admin_url('post.php?post=' . $orderId . '&action=edit');
                return '<a href="' . esc_url($url) . '">#' . esc_html((string) $orderId) . '</a>';
            case 'source':
                return esc_html((string) $item['source']);
            case 'basis':
                return esc_html(Money::formatCents((int) $item['subtotal_basis_cents']));
            case 'commission':
                return esc_html(Money::formatCents((int) $item['commission_cents']));
            case 'status':
                return '<span class="pp-aff-status pp-aff-status-' . esc_attr((string) $item['status']) . '">'
                    . esc_html((string) $item['status']) . '</span>';
            case 'created':
                return esc_html((string) $item['created_at']);
            default:
                return '';
        }
    }
}
