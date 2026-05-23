const DEFAULT_ITEMS = [
  "99.5%+ Purity",
  "Third-Party Tested",
  "2–3 Day Shipping",
  "Secure Checkout",
  "Free over $200",
];

export function TrustBar({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  return (
    <div className="v3-trust-bar" aria-label="Trust signals">
      <div className="v3-trust-bar-inner">
        {items.map((item) => (
          <div key={item} className="v3-trust-bar-item">
            <span className="v3-trust-dot" aria-hidden="true" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
