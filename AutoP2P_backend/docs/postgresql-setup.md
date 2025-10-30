# PostgreSQL Setup Guide for AirP2P Backend

This guide will help you set up PostgreSQL for the AirP2P backend application.

## Installation

### Ubuntu/Debian (Pop!_OS)

```bash
# Update package list
sudo apt update

# Install PostgreSQL and additional contrib package
sudo apt install postgresql postgresql-contrib

# Install development headers (needed for pg module)
sudo apt install postgresql-server-dev-all
```

### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql
```

### Windows

Download and install PostgreSQL from: https://www.postgresql.org/download/windows/

## Initial Setup

### 1. Start PostgreSQL Service

```bash
# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable auto-start on boot

# Check status
sudo systemctl status postgresql
```

### 2. Set up PostgreSQL User

```bash
# Switch to postgres user and access PostgreSQL
sudo -u postgres psql

# In PostgreSQL shell, create a password for postgres user (optional)
ALTER USER postgres PASSWORD 'your_secure_password';

# Exit PostgreSQL shell
\q
```

### 3. Create Database and User

#### Option A: Using npm scripts (recommended)

```bash
# Create database
npm run db:create

# Or run the full setup script
npm run db:setup
```

#### Option B: Manual setup

```bash
# Create database
sudo -u postgres createdb airp2p_db

# Or using psql
sudo -u postgres psql -c "CREATE DATABASE airp2p_db;"

# Create dedicated user (recommended)
sudo -u postgres psql -c "CREATE USER airp2p_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE airp2p_db TO airp2p_user;"
```

### 4. Configure Environment Variables

Update your `.env` file with PostgreSQL credentials:

```env
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
# Or use dedicated user: DB_USERNAME=airp2p_user
DB_PASSWORD=your_password
DB_NAME=airp2p_db
DB_SSL=false
```

## Verification

### Test Connection

```bash
# Test connection as postgres user
sudo -u postgres psql -d airp2p_db -c "SELECT version();"

# Test with your application user (if created)
psql -h localhost -U airp2p_user -d airp2p_db -c "SELECT version();"
```

### Start Your Application

```bash
# Start in development mode
npm run dev

# Check logs for successful database connection
# You should see: "✅ Database connection established successfully."
```

## Common Issues and Solutions

### Issue: "peer authentication failed"

**Solution**: Update PostgreSQL authentication configuration

```bash
# Edit pg_hba.conf file
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Change this line:
# local   all             all                                     peer

# To:
# local   all             all                                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Issue: "database does not exist"

**Solution**: Create the database

```bash
# Create database
sudo -u postgres createdb airp2p_db

# Or run setup script
npm run db:setup
```

### Issue: "role does not exist"

**Solution**: Create the user

```bash
sudo -u postgres psql -c "CREATE USER your_username WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE airp2p_db TO your_username;"
```

### Issue: Connection timeout

**Solution**: Check if PostgreSQL is running

```bash
# Check service status
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check if listening on correct port
sudo netstat -tlnp | grep :5432
```

## Advanced Configuration

### For Production

1. **Create dedicated database user**:
   ```sql
   CREATE USER airp2p_prod WITH PASSWORD 'secure_production_password';
   GRANT ALL PRIVILEGES ON DATABASE airp2p_db TO airp2p_prod;
   ```

2. **Enable SSL** (recommended for production):
   ```env
   DB_SSL=true
   ```

3. **Configure connection limits**:
   ```sql
   ALTER USER airp2p_prod CONNECTION LIMIT 20;
   ```

### For Cloud Deployment

Popular PostgreSQL cloud providers:
- **Heroku Postgres**
- **AWS RDS**
- **Google Cloud SQL**
- **DigitalOcean Managed Databases**

Example cloud configuration:
```env
DB_HOST=your-cloud-host.amazonaws.com
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=airp2p_production
DB_SSL=true
```

## Useful PostgreSQL Commands

```bash
# Connect to database
psql -h localhost -U postgres -d airp2p_db

# List databases
\l

# Connect to database
\c airp2p_db

# List tables
\dt

# Describe table structure
\d table_name

# Show current user
SELECT current_user;

# Show database size
SELECT pg_size_pretty(pg_database_size('airp2p_db'));

# Exit psql
\q
```

## Backup and Restore

### Backup

```bash
# Backup database
pg_dump -h localhost -U postgres airp2p_db > backup.sql

# Backup with compression
pg_dump -h localhost -U postgres -Fc airp2p_db > backup.dump
```

### Restore

```bash
# Restore from SQL file
psql -h localhost -U postgres -d airp2p_db < backup.sql

# Restore from compressed dump
pg_restore -h localhost -U postgres -d airp2p_db backup.dump
```

## Maintenance

### Regular Tasks

```bash
# Update database statistics
sudo -u postgres psql -d airp2p_db -c "ANALYZE;"

# Vacuum database (reclaim storage)
sudo -u postgres psql -d airp2p_db -c "VACUUM;"

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'airp2p_db';"
```

This setup guide should help you get PostgreSQL running smoothly with your AirP2P backend!