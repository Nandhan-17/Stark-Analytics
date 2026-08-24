import io
import math
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from scipy import stats
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer

class DataProcessingEngine:
    def __init__(self, file_contents: bytes, filename: str = "uploaded.csv"):
        self.filename = filename
        self.raw_df = self._load_csv(file_contents)
        self.cleaned_df = None
        self.cleaning_stats = {}
        self.column_metadata = []
        self.numeric_cols = []
        self.categorical_cols = []
        self.datetime_cols = []

    def _load_csv(self, contents: bytes) -> pd.DataFrame:
        """Parse CSV content supporting multiple encodings and separators."""
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception:
            try:
                df = pd.read_csv(io.BytesIO(contents), encoding="latin1")
            except Exception:
                df = pd.read_csv(io.BytesIO(contents), sep=";", encoding="utf-8")
        
        # Clean column names
        df.columns = [str(col).strip() for col in df.columns]
        return df

    def process_all(self) -> Dict[str, Any]:
        """Execute complete data engineering and ML analytics pipeline."""
        if self.raw_df.empty:
            return {"error": "The uploaded CSV file is empty."}

        # 1. Cleaning & Type Detection Pipeline
        self._clean_and_infer_types()

        # 2. Basic & Advanced Statistical Engine
        stats_data = self._compute_statistics()

        # 3. Automated SciPy Hypothesis Testing
        hypothesis_tests = self._run_hypothesis_tests()

        # 4. ML Engine: Anomaly Detection (Isolation Forest)
        anomaly_results = self._detect_anomalies()

        # 5. ML Engine: K-Means Segmentation
        segmentation_results = self._run_kmeans_clustering()

        # 6. Feature Importance & Correlation Matrix
        feature_importance_results = self._compute_feature_importance()

        # 7. Time-Series Trend Engine (if datetime columns exist)
        time_series_results = self._evaluate_time_series()

        # 8. Dynamic Chart Data Preparation (Histogram, Donut, Heatmap)
        chart_data = self._prepare_chart_data()

        # 9. Dynamic Natural Language Executive Summary
        executive_summary = self._generate_executive_summary(
            stats_data=stats_data,
            anomaly_results=anomaly_results,
            segmentation_results=segmentation_results,
            feature_importance_results=feature_importance_results,
            time_series_results=time_series_results,
            hypothesis_tests=hypothesis_tests
        )

        return {
            "metadata": {
                "filename": self.filename,
                "raw_rows": len(self.raw_df),
                "cleaned_rows": len(self.cleaned_df),
                "raw_cols": len(self.raw_df.columns),
                "cleaned_cols": len(self.cleaned_df.columns),
                "memory_usage_kb": round(self.cleaned_df.memory_usage(deep=True).sum() / 1024, 2),
                "numeric_cols": self.numeric_cols,
                "categorical_cols": self.categorical_cols,
                "datetime_cols": self.datetime_cols,
            },
            "cleaning_stats": self.cleaning_stats,
            "column_metadata": self.column_metadata,
            "statistics": stats_data,
            "hypothesis_tests": hypothesis_tests,
            "ml_insights": {
                "anomalies": anomaly_results,
                "segmentation": segmentation_results,
                "feature_importance": feature_importance_results,
                "time_series": time_series_results,
            },
            "chart_data": chart_data,
            "executive_summary": executive_summary,
            "sample_data": self.cleaned_df.head(100).to_dict(orient="records")
        }

    def _clean_and_infer_types(self):
        """Clean dataframe, handle missing values, drop duplicates, and infer column types."""
        df = self.raw_df.copy()
        raw_rows = len(df)
        
        # Track initial nulls
        total_initial_nulls = int(df.isnull().sum().sum())
        
        # Drop duplicates
        df = df.drop_duplicates()
        duplicates_removed = raw_rows - len(df)

        # Detect datetimes and numeric conversions
        self.numeric_cols = []
        self.categorical_cols = []
        self.datetime_cols = []
        self.column_metadata = []

        cleaned_df = pd.DataFrame()

        for col in df.columns:
            series = df[col]
            null_count = int(series.isnull().sum())
            unique_count = int(series.nunique())
            
            # Check for datetime
            datetime_series = None
            if series.dtype == 'object' or pd.api.types.is_string_dtype(series):
                try:
                    # Sample first non-null values to test date format
                    sample_non_nulls = series.dropna().head(20).astype(str)
                    if any(c in sample_non_nulls.iloc[0] for c in ['-', '/', ':']) and sample_non_nulls.iloc[0][0].isdigit():
                        parsed = pd.to_datetime(series, errors='coerce')
                        if parsed.notnull().sum() > 0.5 * len(series):
                            datetime_series = parsed
                except Exception:
                    datetime_series = None

            if datetime_series is not None or pd.api.types.is_datetime64_any_dtype(series):
                cleaned_df[col] = pd.to_datetime(series, errors='coerce')
                self.datetime_cols.append(col)
                dtype_str = "Datetime"
            elif pd.api.types.is_numeric_dtype(series):
                # Impute numeric missing values with median
                median_val = series.median()
                if pd.isna(median_val):
                    median_val = 0
                cleaned_df[col] = series.fillna(median_val)
                self.numeric_cols.append(col)
                dtype_str = "Float" if pd.api.types.is_float_dtype(series) else "Integer"
            else:
                # String / Categorical: try numeric coercion
                numeric_attempt = pd.to_numeric(series, errors='coerce')
                if numeric_attempt.notnull().sum() > 0.75 * len(series):
                    cleaned_df[col] = numeric_attempt.fillna(numeric_attempt.median() if not pd.isna(numeric_attempt.median()) else 0)
                    self.numeric_cols.append(col)
                    dtype_str = "Integer / Float (Converted)"
                else:
                    cleaned_df[col] = series.fillna("Missing").astype(str)
                    self.categorical_cols.append(col)
                    dtype_str = "Categorical"

            # Compute Outliers for numeric columns using IQR & Z-score
            iqr_outliers = 0
            zscore_outliers = 0
            if col in self.numeric_cols:
                n_series = cleaned_df[col]
                q25, q75 = n_series.quantile(0.25), n_series.quantile(0.75)
                iqr = q75 - q25
                if iqr > 0:
                    iqr_outliers = int(((n_series < (q25 - 1.5 * iqr)) | (n_series > (q75 + 1.5 * iqr))).sum())
                std_dev = n_series.std()
                if std_dev > 0:
                    z_scores = (n_series - n_series.mean()) / std_dev
                    zscore_outliers = int((np.abs(z_scores) > 3).sum())

            self.column_metadata.append({
                "column_name": col,
                "dtype": dtype_str,
                "missing_count": null_count,
                "missing_pct": round((null_count / raw_rows) * 100, 2) if raw_rows > 0 else 0,
                "unique_values": unique_count,
                "iqr_outliers": iqr_outliers,
                "zscore_outliers": zscore_outliers,
                "sample_values": cleaned_df[col].dropna().head(3).tolist()
            })

        self.cleaned_df = cleaned_df
        self.cleaning_stats = {
            "initial_nulls": total_initial_nulls,
            "imputed_nulls": total_initial_nulls,
            "duplicates_removed": duplicates_removed,
            "total_outliers_iqr": sum(c["iqr_outliers"] for c in self.column_metadata),
            "total_outliers_zscore": sum(c["zscore_outliers"] for c in self.column_metadata)
        }

    def _compute_statistics(self) -> Dict[str, Any]:
        """Compute basic and advanced inferential statistics for numerical features."""
        stats_list = []
        for col in self.numeric_cols:
            s = self.cleaned_df[col].dropna()
            if len(s) == 0:
                continue
            
            count = len(s)
            mean_val = float(s.mean())
            std_val = float(s.std()) if count > 1 else 0.0
            median_val = float(s.median())
            min_val = float(s.min())
            max_val = float(s.max())
            q25 = float(s.quantile(0.25))
            q75 = float(s.quantile(0.75))
            
            # Advanced distribution analysis
            skew_val = float(stats.skew(s)) if count > 2 and std_val > 0 else 0.0
            kurt_val = float(stats.kurtosis(s)) if count > 3 and std_val > 0 else 0.0
            
            # 95% Confidence Interval
            sem = std_val / math.sqrt(count) if count > 0 else 0.0
            ci_lower = mean_val - (1.96 * sem)
            ci_upper = mean_val + (1.96 * sem)

            stats_list.append({
                "column": col,
                "count": count,
                "mean": round(mean_val, 4),
                "median": round(median_val, 4),
                "std": round(std_val, 4),
                "min": round(min_val, 4),
                "max": round(max_val, 4),
                "q25": round(q25, 4),
                "q75": round(q75, 4),
                "skewness": round(skew_val, 4),
                "kurtosis": round(kurt_val, 4),
                "ci_95_lower": round(ci_lower, 4),
                "ci_95_upper": round(ci_upper, 4),
                "skew_interpretation": "Symmetric" if abs(skew_val) < 0.5 else ("Right-skewed" if skew_val > 0 else "Left-skewed")
            })

        return {"descriptive": stats_list}

    def _run_hypothesis_tests(self) -> List[Dict[str, Any]]:
        """Perform dynamic automated hypothesis testing using SciPy."""
        tests = []
        
        # 1. T-Tests for numeric column pairs
        if len(self.numeric_cols) >= 2:
            num1 = self.numeric_cols[0]
            num2 = self.numeric_cols[1]
            s1 = self.cleaned_df[num1].dropna()
            s2 = self.cleaned_df[num2].dropna()
            if len(s1) > 3 and len(s2) > 3:
                t_stat, p_val = stats.ttest_ind(s1, s2, equal_var=False)
                p_val = float(p_val) if not np.isnan(p_val) else 1.0
                t_stat = float(t_stat) if not np.isnan(t_stat) else 0.0
                is_sig = p_val < 0.05
                tests.append({
                    "test_type": "Two-Sample T-Test",
                    "var1": num1,
                    "var2": num2,
                    "statistic": round(t_stat, 4),
                    "p_value": round(p_val, 4),
                    "is_significant": is_sig,
                    "interpretation": f"Statistically significant difference in means (p={p_val:.4f} < 0.05)." if is_sig else f"No statistically significant difference in means (p={p_val:.4f} >= 0.05)."
                })

        # 2. Chi-Square Test for categorical column pairs
        if len(self.categorical_cols) >= 2:
            cat1 = self.categorical_cols[0]
            cat2 = self.categorical_cols[1]
            # Filter columns with moderate unique values
            if self.cleaned_df[cat1].nunique() <= 20 and self.cleaned_df[cat2].nunique() <= 20:
                contingency_table = pd.crosstab(self.cleaned_df[cat1], self.cleaned_df[cat2])
                if contingency_table.size > 1:
                    chi2, p_val, dof, _ = stats.chi2_contingency(contingency_table)
                    p_val = float(p_val)
                    is_sig = p_val < 0.05
                    tests.append({
                        "test_type": "Chi-Square Test of Independence",
                        "var1": cat1,
                        "var2": cat2,
                        "statistic": round(float(chi2), 4),
                        "p_value": round(p_val, 4),
                        "is_significant": is_sig,
                        "interpretation": f"Significant association between '{cat1}' and '{cat2}' (p={p_val:.4f})." if is_sig else f"No significant association between '{cat1}' and '{cat2}' (p={p_val:.4f})."
                    })

        # 3. One-Way ANOVA for Categorical vs Numeric pair
        if len(self.categorical_cols) >= 1 and len(self.numeric_cols) >= 1:
            cat = self.categorical_cols[0]
            num = self.numeric_cols[0]
            if 2 <= self.cleaned_df[cat].nunique() <= 15:
                groups = [group[num].dropna().values for _, group in self.cleaned_df.groupby(cat)]
                groups = [g for g in groups if len(g) > 1]
                if len(groups) >= 2:
                    f_stat, p_val = stats.f_oneway(*groups)
                    p_val = float(p_val) if not np.isnan(p_val) else 1.0
                    f_stat = float(f_stat) if not np.isnan(f_stat) else 0.0
                    is_sig = p_val < 0.05
                    tests.append({
                        "test_type": "One-Way ANOVA",
                        "var1": cat,
                        "var2": num,
                        "statistic": round(f_stat, 4),
                        "p_value": round(p_val, 4),
                        "is_significant": is_sig,
                        "interpretation": f"Significant difference in '{num}' across categories of '{cat}' (p={p_val:.4f})." if is_sig else f"No significant group difference in '{num}' across '{cat}' (p={p_val:.4f})."
                    })

        return tests

    def _detect_anomalies(self) -> Dict[str, Any]:
        """Detect multivariate anomalies using Isolation Forest with PCA 2D coordinates."""
        if len(self.numeric_cols) < 2 or len(self.cleaned_df) < 5:
            return {
                "available": False,
                "message": "Insufficient numeric columns or rows (at least 2 numeric columns and 5 rows required) to run Isolation Forest anomaly detection."
            }

        X = self.cleaned_df[self.numeric_cols].values
        imputer = SimpleImputer(strategy="median")
        X_imputed = imputer.fit_transform(X)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_imputed)

        iso = IsolationForest(contamination=0.05, random_state=42)
        preds = iso.fit_predict(X_scaled)  # -1 = anomaly, 1 = normal
        scores = iso.decision_function(X_scaled)

        pca = PCA(n_components=2)
        coords = pca.fit_transform(X_scaled)

        anomaly_mask = preds == -1
        anomaly_count = int(np.sum(anomaly_mask))
        total_count = len(X)

        plot_points = []
        for i in range(min(500, total_count)):
            plot_points.append({
                "x": round(float(coords[i, 0]), 4),
                "y": round(float(coords[i, 1]), 4),
                "is_anomaly": bool(anomaly_mask[i]),
                "score": round(float(scores[i]), 4),
                "index": i
            })

        return {
            "available": True,
            "anomaly_count": anomaly_count,
            "anomaly_pct": round((anomaly_count / total_count) * 100, 2),
            "normal_count": total_count - anomaly_count,
            "pca_explained_variance": [round(float(v), 4) for v in pca.explained_variance_ratio_],
            "plot_points": plot_points
        }

    def _run_kmeans_clustering(self) -> Dict[str, Any]:
        """Group numeric data into clusters using K-Means with PCA 2D coordinates."""
        if len(self.numeric_cols) < 2 or len(self.cleaned_df) < 5:
            return {
                "available": False,
                "message": "Insufficient numeric columns or rows available to render K-Means cluster segmentation."
            }

        X = self.cleaned_df[self.numeric_cols].values
        imputer = SimpleImputer(strategy="median")
        X_imputed = imputer.fit_transform(X)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_imputed)

        k = min(4, max(2, len(self.cleaned_df) // 15))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(X_scaled)

        pca = PCA(n_components=2)
        coords = pca.fit_transform(X_scaled)

        cluster_summary = []
        for c_id in range(k):
            mask = cluster_labels == c_id
            c_size = int(np.sum(mask))
            cluster_summary.append({
                "cluster_id": c_id,
                "name": f"Cluster {c_id + 1}",
                "size": c_size,
                "percentage": round((c_size / len(X)) * 100, 2)
            })

        plot_points = []
        for i in range(min(500, len(X))):
            plot_points.append({
                "x": round(float(coords[i, 0]), 4),
                "y": round(float(coords[i, 1]), 4),
                "cluster": int(cluster_labels[i]),
                "index": i
            })

        return {
            "available": True,
            "k_clusters": k,
            "clusters": cluster_summary,
            "plot_points": plot_points
        }

    def _compute_feature_importance(self) -> Dict[str, Any]:
        """Determine top business drivers using Random Forest Regressor and correlation matrix."""
        if len(self.numeric_cols) < 2:
            return {
                "available": False,
                "message": "At least 2 numeric columns required to evaluate feature importance and correlation matrix."
            }

        # Target variable: last numeric column or highest variance
        target_col = self.numeric_cols[-1]
        feature_cols = [c for c in self.numeric_cols if c != target_col]

        X = self.cleaned_df[feature_cols].values
        y = self.cleaned_df[target_col].values

        imputer = SimpleImputer(strategy="median")
        X_imputed = imputer.fit_transform(X)

        rf = RandomForestRegressor(n_estimators=100, random_state=42)
        rf.fit(X_imputed, y)

        importances = rf.feature_importances_
        feature_scores = []
        for feat, score in zip(feature_cols, importances):
            feature_scores.append({
                "feature": feat,
                "score": round(float(score) * 100, 2)
            })

        feature_scores.sort(key=lambda x: x["score"], reverse=True)

        # Correlation Matrix (Pearson)
        corr_matrix = self.cleaned_df[self.numeric_cols].corr().fillna(0)
        corr_data = {
            "columns": list(corr_matrix.columns),
            "values": [[round(float(val), 4) for val in row] for row in corr_matrix.values]
        }

        return {
            "available": True,
            "target_column": target_col,
            "feature_importance": feature_scores,
            "correlation_matrix": corr_data
        }

    def _evaluate_time_series(self) -> Dict[str, Any]:
        """Analyze temporal trends and moving averages if datetime column is detected."""
        if not self.datetime_cols or not self.numeric_cols:
            return {
                "available": False,
                "message": "No valid datetime columns detected in this CSV for time-series evaluation."
            }

        dt_col = self.datetime_cols[0]
        num_col = self.numeric_cols[0]

        temp_df = self.cleaned_df[[dt_col, num_col]].dropna().sort_values(by=dt_col)
        if len(temp_df) < 5:
            return {
                "available": False,
                "message": "Insufficient date points to calculate moving averages."
            }

        temp_df["ma_7"] = temp_df[num_col].rolling(window=7, min_periods=1).mean()
        temp_df["ma_30"] = temp_df[num_col].rolling(window=30, min_periods=1).mean()

        time_points = []
        for _, row in temp_df.head(200).iterrows():
            time_points.append({
                "date": str(row[dt_col].strftime("%Y-%m-%d") if hasattr(row[dt_col], "strftime") else str(row[dt_col])),
                "value": round(float(row[num_col]), 2),
                "ma_7": round(float(row["ma_7"]), 2),
                "ma_30": round(float(row["ma_30"]), 2)
            })

        first_val = temp_df[num_col].iloc[0]
        last_val = temp_df[num_col].iloc[-1]
        pct_change = round(((last_val - first_val) / abs(first_val)) * 100, 2) if first_val != 0 else 0.0

        return {
            "available": True,
            "datetime_column": dt_col,
            "numeric_column": num_col,
            "trend": "Upward" if pct_change > 2 else ("Downward" if pct_change < -2 else "Stable"),
            "pct_change": pct_change,
            "points": time_points
        }

    def _prepare_chart_data(self) -> Dict[str, Any]:
        """Prepare distribution histogram and categorical donut chart payloads."""
        histograms = {}
        for col in self.numeric_cols[:4]:
            s = self.cleaned_df[col].dropna()
            counts, bin_edges = np.histogram(s, bins=15)
            histograms[col] = {
                "counts": [int(c) for c in counts],
                "bin_edges": [round(float(b), 2) for b in bin_edges]
            }

        donuts = {}
        for col in self.categorical_cols[:3]:
            vc = self.cleaned_df[col].value_counts().head(8)
            donuts[col] = {
                "labels": [str(k) for k in vc.index],
                "values": [int(v) for v in vc.values]
            }

        return {
            "histograms": histograms,
            "donuts": donuts
        }

    def _generate_executive_summary(
        self,
        stats_data: Dict[str, Any],
        anomaly_results: Dict[str, Any],
        segmentation_results: Dict[str, Any],
        feature_importance_results: Dict[str, Any],
        time_series_results: Dict[str, Any],
        hypothesis_tests: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Auto-generate plain-English executive summary highlighting key findings."""
        raw_rows = len(self.raw_df)
        cleaned_rows = len(self.cleaned_df)
        nulls = self.cleaning_stats.get("imputed_nulls", 0)
        dups = self.cleaning_stats.get("duplicates_removed", 0)

        overview_text = (
            f"The uploaded dataset '{self.filename}' was successfully ingested and cleaned. "
            f"It contains {cleaned_rows:,} active records across {len(self.cleaned_df.columns)} variables "
            f"({len(self.numeric_cols)} numerical, {len(self.categorical_cols)} categorical). "
            f"During automated data hygiene, {nulls:,} missing cell values were imputed and {dups:,} duplicate rows were purged."
        )

        key_takeaways = []

        # Anomaly Takeaway
        if anomaly_results.get("available"):
            count = anomaly_results["anomaly_count"]
            pct = anomaly_results["anomaly_pct"]
            key_takeaways.append(
                f"**Outlier & Anomaly Alert**: Isolation Forest algorithm flagged **{count:,} anomalous records** ({pct}% of the dataset) requiring operational audit."
            )
        else:
            key_takeaways.append(
                "**Data Consistency**: The dataset shows uniform distribution patterns with no critical multivariate anomalies detected."
            )

        # Feature Importance Takeaway
        if feature_importance_results.get("available") and feature_importance_results.get("feature_importance"):
            top_driver = feature_importance_results["feature_importance"][0]
            target = feature_importance_results["target_column"]
            key_takeaways.append(
                f"**Primary Business Driver**: Random Forest analysis identified **'{top_driver['feature']}'** as the strongest predictor of **'{target}'**, contributing **{top_driver['score']}%** of key variance."
            )

        # Cluster Takeaway
        if segmentation_results.get("available"):
            k = segmentation_results["k_clusters"]
            key_takeaways.append(
                f"**Data Segmentation**: K-Means clustering segmented the records into **{k} distinct customer/operational clusters** based on multidimensional feature patterns."
            )

        # Time-series Takeaway
        if time_series_results.get("available"):
            trend = time_series_results["trend"]
            pct = time_series_results["pct_change"]
            col = time_series_results["numeric_column"]
            key_takeaways.append(
                f"**Temporal Trend**: '{col}' exhibits an **{trend} trend** ({pct:+}%) over the evaluated time horizon."
            )

        # Statistical Hypothesis Takeaway
        if hypothesis_tests:
            sig_test = next((t for t in hypothesis_tests if t["is_significant"]), None)
            if sig_test:
                key_takeaways.append(
                    f"**Statistical Test**: {sig_test['test_type']} confirmed a statistically significant relationship between **'{sig_test['var1']}'** and **'{sig_test['var2']}'** (p={sig_test['p_value']:.4f})."
                )

        return {
            "title": f"Executive Data Summary: {self.filename}",
            "overview": overview_text,
            "takeaways": key_takeaways
        }
