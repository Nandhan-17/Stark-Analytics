"use client";

import React from "react";
import { AnalyticsResponse } from "../types/analytics";
import { PlotlyChart } from "./PlotlyChart";
import { EmptyState } from "./EmptyState";
import { ShieldAlert, Users, BrainCircuit, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface MLInsightsTabProps {
  data: AnalyticsResponse;
}

export const MLInsightsTab: React.FC<MLInsightsTabProps> = ({ data }) => {
  const { anomalies, segmentation } = data.ml_insights;

  // Isolation Forest Anomaly Plot Data
  const anomalyPoints = anomalies.plot_points || [];
  const normalX = anomalyPoints.filter((p) => !p.is_anomaly).map((p) => p.x);
  const normalY = anomalyPoints.filter((p) => !p.is_anomaly).map((p) => p.y);
  const anomalyX = anomalyPoints.filter((p) => p.is_anomaly).map((p) => p.x);
  const anomalyY = anomalyPoints.filter((p) => p.is_anomaly).map((p) => p.y);

  const anomalyPlotData = [
    {
      x: normalX,
      y: normalY,
      mode: "markers",
      type: "scatter",
      name: "Normal Records",
      marker: { color: "#1A73E8", size: 7, opacity: 0.7 },
    },
    {
      x: anomalyX,
      y: anomalyY,
      mode: "markers",
      type: "scatter",
      name: "Isolation Forest Anomaly",
      marker: { color: "#EA4335", size: 11, symbol: "diamond", opacity: 0.9 },
    },
  ];

  const anomalyPlotLayout = {
    title: { text: "Isolation Forest Multivariate Anomaly Space (2D PCA)", font: { size: 14, color: "#202124" } },
    xaxis: { title: "PCA Component 1", gridcolor: "#F1F3F4" },
    yaxis: { title: "PCA Component 2", gridcolor: "#F1F3F4" },
    legend: { orientation: "h", y: -0.2 },
  };

  // K-Means Cluster Plot Data
  const clusterPoints = segmentation.plot_points || [];
  const clusterColors = ["#1A73E8", "#34A853", "#FBBC04", "#EA4335", "#8E24AA"];

  const clusterTraces = (segmentation.clusters || []).map((cluster, idx) => {
    const points = clusterPoints.filter((p) => p.cluster === cluster.cluster_id);
    return {
      x: points.map((p) => p.x),
      y: points.map((p) => p.y),
      mode: "markers",
      type: "scatter",
      name: cluster.name,
      marker: {
        color: clusterColors[idx % clusterColors.length],
        size: 8,
        opacity: 0.8,
      },
    };
  });

  const clusterPlotLayout = {
    title: { text: "K-Means Cluster Segmentation (2D PCA)", font: { size: 14, color: "#202124" } },
    xaxis: { title: "PCA Component 1", gridcolor: "#F1F3F4" },
    yaxis: { title: "PCA Component 2", gridcolor: "#F1F3F4" },
    legend: { orientation: "h", y: -0.2 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. Isolation Forest Anomaly Detection Section */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#EA4335]/10 text-[#EA4335]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124]">Multivariate Anomaly Detection (Isolation Forest)</h3>
              <p className="text-xs text-gray-500">Unsupervised outlier score evaluation across numeric dimensions</p>
            </div>
          </div>

          {anomalies.available && (
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/20 text-xs font-bold text-[#EA4335]">
                {anomalies.anomaly_count} Anomalies ({anomalies.anomaly_pct}%)
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#1A73E8]/10 border border-[#1A73E8]/20 text-xs font-bold text-[#1A73E8]">
                {anomalies.normal_count} Normal Records
              </div>
            </div>
          )}
        </div>

        {anomalies.available ? (
          <PlotlyChart data={anomalyPlotData} layout={anomalyPlotLayout} className="w-full h-88" />
        ) : (
          <EmptyState title="Anomaly Detection Unavailable" message={anomalies.message} />
        )}
      </div>

      {/* 2. K-Means Customer & Data Segmentation Section */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1A73E8]/10 text-[#1A73E8]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124]">Dynamic Customer & Data Segmentation (K-Means)</h3>
              <p className="text-xs text-gray-500">Automated clustering based on feature variance patterns</p>
            </div>
          </div>

          {segmentation.available && (
            <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 text-[#202124]">
              {segmentation.k_clusters} Dynamic Clusters Evaluated
            </div>
          )}
        </div>

        {segmentation.available ? (
          <div className="space-y-6">
            <PlotlyChart data={clusterTraces} layout={clusterPlotLayout} className="w-full h-88" />

            {/* Cluster Summaries Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {(segmentation.clusters || []).map((cluster, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-200/80 bg-white/90 shadow-2xs hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: clusterColors[idx % clusterColors.length] }}
                    ></span>
                    <span className="text-xs font-bold text-[#202124]">{cluster.name}</span>
                  </div>
                  <div className="text-xl font-extrabold text-[#202124]">
                    {cluster.size.toLocaleString()} <span className="text-xs text-gray-500 font-normal">records</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">{cluster.percentage}% of dataset</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="Segmentation Unavailable" message={segmentation.message} />
        )}
      </div>
    </motion.div>
  );
};
