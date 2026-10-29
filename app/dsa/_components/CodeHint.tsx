"use client";

// Under a code block: says so when the code is wider than the screen and scrolls sideways (mostly on phones).
// It measures the <pre> just before it, the same way Follow measures a wide figure.

import { useEffect, useRef, useState } from "react";

export function CodeHint() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const pre = ref.current?.previousElementSibling as HTMLElement | null;
    if (!pre) return;
    const on = () => setWide(pre.scrollWidth > pre.clientWidth + 1);
    on();
    const ro = new ResizeObserver(on);
    ro.observe(pre);
    return () => ro.disconnect();
  }, []);
  return (
    <p ref={ref} className="follow__hint code__hint" aria-hidden="true" hidden={!wide}>
      Wider than the screen: swipe sideways to see the rest.
    </p>
  );
}
