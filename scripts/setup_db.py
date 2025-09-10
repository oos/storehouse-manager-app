#!/usr/bin/env python3
"""
Script to set up the database with initial data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import Base, User, UserRole, Agency, Item, InventoryItem
from backend.auth import get_password_hash
from datetime import datetime, timedelta

def create_initial_data():
    """Create initial data for the application"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already has data. Skipping initialization.")
            return
        
        # Create admin user
        admin_user = User(
            email="admin@storehouse.com",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role=UserRole.COORDINATOR,
            phone="+1234567890"
        )
        db.add(admin_user)
        
        # Create sample agency
        sample_agency = Agency(
            name="Community Food Bank",
            contact_person="Jane Smith",
            email="jane@communityfoodbank.com",
            phone="+1234567891",
            address="123 Main Street, City, State 12345"
        )
        db.add(sample_agency)
        
        # Create sample items
        sample_items = [
            Item(name="Rice", category="food", unit="kg", description="Long grain rice"),
            Item(name="Pasta", category="food", unit="packages", description="Spaghetti pasta"),
            Item(name="Canned Beans", category="food", unit="cans", description="Mixed beans in tomato sauce"),
            Item(name="Bread", category="food", unit="loaves", description="White bread"),
            Item(name="Milk", category="food", unit="liters", description="Fresh milk"),
            Item(name="Toilet Paper", category="hygiene", unit="rolls", description="4-pack toilet paper"),
            Item(name="Soap", category="hygiene", unit="bars", description="Bar soap"),
            Item(name="Shampoo", category="hygiene", unit="bottles", description="500ml shampoo"),
            Item(name="Coffee", category="special", unit="packages", description="Ground coffee"),
            Item(name="Eggs", category="special", unit="dozen", description="Fresh eggs"),
        ]
        
        for item in sample_items:
            db.add(item)
        
        db.commit()
        
        # Create sample inventory items
        items = db.query(Item).all()
        for item in items:
            inventory_item = InventoryItem(
                item_id=item.id,
                quantity=50.0,
                min_quantity=10.0,
                max_quantity=100.0,
                location="Main Storage",
                expiry_date=datetime.now() + timedelta(days=30)
            )
            db.add(inventory_item)
        
        db.commit()
        
        print("Initial data created successfully!")
        print("Admin user: admin@storehouse.com / admin123")
        
    except Exception as e:
        print(f"Error creating initial data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data()
