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

  // பாப்அப் பாக்ஸ் மற்றும் எழுத்துக்கள் பளிச்சென்று தெரிய டார்க் பின்னணி + வெள்ளை டெக்ஸ்ட்
  const resolvedHoverLabel = {
    bgcolor: "#0F172A",      // டார்க் நேவி / ஸ்லேட் பின்னணி
    bordercolor: "#334155",  // தெளிவான பார்டர்
    font: {
      family: "Inter, sans-serif",
      size: 12,
      color: "#FFFFFF",      // தூய வெள்ளை நிற எழுத்துக்கள்
    },
    ...layout?.hoverlabel,
  };

  const defaultLayout = {
    autosize: true,
    font: { family: "Inter, sans-serif", color: "#202124", size: 12 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { l: 40, r: 20, t: 30, b: 40 },
    ...layout,
    hoverlabel: resolvedHoverLabel,
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
