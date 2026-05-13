---
slug: business-info
title: Business information block
updated: 2026-05-13
---

# Business information block

The merchant-facing identity shown in the site footer, on the contact page, and in transactional emails. Bankful underwriting requires this to be visible from any page of the site.

```
{{LEGAL_ENTITY}} (d/b/a PurePep)
{{BUSINESS_ADDRESS}}
Customer service: {{SUPPORT_EMAIL}}
Customer service phone: {{SUPPORT_PHONE}}
Hours: Monday–Friday, {{SUPPORT_HOURS}} {{SUPPORT_TZ}}
Billing descriptor: {{BILLING_DESCRIPTOR}}
```

## Placement requirements

- **Footer** — show legal entity, address, and customer service email on every page.
- **Contact page** — show all fields above.
- **Order confirmation and shipment confirmation emails** — include legal entity, address, support email, and support phone.
- **Order receipt PDF (if generated)** — same as above plus billing descriptor.

## Why each field matters for Bankful

| Field | Why Bankful asks for it |
|---|---|
| Legal entity | Must match the underwriting application. |
| Business address | Verifiable physical location, not a PO box. |
| Support email | Domain must match the website domain. |
| Support phone | Live or voicemail in the stated hours, returning calls same business day. |
| Support hours | Sets expectations for response time; reduces chargebacks. |
| Billing descriptor | Must appear identically on the statement and on the receipt so cardholders recognize the charge. |
