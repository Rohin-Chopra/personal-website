"use client";

import { useEffect } from "react";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

type VercelAnalyticsWindow = Window & {
  va?: (event: string, name: string, data: Record<string, unknown>) => void;
};

export function WebVitals() {
  useEffect(() => {
    const sendToAnalytics = (metric: Metric) => {
      const { va } = window as VercelAnalyticsWindow;
      va?.("track", metric.name, {
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: metric.rating,
      });

      if (process.env.NODE_ENV === "development") {
        console.log(metric);
      }
    };

    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  }, []);

  return null;
}
