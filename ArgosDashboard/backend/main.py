# 檔案名稱: backend/main.py (不支援 Uploader)

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional
from enum import Enum
import datetime
import os
import google.generativeai as genai
import json
import hashlib
import secrets
import random
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy import Column, String, text

# --- (載入 .env) ---
load_dotenv()

# --- 1. 定義數據模型 (不含 Uploader) ---
class TrafficLight(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"

class ULDReport(SQLModel):
    uld_id: str
    status: TrafficLight
    damage_category: Optional[str] = None
    last_seen: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )
    location: Optional[str] = Field(
        default="HK",
        sa_column=Column("location", String, nullable=True),
    )
    shipping_location: Optional[str] = Field(
        default=None,
        sa_column=Column("shipping_location", String, nullable=True),
    )

class ULD(ULDReport, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class YOLOAnalysisRequest(BaseModel):
    uld_id: str
    yolo_findings: str 
    # (不含 Uploader)

class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class PasswordUpdateRequest(BaseModel):
    old_password: str
    new_password: str

# --- 2. 數據庫設定 ---
DATABASE_URL = "sqlite:///./argos.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

USER_CREDENTIALS_PATH = Path("user_credentials.json")

DESTINATION_OPTIONS = [
    "JFK",
    "LAX",
    "SFO",
    "SIN",
    "LHR",
    "FRA",
    "SYD",
    "NRT",
    "DXB",
    "CDG",
    "YYZ",
    "BOM",
]

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    salt_bytes = bytes.fromhex(salt)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 200000).hex()
    return salt, pwd_hash

def legacy_hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def ensure_user_storage():
    if not USER_CREDENTIALS_PATH.exists():
        salt, pwd_hash = hash_password("test")
        default_data = {
            "username": "test",
            "salt": salt,
            "password_hash": pwd_hash,
        }
        USER_CREDENTIALS_PATH.write_text(json.dumps(default_data))

def load_user_credentials() -> dict:
    ensure_user_storage()
    return json.loads(USER_CREDENTIALS_PATH.read_text())

def save_user_credentials(data: dict):
    USER_CREDENTIALS_PATH.write_text(json.dumps(data))


def ensure_additional_columns():
    with engine.begin() as connection:
        table_exists = connection.execute(
            text(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='uld'"
            )
        ).fetchone()
        if not table_exists:
            return

        columns = connection.execute(text("PRAGMA table_info(uld)")).fetchall()
        column_names = {column[1] for column in columns}

        if "shipping_location" not in column_names:
            connection.execute(
                text("ALTER TABLE uld ADD COLUMN shipping_location TEXT")
            )

        connection.execute(
            text(
                """
                UPDATE uld
                SET shipping_location = CASE
                    WHEN shipping_location IS NULL OR TRIM(shipping_location) = ''
                        THEN 'HK ➜ TBD'
                    ELSE shipping_location
                END
                """
            )
        )

        if "location" not in column_names:
            connection.execute(text("ALTER TABLE uld ADD COLUMN location TEXT"))

        connection.execute(
            text(
                """
                UPDATE uld
                SET location = CASE
                    WHEN location IS NULL OR TRIM(location) = ''
                        THEN 'HK'
                    ELSE location
                END
                """
            )
        )


def generate_shipping_destination() -> str:
    return f"HK ➜ {random.choice(DESTINATION_OPTIONS)}"


def ensure_report_defaults(report: ULDReport) -> None:
    report.location = "HK"
    if not report.shipping_location or not report.shipping_location.strip():
        report.shipping_location = generate_shipping_destination()


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    ensure_additional_columns()
    
    with Session(engine) as session:
        count_statement = select(ULD).limit(1)
        existing_uld = session.exec(count_statement).first()
        if not existing_uld:
            print("數據庫為空，植入初始假數據...")
            ulds_to_create = [
                ULD(
                    uld_id="AKE-CPA100", 
                    status=TrafficLight.GREEN, 
                    damage_category="No Damage Found",
                    location="HK",
                    shipping_location="HK ➜ JFK",
                    last_seen=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1)
                ),
                ULD(
                    uld_id="AMP-CPA302", 
                    status=TrafficLight.RED, 
                    damage_category="Forklift puncture (Base)",
                    location="HK",
                    shipping_location="HK ➜ SFO",
                    last_seen=datetime.datetime.now(datetime.timezone.utc)
                ),
                ULD(
                    uld_id="AKE-CPA205",
                    status=TrafficLight.YELLOW,
                    damage_category="Panel dent detected",
                    location="HK",
                    shipping_location="HK ➜ FRA",
                    last_seen=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=30)
                ),
            ]
            for uld in ulds_to_create:
                session.add(uld)
            session.commit()
            print("初始數據植入完成！")
        else:
            print("數據庫已有數據，跳過初始植入。")


def get_session():
    with Session(engine) as session:
        yield session

