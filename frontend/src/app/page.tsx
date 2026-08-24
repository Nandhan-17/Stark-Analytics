"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CsvDropzone } from "@/components/CsvDropzone";
import { ExecutiveSummaryTab } from "@/components/ExecutiveSummaryTab";
import { StatisticalAnalysisTab } from "@/components/StatisticalAnalysisTab";
import { MLInsightsTab } from "@/components/MLInsightsTab";
import { DynamicChartsTab } from "@/components/DynamicChartsTab";
import { CustomChartBuilder } from "@/components/CustomChartBuilder";
import { AnalyticsResponse } from "@/types/analytics";
import { FileText, Calculator, BrainCircuit, BarChart2, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = "http://localhost:8000";

export default function StarkAnalyticsDashboard() {
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "stats" | "ml" | "charts">("summary");

  // Check Backend Health on Mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/health`);
        if (res.ok) {
          setApiStatus("connected");
        } else {
          setApiStatus("disconnected");
        }
      } catch (err) {
        setApiStatus("disconnected");
      }
    };
    checkHealth();
  }, []);

  // Handle User CSV Upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/upload-csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || "Failed to process uploaded CSV.");
      }

      const result: AnalyticsResponse = await response.json();
      setAnalyticsData(result);
      setActiveTab("summary");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while processing the CSV file.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sample Dataset Selection
  const handleSampleSelect = async (type: "ecommerce" | "healthcare" | "hr") => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/sample-dataset/${type}`);
      if (!response.ok) {
        throw new Error("Failed to load sample dataset from server.");
      }
      const result: AnalyticsResponse = await response.json();
      setAnalyticsData(result);
      setActiveTab("summary");
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to fetch sample dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Data View
  const handleReset = () => {
    setAnalyticsData(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] flex flex-col font-sans pb-16">
      {/* Google Soft Glassmorphic Navbar */}
      <Header
        apiStatus={apiStatus}
        currentFilename={analyticsData?.metadata.filename}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Error Alert Pill */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#EA4335] flex items-center justify-between text-xs font-semibold shadow-2xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-[#EA4335] underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Initial CSV Dropzone View (Shown when no data uploaded yet) */}
        {!analyticsData && (
          <div className="mt-6">
            <CsvDropzone
              onFileUpload={handleFileUpload}
              onSampleSelect={handleSampleSelect}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Analytics Dashboard Interface (Shown after CSV processed) */}
        {analyticsData && (
          <div className="space-y-6">
            {/* Header Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-extrabold text-[#202124] tracking-tight">
                  Dataset Analytics: {analyticsData.metadata.filename}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {analyticsData.metadata.cleaned_rows.toLocaleString()} Cleaned Rows • {analyticsData.metadata.cleaned_cols} Variables • {analyticsData.metadata.memory_usage_kb} KB
                </p>
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <RefreshCw className="w-4 h-4 text-[#1A73E8]" />
                <span>Upload New CSV</span>
              </button>
            </div>

            {/* Google Glassmorphic 4-Tab Navigation */}
            <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto pb-1">
              {/* Tab 1 */}
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "summary"
                    ? "bg-[#1A73E8] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tab 1: Executive Summary & Cleaning</span>
              </button>

              {/* Tab 2 */}
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "stats"
                    ? "bg-[#1A73E8] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Tab 2: Advanced Statistical Analysis</span>
              </button>

              {/* Tab 3 */}
              <button
                onClick={() => setActiveTab("ml")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "ml"
                    ? "bg-[#1A73E8] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Tab 3: Segmentation & Anomalies (ML)</span>
              </button>

              {/* Tab 4 */}
              <button
                onClick={() => setActiveTab("charts")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "charts"
                    ? "bg-[#1A73E8] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Tab 4: Dynamic Visualizations</span>
              </button>
            </div>

            {/* Tab Body Contents */}
            <div className="pt-2">
              <AnimatePresence mode="wait">
                {activeTab === "summary" && <ExecutiveSummaryTab key="summary" data={analyticsData} />}
                {activeTab === "stats" && <StatisticalAnalysisTab key="stats" data={analyticsData} />}
                {activeTab === "ml" && <MLInsightsTab key="ml" data={analyticsData} />}
                {activeTab === "charts" && <DynamicChartsTab key="charts" data={analyticsData} />}
              </AnimatePresence>
            </div>

            {/* Interactive Custom Chart Builder Component (Always Accessible Below Tabs) */}
            <div className="pt-8">
              <CustomChartBuilder data={analyticsData} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
