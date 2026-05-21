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

// Web3Forms access key — public-by-design (client-side key, rate-limited
// per key by Web3Forms themselves).  Pulled from a build-time env so it
// can be rotated without code edits; hardcoded fallback lets local dev
// + sandbox builds work without the env being set.
const WEB3FORMS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY ??
  "19ec57f5-b47c-4c14-ae51-870605335a5b";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    // Capture the form element synchronously — React's synthetic event
    // currentTarget can read as null after any await, even though pooling
    // is off in React 18.  Belt-and-braces.
    const formEl = ev.currentTarget;
    const ref = genRef();
    const record: TicketRecord = {
      ref,
      topic,
      subject: subject.trim(),
      date: new Date().toISOString(),
    };

    setSubmitting(true);
    setSubmitError(null);

    // Build FormData from the form element — picks up every named
    // input + hidden field (access_key, redirect, from_name, name,
    // email, topic, order_or_lot, subject, message) declaratively
    // from the DOM, so view-source confirms the integration without
    // reading JS bundles.  Then we OVERRIDE `subject` with the
    // greppable `[ref] topic — user-subject` form for the Zoho
    // inbox, and `.set("ref", ref)` so the body carries the ticket
    // reference.
    try {
      const fd = new FormData(formEl);
      fd.set("subject", `[${ref}] ${topic} — ${subject.trim()}`);
      fd.set("ref", ref);

      const res = await fetch(WEB3FORMS_ENDPOINT, { method: "POST", body: fd });
      const data: { success?: boolean; message?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(
          typeof data.message === "string" && data.message
            ? data.message
            : `Submit failed (HTTP ${res.status}).`,
        );
      }

      // Persist locally only AFTER a confirmed delivery — keeps the
      // "recent requests" list aligned with what actually reached
      // the inbox.
      const next = [record, ...recent].slice(0, 5);
      setRecent(next);
      try {
        window.localStorage.setItem(TICKETS_KEY, JSON.stringify(next));
      } catch {
        /* non-fatal */
      }
      setTicket(record);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong sending your request.",
      );
    } finally {
      setSubmitting(false);
    }
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
    "w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 font-sans text-[15px] text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25";
  const labelBase =
    "mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-60";
  const errBase = "mt-1.5 font-sans text-[12px] font-medium text-alert";

  return (
    <div className="bg-bone">
      <div className="layout-content pt-9 pb-28 md:pt-14 md:pb-20">
        <div className="mx-auto max-w-[620px]">
          {/* ── Header — compact, centred ── */}
          <header className="text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-amber">
              Support
            </p>
            <h1 className="mt-3 font-sans text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink md:text-[40px]">
              How can we help?
            </h1>
            <p className="mx-auto mt-3 max-w-[46ch] font-sans text-[14px] leading-relaxed text-ink-muted md:text-[15px]">
              Open a request and the PurePep research team replies within one
              business day.
            </p>
          </header>

          {/* ── PRIMARY: support request portal ── */}
          <section className="mt-8">
            {ticket ? (
              <div className="rounded-2xl border border-ink/12 bg-surface p-5 shadow-sm md:p-7">
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
                action={WEB3FORMS_ENDPOINT}
                method="POST"
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-ink/12 bg-surface p-5 shadow-sm md:p-7"
              >
                {/* Web3Forms wiring — declarative so view-source confirms
                    the integration without inspecting JS bundles.  The
                    onSubmit handler intercepts with preventDefault and
                    runs an async fetch so the in-page success card +
                    ticket ref UX still works; the action/method are the
                    no-JS graceful degradation path. */}
                <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
                <input type="hidden" name="redirect" value="false" />
                <input type="hidden" name="from_name" value={name.trim() || "PurePep support form"} />
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
                      name="name"
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
                      name="email"
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
                      name="topic"
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
                      name="order_or_lot"
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
                    name="subject"
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
                    name="message"
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
                  disabled={submitting}
                  aria-busy={submitting}
                  className="mt-7 inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-amber px-6 py-4 font-sans text-[15px] font-bold text-ink shadow-sm transition hover:bg-amber-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send request"}{" "}
                  <span aria-hidden="true">→</span>
                </button>
                {submitError && (
                  <p
                    role="alert"
                    className="mt-3 font-sans text-[13px] leading-relaxed text-alert"
                  >
                    Couldn&rsquo;t send: {submitError} You can also email{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="font-medium underline"
                    >
                      {SUPPORT_EMAIL}
                    </a>{" "}
                    directly.
                  </p>
                )}
                <p className="mt-3 font-sans text-[12px] leading-relaxed text-ink-40">
                  Sends directly to the PurePep research team. You&rsquo;ll
                  get a reference number to track this request. All products
                  are sold for research use only.
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
                <ul className="overflow-hidden rounded-xl border border-ink/12">
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

          {/* ── Channel strip — compact, secondary ── */}
          <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="rounded-xl border border-ink/12 bg-surface px-4 py-3.5 no-underline transition-colors hover:bg-surface-3"
            >
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-40">
                Email
              </span>
              <span className="mt-1 block font-sans text-[13.5px] font-bold text-ink">
                {SUPPORT_EMAIL}
              </span>
            </a>
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="rounded-xl border border-ink/12 bg-surface px-4 py-3.5 no-underline transition-colors hover:bg-surface-3"
            >
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-40">
                Phone
              </span>
              <span className="mt-1 block font-sans text-[13.5px] font-bold text-ink">
                {SUPPORT_PHONE_DISPLAY}
              </span>
            </a>
            <div className="rounded-xl border border-ink/12 bg-surface px-4 py-3.5">
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-40">
                Hours
              </span>
              <span className="mt-1 block font-sans text-[13.5px] font-bold text-ink">
                Mon–Fri · 9–17 · 1 business day
              </span>
            </div>
          </section>

          {/* ── Self-serve — demoted, last ── */}
          <section className="mt-10">
            <p className="mb-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-60">
              Prefer to self-serve?
            </p>
            <div className="overflow-hidden rounded-xl border border-ink/12 bg-surface">
              {HELP_LINKS.map((h, i) => (
                <Link
                  key={h.href}
                  href={h.href}
                  className={`flex items-center gap-4 px-4 py-3.5 no-underline transition-colors hover:bg-surface-3 ${
                    i > 0 ? "border-t border-ink/10" : ""
                  }`}
                >
                  <span className="font-mono text-[11px] font-semibold text-ink-40">
                    {h.num}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sans text-[14px] font-bold text-ink">
                      {h.title}
                    </span>
                    <span className="block font-sans text-[12.5px] leading-snug text-ink-muted">
                      {h.body}
                    </span>
                  </span>
                  <span aria-hidden="true" className="font-sans text-[15px] text-ink-40">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <p className="mt-8 text-center font-sans text-[12px] leading-relaxed text-ink-40">
            PurePep peptides are sold strictly for in vitro laboratory
            research. Not for human or veterinary use.
          </p>
        </div>
      </div>
    </div>
  );
}
