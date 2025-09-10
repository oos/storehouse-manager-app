# Store House Manager

A comprehensive web application for managing a volunteer-run food charity organization. Built with React (TypeScript) frontend and FastAPI (Python) backend.

## Features

### Core Functionality
- **Agency Management**: Register and manage partner agencies
- **Family Management**: Track families served with special requirements
- **Inventory Management**: Monitor food and hygiene item stock levels
- **Packing Lists**: Create and manage weekly packing lists
- **Volunteer Management**: Schedule and assign volunteers to packing sessions
- **Order Management**: Track food orders and deliveries
- **Communications**: Send messages to agencies, volunteers, and families
- **Weekly Requirements**: Agencies submit weekly family requirements

### Workflow Management
- **Weekly Cycle**: Agency requirements → Packing lists → Box packing → Collection
- **Monthly Cycle**: Ordering extra items and supplies
- **Quarterly Cycle**: EFS+ delivery, rota management, hygiene items, reporting

## Technology Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API calls
- Day.js for date manipulation
- React Hook Form for form handling

### Backend
- FastAPI (Python 3.8+)
- SQLAlchemy ORM
- SQLite database (development)
- Pydantic for data validation
- JWT authentication
- Uvicorn ASGI server

## Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Backend Setup
1. Navigate to the project directory:
   ```bash
   cd store-house-manager
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python run_backend.py
   ```
   The API will be available at `http://localhost:8001`
   API documentation at `http://localhost:8001/docs`

### Frontend Setup
1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3002`

### Quick Start
Use the provided script to start both servers:
```bash
chmod +x scripts/start_dev.sh
./scripts/start_dev.sh
```

## User Roles

- **Agency**: Submit weekly requirements, view family information
- **Coordinator**: Manage all operations, review requirements
- **Rota Manager**: Manage volunteer schedules and assignments
- **Packing Volunteer**: View assigned packing sessions
- **Driver**: Manage delivery schedules
- **Resident**: View personal information and schedules
- **Online/Physical Shopper**: Manage shopping lists and orders

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user info

### Agencies
- `GET /agencies/` - List all agencies
- `POST /agencies/` - Create new agency
- `PUT /agencies/{id}` - Update agency
- `DELETE /agencies/{id}` - Delete agency

### Families
- `GET /families/` - List all families
- `POST /families/` - Create new family
- `PUT /families/{id}` - Update family
- `DELETE /families/{id}` - Delete family

### Inventory
- `GET /items/` - List all items
- `POST /items/` - Create new item
- `GET /inventory-items/` - List inventory levels
- `POST /inventory-items/` - Add inventory item
- `PUT /inventory-items/{id}` - Update inventory

### Packing Lists
- `GET /packing-lists/` - List packing lists
- `POST /packing-lists/` - Create packing list
- `PUT /packing-lists/{id}` - Update packing list
- `DELETE /packing-lists/{id}` - Delete packing list

### Weekly Requirements
- `GET /weekly-requirements/` - List weekly requirements
- `POST /weekly-requirements/` - Submit requirements
- `PUT /weekly-requirements/{id}` - Update requirements

### Volunteers & Rotas
- `GET /users/?role=packing_volunteer` - List volunteers
- `GET /rotas/` - List rotas
- `POST /rotas/` - Create rota
- `GET /rota-assignments/` - List assignments

### Orders
- `GET /orders/` - List orders
- `POST /orders/` - Create order
- `PUT /orders/{id}` - Update order

### Communications
- `GET /communications/` - List communications
- `POST /communications/` - Send communication
- `GET /communication-templates/` - List templates
- `POST /communication-templates/` - Create template

## Database Schema

The application uses SQLite for development with the following main entities:

- **Users**: System users with role-based access
- **Agencies**: Partner organizations
- **Families**: Families served by the charity
- **Items**: Food and hygiene items
- **InventoryItems**: Stock levels and locations
- **PackingLists**: Weekly packing lists
- **PackingSessions**: Scheduled packing sessions
- **FoodBoxes**: Individual food boxes for families
- **Orders**: Food orders and deliveries
- **Communications**: Messages and notifications
- **WeeklyRequirements**: Agency weekly submissions

## Development

### Project Structure
```
store-house-manager/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   └── auth.py              # Authentication logic
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts
│   └── services/           # API services
├── scripts/
│   └── start_dev.sh        # Development startup script
└── requirements.txt        # Python dependencies
```

### Adding New Features
1. Add database models in `backend/models.py`
2. Create Pydantic schemas in `backend/schemas.py`
3. Add API endpoints in `backend/main.py`
4. Create React components in `src/pages/`
5. Update navigation in `src/App.tsx`

## Deployment

### Production Setup
1. Set up PostgreSQL database
2. Update database configuration
3. Set environment variables
4. Build frontend: `npm run build`
5. Serve with production ASGI server

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.