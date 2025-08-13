# Mobile Screen Designer

## Installation & Setup

# 1. Database Setup

1. Install PostgreSQL
2. Create a new database:
   ```sql
   CREATE DATABASE mobile_designer_db;
   ```
3. Run the database schema:
   ```bash
   psql -U postgres -d mobile_designer_db -f database_schema.sql
   ```


# 2. Application Configuration

1. Update database connection in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/mobile_designer_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

# 3. Build and Run

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mobile-screen-designer
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## API Endpoints

### Applications
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Create new application
- `GET /api/applications/{id}` - Get application by ID
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

### Screens
- `GET /api/screens/application/{applicationId}` - Get screens by application
- `POST /api/screens` - Create new screen
- `GET /api/screens/{id}` - Get screen by ID
- `PUT /api/screens/{id}` - Update screen
- `PUT /api/screens/{id}/layout` - Update screen layout only
- `DELETE /api/screens/{id}` - Delete screen

