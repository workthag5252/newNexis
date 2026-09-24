from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: Optional[str] = None
    role: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# AI Schemas
class AiPromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    system_prompt: Optional[str] = "You are a helpful, accurate, and concise AI assistant."
    model: Optional[str] = None
    temperature: Optional[float] = 0.7

class AiPromptResponse(BaseModel):
    id: Optional[int] = None
    prompt: str
    response: str
    model: str
    tokens_used: int
    created_at: datetime

class AiInteractionOut(BaseModel):
    id: int
    prompt: str
    response: str
    model_used: str
    tokens_used: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Google Sheets Schemas
class SheetSyncRequest(BaseModel):
    sheet_id: Optional[str] = None
    include_ai_history: bool = True
    include_users: bool = True
    google_access_token: Optional[str] = None

class SheetSyncResponse(BaseModel):
    status: str
    message: str
    sheet_id: str
    sheet_url: str
    synced_records_count: int
    synced_at: datetime

class SheetCreateRequest(BaseModel):
    title: str = "NexusAI Export"
    google_access_token: Optional[str] = None

# System Health
class SystemHealthOut(BaseModel):
    status: str
    database: str
    ai_service_configured: bool
    ai_model: str
    google_sheets_ready: bool
    timestamp: datetime
