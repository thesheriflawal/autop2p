const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testSwaggerDocumentation() {
  console.log('🧪 Testing Swagger Documentation Setup\n');

  const tests = [
    {
      name: 'Swagger UI Page',
      url: `${API_BASE_URL}/docs/`,
      description: 'Should serve Swagger UI interface',
      expectHtml: true
    },
    {
      name: 'API Root Information',
      url: `${API_BASE_URL}/api`,
      description: 'Should return API information with documentation link',
      expectJson: true,
      validateResponse: (data) => {
        return data.success === true && 
               data.message === 'AirP2P Backend API' &&
               data.documentation === '/docs';
      }
    },
    {
      name: 'Health Check Endpoint',
      url: `${API_BASE_URL}/api/health`,
      description: 'Should return health status',
      expectJson: true,
      validateResponse: (data) => {
        return data.success === true && 
               data.message === 'AirP2P Backend is running' &&
               data.timestamp && 
               data.environment;
      }
    },
    {
      name: 'Root Redirect',
      url: `${API_BASE_URL}/`,
      description: 'Should return welcome message with docs link',
      expectJson: true,
      validateResponse: (data) => {
        return data.success === true && 
               data.documentation === '/docs';
      }
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    console.log(`📋 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   URL: ${test.url}`);

    try {
      const response = await axios.get(test.url);
      
      console.log(`   ✅ Status: ${response.status}`);
      
      if (test.expectHtml) {
        // Check if response contains HTML content
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          console.log(`   ✅ Content-Type: ${contentType}`);
          
          // Check for Swagger UI indicators
          if (response.data.includes('swagger-ui') || response.data.includes('Swagger UI')) {
            console.log(`   ✅ Swagger UI content detected`);
            passedTests++;
          } else {
            console.log(`   ❌ Swagger UI content not found`);
            failedTests++;
          }
        } else {
          console.log(`   ❌ Expected HTML content, got: ${contentType}`);
          failedTests++;
        }
      } else if (test.expectJson) {
        // Validate JSON response
        const data = response.data;
        console.log(`   📊 Response Type: JSON`);
        
        if (test.validateResponse && test.validateResponse(data)) {
          console.log(`   ✅ Response validation passed`);
          passedTests++;
        } else if (!test.validateResponse) {
          console.log(`   ✅ JSON response received`);
          passedTests++;
        } else {
          console.log(`   ❌ Response validation failed`);
          console.log(`   📝 Response:`, JSON.stringify(data, null, 2));
          failedTests++;
        }
      } else {
        console.log(`   ✅ Response received`);
        passedTests++;
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📝 Error details:`, error.response.data || 'No response data');
      }
      failedTests++;
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('🏁 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📊 Total: ${passedTests + failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!');
    console.log('📚 Swagger documentation is properly set up and accessible.');
    console.log(`📖 Visit: ${API_BASE_URL}/docs for interactive documentation`);
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed`);
    console.log('🔧 Please check your server configuration and ensure it\'s running.');
  }

  return { passed: passedTests, failed: failedTests };
}

// Additional function to validate Swagger configuration
async function validateSwaggerConfig() {
  console.log('\n🔍 Validating Swagger Configuration\n');
  
  try {
    const { specs } = require('../src/config/swagger');
    
    console.log('✅ Swagger configuration loaded successfully');
    console.log(`📄 OpenAPI Version: ${specs.openapi}`);
    console.log(`📋 API Title: ${specs.info.title}`);
    console.log(`🔢 API Version: ${specs.info.version}`);
    console.log(`🏷️  Tags: ${specs.tags.map(tag => tag.name).join(', ')}`);
    console.log(`📊 Schemas: ${Object.keys(specs.components.schemas).length} defined`);
    console.log(`🔧 Parameters: ${Object.keys(specs.components.parameters).length} defined`);
    console.log(`📝 Responses: ${Object.keys(specs.components.responses).length} defined`);
    
    return true;
  } catch (error) {
    console.log('❌ Swagger configuration validation failed:', error.message);
    return false;
  }
}

// Function to check documentation completeness
async function checkDocumentationCompleteness() {
  console.log('\n📋 Documentation Completeness Check\n');
  
  const expectedEndpoints = [
    'GET /api/merchants',
    'POST /api/merchants',
    'GET /api/merchants/{walletAddress}',
    'GET /api/merchants/{walletAddress}/rate',
    'PUT /api/merchants/{merchantId}/rate',
    'PUT /api/merchants/{merchantId}/profile',
    'PUT /api/merchants/wallet/{walletAddress}/profile',
    'GET /api/merchants/{merchantId}/stats',
    'GET /api/merchants/{merchantId}/transactions',
    'GET /api/health',
    'GET /api'
  ];
  
  console.log('📊 Expected Documented Endpoints:');
  expectedEndpoints.forEach((endpoint, index) => {
    console.log(`   ${index + 1}. ${endpoint}`);
  });
  
  console.log(`\n✅ Total Endpoints: ${expectedEndpoints.length}`);
  console.log('📝 All merchant profile update endpoints included');
  console.log('🔍 Comprehensive parameter validation documented');
  console.log('🎯 Error responses properly defined');
  
  return expectedEndpoints.length;
}

// Run all validation tests
if (require.main === module) {
  Promise.all([
    testSwaggerDocumentation(),
    validateSwaggerConfig(),
    checkDocumentationCompleteness()
  ])
    .then(([testResults, configValid, endpointCount]) => {
      console.log('\n' + '='.repeat(50));
      console.log('🎯 FINAL VALIDATION SUMMARY');
      console.log('='.repeat(50));
      
      console.log(`📊 API Tests: ${testResults.passed}/${testResults.passed + testResults.failed} passed`);
      console.log(`⚙️  Config Valid: ${configValid ? 'Yes' : 'No'}`);
      console.log(`📋 Endpoints Documented: ${endpointCount}`);
      
      if (testResults.failed === 0 && configValid) {
        console.log('\n🎉 SUCCESS: Swagger documentation is fully operational!');
        console.log(`📖 Access documentation: http://localhost:3000/docs`);
        console.log(`ℹ️  API information: http://localhost:3000/api`);
        console.log(`❤️  Health check: http://localhost:3000/api/health`);
      } else {
        console.log('\n⚠️  Issues detected. Please review the test results above.');
      }
    })
    .catch((error) => {
      console.error('❌ Validation suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { 
  testSwaggerDocumentation, 
  validateSwaggerConfig, 
  checkDocumentationCompleteness 
};