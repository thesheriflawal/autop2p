-- AirP2P Backend Database Setup Script for PostgreSQL
-- Run this script to set up the initial database and user

-- Create database (run as postgres superuser)
CREATE DATABASE airp2p_db;

-- Create a dedicated user for the application (optional but recommended)
CREATE USER airp2p_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE airp2p_db TO airp2p_user;

-- Connect to the airp2p_db database and grant schema privileges
\c airp2p_db;
GRANT ALL ON SCHEMA public TO airp2p_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO airp2p_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO airp2p_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO airp2p_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO airp2p_user;

-- Enable UUID extension (useful for UUIDs in models)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable crypto extension (useful for cryptographic functions if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Optional: Create indexes for better performance (these will be created by Sequelize)
-- But you can add custom indexes here if needed

SELECT 'Database setup completed successfully!' as message;