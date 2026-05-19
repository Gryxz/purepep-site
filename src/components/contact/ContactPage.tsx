"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * /contact — support ticket portal (Shopify-style help + contact form).
 *
 * The storefront is a static export (no server runtime), so the
 * "ticket" is created client-side: we mint a reference, persist a
 * lightweight record to localStorage so returning visitors see their
 * recent requests, and hand the fully-formatted request off to the
 * researcher's mail client via a pre-filled mailto to info@purepep.shop.
 * Single responsive component — desktop and mobile chrome are swapped
 * by the layout, the content here is identical on both by construction.
 */

const SUPPORT_EMAIL = "info@purepep.shop";
const SUPPORT_PHONE_DISPLAY = "(866) 212-6466";
const SUPPORT_PHONE_TEL = "+18662126466";
const TICKETS_KEY = "pp_support_tickets";

const TOPICS = [
  "Order status",
  "Shipping & delivery",
  "Certificate of Analysis / documentation",
  "Product question",
  "Returns & refunds",
  "Affiliate / referral program",
  "Researcher access & verification",
  "Something else",
] as const;

const HELP_LINKS: { href: string; num: string; title: string; body: string }[] =
  [
    {
      href: "/faq",
      num: "01",
      title: "FAQ",
      body: "Shipping, lot traceability, research-use terms, and payment.",
    },
    {
      href: "/quality#sample-coa",
      num: "02",
      title: "Certificates of Analysis",
      body: "Read a real COA and how every lot is tested.",
    },
    {
      href: "/documentation",
      num: "03",
      title: "Documentation",
      body: "Handling, reconstitution, and storage references.",
    },
    {
      href: "/researcher-access",
      num: "04",
      title: "Researcher access",
      body: "Verification for 21+ qualified researchers.",
    },
  ];

interface TicketRecord {
  ref: string;
  topic: string;
  subject: string;
  date: string;
}

