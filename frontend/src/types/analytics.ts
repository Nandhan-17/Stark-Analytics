export interface ColumnMetadata {
  column_name: string;
  dtype: string;
  missing_count: number;
  missing_pct: number;
  unique_values: number;
  iqr_outliers: number;
  zscore_outliers: number;
  sample_values: any[];
}

export interface DescriptiveStat {
  column: string;
  count: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q25: number;
  q75: number;
  skewness: number;
  kurtosis: number;
  ci_95_lower: number;
  ci_95_upper: number;
  skew_interpretation: string;
}

export interface HypothesisTest {
  test_type: string;
  var1: string;
  var2: string;
  statistic: number;
  p_value: number;
  is_significant: boolean;
  interpretation: string;
}

export interface AnomalyPoint {
  x: number;
  y: number;
  is_anomaly: boolean;
  score: number;
  index: number;
}

export interface AnomalyResult {
  available: boolean;
  message?: string;
  anomaly_count?: number;
  anomaly_pct?: number;
  normal_count?: number;
  pca_explained_variance?: number[];
  plot_points?: AnomalyPoint[];
}

export interface ClusterInfo {
  cluster_id: number;
  name: string;
  size: number;
  percentage: number;
}

export interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
  index: number;
}

export interface SegmentationResult {
  available: boolean;
  message?: string;
  k_clusters?: number;
  clusters?: ClusterInfo[];
  plot_points?: ClusterPoint[];
}

export interface FeatureImportanceItem {
  feature: string;
  score: number;
}

export interface CorrelationMatrixData {
  columns: string[];
  values: number[][];
}

export interface FeatureImportanceResult {
  available: boolean;
  message?: string;
  target_column?: string;
  feature_importance?: FeatureImportanceItem[];
  correlation_matrix?: CorrelationMatrixData;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  ma_7: number;
  ma_30: number;
}

export interface TimeSeriesResult {
  available: boolean;
  message?: string;
  datetime_column?: string;
  numeric_column?: string;
  trend?: string;
  pct_change?: number;
  points?: TimeSeriesPoint[];
}

export interface ChartDataPayload {
  histograms: Record<string, { counts: number[]; bin_edges: number[] }>;
  donuts: Record<string, { labels: string[]; values: number[] }>;
}

export interface ExecutiveSummary {
  title: string;
  overview: string;
  takeaways: string[];
}

export interface AnalyticsResponse {
  metadata: {
    filename: string;
    raw_rows: number;
    cleaned_rows: number;
    raw_cols: number;
    cleaned_cols: number;
    memory_usage_kb: number;
    numeric_cols: string[];
    categorical_cols: string[];
    datetime_cols: string[];
  };
  cleaning_stats: {
    initial_nulls: number;
    imputed_nulls: number;
    duplicates_removed: number;
    total_outliers_iqr: number;
    total_outliers_zscore: number;
  };
  column_metadata: ColumnMetadata[];
  statistics: {
    descriptive: DescriptiveStat[];
  };
  hypothesis_tests: HypothesisTest[];
  ml_insights: {
    anomalies: AnomalyResult;
    segmentation: SegmentationResult;
    feature_importance: FeatureImportanceResult;
    time_series: TimeSeriesResult;
  };
  chart_data: ChartDataPayload;
  executive_summary: ExecutiveSummary;
  sample_data: Record<string, any>[];
}
