import type { Config } from "tailwindcss";

/**
 * Tailwind v4 JS config — loaded via `@config "../../tailwind.config.ts"` in globals.css.
 *
 * Defines the brand color palette as theme.extend.colors so utilities like
 * bg-bone, text-ink, bg-amber, bg-surface-{2,3,4}, text-ink-{60,40,20} are
 * available.  These same values live in the @theme block in globals.css as
 * literal hex so grep(1) on the bundle confirms they landed.
 *
 * Safelisting is handled by @source inline() in globals.css (Tailwind v4
 * dropped safelist from the JS config in favour of the CSS directive).
 */
const config: Config = {
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: "#FAF7F0",
          soft: "#F5F1E6",
        },
        ink: {
          DEFAULT: "#1F1F1F",
          muted: "#6E6E6E",
          60: "rgb(31 31 31 / 60%)",
          40: "rgb(31 31 31 / 40%)",
          20: "rgb(31 31 31 / 20%)",
        },
        amber: {
          DEFAULT: "#DC9814",
          hover: "#BE840F",
        },
        surface: {
          DEFAULT: "#F1EDE3",
          2: "#F5F1EA",
          3: "#EFEAE0",
          4: "#E9E3D7",
        },
        blush: "#F2D7D7",
        line: "#E4DFCF",
        emerald: {
          DEFAULT: "#0F5132",
          soft: "#E8F0EB",
        },
        alert: {
          DEFAULT: "#C83E4D",
          soft: "#F7E4E6",
        },
      },
    },
  },
};

export default config;
