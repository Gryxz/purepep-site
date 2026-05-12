<?php

declare(strict_types=1);

namespace PurePep\Affiliate;

final class Plugin
{
    private static ?self $instance = null;
    private bool $booted = false;

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function boot(): void
    {
        if ($this->booted) {
            return;
        }
        $this->booted = true;

        if (!$this->isEnabled()) {
            return;
        }

        // Hook wiring (REST, WC, admin) lands here in subsequent commits.
    }

    public function isEnabled(): bool
    {
        return (int) get_option('pp_aff_enabled', 1) === 1;
    }
}
