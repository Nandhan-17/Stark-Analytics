"use client";

import React from "react";
import { AnalyticsResponse } from "../types/analytics";
import { CheckCircle2, ShieldAlert, Sparkles, Layers, HardDrive, AlertTriangle, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ExecutiveSummaryTabProps {
  data: AnalyticsResponse;
}

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({ data }) => {
  const { metadata, cleaning_stats, column_metadata, executive_summary } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 4 Stat Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cleaned Rows */}
        <div className="glass-card p-5 border-l-4 border-l-[#1A73E8]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cleaned Records</span>
            <div className="p-2 rounded-lg bg-[#1A73E8]/10 text-[#1A73E8]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#202124]">
            {metadata.cleaned_rows.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Raw rows: {metadata.raw_rows.toLocaleString()} ({metadata.raw_cols} columns)
          </p>
        </div>

        {/* Metric 2: Fixed Missing Values */}
        <div className="glass-card p-5 border-l-4 border-l-[#34A853]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Imputed Values</span>
            <div className="p-2 rounded-lg bg-[#34A853]/10 text-[#34A853]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#202124]">
              {cleaning_stats.imputed_nulls.toLocaleString()}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#34A853]/15 text-[#34A853]">
              100% Fixed
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Median & Mode auto-imputation</p>
        </div>

        {/* Metric 3: Duplicates Purged */}
        <div className="glass-card p-5 border-l-4 border-l-[#FBBC04]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duplicates Purged</span>
            <div className="p-2 rounded-lg bg-[#FBBC04]/10 text-[#FBBC04]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#202124]">
            {cleaning_stats.duplicates_removed.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">Redundant row instances removed</p>
        </div>

        {/* Metric 4: Outliers Flagged */}
        <div className="glass-card p-5 border-l-4 border-l-[#EA4335]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outliers Flagged</span>
            <div className="p-2 rounded-lg bg-[#EA4335]/10 text-[#EA4335]">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#202124]">
            {cleaning_stats.total_outliers_iqr.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">Identified via IQR Bounds</p>
        </div>
      </div>

      {/* Natural Language Executive Summary Card */}
      <div className="glass-card p-6 border border-[#1A73E8]/20 bg-gradient-to-br from-white/90 via-white/80 to-[#1A73E8]/5 relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#1A73E8] text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#202124]">{executive_summary.title}</h3>
            <p className="text-xs text-gray-500">Automated Natural Language Business Takeaways</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed font-normal bg-white/70 p-4 rounded-xl border border-gray-100 mb-6">
          {executive_summary.overview}
        </p>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Key Business Takeaways</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {executive_summary.takeaways.map((takeaway, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/90 border border-gray-200/80 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#1A73E8] mt-2 shrink-0"></div>
                <div
                  className="text-xs text-[#202124] leading-normal"
                  dangerouslySetInnerHTML={{ __html: takeaway.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Schema & Data Hygiene Details */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#1A73E8]" />
            <h3 className="text-base font-bold text-[#202124]">Dynamic Dataset Schema & Data Types</h3>
          </div>
          <span className="text-xs text-gray-500">
            Memory Footprint: {metadata.memory_usage_kb} KB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="py-3 px-4 font-bold text-gray-600">Column Name</th>
                <th className="py-3 px-4 font-bold text-gray-600">Inferred Type</th>
                <th className="py-3 px-4 font-bold text-gray-600">Missing Count</th>
                <th className="py-3 px-4 font-bold text-gray-600">Unique Values</th>
                <th className="py-3 px-4 font-bold text-gray-600">IQR Outliers</th>
                <th className="py-3 px-4 font-bold text-gray-600">Sample Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {column_metadata.map((col, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-[#202124]">{col.column_name}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      col.dtype.includes("Float") || col.dtype.includes("Integer")
                        ? "bg-[#1A73E8]/10 text-[#1A73E8]"
                        : col.dtype.includes("Datetime")
                        ? "bg-[#FBBC04]/15 text-[#b38300]"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {col.dtype}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">
                    {col.missing_count > 0 ? (
                      <span className="text-[#EA4335] font-semibold">{col.missing_count} ({col.missing_pct}%)</span>
                    ) : (
                      <span className="text-[#34A853]">0 (Clean)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">{col.unique_values.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-gray-600">
                    {col.iqr_outliers > 0 ? (
                      <span className="text-[#EA4335] font-medium">{col.iqr_outliers}</span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-gray-500 font-mono text-[11px] truncate max-w-[200px]">
                    {col.sample_values.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
