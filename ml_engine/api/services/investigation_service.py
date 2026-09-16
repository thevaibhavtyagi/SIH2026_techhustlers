from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]

QUEUE_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "investigation_queue.csv"
)

# v3 has real grounded LLM text (column: grounded_llm_report).
# v4 has the right schema but all 20 entries have report_status=FAILED
# due to LLM rate-limit errors during generation.
# We merge v3's real text into the report dataframe at startup.
REPORT_FILE_V3 = (
    BASE_DIR
    / "data"
    / "processed"
    / "grounded_llm_investigation_reports_v3.csv"
)


class InvestigationService:

    def __init__(self):

        self.queue = pd.read_csv(
            QUEUE_FILE,
            low_memory=False
        )

        # Build the reports table:
        # 1. Start from queue columns needed by InvestigationReportResponse
        report_cols = [
            "investigation_rank", "work_id", "state", "constituency",
            "final_ai_risk_score", "final_ai_risk_level",
            "risk_detection_confidence", "active_risk_engines",
            "available_risk_engines", "primary_risk_source",
            "investigation_priority_score", "investigation_priority_category",
        ]
        base = self.queue[
            [c for c in report_cols if c in self.queue.columns]
        ].copy()

        # 2. Merge real LLM report text from v3
        try:
            v3 = pd.read_csv(REPORT_FILE_V3, low_memory=False)
            # v3 uses "grounded_llm_report"; rename to the schema field
            if "grounded_llm_report" in v3.columns:
                v3 = v3[["work_id", "grounded_llm_report"]].rename(
                    columns={"grounded_llm_report": "grounded_llm_investigation_report"}
                )
                base = base.merge(v3, on="work_id", how="left")
            else:
                base["grounded_llm_investigation_report"] = None
            v3_loaded = True
        except Exception as e:
            print(f"Warning: could not load v3 reports: {e}")
            base["grounded_llm_investigation_report"] = None
            v3_loaded = False

        # 3. Set report_status based on whether real text is present
        has_text = (
            base["grounded_llm_investigation_report"].notna()
            & (base["grounded_llm_investigation_report"].astype(str).str.strip() != "")
        )
        base["report_status"] = has_text.map(
            {True: "COMPLETE", False: "NOT_GENERATED"}
        )
        base["report_file"] = None

        self.reports = base

        print(
            f"Investigation queue loaded: "
            f"{len(self.queue)} projects"
        )
        complete_count = (base["report_status"] == "COMPLETE").sum()
        print(
            f"Investigation reports loaded: "
            f"{len(base)} entries | {complete_count} with real LLM text"
            f" (v3_source={'yes' if v3_loaded else 'no'})"
        )

    def _clean_records(self, df):

        # Replace infinity values
        df = df.replace(
            [float("inf"), float("-inf")],
            None
        )

        # Convert NaN to None
        df = df.astype(object).where(
            pd.notna(df),
            None
        )

        return df.to_dict(orient="records")

    def get_investigations(
        self,
        limit=20,
        offset=0,
        risk_level=None,
        priority_category=None,
        state=None,
        district=None,
        constituency=None,
    ):

        df = self.queue.copy()

        # Risk level filter
        if risk_level:

            df = df[
                df["final_ai_risk_level"]
                .astype(str)
                .str.upper()
                == risk_level.upper()
            ]

        # Priority category filter
        if priority_category:

            df = df[
                df["investigation_priority_category"]
                .astype(str)
                .str.lower()
                .str.contains(
                    priority_category.lower(),
                    na=False
                )
            ]

        # State filter
        if state:

            df = df[
                df["state"]
                .astype(str)
                .str.lower()
                .str.contains(
                    state.lower(),
                    na=False
                )
            ]

        if district:
            df = df[
                df["ida"]
                .astype(str)
                .str.lower()
                .str.contains(
                    district.lower(),
                    na=False
                )
            ]

        if constituency:
            df = df[
                df["constituency"]
                .astype(str)
                .str.lower()
                .str.contains(
                    constituency.lower(),
                    na=False
                )
            ]

        total = len(df)

        # Pagination
        df = df.iloc[
            offset:offset + limit
        ]

        records = self._clean_records(df)

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "investigations": records,
        }

    def get_investigation(self, work_id):

        df = self.queue[
            self.queue["work_id"].astype(str)
            == str(work_id)
        ]

        if df.empty:
            return None

        record = self._clean_records(df)

        return record[0]

    def get_report(self, work_id):

        df = self.reports[
            self.reports["work_id"].astype(str)
            == str(work_id)
        ]

        if df.empty:
            return None

        record = self._clean_records(df)
        result = record[0]

        # Only return if there is actual report content.
        # A queue entry with no LLM text is not a completed report.
        if not result.get("grounded_llm_investigation_report"):
            return None

        return result