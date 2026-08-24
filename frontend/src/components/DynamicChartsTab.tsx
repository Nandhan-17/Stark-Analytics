"use client";

import React from "react";
import { AnalyticsResponse } from "../types/analytics";
import { PlotlyChart } from "./PlotlyChart";
import { EmptyState } from "./EmptyState";
import { BarChart3, PieChart, Grid, TrendingUp, Cpu } from "lucide-react";
import { motion } from "framer-motion";

interface DynamicChartsTabProps {
  data: AnalyticsResponse;
}

export const DynamicChartsTab: React.FC<DynamicChartsTabProps> = ({ data }) => {
  const { chart_data, ml_insights } = data;
  const { feature_importance: featResult, time_series: tsResult } = ml_insights;

  // 1. Correlation Heatmap Data (Light Blue to Navy Gradient)
  const corrData = featResult.correlation_matrix;
  const hasCorrelation = featResult.available && corrData && corrData.columns.length > 1;

  const corrHeatmapPlotData = hasCorrelation
    ? [
        {
          z: corrData.values,
          x: corrData.columns,
          y: corrData.columns,
          type: "heatmap",
          colorscale: [
            [0, "#E8F0FE"],
            [0.5, "#4285F4"],
            [1, "#0D47A1"],
          ],
          showscale: true,
          reversescale: false,
        },
      ]
    : [];

  const corrHeatmapLayout = {
    title: { text: "Pearson Correlation Matrix (Light Blue to Navy)", font: { size: 14, color: "#202124" } },
    margin: { l: 80, r: 40, t: 40, b: 80 },
  };

  // 2. Feature Importance Bar Chart Data
  const hasFeatureImportance = featResult.available && featResult.feature_importance && featResult.feature_importance.length > 0;
  const featScores = featResult.feature_importance || [];

  const featureImportancePlotData = hasFeatureImportance
    ? [
        {
          x: featScores.map((f) => f.score),
          y: featScores.map((f) => f.feature),
          type: "bar",
          orientation: "h",
          marker: {
            color: "#1A73E8",
            corner_radius: 4,
          },
        },
      ]
    : [];

  const featureImportanceLayout = {
    title: { text: `Target Drivers: Predictors of '${featResult.target_column}'`, font: { size: 14, color: "#202124" } },
    xaxis: { title: "Importance Score (%)", gridcolor: "#F1F3F4" },
    yaxis: { autorange: "reversed" },
    margin: { l: 120, r: 30, t: 40, b: 40 },
  };

  // 3. Time Series Plot Data
  const hasTimeSeries = tsResult.available && tsResult.points && tsResult.points.length > 0;
  const tsPoints = tsResult.points || [];

  const timeSeriesPlotData = hasTimeSeries
    ? [
        {
          x: tsPoints.map((p) => p.date),
          y: tsPoints.map((p) => p.value),
          type: "scatter",
          mode: "lines",
          name: `${tsResult.numeric_column} (Raw)`,
          line: { color: "#9AA0A6", width: 1.5 },
        },
        {
          x: tsPoints.map((p) => p.date),
          y: tsPoints.map((p) => p.ma_7),
          type: "scatter",
          mode: "lines",
          name: "7-Period Moving Average",
          line: { color: "#1A73E8", width: 2.5 },
        },
        {
          x: tsPoints.map((p) => p.date),
          y: tsPoints.map((p) => p.ma_30),
          type: "scatter",
          mode: "lines",
          name: "30-Period Moving Average",
          line: { color: "#EA4335", width: 2.5, dash: "dot" },
        },
      ]
    : [];

  const timeSeriesLayout = {
    title: { text: `Temporal Trend & Moving Averages for '${tsResult.numeric_column}'`, font: { size: 14, color: "#202124" } },
    xaxis: { title: "Timeline", gridcolor: "#F1F3F4" },
    yaxis: { title: tsResult.numeric_column, gridcolor: "#F1F3F4" },
    legend: { orientation: "h", y: -0.2 },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 1. Feature Importance & Correlation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Importance Card */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#1A73E8]/10 text-[#1A73E8]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">Business Drivers & Feature Importance</h3>
                <p className="text-xs text-gray-500">Random Forest importance ranking against target column</p>
              </div>
            </div>

            {hasFeatureImportance ? (
              <PlotlyChart data={featureImportancePlotData} layout={featureImportanceLayout} className="w-full h-76" />
            ) : (
              <EmptyState title="Feature Importance Unavailable" message={featResult.message} />
            )}
          </div>

          {/* Correlation Heatmap Card */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#34A853]/10 text-[#34A853]">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">Correlation Matrix Heatmap</h3>
                <p className="text-xs text-gray-500">Inter-variable Pearson correlation coefficients</p>
              </div>
            </div>

            {hasCorrelation ? (
              <PlotlyChart data={corrHeatmapPlotData} layout={corrHeatmapLayout} className="w-full h-76" />
            ) : (
              <EmptyState title="Correlation Heatmap Unavailable" message="At least 2 numeric columns are required to generate a correlation heatmap." />
            )}
          </div>
        </div>

        {/* 2. Time-Series Evaluation Line Chart */}
        <div className="glass-card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#FBBC04]/15 text-[#b38300]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">Time-Series & Moving Average Trends</h3>
                <p className="text-xs text-gray-500">Temporal evaluation across Datetime columns</p>
              </div>
            </div>

            {hasTimeSeries && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                tsResult.trend === "Upward"
                  ? "bg-[#34A853]/15 text-[#34A853]"
                  : tsResult.trend === "Downward"
                  ? "bg-[#EA4335]/15 text-[#EA4335]"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {tsResult.trend} Trend ({tsResult.pct_change > 0 ? `+${tsResult.pct_change}%` : `${tsResult.pct_change}%`})
              </span>
            )}
          </div>

          {hasTimeSeries ? (
            <PlotlyChart data={timeSeriesPlotData} layout={timeSeriesLayout} className="w-full h-80" />
          ) : (
            <EmptyState title="Time-Series Analysis Unavailable" message={tsResult.message} />
          )}
        </div>

        {/* 3. Distribution Curves & Categorical Donut Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Distribution Histogram */}
          {Object.keys(chart_data.histograms).length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#1A73E8]/10 text-[#1A73E8]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#202124]">Distribution Curve ({Object.keys(chart_data.histograms)[0]})</h3>
                  <p className="text-xs text-gray-500">Histogram frequency distribution</p>
                </div>
              </div>

              {(() => {
                const colName = Object.keys(chart_data.histograms)[0];
                const hist = chart_data.histograms[colName];
                const binCenters = hist.bin_edges.slice(0, -1).map((b, idx) => ((b + hist.bin_edges[idx + 1]) / 2).toFixed(2));
                return (
                  <PlotlyChart
                    data={[
                      {
                        x: binCenters,
                        y: hist.counts,
                        type: "bar",
                        marker: { color: "#1A73E8" },
                      },
                    ]}
                    layout={{
                      xaxis: { title: colName },
                      yaxis: { title: "Frequency Count" },
                      margin: { l: 40, r: 20, t: 20, b: 40 },
                    }}
                    className="w-full h-64"
                  />
                );
              })()}
            </div>
          )}

          {/* Categorical Donut Chart */}
          {Object.keys(chart_data.donuts).length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#EA4335]/10 text-[#EA4335]">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#202124]">Category Breakdown ({Object.keys(chart_data.donuts)[0]})</h3>
                  <p className="text-xs text-gray-500">Top categorical proportions</p>
                </div>
              </div>

              {(() => {
                const colName = Object.keys(chart_data.donuts)[0];
                const donut = chart_data.donuts[colName];
                return (
                  <PlotlyChart
                    data={[
                      {
                        labels: donut.labels,
                        values: donut.values,
                        type: "pie",
                        hole: 0.4,
                        marker: {
                          colors: ["#1A73E8", "#34A853", "#FBBC04", "#EA4335", "#8E24AA", "#00ACC1"],
                        },
                      },
                    ]}
                    layout={{
                      margin: { l: 20, r: 20, t: 20, b: 20 },
                      legend: { orientation: "h", y: -0.1 },
                    }}
                    className="w-full h-64"
                  />
                );
              })()}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
