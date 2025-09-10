# Storehouse Manager

A comprehensive web application for managing charity food distribution operations. This application helps volunteer-run charities manage their food distribution to families in need, including agency coordination, volunteer scheduling, inventory management, and order processing.

## Features

### Core Functionality
- **Agency Management**: Register and manage agencies that serve families
- **Family Management**: Track families and their specific requirements
- **Inventory Management**: Monitor food and hygiene item stock levels
- **Volunteer Coordination**: Manage volunteer schedules and assignments
- **Order Management**: Handle weekly, monthly, and quarterly supply orders
- **Communication System**: Send messages to agencies, volunteers, and stakeholders

### Key Workflows
- **Weekly Cycle**: Agency requirements → Packing lists → Volunteer packing → Family collection
- **Monthly Cycle**: Ordering extras and special items from suppliers
- **Quarterly Cycle**: EFS+ deliveries, volunteer rotas, hygiene item management, reporting

## Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL** - Primary database (SQLite for development)
- **Alembic** - Database migration tool
- **JWT** - Authentication and authorization

### Frontend
- **React 18** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - React component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL (for production) or SQLite (for development)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-house-manager
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database and secret key settings
   ```

5. **Run database migrations**
   ```bash
   # For SQLite (development)
   python -c "from backend.database import engine; from backend.models import Base; Base.metadata.create_all(bind=engine)"
   
   # For PostgreSQL (production)
   # Set up your PostgreSQL database and update DATABASE_URL in .env
   ```

6. **Start the backend server**
   ```bash
   cd backend
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3002`

## Usage

### User Roles

The application supports different user roles with specific permissions:

- **Agency**: Manages families and submits weekly requirements
- **Coordinator**: Manages overall operations, creates packing lists, orders supplies
- **Rota Manager**: Manages volunteer schedules
- **Packing Volunteer**: Packs food boxes
- **Driver**: Collects food from suppliers
- **Resident on site**: Receives deliveries
- **Online Shopper**: Orders items online
- **Physical Shopper**: Buys items in person

### Key Workflows

#### Weekly Operations
1. **Agencies** submit their weekly family requirements (Wednesday afternoon)
2. **Coordinator** creates packing lists based on requirements (Wednesday night)
3. **Rota Manager** confirms volunteer availability
4. **Packing Volunteers** pack food boxes (Thursday before 11am)
5. **Agencies** collect food boxes (Thursday 9:30-10:30am)

#### Monthly Operations
1. **Coordinator** receives EFS+ extras list
2. **Online Shopper** orders special items
3. **Physical Shopper** buys mixed fruit and vegetables
4. **Resident** receives deliveries

#### Quarterly Operations
1. **Resident** receives EFS+ delivery
2. **Rota Manager** sets volunteer rotas
3. **Coordinator** manages hygiene item rotas and orders
4. **Coordinator** reports to EFS+ on families served

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: System users with different roles
- **Agencies**: Organizations that serve families
- **Families**: Individual families receiving assistance
- **Items**: Food and hygiene items in inventory
- **Inventory**: Current stock levels and locations
- **Orders**: Supply orders and deliveries
- **Packing Lists**: Weekly packing instructions
- **Volunteers**: Volunteer assignments and schedules
- **Communications**: Messages and notifications

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
npm test
```

### Code Formatting
```bash
# Python
black backend/
isort backend/

# TypeScript/React
npm run format
```

## Deployment

### Production Setup

1. **Set up PostgreSQL database**
2. **Configure environment variables**
3. **Run database migrations**
4. **Build frontend**
   ```bash
   npm run build
   ```
5. **Deploy backend with a WSGI server like Gunicorn**
6. **Set up reverse proxy with Nginx**

### Docker Deployment (Optional)

Docker configuration can be added for easier deployment:

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Roadmap

### Phase 1 (Current)
- [x] Basic user management and authentication
- [x] Agency and family management
- [x] Inventory tracking
- [x] Basic UI components

### Phase 2 (Next)
- [ ] Complete packing list management
- [ ] Volunteer scheduling and rota management
- [ ] Order management system
- [ ] Communication system

### Phase 3 (Future)
- [ ] Mobile app for volunteers
- [ ] Advanced reporting and analytics
- [ ] Integration with external suppliers
- [ ] Automated notifications and reminders
