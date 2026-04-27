---
name: purepep-design
description: Use this skill to generate well-branded interfaces and assets for PurePep, a research-use-only peptide e-commerce brand, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

PurePep is a clinical, restrained, research-use-only peptide brand. Aesthetic anchors:
- Eggshell cream canvas, Carbon Black serif headings (Fraunces), Soft Blush surfaces, Rosy Copper used **sparingly** for one CTA per viewport.
- Locked 5-color palette — never introduce new hues.
- All copy is research-framed: never therapeutic, weight-loss, dosage, or wellness claims. No emoji. No exclamation marks. Sentence case for UI.
- Compliance phrases ("For research use only — not for human consumption.", "21+ qualified researchers only.", "All sales final. No refunds.") must appear on every product surface, verbatim.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and `ui_kits/storefront/` and create static HTML files for the user to view. Always link `colors_and_type.css` so type and color tokens are loaded.

If working on production code, read `README.md` (full visual + content rules), `colors_and_type.css` (tokens), and `ui_kits/storefront/*.jsx` (component patterns). Translate to your framework but preserve the locked palette, hairline borders, generous whitespace, and one-copper-CTA discipline.

If the user invokes this skill without any other guidance, ask them what they want to build or design (storefront page, vial label variant, slide deck, etc), ask some clarifying questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
