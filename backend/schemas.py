from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from backend.models import UserRole, FamilyStatus, OrderStatus, PackingStatus

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Agency schemas
class AgencyBase(BaseModel):
    name: str
    contact_person: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None

class AgencyCreate(AgencyBase):
    pass

class AgencyUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class Agency(AgencyBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Family schemas
class FamilyBase(BaseModel):
    family_name: str
    contact_person: str
    phone: Optional[str] = None
    address: Optional[str] = None
    family_size: int = 1
    special_requirements: Optional[str] = None
    status: FamilyStatus = FamilyStatus.ACTIVE

class FamilyCreate(FamilyBase):
    agency_id: int

class FamilyUpdate(BaseModel):
    family_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    family_size: Optional[int] = None
    special_requirements: Optional[str] = None
    status: Optional[FamilyStatus] = None

class Family(FamilyBase):
    id: int
    agency_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Item schemas
class ItemBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    unit: str
    is_available: bool = True

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    is_available: Optional[bool] = None

class Item(ItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Inventory schemas
class InventoryItemBase(BaseModel):
    item_id: int
    quantity: float
    min_quantity: float = 0
    max_quantity: Optional[float] = None
    location: Optional[str] = None
    expiry_date: Optional[datetime] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    quantity: Optional[float] = None
    min_quantity: Optional[float] = None
    max_quantity: Optional[float] = None
    location: Optional[str] = None
    expiry_date: Optional[datetime] = None

class InventoryItem(InventoryItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Weekly Requirement schemas
class WeeklyRequirementBase(BaseModel):
    agency_id: int
    week_start: datetime
    week_end: datetime
    total_families: int
    total_boxes: int
    special_requests: Optional[str] = None

class WeeklyRequirementCreate(WeeklyRequirementBase):
    pass

class WeeklyRequirementUpdate(BaseModel):
    total_families: Optional[int] = None
    total_boxes: Optional[int] = None
    special_requests: Optional[str] = None
    status: Optional[str] = None

class WeeklyRequirement(WeeklyRequirementBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Packing List schemas
class PackingListBase(BaseModel):
    week_start: datetime
    week_end: datetime
    total_boxes: int

class PackingListCreate(PackingListBase):
    pass

class PackingListUpdate(BaseModel):
    total_boxes: Optional[int] = None
    status: Optional[PackingStatus] = None

class PackingList(PackingListBase):
    id: int
    status: PackingStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Packing List Item schemas
class PackingListItemBase(BaseModel):
    item_id: int
    quantity_per_box: float
    total_quantity_needed: float

class PackingListItemCreate(PackingListItemBase):
    packing_list_id: int

class PackingListItemUpdate(BaseModel):
    quantity_per_box: Optional[float] = None
    total_quantity_needed: Optional[float] = None

class PackingListItem(PackingListItemBase):
    id: int
    packing_list_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Packing Session schemas
class PackingSessionBase(BaseModel):
    packing_list_id: int
    scheduled_date: datetime
    notes: Optional[str] = None

class PackingSessionCreate(PackingSessionBase):
    pass

class PackingSessionUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    status: Optional[PackingStatus] = None
    notes: Optional[str] = None

class PackingSession(PackingSessionBase):
    id: int
    status: PackingStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Food Box schemas
class FoodBoxBase(BaseModel):
    family_id: int
    packing_session_id: int
    box_number: str
    notes: Optional[str] = None

class FoodBoxCreate(FoodBoxBase):
    pass

class FoodBoxUpdate(BaseModel):
    status: Optional[str] = None
    collected_at: Optional[datetime] = None
    collected_by: Optional[str] = None
    notes: Optional[str] = None

class FoodBox(FoodBoxBase):
    id: int
    status: str
    collected_at: Optional[datetime] = None
    collected_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    order_type: str
    supplier: str
    order_date: datetime
    delivery_date: Optional[datetime] = None
    total_cost: Optional[float] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    created_by: int

class OrderUpdate(BaseModel):
    order_type: Optional[str] = None
    supplier: Optional[str] = None
    order_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    status: Optional[OrderStatus] = None
    total_cost: Optional[float] = None
    notes: Optional[str] = None

class Order(OrderBase):
    id: int
    status: OrderStatus
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Order Item schemas
class OrderItemBase(BaseModel):
    item_id: int
    quantity: float
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    notes: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    order_id: int

class OrderItemUpdate(BaseModel):
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    notes: Optional[str] = None

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Rota schemas
class RotaBase(BaseModel):
    rota_type: str
    quarter_start: datetime
    quarter_end: datetime

class RotaCreate(RotaBase):
    pass

class RotaUpdate(BaseModel):
    quarter_start: Optional[datetime] = None
    quarter_end: Optional[datetime] = None
    is_active: Optional[bool] = None

class Rota(RotaBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Rota Assignment schemas
class RotaAssignmentBase(BaseModel):
    rota_id: int
    user_id: int
    week_start: datetime
    week_end: datetime
    role: str
    notes: Optional[str] = None

class RotaAssignmentCreate(RotaAssignmentBase):
    pass

class RotaAssignmentUpdate(BaseModel):
    week_start: Optional[datetime] = None
    week_end: Optional[datetime] = None
    role: Optional[str] = None
    confirmed: Optional[bool] = None
    notes: Optional[str] = None

class RotaAssignment(RotaAssignmentBase):
    id: int
    confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Communication schemas
class CommunicationBase(BaseModel):
    subject: str
    message: str
    recipient_type: str
    recipient_ids: Optional[List[int]] = None

class CommunicationCreate(CommunicationBase):
    created_by: int

class Communication(CommunicationBase):
    id: int
    sent_at: Optional[datetime] = None
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
