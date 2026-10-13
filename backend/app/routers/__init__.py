from fastapi import APIRouter

from app.routers import (
    patient,
    blood_sugar,
    exercise,
    medication,
    diet_record,
    health_report,
    chat,
)

main_router = APIRouter(prefix="/api", tags=["main"])
main_router.include_router(patient.router)
main_router.include_router(blood_sugar.router)
main_router.include_router(exercise.router)
main_router.include_router(medication.router)
main_router.include_router(diet_record.router)
main_router.include_router(health_report.router)
main_router.include_router(chat.router)
