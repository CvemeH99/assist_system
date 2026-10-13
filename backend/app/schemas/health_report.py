from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime


# 健康报告响应体
class HealthReportResponse(BaseModel):
    id: int
    patient: int
    report_type: str
    period_start: date
    period_end: date
    avg_blood_sugar: Optional[float] = None
    blood_sugar_std: Optional[float] = None
    time_in_range: Optional[float] = None
    summary: str
    recommendations: Optional[str] = None
    risk_level: Optional[str] = None
    generated_at: datetime
