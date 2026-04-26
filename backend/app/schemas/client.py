from pydantic import BaseModel
from typing import Optional

class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None

class ClientResponse(ClientCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True