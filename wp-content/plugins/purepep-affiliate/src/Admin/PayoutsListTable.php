<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Admin;

use PurePep\Affiliate\Repository\PayoutsRepository;
use PurePep\Affiliate\Support\Money;
use WP_List_Table;

if (!class_exists(WP_List_Table::class)) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

final class PayoutsListTable extends WP_List_Table
{
    public function __construct(private PayoutsRepository $payouts)
    {
        parent::__construct([
            'singular' => 'payout',
            'plural' => 'payouts',
            'ajax' => false,
        ]);
    }

    public function get_columns(): array
    {
        return [
            'id' => __('ID', 'purepep-affiliate'),
            'affiliate' => __('Affiliate', 'purepep-affiliate'),
            'amount' => __('Amount', 'purepep-affiliate'),
            'status' => __('Status', 'purepep-affiliate'),
            'requested' => __('Requested', 'purepep-affiliate'),
            'paid' => __('Paid', 'purepep-affiliate'),
            'actions' => __('Actions', 'purepep-affiliate'),
        ];
    }

    public function prepare_items(): void
    {
        $perPage = 25;
        $page = max(1, (int) ($_GET['paged'] ?? 1));
        $offset = ($page - 1) * $perPage;
        $status = isset($_GET['status']) ? sanitize_text_field(wp_unslash((string) $_GET['status'])) : null;
        if ($status === '') {
            $status = null;
        }

        $result = $this->payouts->adminList($status, $perPage, $offset);
        $this->items = $result['items'];
        $this->set_pagination_args(['total_items' => $result['total'], 'per_page' => $perPage]);
        $this->_column_headers = [$this->get_columns(), [], []];
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
            case 'amount':
                return esc_html(Money::formatCents((int) $item['amount_cents'], (string) $item['currency']));
            case 'status':
                return '<span class="pp-aff-status pp-aff-status-' . esc_attr((string) $item['status']) . '">'
                    . esc_html((string) $item['status']) . '</span>';
            case 'requested':
                return esc_html((string) $item['requested_at']);
            case 'paid':
                return $item['paid_at'] ? esc_html((string) $item['paid_at']) : '&mdash;';
            case 'actions':
                if ((string) $item['status'] !== 'requested') {
                    return '&mdash;';
                }
                return $this->renderActions((int) $item['id']);
            default:
                return '';
        }
    }

    private function renderActions(int $payoutId): string
    {
        $payUrl = admin_url('admin-post.php');
        $payNonce = wp_nonce_field('pp_aff_payout_action_' . $payoutId, '_wpnonce', true, false);
        ob_start();
        ?>
        <form method="post" action="<?php echo esc_url($payUrl); ?>" style="display:inline-block;margin-right:8px">
            <?php echo $payNonce; ?>
            <input type="hidden" name="action" value="pp_aff_mark_paid" />
            <input type="hidden" name="payout_id" value="<?php echo esc_attr((string) $payoutId); ?>" />
            <input type="text" name="admin_note" maxlength="2000"
                   placeholder="<?php echo esc_attr__('Note (optional)', 'purepep-affiliate'); ?>"
                   style="width:140px" />
            <button type="submit" class="button button-primary">
                <?php echo esc_html__('Mark paid', 'purepep-affiliate'); ?>
            </button>
        </form>
        <form method="post" action="<?php echo esc_url($payUrl); ?>" style="display:inline-block">
            <?php echo wp_nonce_field('pp_aff_payout_action_' . $payoutId, '_wpnonce', true, false); ?>
            <input type="hidden" name="action" value="pp_aff_reject" />
            <input type="hidden" name="payout_id" value="<?php echo esc_attr((string) $payoutId); ?>" />
            <input type="text" name="admin_note" maxlength="2000" required
                   placeholder="<?php echo esc_attr__('Reason (required)', 'purepep-affiliate'); ?>"
                   style="width:140px" />
            <button type="submit" class="button">
                <?php echo esc_html__('Reject', 'purepep-affiliate'); ?>
            </button>
        </form>
        <?php
        return (string) ob_get_clean();
    }
}
