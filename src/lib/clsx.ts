export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") out.push(String(v));
    else if (Array.isArray(v)) out.push(clsx(...v));
  }
  return out.join(" ");
}
