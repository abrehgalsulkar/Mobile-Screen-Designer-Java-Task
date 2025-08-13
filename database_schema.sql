-- Database Schema for Mobile Screen Designer
-- Database: mobile_designer_db

-- Database Schema for Mobile Screen Designer
-- Note: Make sure you're connected to mobile_designer_db before running this script

-- Guest table (for guest users)
CREATE TABLE guest (
    id SERIAL PRIMARY KEY,
    guest_id VARCHAR(50) UNIQUE NOT NULL DEFAULT 'guest_001',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application table
CREATE TABLE application (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon_path VARCHAR(500),
    guest_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guest(guest_id)
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

-- Insert default guest
INSERT INTO guest (guest_id) VALUES ('guest_001');

-- Create indexes for better performance
CREATE INDEX idx_application_guest_id ON application(guest_id);
CREATE INDEX idx_screen_application_id ON screen(application_id);
CREATE INDEX idx_application_created_at ON application(created_at);
CREATE INDEX idx_screen_created_at ON screen(created_at);
