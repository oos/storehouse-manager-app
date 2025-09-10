from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, get_db
from backend import models, schemas, auth
from backend.models import User, UserRole
from backend.auth import get_password_hash, get_current_active_user
from datetime import datetime, timedelta
from typing import List, Optional
import uvicorn

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Storehouse Manager API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get current user
def get_current_user_role(required_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Storehouse Manager API"}

# Authentication endpoints
@app.post("/auth/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        phone=user.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Agency endpoints
@app.post("/agencies/", response_model=schemas.Agency)
async def create_agency(
    agency: schemas.AgencyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_agency = models.Agency(**agency.dict())
    db.add(db_agency)
    db.commit()
    db.refresh(db_agency)
    return db_agency

@app.get("/agencies/", response_model=List[schemas.Agency])
async def read_agencies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    agencies = db.query(models.Agency).offset(skip).limit(limit).all()
    return agencies

@app.get("/agencies/{agency_id}", response_model=schemas.Agency)
async def read_agency(
    agency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    agency = db.query(models.Agency).filter(models.Agency.id == agency_id).first()
    if agency is None:
        raise HTTPException(status_code=404, detail="Agency not found")
    return agency

# Family endpoints
@app.post("/families/", response_model=schemas.Family)
async def create_family(
    family: schemas.FamilyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_family = models.Family(**family.dict())
    db.add(db_family)
    db.commit()
    db.refresh(db_family)
    return db_family

@app.get("/families/", response_model=List[schemas.Family])
async def read_families(
    agency_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.Family)
    if agency_id:
        query = query.filter(models.Family.agency_id == agency_id)
    families = query.offset(skip).limit(limit).all()
    return families

@app.get("/families/{family_id}", response_model=schemas.Family)
async def read_family(
    family_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if family is None:
        raise HTTPException(status_code=404, detail="Family not found")
    return family

# Item endpoints
@app.post("/items/", response_model=schemas.Item)
async def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/items/", response_model=List[schemas.Item])
async def read_items(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.Item)
    if category:
        query = query.filter(models.Item.category == category)
    items = query.offset(skip).limit(limit).all()
    return items

# Weekly Requirement endpoints
@app.post("/weekly-requirements/", response_model=schemas.WeeklyRequirement)
async def create_weekly_requirement(
    requirement: schemas.WeeklyRequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_requirement = models.WeeklyRequirement(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@app.get("/weekly-requirements/", response_model=List[schemas.WeeklyRequirement])
async def read_weekly_requirements(
    agency_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.WeeklyRequirement)
    if agency_id:
        query = query.filter(models.WeeklyRequirement.agency_id == agency_id)
    requirements = query.offset(skip).limit(limit).all()
    return requirements

# Packing List endpoints
@app.post("/packing-lists/", response_model=schemas.PackingList)
async def create_packing_list(
    packing_list: schemas.PackingListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_packing_list = models.PackingList(**packing_list.dict())
    db.add(db_packing_list)
    db.commit()
    db.refresh(db_packing_list)
    return db_packing_list

@app.get("/packing-lists/", response_model=List[schemas.PackingList])
async def read_packing_lists(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    packing_lists = db.query(models.PackingList).offset(skip).limit(limit).all()
    return packing_lists

@app.get("/packing-lists/{packing_list_id}", response_model=schemas.PackingList)
async def read_packing_list(
    packing_list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    packing_list = db.query(models.PackingList).filter(models.PackingList.id == packing_list_id).first()
    if packing_list is None:
        raise HTTPException(status_code=404, detail="Packing list not found")
    return packing_list

@app.put("/packing-lists/{packing_list_id}", response_model=schemas.PackingList)
async def update_packing_list(
    packing_list_id: int,
    packing_list_update: schemas.PackingListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_packing_list = db.query(models.PackingList).filter(models.PackingList.id == packing_list_id).first()
    if db_packing_list is None:
        raise HTTPException(status_code=404, detail="Packing list not found")
    
    for field, value in packing_list_update.dict(exclude_unset=True).items():
        setattr(db_packing_list, field, value)
    
    db.commit()
    db.refresh(db_packing_list)
    return db_packing_list

@app.delete("/packing-lists/{packing_list_id}")
async def delete_packing_list(
    packing_list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_packing_list = db.query(models.PackingList).filter(models.PackingList.id == packing_list_id).first()
    if db_packing_list is None:
        raise HTTPException(status_code=404, detail="Packing list not found")
    
    db.delete(db_packing_list)
    db.commit()
    return {"message": "Packing list deleted successfully"}

# Packing List Items endpoints
@app.post("/packing-list-items/", response_model=schemas.PackingListItem)
async def create_packing_list_item(
    item: schemas.PackingListItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_item = models.PackingListItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/packing-list-items/", response_model=List[schemas.PackingListItem])
async def read_packing_list_items(
    packing_list_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.PackingListItem)
    if packing_list_id:
        query = query.filter(models.PackingListItem.packing_list_id == packing_list_id)
    items = query.offset(skip).limit(limit).all()
    return items

@app.put("/packing-list-items/{item_id}", response_model=schemas.PackingListItem)
async def update_packing_list_item(
    item_id: int,
    item_update: schemas.PackingListItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_item = db.query(models.PackingListItem).filter(models.PackingListItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Packing list item not found")
    
    for field, value in item_update.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/packing-list-items/{item_id}")
async def delete_packing_list_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_item = db.query(models.PackingListItem).filter(models.PackingListItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Packing list item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Packing list item deleted successfully"}

# Inventory endpoints
@app.post("/inventory/", response_model=schemas.InventoryItem)
async def create_inventory_item(
    inventory_item: schemas.InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_inventory_item = models.InventoryItem(**inventory_item.dict())
    db.add(db_inventory_item)
    db.commit()
    db.refresh(db_inventory_item)
    return db_inventory_item

@app.get("/inventory/", response_model=List[schemas.InventoryItem])
async def read_inventory(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    inventory_items = db.query(models.InventoryItem).offset(skip).limit(limit).all()
    return inventory_items

# User/Volunteer endpoints
@app.get("/users/", response_model=List[schemas.User])
async def read_users(
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.offset(skip).limit(limit).all()
    return users

@app.put("/users/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Rota endpoints
@app.post("/rotas/", response_model=schemas.Rota)
async def create_rota(
    rota: schemas.RotaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_rota = models.Rota(**rota.dict())
    db.add(db_rota)
    db.commit()
    db.refresh(db_rota)
    return db_rota

@app.get("/rotas/", response_model=List[schemas.Rota])
async def read_rotas(
    rota_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.Rota)
    if rota_type:
        query = query.filter(models.Rota.rota_type == rota_type)
    rotas = query.offset(skip).limit(limit).all()
    return rotas

@app.get("/rotas/{rota_id}", response_model=schemas.Rota)
async def read_rota(
    rota_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    rota = db.query(models.Rota).filter(models.Rota.id == rota_id).first()
    if rota is None:
        raise HTTPException(status_code=404, detail="Rota not found")
    return rota

# Rota Assignment endpoints
@app.post("/rota-assignments/", response_model=schemas.RotaAssignment)
async def create_rota_assignment(
    assignment: schemas.RotaAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_assignment = models.RotaAssignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@app.get("/rota-assignments/", response_model=List[schemas.RotaAssignment])
async def read_rota_assignments(
    rota_id: Optional[int] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.RotaAssignment)
    if rota_id:
        query = query.filter(models.RotaAssignment.rota_id == rota_id)
    if user_id:
        query = query.filter(models.RotaAssignment.user_id == user_id)
    assignments = query.offset(skip).limit(limit).all()
    return assignments

@app.put("/rota-assignments/{assignment_id}", response_model=schemas.RotaAssignment)
async def update_rota_assignment(
    assignment_id: int,
    assignment_update: schemas.RotaAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_assignment = db.query(models.RotaAssignment).filter(models.RotaAssignment.id == assignment_id).first()
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Rota assignment not found")
    
    for field, value in assignment_update.dict(exclude_unset=True).items():
        setattr(db_assignment, field, value)
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@app.delete("/rota-assignments/{assignment_id}")
async def delete_rota_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_assignment = db.query(models.RotaAssignment).filter(models.RotaAssignment.id == assignment_id).first()
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Rota assignment not found")
    
    db.delete(db_assignment)
    db.commit()
    return {"message": "Rota assignment deleted successfully"}

# Order endpoints
@app.post("/orders/", response_model=schemas.Order)
async def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_order = models.Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=List[schemas.Order])
async def read_orders(
    order_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.Order)
    if order_type:
        query = query.filter(models.Order.order_type == order_type)
    if status:
        query = query.filter(models.Order.status == status)
    orders = query.offset(skip).limit(limit).all()
    return orders

@app.get("/orders/{order_id}", response_model=schemas.Order)
async def read_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/orders/{order_id}", response_model=schemas.Order)
async def update_order(
    order_id: int,
    order_update: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for field, value in order_update.dict(exclude_unset=True).items():
        setattr(db_order, field, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@app.delete("/orders/{order_id}")
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}

# Order Item endpoints
@app.post("/order-items/", response_model=schemas.OrderItem)
async def create_order_item(
    item: schemas.OrderItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_item = models.OrderItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/order-items/", response_model=List[schemas.OrderItem])
async def read_order_items(
    order_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(models.OrderItem)
    if order_id:
        query = query.filter(models.OrderItem.order_id == order_id)
    items = query.offset(skip).limit(limit).all()
    return items

@app.put("/order-items/{item_id}", response_model=schemas.OrderItem)
async def update_order_item(
    item_id: int,
    item_update: schemas.OrderItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    for field, value in item_update.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/order-items/{item_id}")
async def delete_order_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Order item deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
