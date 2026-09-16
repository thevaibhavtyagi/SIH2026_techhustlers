from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "final_unified_risk_analysis_v2.csv"
)


class RiskService:

    def __init__(self):
        self.data = pd.read_csv(
            DATA_FILE,
            low_memory=False
        )

    def _filter_data(self, state: str = None, district: str = None, constituency: str = None):
        df = self.data.copy()
        if state:
            df = df[df["state"].astype(str).str.lower() == state.lower()]
        if district:
            df = df[df["ida"].astype(str).str.lower() == district.lower()]
        if constituency:
            df = df[df["constituency"].astype(str).str.lower() == constituency.lower()]
        return df

    def get_summary(self, state: str = None, district: str = None, constituency: str = None):

        df = self._filter_data(state, district, constituency)

        total_projects = len(df)

        risk_counts = (
            df["final_ai_risk_level"]
            .value_counts()
            .to_dict()
        )

        average_score = (
            pd.to_numeric(
                df["final_ai_risk_score"],
                errors="coerce"
            )
            .mean()
        )

        high_critical = df[
            df["final_ai_risk_level"]
            .isin(["HIGH", "CRITICAL"])
        ]

        return {
            "total_projects": total_projects,

            "risk_distribution": {
                "LOW": int(risk_counts.get("LOW", 0)),
                "MEDIUM": int(risk_counts.get("MEDIUM", 0)),
                "HIGH": int(risk_counts.get("HIGH", 0)),
                "CRITICAL": int(risk_counts.get("CRITICAL", 0)),
            },

            "average_risk_score": round(
                float(average_score),
                2
            ),

            "high_critical_projects": len(
                high_critical
            ),
        }

    def get_distribution(self, state: str = None, district: str = None, constituency: str = None):

        df = self._filter_data(state, district, constituency)

        distribution = (
            df["final_ai_risk_level"]
            .value_counts()
            .reindex(
                ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                fill_value=0
            )
        )

        return {
            "labels": distribution.index.tolist(),
            "values": [
                int(value)
                for value in distribution.values
            ]
        }