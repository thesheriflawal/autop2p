#!/usr/bin/env node

/**
 * PostgreSQL Connection Test Script
 * 
 * This script tests the database connection without starting the full application
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'airp2p_db',
  };

  console.log('Configuration:');
  console.log(`📍 Host: ${config.host}`);
  console.log(`🚪 Port: ${config.port}`);
  console.log(`👤 Username: ${config.username}`);
  console.log(`🗄️  Database: ${config.database}`);
  console.log(`🔒 SSL: ${process.env.DB_SSL === 'true' ? 'enabled' : 'disabled'}\n`);

  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    }
  );

  try {
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // Test basic query
    const [results] = await sequelize.query('SELECT version() as version, now() as current_time');
    console.log('\n📊 Database Information:');
    console.log(`Version: ${results[0].version}`);
    console.log(`Current Time: ${results[0].current_time}\n`);

    // Test database permissions
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    console.log(`📋 Existing tables: ${tables.length > 0 ? tables.map(t => t.table_name).join(', ') : 'None (first run)'}`);

    // Test if we can create a test table (check permissions)
    try {
      await sequelize.query('CREATE TEMP TABLE test_permissions (id SERIAL PRIMARY KEY)');
      await sequelize.query('DROP TABLE test_permissions');
      console.log('✅ Database permissions: OK');
    } catch (permError) {
      console.log(`⚠️  Database permissions: Limited - ${permError.message}`);
    }

    console.log('\n🎉 All tests passed! Your database is ready for AirP2P Backend.');

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`Error: ${error.message}\n`);

    // Provide helpful error suggestions
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('💡 Suggestion: Create the database first:');
      console.log('   sudo -u postgres createdb airp2p_db');
      console.log('   Or run: npm run db:create\n');
    }

    if (error.message.includes('password authentication failed') || error.message.includes('peer authentication failed')) {
      console.log('💡 Suggestion: Check your credentials or authentication method:');
      console.log('   - Verify DB_USERNAME and DB_PASSWORD in .env file');
      console.log('   - Check PostgreSQL pg_hba.conf authentication settings');
      console.log('   - See docs/postgresql-setup.md for detailed instructions\n');
    }

    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('💡 Suggestion: PostgreSQL server is not running:');
      console.log('   sudo systemctl start postgresql');
      console.log('   sudo systemctl status postgresql\n');
    }

    if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.log('💡 Suggestion: Create the database user:');
      console.log(`   sudo -u postgres psql -c "CREATE USER ${config.username} WITH PASSWORD 'your_password';"`);
      console.log(`   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${config.username};"\n`);
    }

    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testConnection().catch(console.error);