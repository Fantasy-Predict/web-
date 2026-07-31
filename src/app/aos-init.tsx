"use client";

import { useEffect } from "react";
import AOS from "aos";

export function AOSInit() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      // Intentionally only fade/zoom variants are used across the app —
      // fade-left/fade-right translate elements in from off-canvas and
      // break on narrow viewports. Never use those.
    });
  }, []);

  return null;
}