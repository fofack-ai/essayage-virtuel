import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-grid-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton-line small" />
            <div className="skeleton-line big" />
            <div className="skeleton-line medium" />
          </div>
        ))}
      </div>

      <div className="skeleton-grid-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="skeleton-chart" key={i}>
            <div className="skeleton-line medium" />
            <div className="skeleton-graph" />
          </div>
        ))}
      </div>
    </div>
  );
}