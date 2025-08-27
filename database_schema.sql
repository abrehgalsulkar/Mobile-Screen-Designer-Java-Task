-- Database Schema for Mobile Screen Designer
-- Database: mobile_designer_db

-- Note: Make sure you're connected to mobile_designer_db before running this script

-- Application table
CREATE TABLE application (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon_path VARCHAR(500),
    user_id BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screen table
CREATE TABLE screen (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    layout_json TEXT NOT NULL,
    screen_image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES application(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_application_user_id ON application(user_id);
CREATE INDEX idx_screen_application_id ON screen(application_id);
CREATE INDEX idx_application_created_at ON application(created_at);
CREATE INDEX idx_screen_created_at ON screen(created_at);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contact_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a default user for testing (password will be hashed by Spring Security)
INSERT INTO users (username, email, contact_number, password) VALUES 
('admin', 'admin@example.com', '+1234567890', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa')
ON CONFLICT (username) DO NOTHING;
