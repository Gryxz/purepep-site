"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (href) {
      router.push(href);
    } else {
      try {
        router.back();
      } catch {
        router.push("/shop");
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="v3-back-btn"
    >
      <svg
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