# --- 3. FastAPI App 實例 ---
app = FastAPI(
    title="ARGOS Project API",
    description="API for Cathay Hackathon - ULD Management"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LLM 知識庫 (保持不變) ---
ULD_INSPECTION_RULES = """
...
"""
TRAFFIC_LIGHT_LOGIC = """
...
"""

# --- 4. API 端點 (Endpoints) ---

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    ensure_user_storage()

# --- LLM 設定和 Prompt ---
try:
    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
    llm = genai.GenerativeModel('models/gemini-flash-latest')
except Exception as e:
    print(f"Warning: Could not configure Gemini API. API Key set? {e}")
    llm = None

def build_prompt(uld_id: str, yolo_findings: str) -> str: # (不含 Uploader)
    """ 建立 LLM 的 Prompt """
    return f"""
    You are an AI assistant for Cathay Cargo, named ARGOS. Your job is to act as a ULD (Unit Load Device) inspector.
    You will receive a damage report from a local YOLO model. Your task is to analyze this report against the official 'ULD Inspection Items' and 'Traffic Light Logic' provided below.

    **ULD Inspection Items:**
    {ULD_INSPECTION_RULES}

    **Traffic Light Logic:**
    {TRAFFIC_LIGHT_LOGIC}

    **Analysis Task:**
    The ULD ID is: {uld_id}
    The local YOLO model found: "{yolo_findings}"
    
    **Your Response:**
    You MUST respond *only* with a valid JSON object. Do not add any other text, markdown ticks (```json), or explanations.
    The JSON must have the following structure:
    {{
      "uld_id": "{uld_id}",
      "status": "green|yellow|red",
      "damage_category": "string (e.g., 'Panel crack > 10cm' or 'No damage found')",
      "shipping_location": "string (e.g., 'HKG ➜ LAX' or 'Ready at SFO Warehouse')"
    }}
    """
# --- END 新增 ---


# --- 重構：將儲存邏輯拆分出來 ---
def save_report_to_db(report: ULDReport, session: Session) -> ULD:
    """
    將報告儲存或更新到資料庫的核心邏輯
    """
    ensure_report_defaults(report)
    statement = select(ULD).where(ULD.uld_id == report.uld_id)
    existing_uld = session.exec(statement).first()
    
    if existing_uld:
        # 更新現有 ULD
        existing_uld.status = report.status
        existing_uld.damage_category = report.damage_category
        existing_uld.last_seen = report.last_seen
        existing_uld.location = report.location
        existing_uld.shipping_location = report.shipping_location
        # (不含 Uploader)
        session.add(existing_uld)
        session.commit()
        session.refresh(existing_uld)
        return existing_uld
    else:
        # 創建新的 ULD 紀錄
        new_uld = ULD.from_orm(report)
        session.add(new_uld)
        session.commit()
        session.refresh(new_uld)
        return new_uld
# --- END 重構 ---

# --- 新增：Cloud AI 端點 ---
@app.post("/api/ai/analyze", response_model=ULD)
async def analyze_uld_damage(
    request: YOLOAnalysisRequest, 
    session: Session = Depends(get_session)
):
    """
    [Cloud AI Endpoint]
    接收來自 App/YOLO 的原始發現，使用 LLM 進行分析...
    """
    if not llm:
        raise HTTPException(status_code=500, detail="Gemini AI Model is not configured. Check .env file.")
        
    # 1. 建構 Prompt (不含 Uploader)
    prompt = build_prompt(
        request.uld_id, 
        request.yolo_findings
    )
    
    try:
        # 2. 呼叫 LLM API
        response = await llm.generate_content_async(prompt)
        
        # 3. 解析 LLM 回應 (移除 markdown)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        ai_report_data = json.loads(cleaned_response)
        
        # 4. 建立 ULDReport 物件 (不含 Uploader)
        report = ULDReport(
            uld_id=ai_report_data.get("uld_id"),
            status=ai_report_data.get("status"),
            damage_category=ai_report_data.get("damage_category"),
            shipping_location=ai_report_data.get("shipping_location"),
        )

        # 5. (重要!) 呼叫我們拆分出來的 DB 儲存邏輯
        return save_report_to_db(report=report, session=session)

    except Exception as e:
        print(f"LLM or JSON parsing error: {e}") 
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
# --- END 新增 ---


# --- 修改：舊端點現在呼叫新的儲存邏輯 ---
@app.post("/api/uld/report", response_model=ULD)
def create_uld_report(report: ULDReport, session: Session = Depends(get_session)):
    """
    [舊端點 - 手動測試用]
    """
    # (不含 Uploader)
    return save_report_to_db(report=report, session=session)
# --- END 修改 ---


@app.get("/api/ulds", response_model=list[ULD])
def get_all_ulds(session: Session = Depends(get_session)):
    """
    提供所有 ULD 狀態給 Dashboard
    """
    statement = select(ULD).order_by(ULD.last_seen.desc())
    ulds = session.exec(statement).all()
    return ulds

@app.post("/api/login")
def login(request: LoginRequest, response: Response):
    creds = load_user_credentials()
    if request.username != creds.get("username"):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    salt = creds.get("salt")
    stored_hash = creds.get("password_hash")
    if salt:
        _, incoming_hash = hash_password(request.password, salt)
    else:
        incoming_hash = legacy_hash(request.password)
    if incoming_hash != stored_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    if not salt:
        salt, new_hash = hash_password(request.password)
        creds["salt"] = salt
        creds["password_hash"] = new_hash
        save_user_credentials(creds)

    token = "argos-token"
    cookie_params = {
        "key": "argos-token",
        "value": token,
        "path": "/",
        "httponly": True,
        "samesite": "lax",
        "secure": False,
    }
    if request.remember_me:
        cookie_params["max_age"] = 60 * 60 * 24 * 7
    response.set_cookie(**cookie_params)

    return {"token": token, "user": {"username": creds["username"]}}


@app.post("/api/profile/password")
def update_password(request: PasswordUpdateRequest):
    creds = load_user_credentials()
    salt = creds.get("salt")
    stored_hash = creds.get("password_hash")
    if salt:
        _, old_hash = hash_password(request.old_password, salt)
    else:
        old_hash = legacy_hash(request.old_password)
    if old_hash != stored_hash:
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    new_salt, new_hash = hash_password(request.new_password)
    creds["salt"] = new_salt
    creds["password_hash"] = new_hash
    save_user_credentials(creds)
    return {"status": "ok"}

# --- 5. 運行伺服器 ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)