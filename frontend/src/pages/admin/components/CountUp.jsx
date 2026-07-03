import React, { useEffect, useState } from "react";

export default function CountUp({ value = 0, duration = 900, suffix = "", prefix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <>
      {prefix}
      {display.toLocaleString("fr-FR")}
      {suffix}
    </>
  );
}