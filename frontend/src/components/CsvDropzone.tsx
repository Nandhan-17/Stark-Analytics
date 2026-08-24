"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles, ShoppingBag, Activity, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CsvDropzoneProps {
  onFileUpload: (file: File) => void;
  onSampleSelect: (type: "ecommerce" | "healthcare" | "hr") => void;
  isLoading: boolean;
}

export const CsvDropzone: React.FC<CsvDropzoneProps> = ({ onFileUpload, onSampleSelect, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Primary Google Glassmorphic Dropzone Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card p-10 cursor-pointer text-center relative overflow-hidden transition-all duration-300 ${
            isDragOver
              ? "border-2 border-dashed border-[#1A73E8] bg-[#1A73E8]/5 shadow-lg scale-[1.01]"
              : "border-2 border-dashed border-[#1A73E8]/40 hover:border-[#1A73E8] hover:bg-white/95"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          {/* Top Google Bar Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A73E8] via-[#EA4335] via-[#FBBC04] to-[#34A853]"></div>

          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A73E8]/10 text-[#1A73E8] flex items-center justify-center shadow-sm">
              {isLoading ? (
                <div className="w-8 h-8 border-3 border-[#1A73E8] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#202124] tracking-tight">
                {isLoading ? "Analyzing CSV Dataset..." : "Upload your CSV File"}
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Drag & drop your raw CSV file here, or click to browse. Stark Analytics will automatically clean, analyze, and generate full ML analytics dynamically.
              </p>
            </div>

            {!isLoading && (
              <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1A73E8] text-white font-medium text-sm shadow-sm hover:bg-[#1557b0] transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Browse CSV Files</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Sample Dataset Selector Cards */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#FBBC04]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Or test instantly with pre-built sample datasets
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sample 1: E-Commerce */}
            <button
              disabled={isLoading}
              onClick={() => onSampleSelect("ecommerce")}
              className="glass-card p-4 text-left glass-card-hover flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A73E8]/10 text-[#1A73E8] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#202124]">E-Commerce Sales</div>
                  <div className="text-xs text-gray-500">Sales, Profit, Ratings & Dates</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1A73E8] group-hover:translate-x-1 transition-all" />
            </button>

            {/* Sample 2: Healthcare */}
            <button
              disabled={isLoading}
              onClick={() => onSampleSelect("healthcare")}
              className="glass-card p-4 text-left glass-card-hover flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#202124]">Healthcare Metrics</div>
                  <div className="text-xs text-gray-500">BMI, BP, Cholesterol & Age</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#EA4335] group-hover:translate-x-1 transition-all" />
            </button>

            {/* Sample 3: HR Performance */}
            <button
              disabled={isLoading}
              onClick={() => onSampleSelect("hr")}
              className="glass-card p-4 text-left glass-card-hover flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#34A853]/10 text-[#34A853] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#202124]">HR & Salaries</div>
                  <div className="text-xs text-gray-500">Salary, Department, Experience</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#34A853] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
