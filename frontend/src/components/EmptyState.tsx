"use client";

import React from "react";
import { Info, HelpCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Analysis Unavailable",
  message = "Insufficient column types available in this CSV to render this analysis.",
}) => {
  return (
    <div className="glass-card p-8 text-center flex flex-col items-center justify-center space-y-3 bg-white/60">
      <div className="w-12 h-12 rounded-2xl bg-[#FBBC04]/15 text-[#b38300] flex items-center justify-center">
        <Info className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#202124]">{title}</h4>
        <p className="text-xs text-gray-500 max-w-sm mt-1 mx-auto leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