function genRef(): string {
  const d = new Date();
  const ymd =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  let rand = "";
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 6; i++) {
    rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `PP-${ymd}-${rand}`;
}

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [recent, setRecent] = useState<TicketRecord[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TICKETS_KEY);
      if (raw) setRecent(JSON.parse(raw) as TicketRecord[]);
    } catch {
      /* localStorage unavailable — portal still works, just no history */
    }
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Enter your name.";
    if (!email.trim()) {
      e.email = "Enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Enter a valid email address.";
    }
    if (!subject.trim()) e.subject = "Add a short subject.";
    if (message.trim().length < 12) {
      e.message = "Tell us a little more (at least 12 characters).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildBody(ref: string): string {
    return [
      `Support reference: ${ref}`,
      `Topic: ${topic}`,
      orderRef.trim() ? `Order / lot #: ${orderRef.trim()}` : null,
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      "",
      "Message:",
      message.trim(),
      "",
      "—",
      "Sent from the PurePep support portal (purepep.shop/contact).",
      "Research use only. Not for human or veterinary use.",
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  function mailtoFor(ref: string): string {
    const subj = `[${ref}] ${topic} — ${subject.trim()}`;
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subj,
    )}&body=${encodeURIComponent(buildBody(ref))}`;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    const ref = genRef();
    const record: TicketRecord = {
      ref,
      topic,
      subject: subject.trim(),
      date: new Date().toISOString(),
    };

    const next = [record, ...recent].slice(0, 5);
    setRecent(next);
    try {
      window.localStorage.setItem(TICKETS_KEY, JSON.stringify(next));
    } catch {
      /* non-fatal */
    }

    setTicket(record);
    window.location.href = mailtoFor(ref);
  }

  async function copy(text: string, tag: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked — the value is still visible on screen */
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setOrderRef("");
    setTopic(TOPICS[0]);
    setSubject("");
    setMessage("");
    setErrors({});
    setTicket(null);
  }

  const inputBase =
    "w-full rounded-2xl border border-ink bg-bone px-4 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-amber";
  const labelBase =
    "mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink";
  const errBase = "mt-1 font-sans text-[12px] text-alert";

  return (
    <div className="bg-bone">
      <div className="layout-content py-12 md:py-16">
        {/* ── Header ── */}
        <header className="max-w-[680px]">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-60">
            Support
          </p>
          <h1 className="mt-3 font-sans text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink md:text-[44px]">
            How can we help?
          </h1>
          <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink-muted md:text-[16px]">
            Open a support request and the PurePep research team will reply
            within one business day. Order status, shipping, Certificates of
            Analysis, returns, and account questions all go to{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-ink underline decoration-amber underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            or call{" "}
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="font-medium text-ink underline decoration-amber underline-offset-2"
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>
            .
          </p>
        </header>

        {/* ── Quick help / deflection ── */}
        <section className="mt-10">
          <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-60">
            Find an answer fast
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HELP_LINKS.map((h) => (
              <Link
                key={h.href}
                href={h.href}
                className="group flex flex-col rounded-md border border-ink bg-surface p-5 no-underline transition-colors hover:bg-surface-3"
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">
                  {h.num}
                </span>
                <span className="mt-2 font-sans text-[16px] font-bold text-ink">
                  {h.title}
                </span>
                <span className="mt-1.5 font-sans text-[13px] leading-snug text-ink-muted">
                  {h.body}
                </span>
                <span className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                  Open <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Two-column: form + channel info ── */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Form / success */}
          <section>
            {ticket ? (
              <div className="rounded-md border border-ink bg-surface p-6 md:p-8">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald">
                  Request created
                </p>
                <h2 className="mt-2 font-sans text-[24px] font-extrabold tracking-[-0.01em] text-ink">
                  Your support reference
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-md border border-ink bg-bone px-4 py-2 font-mono text-[18px] font-semibold tracking-[0.06em] text-ink">
                    {ticket.ref}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(ticket.ref, "ref")}
                    className="cursor-pointer rounded-full border border-ink bg-transparent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink hover:bg-surface-3"
                  >
                    {copied === "ref" ? "Copied" : "Copy reference"}
                  </button>
                </div>
                <p className="mt-5 font-sans text-[14px] leading-relaxed text-ink-muted">
                  A pre-filled message to {SUPPORT_EMAIL} should have opened in
                  your email app. If it did not, email us directly and quote the
                  reference above — it links your message to this request.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={mailtoFor(ticket.ref)}
                    className="inline-flex items-center gap-2 rounded-full border border-ink bg-amber px-5 py-2.5 font-sans text-[14px] font-bold text-ink no-underline hover:bg-amber-hover"
                  >
                    Reopen email <span aria-hidden="true">→</span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      copy(
                        `Reference: ${ticket.ref}\nTopic: ${ticket.topic}\nSubject: ${ticket.subject}\nTo: ${SUPPORT_EMAIL}`,
                        "details",
                      )
                    }
                    className="cursor-pointer rounded-full border border-ink bg-transparent px-5 py-2.5 font-sans text-[14px] font-bold text-ink hover:bg-surface-3"
                  >
                    {copied === "details" ? "Copied" : "Copy ticket details"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="cursor-pointer border border-transparent bg-transparent px-2 py-2.5 font-sans text-[14px] font-semibold text-ink underline decoration-ink-40 underline-offset-2"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-md border border-ink bg-surface p-6 md:p-8"
              >
                <h2 className="font-sans text-[22px] font-extrabold tracking-[-0.01em] text-ink">
                  Open a support request
                </h2>
                <p className="mt-1.5 font-sans text-[13px] text-ink-muted">
                  Fields marked with an asterisk are required.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className={labelBase}>
                      Name *
                    </label>
                    <input
                      id="c-name"
                      className={inputBase}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                    {errors.name && <p className={errBase}>{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className={labelBase}>
                      Email *
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      className={inputBase}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                    {errors.email && <p className={errBase}>{errors.email}</p>}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-topic" className={labelBase}>
                      Topic *
                    </label>
                    <select
                      id="c-topic"
                      className={`${inputBase} appearance-none`}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    >
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-order" className={labelBase}>
                      Order or lot # (optional)
                    </label>
                    <input
                      id="c-order"
                      className={inputBase}
                      value={orderRef}
                      onChange={(e) => setOrderRef(e.target.value)}
                      placeholder="e.g. PP-1234 or RT-2604-A11"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="c-subject" className={labelBase}>
                    Subject *
                  </label>
                  <input
                    id="c-subject"
                    className={inputBase}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  {errors.subject && (
                    <p className={errBase}>{errors.subject}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="c-message" className={labelBase}>
                    How can we help? *
                  </label>
                  <textarea
                    id="c-message"
                    rows={6}
                    className={`${inputBase} resize-y`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  {errors.message && (
                    <p className={errBase}>{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-ink bg-amber px-7 py-3 font-sans text-[15px] font-bold text-ink hover:bg-amber-hover sm:w-auto"
                >
                  Create support request <span aria-hidden="true">→</span>
                </button>
                <p className="mt-3 font-sans text-[12px] leading-relaxed text-ink-40">
                  Submitting opens a pre-filled email to {SUPPORT_EMAIL} and
                  gives you a reference number to track this request. All
                  products are sold for research use only.
                </p>
              </form>
            )}

            {recent.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-60">
                  Your recent requests
                  <span className="ml-2 font-normal normal-case tracking-normal text-ink-40">
                    (saved on this device)
                  </span>
                </p>
                <ul className="overflow-hidden rounded-md border border-line">
                  {recent.map((r, i) => (
                    <li
                      key={r.ref}
                      className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-bone px-4 py-3 ${
                        i > 0 ? "border-t border-line" : ""
                      }`}
                    >
                      <span className="font-mono text-[12px] font-semibold tracking-[0.06em] text-ink">
                        {r.ref}
                      </span>
                      <span className="font-sans text-[13px] text-ink-muted">
                        {r.topic} — {r.subject}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-40">
                        {new Date(r.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Channel info */}
          <aside className="lg:pt-1">
            <div className="rounded-md border border-ink bg-bone p-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-60">
                Email
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-1 block font-sans text-[15px] font-bold text-ink no-underline"
              >
                {SUPPORT_EMAIL}
              </a>

              <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-60">
                Phone
              </p>
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="mt-1 block font-sans text-[15px] font-bold text-ink no-underline"
              >
                {SUPPORT_PHONE_DISPLAY}
              </a>

              <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-60">
                Response time
              </p>
              <p className="mt-1 font-sans text-[14px] text-ink">
                Within 1 business day
              </p>

              <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-60">
                Support hours
              </p>
              <p className="mt-1 font-sans text-[14px] text-ink">
                Mon–Fri · 9:00–17:00
              </p>

              <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-60">
                Order issues
              </p>
              <p className="mt-1 font-sans text-[14px] leading-relaxed text-ink-muted">
                Quote your order or lot number for the fastest resolution.
                Tracking is in your confirmation email.
              </p>
            </div>

            <p className="mt-4 font-sans text-[12px] leading-relaxed text-ink-40">
              PurePep peptides are sold strictly for in vitro laboratory
              research. Not for human or veterinary use.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
