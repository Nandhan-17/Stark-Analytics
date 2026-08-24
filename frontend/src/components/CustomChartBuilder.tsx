"use client";

import React, { useState } from "react";
import { AnalyticsResponse } from "../types/analytics";
import { PlotlyChart } from "./PlotlyChart";
import { Sliders, BarChart, LineChart, ScatterChart, PieChart, BoxSelect, Play } from "lucide-react";
import { motion } from "framer-motion";

interface CustomChartBuilderProps {
  data: AnalyticsResponse;
}

export const CustomChartBuilder: React.FC<CustomChartBuilderProps> = ({ data }) => {
  const { sample_data, metadata } = data;
  const allColumns = [...metadata.numeric_cols, ...metadata.categorical_cols, ...metadata.datetime_cols];

  const [xAxis, setXAxis] = useState<string>(allColumns[0] || "");
  const [yAxis, setYAxis] = useState<string>(metadata.numeric_cols[0] || allColumns[1] || "");
  const [groupBy, setGroupBy] = useState<string>("None");
  const [chartType, setChartType] = useState<"bar" | "line" | "scatter" | "pie" | "box">("bar");

  if (!sample_data || sample_data.length === 0) {
    return null;
  }

  // Generate Plotly dataset dynamically based on UI dropdown selections
  const generateCustomPlotData = () => {
    if (!xAxis) return [];

    const xVals = sample_data.map((row) => row[xAxis]);
    const yVals = yAxis ? sample_data.map((row) => row[yAxis]) : [];

    if (chartType === "pie") {
      const valueCounts: Record<string, number> = {};
      xVals.forEach((val) => {
        const k = String(val);
        valueCounts[k] = (valueCounts[k] || 0) + 1;
      });
      return [
        {
          labels: Object.keys(valueCounts),
          values: Object.values(valueCounts),
          type: "pie",
          marker: { colors: ["#1A73E8", "#34A853", "#FBBC04", "#EA4335", "#8E24AA", "#00ACC1"] },
        },
      ];
    }

    if (groupBy !== "None" && groupBy !== xAxis) {
      // Group by distinct categories
      const groups: Record<string, { x: any[]; y: any[] }> = {};
      sample_data.forEach((row) => {
        const gKey = String(row[groupBy]);
        if (!groups[gKey]) groups[gKey] = { x: [], y: [] };
        groups[gKey].x.push(row[xAxis]);
        if (yAxis) groups[gKey].y.push(row[yAxis]);
      });

      const colors = ["#1A73E8", "#34A853", "#FBBC04", "#EA4335", "#8E24AA", "#00ACC1"];
      return Object.keys(groups).map((gKey, idx) => ({
        x: groups[gKey].x,
        y: yAxis ? groups[gKey].y : undefined,
        name: gKey,
        type: chartType === "box" ? "box" : chartType === "scatter" ? "scatter" : chartType === "line" ? "scatter" : "bar",
        mode: chartType === "line" ? "lines+markers" : chartType === "scatter" ? "markers" : undefined,
        marker: { color: colors[idx % colors.length] },
      }));
    }

    // Default Single Series Trace
    return [
      {
        x: xVals,
        y: yAxis ? yVals : undefined,
        type: chartType === "box" ? "box" : chartType === "scatter" ? "scatter" : chartType === "line" ? "scatter" : "bar",
        mode: chartType === "line" ? "lines+markers" : chartType === "scatter" ? "markers" : undefined,
        marker: { color: "#1A73E8" },
      },
    ];
  };

  const customPlotLayout = {
    title: { text: `Custom Dynamic Chart: ${xAxis} ${yAxis ? `vs ${yAxis}` : ""}`, font: { size: 14, color: "#202124" } },
    xaxis: { title: xAxis, gridcolor: "#F1F3F4" },
    yaxis: yAxis ? { title: yAxis, gridcolor: "#F1F3F4" } : undefined,
    margin: { l: 60, r: 30, t: 40, b: 50 },
    legend: { orientation: "h", y: -0.2 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 border-2 border-[#1A73E8]/20 bg-gradient-to-b from-white to-blue-50/20 shadow-md"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 rounded-xl bg-[#1A73E8] text-white shadow-sm">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#202124]">Interactive Custom Chart Builder</h3>
          <p className="text-xs text-gray-500">Dynamically configure axes, group-by categories, and chart types on the fly</p>
        </div>
      </div>

      {/* Control Panel Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/90 border border-gray-200/80 shadow-2xs mb-6">
        {/* Dropdown 1: X-Axis */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">X-Axis Column</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[#202124] focus:outline-none focus:border-[#1A73E8]"
          >
            {allColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Y-Axis */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Y-Axis Column (Optional)</label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[#202124] focus:outline-none focus:border-[#1A73E8]"
          >
            <option value="">None (Count Frequency)</option>
            {metadata.numeric_cols.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 3: Group By / Color */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Color / Group-by</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[#202124] focus:outline-none focus:border-[#1A73E8]"
          >
            <option value="None">None</option>
            {metadata.categorical_cols.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 4: Chart Type Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Chart Type</label>
          <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setChartType("bar")}
              title="Bar Chart"
              className={`p-1.5 rounded-md transition-colors ${chartType === "bar" ? "bg-[#1A73E8] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              <BarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("line")}
              title="Line Chart"
              className={`p-1.5 rounded-md transition-colors ${chartType === "line" ? "bg-[#1A73E8] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("scatter")}
              title="Scatter Plot"
              className={`p-1.5 rounded-md transition-colors ${chartType === "scatter" ? "bg-[#1A73E8] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              <ScatterChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("pie")}
              title="Pie / Donut Chart"
              className={`p-1.5 rounded-md transition-colors ${chartType === "pie" ? "bg-[#1A73E8] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              <PieChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("box")}
              title="Box Plot"
              className={`p-1.5 rounded-md transition-colors ${chartType === "box" ? "bg-[#1A73E8] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              <BoxSelect className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Render Custom Plotly Graph */}
      <PlotlyChart data={generateCustomPlotData()} layout={customPlotLayout} className="w-full h-88" />
    </motion.div>
  );
};
