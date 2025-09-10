from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    AGENCY = "agency"
    COORDINATOR = "coordinator"
    ROTA_MANAGER = "rota_manager"
    PACKING_VOLUNTEER = "packing_volunteer"
    DRIVER = "driver"
    RESIDENT = "resident"
    ONLINE_SHOPPER = "online_shopper"
    PHYSICAL_SHOPPER = "physical_shopper"

class FamilyStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TEMPORARY = "temporary"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PackingStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Agency(Base):
    __tablename__ = "agencies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    families = relationship("Family", back_populates="agency")
    weekly_requirements = relationship("WeeklyRequirement", back_populates="agency")

class Family(Base):
    __tablename__ = "families"
    
    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id"), nullable=False)
    family_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text)
    family_size = Column(Integer, default=1)
    special_requirements = Column(Text)
    status = Column(SQLEnum(FamilyStatus), default=FamilyStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    agency = relationship("Agency", back_populates="families")
    food_boxes = relationship("FoodBox", back_populates="family")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # food, hygiene, special
    description = Column(Text)
    unit = Column(String, nullable=False)  # kg, pieces, etc.
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    inventory_items = relationship("InventoryItem", back_populates="item")
    packing_list_items = relationship("PackingListItem", back_populates="item")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    min_quantity = Column(Float, default=0)
    max_quantity = Column(Float)
    location = Column(String)
    expiry_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    item = relationship("Item", back_populates="inventory_items")

class WeeklyRequirement(Base):
    __tablename__ = "weekly_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id"), nullable=False)
    week_start = Column(DateTime, nullable=False)
    week_end = Column(DateTime, nullable=False)
    total_families = Column(Integer, nullable=False)
    total_boxes = Column(Integer, nullable=False)
    special_requests = Column(Text)
    status = Column(String, default="pending")  # pending, confirmed, packed, collected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    agency = relationship("Agency", back_populates="weekly_requirements")

class PackingList(Base):
    __tablename__ = "packing_lists"
    
    id = Column(Integer, primary_key=True, index=True)
    week_start = Column(DateTime, nullable=False)
    week_end = Column(DateTime, nullable=False)
    total_boxes = Column(Integer, nullable=False)
    status = Column(SQLEnum(PackingStatus), default=PackingStatus.SCHEDULED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    packing_list_items = relationship("PackingListItem", back_populates="packing_list")
    packing_sessions = relationship("PackingSession", back_populates="packing_list")

class PackingListItem(Base):
    __tablename__ = "packing_list_items"
    
    id = Column(Integer, primary_key=True, index=True)
    packing_list_id = Column(Integer, ForeignKey("packing_lists.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity_per_box = Column(Float, nullable=False)
    total_quantity_needed = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    packing_list = relationship("PackingList", back_populates="packing_list_items")
    item = relationship("Item", back_populates="packing_list_items")

class PackingSession(Base):
    __tablename__ = "packing_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    packing_list_id = Column(Integer, ForeignKey("packing_lists.id"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(PackingStatus), default=PackingStatus.SCHEDULED)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    packing_list = relationship("PackingList", back_populates="packing_sessions")
    volunteer_assignments = relationship("VolunteerAssignment", back_populates="packing_session")

class VolunteerAssignment(Base):
    __tablename__ = "volunteer_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    packing_session_id = Column(Integer, ForeignKey("packing_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    confirmed = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    packing_session = relationship("PackingSession", back_populates="volunteer_assignments")
    user = relationship("User")

class FoodBox(Base):
    __tablename__ = "food_boxes"
    
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    packing_session_id = Column(Integer, ForeignKey("packing_sessions.id"), nullable=False)
    box_number = Column(String, nullable=False)
    status = Column(String, default="packed")  # packed, collected, delivered
    collected_at = Column(DateTime)
    collected_by = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    family = relationship("Family", back_populates="food_boxes")
    packing_session = relationship("PackingSession")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_type = Column(String, nullable=False)  # weekly, monthly, quarterly, hygiene, special
    supplier = Column(String, nullable=False)
    order_date = Column(DateTime, nullable=False)
    delivery_date = Column(DateTime)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    total_cost = Column(Float)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    order_items = relationship("OrderItem", back_populates="order")
    creator = relationship("User")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float)
    total_price = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    order = relationship("Order", back_populates="order_items")
    item = relationship("Item")

class Rota(Base):
    __tablename__ = "rotas"
    
    id = Column(Integer, primary_key=True, index=True)
    rota_type = Column(String, nullable=False)  # packing, hygiene
    quarter_start = Column(DateTime, nullable=False)
    quarter_end = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    rota_assignments = relationship("RotaAssignment", back_populates="rota")

class RotaAssignment(Base):
    __tablename__ = "rota_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    rota_id = Column(Integer, ForeignKey("rotas.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_start = Column(DateTime, nullable=False)
    week_end = Column(DateTime, nullable=False)
    role = Column(String, nullable=False)
    confirmed = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rota = relationship("Rota", back_populates="rota_assignments")
    user = relationship("User")

class Communication(Base):
    __tablename__ = "communications"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    recipient_type = Column(String, nullable=False)  # agency, volunteer, all
    recipient_ids = Column(Text)  # JSON array of IDs
    sent_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    creator = relationship("User")
