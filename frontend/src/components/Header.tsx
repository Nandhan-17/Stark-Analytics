"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, Database, FileSpreadsheet } from "lucide-react";

interface HeaderProps {
  apiStatus: "checking" | "connected" | "disconnected";
  currentFilename?: string;
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ apiStatus, currentFilename, onReset }) => {
  return (
    <header className="sticky top-0 z-50 glass-nav px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          {/* Google Accent Dots Icon Container */}
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center p-2 relative overflow-hidden group">
            <div className="grid grid-cols-2 gap-1 w-full h-full">
              <div className="bg-[#1A73E8] rounded-sm group-hover:scale-110 transition-transform"></div>
              <div className="bg-[#EA4335] rounded-sm group-hover:scale-110 transition-transform"></div>
              <div className="bg-[#FBBC04] rounded-sm group-hover:scale-110 transition-transform"></div>
              <div className="bg-[#34A853] rounded-sm group-hover:scale-110 transition-transform"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-[#202124] tracking-tight">Stark Analytics</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#1A73E8]/10 text-[#1A73E8] border border-[#1A73E8]/20">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Automated Dynamic Data Analytics & ML Engine</p>
          </div>
        </div>

        {/* Dynamic Status / File Indicator */}
        <div className="flex items-center space-x-4">
          {currentFilename && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100/80 border border-gray-200/80 text-xs font-medium text-[#202124]">
              <FileSpreadsheet className="w-4 h-4 text-[#1A73E8]" />
              <span className="truncate max-w-[180px]">{currentFilename}</span>
              <button
                onClick={onReset}
                className="ml-2 text-xs text-[#1A73E8] hover:underline font-semibold"
              >
                Change
              </button>
            </div>
          )}

          {/* API Health Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 border border-gray-200 shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === "connected"
                  ? "bg-[#34A853] animate-pulse"
                  : apiStatus === "disconnected"
                  ? "bg-[#EA4335]"
                  : "bg-[#FBBC04]"
              }`}
            ></span>
            <span className="text-[#202124]">
              {apiStatus === "connected" ? "Engine Active" : apiStatus === "disconnected" ? "Engine Offline" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
