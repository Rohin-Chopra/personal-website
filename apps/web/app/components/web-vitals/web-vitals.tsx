"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";

export function WebVitals() {
  useEffect(() => {
    const sendToAnalytics = (metric: any) => {
      // Send to Vercel Analytics if available
      if (typeof window !== "undefined" && (window as any).va) {
        (window as any).va("track", metric.name, {
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          rating: metric.rating,
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(metric);
      }
    };

    onCLS(sendToAnalytics);
    // onFID was deprecated in favor of onINP (Interaction to Next Paint)
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  }, []);

  return null;
}

