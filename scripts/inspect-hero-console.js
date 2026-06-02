/* ─────────────────────────────────────────────────────────────────────
   Paste this into Safari Web Inspector → Console while viewing
   purepep.shop on your phone (or in desktop Safari/Chrome with mobile
   emulation).  It scrolls through the parallax in 8 steps and prints
   computed styles + bounding rects for every step.

   How to connect Safari Web Inspector to your phone:
     iPhone → Settings → Safari → Advanced → Web Inspector ON
     Mac    → plug in iPhone → Safari → Develop menu → [your iPhone]
              → purepep.shop tab → opens Web Inspector window
     Console tab → paste the code below → Enter

   Result: copy the entire console output and paste it back to me.
   That gives me exact CSS state + element positions at every scroll
   point — no more guessing from screenshots.
   ───────────────────────────────────────────────────────────────────── */

(async () => {
  const SELECTORS = [
    ".mob-heropx",
    ".mob-heropx-1",
    ".mob-heropx-2",
    ".mob-heropx-content-2",
    ".mob-heropx-vial-wrap",
    ".mob-heropx-brand-watermark",
    ".mob-heropx-cta-block",
  ];
  const KEYS = [
    "position",
    "display",
    "top",
    "bottom",
    "left",
    "transform",
    "width",
    "height",
    "margin-top",
    "padding-top",
    "padding-bottom",
    "justify-content",
    "align-items",
    "z-index",
    "opacity",
  ];

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  console.log(`viewport ${vw}×${vh}`);

  const STEPS = 8;
  const total = vh * 2;

  for (let i = 0; i <= STEPS; i++) {
    const y = Math.round((i / STEPS) * total);
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 250));

    const out = { step: i, scrollY: y, els: {} };
    for (const sel of SELECTORS) {
      const el = document.querySelector(sel);
      if (!el) {
        out.els[sel] = null;
        continue;
      }
      const cs = getComputedStyle(el);
      const computed = {};
      for (const k of KEYS) computed[k] = cs.getPropertyValue(k);
      const r = el.getBoundingClientRect();
      out.els[sel] = {
        rect: {
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height),
          width: Math.round(r.width),
        },
        computed,
      };
    }
    console.log(JSON.stringify(out));
  }

  console.log("DONE — copy everything above this line and send it back.");
  window.scrollTo(0, 0);
})();
