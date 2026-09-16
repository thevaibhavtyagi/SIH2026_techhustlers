from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "final_unified_risk_analysis_v2.csv"
)


class AnalyticsService:

    def __init__(self):

        self.data = pd.read_csv(
            DATA_FILE,
            low_memory=False
        )

        self.data["sanction_amount"] = pd.to_numeric(
            self.data["sanction_amount"], errors="coerce"
        ).fillna(0)

        self.data["total_expenditure"] = pd.to_numeric(
            self.data["total_expenditure"], errors="coerce"
        ).fillna(0)

        print(
            f"Analytics data loaded: "
            f"{len(self.data)} projects"
        )

    def _filter_data(self, state: str = None, district: str = None, constituency: str = None):
        df = self.data.copy()
        if state:
            df = df[df["state"].astype(str).str.contains(state, case=False, na=False)]
        if district:
            df = df[df["ida"].astype(str).str.contains(district, case=False, na=False)]
        if constituency:
            df = df[df["constituency"].astype(str).str.contains(constituency, case=False, na=False)]
        return df

    def get_overview(self, state: str = None, district: str = None, constituency: str = None):

        df = self._filter_data(state, district, constituency)

        # ---------------------------------
        # Total projects
        # ---------------------------------

        total_projects = len(df)

        # ---------------------------------
        # Risk distribution
        # ---------------------------------

        risk_counts = (
            df["final_ai_risk_level"]
            .astype(str)
            .str.upper()
            .value_counts()
            .to_dict()
        )

        low = int(
            risk_counts.get("LOW", 0)
        )

        medium = int(
            risk_counts.get("MEDIUM", 0)
        )

        high = int(
            risk_counts.get("HIGH", 0)
        )

        critical = int(
            risk_counts.get("CRITICAL", 0)
        )

        # ---------------------------------
        # Risk scores
        # ---------------------------------

        risk_scores = pd.to_numeric(
            df["final_ai_risk_score"],
            errors="coerce"
        )

        average_risk_score = risk_scores.mean()

        maximum_risk_score = risk_scores.max()

        # ---------------------------------
        # HIGH + CRITICAL
        # ---------------------------------

        high_critical_projects = (
            high + critical
        )

        # ---------------------------------
        # ML detected projects
        # ---------------------------------

        ml_detected_projects = (
            pd.to_numeric(
                df["ml_detected"],
                errors="coerce"
            )
            .fillna(0)
            .astype(int)
            .sum()
        )

        # ---------------------------------
        # Multi-engine projects
        # ---------------------------------

        active_engines = pd.to_numeric(
            df["active_risk_engines"],
            errors="coerce"
        ).fillna(0)

        multi_engine_projects = (
            active_engines >= 2
        ).sum()

        # ---------------------------------
        # Financials and Status
        # ---------------------------------

        total_sanctioned_amount = df["sanction_amount"].sum()
        total_expenditure = df["total_expenditure"].sum()

        completed_projects = (
            df["work_status"].astype(str).str.lower() == "work completed"
        ).sum()

        pending_projects = total_projects - completed_projects

        # ---------------------------------
        # Return response
        # ---------------------------------

        return {

            "total_projects": total_projects,
            "total_sanctioned_amount": float(total_sanctioned_amount),
            "total_expenditure": float(total_expenditure),
            "completed_projects": int(completed_projects),
            "pending_projects": int(pending_projects),

            "risk_distribution": {
                "LOW": low,
                "MEDIUM": medium,
                "HIGH": high,
                "CRITICAL": critical
            },

            "average_risk_score": round(
                float(average_risk_score),
                2
            ),

            "maximum_risk_score": round(
                float(maximum_risk_score),
                2
            ),

            "high_critical_projects": (
                high_critical_projects
            ),

            "ml_detected_projects": int(
                ml_detected_projects
            ),

            "multi_engine_projects": int(
                multi_engine_projects
            )
        }

    def get_states(self, state: str = None, district: str = None, constituency: str = None):

        df = self._filter_data(state, district, constituency)

        result = (
            df.groupby("state")
            .agg(
                total_projects=("work_id", "count"),
                total_sanctioned_amount=("sanction_amount", "sum"),
                total_expenditure=("total_expenditure", "sum"),
                average_risk_score=(
                    "final_ai_risk_score",
                    "mean"
                )
            )
            .reset_index()
        )

        high = (
            df[df["final_ai_risk_level"] == "HIGH"]
            .groupby("state")
            .size()
            .rename("high_risk")
        )

        critical = (
            df[df["final_ai_risk_level"] == "CRITICAL"]
            .groupby("state")
            .size()
            .rename("critical_risk")
        )

        result = result.merge(
            high,
            on="state",
            how="left"
        )

        result = result.merge(
            critical,
            on="state",
            how="left"
        )

        result["high_risk"] = (
            result["high_risk"]
            .fillna(0)
            .astype(int)
        )

        result["critical_risk"] = (
            result["critical_risk"]
            .fillna(0)
            .astype(int)
        )

        result["average_risk_score"] = (
            result["average_risk_score"]
            .round(2)
        )

        result = result.sort_values(
            "total_projects",
            ascending=False
        )

        return {
            "total_states": len(result),
            "states": result.to_dict(
                orient="records"
            )
        }

    def get_categories(self, state: str = None, district: str = None, constituency: str = None):

        df = self._filter_data(state, district, constituency)

        result = (
            df.groupby("work_category")
            .agg(
                total_projects=("work_id", "count"),
                total_sanctioned_amount=("sanction_amount", "sum"),
                total_expenditure=("total_expenditure", "sum"),
                average_risk_score=(
                    "final_ai_risk_score",
                    "mean"
                )
            )
            .reset_index()
        )

        high = (
            df[df["final_ai_risk_level"] == "HIGH"]
            .groupby("work_category")
            .size()
            .rename("high_risk")
        )

        critical = (
            df[df["final_ai_risk_level"] == "CRITICAL"]
            .groupby("work_category")
            .size()
            .rename("critical_risk")
        )

        result = result.merge(
            high,
            on="work_category",
            how="left"
        )

        result = result.merge(
            critical,
            on="work_category",
            how="left"
        )

        result["high_risk"] = (
            result["high_risk"]
            .fillna(0)
            .astype(int)
        )

        result["critical_risk"] = (
            result["critical_risk"]
            .fillna(0)
            .astype(int)
        )

        result["average_risk_score"] = (
            result["average_risk_score"]
            .round(2)
        )

        result = result.sort_values(
            "total_projects",
            ascending=False
        )

        return {
            "total_categories": len(result),
            "categories": result.to_dict(
                orient="records"
            )
        }

    def get_constituencies(self, state: str = None, district: str = None, constituency: str = None):

        df = self._filter_data(state, district, constituency)

        result = (
            df.groupby(
                ["state", "constituency"]
            )
            .agg(
                total_projects=("work_id", "count"),
                total_sanctioned_amount=("sanction_amount", "sum"),
                total_expenditure=("total_expenditure", "sum"),
                average_risk_score=(
                    "final_ai_risk_score",
                    "mean"
                )
            )
            .reset_index()
        )

        high = (
            df[df["final_ai_risk_level"] == "HIGH"]
            .groupby(
                ["state", "constituency"]
            )
            .size()
            .rename("high_risk")
        )

        critical = (
            df[df["final_ai_risk_level"] == "CRITICAL"]
            .groupby(
                ["state", "constituency"]
            )
            .size()
            .rename("critical_risk")
        )

        result = result.merge(
            high,
            on=["state", "constituency"],
            how="left"
        )

        result = result.merge(
            critical,
            on=["state", "constituency"],
            how="left"
        )

        result["high_risk"] = (
            result["high_risk"]
            .fillna(0)
            .astype(int)
        )

        result["critical_risk"] = (
            result["critical_risk"]
            .fillna(0)
            .astype(int)
        )

        result["average_risk_score"] = (
            result["average_risk_score"]
            .round(2)
        )

        result = result.sort_values(
            "average_risk_score",
            ascending=False
        )

        return {
            "total_constituencies": len(result),
            "constituencies": result.to_dict(
                orient="records"
            )
        }

    def get_timeseries(self, state: str = None, district: str = None, constituency: str = None):
        df = self._filter_data(state, district, constituency)
        
        # Parse dates safely
        rec_dates = pd.to_datetime(df["recommended_date"], errors="coerce").dropna()
        sanc_dates = pd.to_datetime(df["sanction_date"], errors="coerce").dropna()
        comp_dates = pd.to_datetime(df["completion_date"], errors="coerce").dropna()
        
        # Convert to month period strings (YYYY-MM)
        rec_months = rec_dates.dt.to_period("M").astype(str)
        sanc_months = sanc_dates.dt.to_period("M").astype(str)
        comp_months = comp_dates.dt.to_period("M").astype(str)
        
        # Aggregate counts per month
        rec_counts = rec_months.value_counts().rename("recommended_projects")
        sanc_counts = sanc_months.value_counts().rename("sanctioned_projects")
        comp_counts = comp_months.value_counts().rename("completed_projects")
        
        # Merge all aggregates
        merged = pd.concat([rec_counts, sanc_counts, comp_counts], axis=1).fillna(0).astype(int)
        
        # Ensure we have continuous months between min and max date
        if not merged.empty:
            min_date = min(
                rec_dates.min() if not rec_dates.empty else pd.Timestamp.max,
                sanc_dates.min() if not sanc_dates.empty else pd.Timestamp.max,
                comp_dates.min() if not comp_dates.empty else pd.Timestamp.max
            )
            max_date = max(
                rec_dates.max() if not rec_dates.empty else pd.Timestamp.min,
                sanc_dates.max() if not sanc_dates.empty else pd.Timestamp.min,
                comp_dates.max() if not comp_dates.empty else pd.Timestamp.min
            )
            
            if pd.notna(min_date) and pd.notna(max_date) and min_date <= max_date:
                all_months = pd.period_range(min_date, max_date, freq="M").astype(str)
                merged = merged.reindex(all_months, fill_value=0)
        
        # Convert to list of dicts and sort chronologically
        merged = merged.sort_index()
        result = []
        for month_str, row in merged.iterrows():
            result.append({
                "month": str(month_str),
                "recommended_projects": int(row["recommended_projects"]),
                "sanctioned_projects": int(row["sanctioned_projects"]),
                "completed_projects": int(row["completed_projects"])
            })
            
        return result