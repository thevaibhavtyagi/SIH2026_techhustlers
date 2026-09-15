-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'district_nodal', 'mp' — see database/auth_schema.sql (source of truth)
    constituency VARCHAR(100)
);

-- Create Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    state VARCHAR(50) NOT NULL,
    constituency VARCHAR(100) NOT NULL,
    contractor_id INT,
    sanctioned_amount DECIMAL(15,2) NOT NULL,
    expenditure DECIMAL(15,2) DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'On Track',
    risk_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
