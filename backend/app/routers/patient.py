"""患者管理 API 路由"""

from fastapi import APIRouter, HTTPException, Query
from typing import List
from tortoise import Tortoise
from app.models.patient import Patient
from app.models.blood_sugar import BloodSugar
from app.models.diet_record import DietRecord
from app.models.exercise import Exercise
from app.models.health_report import HealthReport
from app.models.medication import Medication
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter(prefix="/patients", tags=["patients"])


# 获取患者列表，使用 PatientResponse Schema 来校验、过滤和序列化返回值。
@router.get("/", response_model=List[PatientResponse])
async def list_patients(skip: int = 0, limit: int = 20):
    patients = await Patient.all().offset(skip).limit(limit)
    return patients


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: int):
    """获取单个患者详情"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    return patient


@router.post("/", response_model=PatientResponse)
async def create_patient(data: PatientCreate):
    """创建新患者"""
    # model_dump()：Pydantic v2的写法，将请求体转换为字典。
    patient = await Patient.create(**data.model_dump())
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: int, data: PatientUpdate):
    """更新患者信息"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    # 提取已设置的字段进行更新
    # exclude_unset=True：排除未设置的字段。
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)

    await patient.save()  # 异步保存
    return patient


@router.delete("/{patient_id}")
async def delete_patient(patient_id: int):
    """删除患者及其关联记录"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    # 先删除所有引用该患者的子记录，避免外键约束阻止删除
    await BloodSugar.filter(patient_id=patient_id).delete()
    await DietRecord.filter(patient_id=patient_id).delete()
    await Exercise.filter(patient_id=patient_id).delete()
    await HealthReport.filter(patient_id=patient_id).delete()
    await Medication.filter(patient_id=patient_id).delete()

    # chat_history 表存在但没有对应模型，用原生 SQL 清理其外键记录
    conn = Tortoise.get_connection("default")
    await conn.execute_query(
        "DELETE FROM chat_history WHERE patient_id = %s", [patient_id]
    )

    await patient.delete()  # 异步删除
    return {"message": "删除成功"}
