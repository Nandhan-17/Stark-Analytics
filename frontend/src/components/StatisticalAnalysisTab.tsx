"use client";

import React, { useState } from "react";
import { AnalyticsResponse } from "../types/analytics";
import { Calculator, FlaskConical, Search, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface StatisticalAnalysisTabProps {
  data: AnalyticsResponse;
}

export const StatisticalAnalysisTab: React.FC<StatisticalAnalysisTabProps> = ({ data }) => {
  const { statistics, hypothesis_tests } = data;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStats = statistics.descriptive.filter((s) =>
    s.column.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Section 1: Descriptive & Inferential Statistics Grid */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#1A73E8]/10 text-[#1A73E8]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">Descriptive & Distribution Statistics</h3>
                <p className="text-xs text-gray-500">Mean, Median, Quartiles, Skewness, Kurtosis & 95% CI</p>
              </div>
            </div>

            <div className="relative max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search numeric columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#1A73E8]"
              />
            </div>
          </div>

          {filteredStats.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500">No matching numeric columns found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600">
                    <th className="py-3 px-3 font-bold">Numeric Feature</th>
                    <th className="py-3 px-3 font-bold">Count</th>
                    <th className="py-3 px-3 font-bold">Mean</th>
                    <th className="py-3 px-3 font-bold">Median</th>
                    <th className="py-3 px-3 font-bold">Std Dev</th>
                    <th className="py-3 px-3 font-bold">Min / Max</th>
                    <th className="py-3 px-3 font-bold">Q25 / Q75</th>
                    <th className="py-3 px-3 font-bold">Skewness</th>
                    <th className="py-3 px-3 font-bold">Kurtosis</th>
                    <th className="py-3 px-3 font-bold">95% CI Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStats.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#202124]">{stat.column}</td>
                      <td className="py-3 px-3 text-gray-600">{stat.count.toLocaleString()}</td>
                      <td className="py-3 px-3 font-medium text-[#1A73E8]">{stat.mean.toLocaleString()}</td>
                      <td className="py-3 px-3 text-gray-700">{stat.median.toLocaleString()}</td>
                      <td className="py-3 px-3 text-gray-600">{stat.std.toLocaleString()}</td>
                      <td className="py-3 px-3 text-gray-600">
                        {stat.min} / {stat.max}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {stat.q25} / {stat.q75}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            stat.skew_interpretation === "Symmetric"
                              ? "bg-[#34A853]/15 text-[#34A853]"
                              : "bg-[#FBBC04]/20 text-[#b38300]"
                          }`}
                        >
                          {stat.skewness} ({stat.skew_interpretation})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{stat.kurtosis}</td>
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                        [{stat.ci_95_lower}, {stat.ci_95_upper}]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Automated SciPy Hypothesis Testing Table */}
        <div className="glass-card p-6 mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#FBBC04]/15 text-[#b38300]">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124]">Automated SciPy Hypothesis Testing</h3>
              <p className="text-xs text-gray-500">T-Tests, Chi-Square Tests of Independence & One-Way ANOVA</p>
            </div>
          </div>

          {hypothesis_tests.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 bg-gray-50 rounded-xl">
              Insufficient paired column variables in this dataset to execute automated hypothesis tests.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600">
                    <th className="py-3 px-4 font-bold">Statistical Test</th>
                    <th className="py-3 px-4 font-bold">Variable 1</th>
                    <th className="py-3 px-4 font-bold">Variable 2</th>
                    <th className="py-3 px-4 font-bold">Test Statistic</th>
                    <th className="py-3 px-4 font-bold">p-value</th>
                    <th className="py-3 px-4 font-bold">Significance (α=0.05)</th>
                    <th className="py-3 px-4 font-bold">Dynamic Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hypothesis_tests.map((test, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#202124]">{test.test_type}</td>
                      <td className="py-3 px-4 font-semibold text-[#1A73E8]">{test.var1}</td>
                      <td className="py-3 px-4 font-semibold text-[#1A73E8]">{test.var2}</td>
                      <td className="py-3 px-4 text-gray-700 font-mono">{test.statistic}</td>
                      <td className="py-3 px-4 font-bold text-[#202124]">{test.p_value}</td>
                      <td className="py-3 px-4">
                        {test.is_significant ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#34A853]/15 text-[#34A853]">
                            <CheckCircle className="w-3 h-3" />
                            <span>Significant</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Not Significant</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs leading-normal">{test.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
