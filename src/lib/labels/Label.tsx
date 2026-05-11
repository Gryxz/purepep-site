/* eslint-disable no-restricted-syntax -- the INK hex constant is
   brand data baked into the printed label, NOT app styling.  Tokens
   are for app-level theming; physical-label colors are spec'd in hex
   alongside the SKU manifest in ./skus.ts. */
/**
 * Canonical PurePep vial label — JSX template fed to Satori for the
 * deterministic label-render pipeline.
 *
 * Layout (1080 × 360, 12:4 aspect):
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ [P]                                          PUREPEP         │  ← header (60px)
 *   │                                                              │
 *   │     RETA                              [ 10 MG ]              │  ← compound + dose (160px)
 *   │     ──────                                                   │
 *   │     CAS 2381089-83-2                                         │  ← sub-line (40px)
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION           │  ← compliance band (60px)
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Typography: IBM Plex Mono throughout — Bold for compound code +
 * dose pill + wordmark, Regular for the CAS / chemical name / footer.
 *
 * Ink: dark navy / near-black (#0f1419) on every pastel bg for high
 * legibility regardless of label color.
 */

import * as React from "react";
import type { LabelSku } from "./skus";

const INK = "#0f1419"; // dark navy / near-black, the universal ink color
const CREAM = "#FAF7F0"; // label cream — glyph fill on ink block
const COMPLIANCE_TEXT = "FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION";

export interface LabelProps {
  sku: LabelSku;
  width?: number;
  height?: number;
  /**
   * When true, replaces the dose pill with the canonical τ glyph marker.
   * Used for AI product photography labels — keeps the inset block visually
   * consistent (same ink block, same position, same weight) without exposing
   * a specific dose, since photography labels are dose-agnostic.
   */
  photography?: boolean;
}

export function Label({ sku, width = 1080, height = 360, photography = false }: LabelProps) {
  const subline = sku.fullName
    ? `${sku.fullName} · CAS ${sku.cas}`
    : `CAS ${sku.cas}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width,
        height,
        background: sku.labelBg,
        color: INK,
        fontFamily: "IBM Plex Mono",
      }}
    >
      {/* HEADER strip — P icon left, PurePep wordmark right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px 0",
          height: 56,
        }}
      >
        {/* P icon — small dark square with white P */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            background: INK,
            color: sku.labelBg,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          P
        </div>
        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: INK,
          }}
        >
          PUREPEP
        </div>
      </div>

      {/* CENTER zone — compound code (giant) + dose pill */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "16px 40px 8px",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Compound code — IBM Plex Mono Bold, dominant */}
          <div
            style={{
              display: "flex",
              fontSize: sku.abbreviation.length > 5 ? 100 : 128,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: INK,
            }}
          >
            {sku.abbreviation}
          </div>
          {/* Dose pill (production) or τ glyph block (photography) */}
          {photography ? (
            /* τ glyph — same ink block, same visual weight as dose pill,
               cream glyph on ink. SVG rects mirror docs/design-v3/project/assets/glyph.svg */
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 130,
                height: 70,
                background: INK,
                borderRadius: 8,
              }}
            >
              <svg
                viewBox="0 0 60 72"
                width={44}
                height={52}
                style={{ fill: CREAM }}
              >
                <rect x="4" y="4" width="22" height="64" />
                <rect x="26" y="22" width="8" height="2" />
                <rect x="26" y="29" width="8" height="2" />
                <rect x="34" y="4" width="22" height="36" />
              </svg>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 22px",
                background: INK,
                color: sku.labelBg,
                borderRadius: 8,
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "0.04em",
                minWidth: 130,
              }}
            >
              {sku.dose}
            </div>
          )}
        </div>

        {/* Sub-line — full chemical name + CAS, small mono regular */}
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: INK,
            opacity: 0.78,
          }}
        >
          {subline}
        </div>
      </div>

      {/* COMPLIANCE band — dark navy strip with white mono caps */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 56,
          background: INK,
          color: sku.labelBg,
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {COMPLIANCE_TEXT}
      </div>
    </div>
  );
}
