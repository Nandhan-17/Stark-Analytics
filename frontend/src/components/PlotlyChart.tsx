"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import of Plotly with SSR disabled
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl bg-gray-50 flex items-center justify-center text-xs text-gray-400 font-medium animate-pulse">
      Loading Plotly Canvas...
    </div>
  ),
});

interface PlotlyChartProps {
  data: any[];
  layout: any;
  config?: any;
  className?: string;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout,
  config = { responsive: true, displayModeBar: false },
  className = "w-full h-80",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-72 rounded-2xl bg-gray-50 flex items-center justify-center text-xs text-gray-400 font-medium">
        Initializing Visualization...
      </div>
    );
  }

  const defaultLayout = {
    autosize: true,
    font: { family: "Inter, sans-serif", color: "#202124", size: 12 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { l: 40, r: 20, t: 30, b: 40 },
    hoverlabel: {
      bgcolor: "#FFFFFF",
      font: { family: "Inter, sans-serif", size: 12 },
      bordercolor: "#E2E8F0",
    },
    ...layout,
  };

  return (
    <div className={className}>
      <Plot
        data={data}
        layout={defaultLayout}
        config={config}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
      />
    </div>
  );
};
