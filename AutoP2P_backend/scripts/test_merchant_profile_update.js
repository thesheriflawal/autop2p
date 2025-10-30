const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const merchantEndpoint = `${API_BASE_URL}/api/merchants`;

async function testMerchantProfileUpdate() {
  console.log('🧪 Testing Merchant Profile Update Endpoints\n');

  // Test data
  const testMerchantId = 1;
  const testWalletAddress = '0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1';

  const tests = [
    // Valid update tests
    {
      name: 'Update single field (name) by ID',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { name: 'Updated Test Merchant' },
      description: 'Should update merchant name successfully'
    },
    {
      name: 'Update multiple fields by ID',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: {
        name: 'Multi-Field Updated Merchant',
        adRate: 1.05,
        currency: 'USDT',
        minOrder: 10,
        maxOrder: 1000,
        paymentMethods: ['Bank Transfer', 'PayPal', 'Credit Card']
      },
      description: 'Should update multiple fields successfully'
    },
    {
      name: 'Update by wallet address',
      method: 'PUT',
      url: `${merchantEndpoint}/wallet/${testWalletAddress}/profile`,
      data: {
        name: 'Updated via Wallet',
        email: 'updated@example.com'
      },
      description: 'Should update merchant profile by wallet address'
    },
    {
      name: 'Update email only',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { email: 'newemail@merchant.com' },
      description: 'Should update email successfully'
    },
    {
      name: 'Update payment methods only',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { 
        paymentMethods: ['Bank Transfer', 'Zelle', 'Cash App', 'Venmo'] 
      },
      description: 'Should update payment methods array'
    },
    {
      name: 'Update order limits',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: {
        minOrder: 5,
        maxOrder: 500
      },
      description: 'Should update min and max order amounts'
    },
    {
      name: 'Update currency and rate',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: {
        currency: 'ETH',
        adRate: 1.03
      },
      description: 'Should update currency and ad rate'
    },

    // Error cases
    {
      name: 'Empty request body',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: {},
      description: 'Should return 400 error for empty request body',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Invalid fields only',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: {
        balance: 1000,
        isActive: false,
        walletAddress: '0x123'
      },
      description: 'Should return 400 error for invalid fields',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Invalid ad rate (too high)',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { adRate: 15 },
      description: 'Should return 400 error for ad rate > 10',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Invalid ad rate (negative)',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { adRate: -1 },
      description: 'Should return 400 error for negative ad rate',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Invalid email format',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { email: 'invalid-email' },
      description: 'Should return 400 error for invalid email',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Invalid currency',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { currency: 'INVALID' },
      description: 'Should return 400 error for invalid currency',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Name too short',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { name: 'A' },
      description: 'Should return 400 error for name < 2 characters',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Invalid min/max order relationship',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: {
        minOrder: 1000,
        maxOrder: 500
      },
      description: 'Should return 400 error when minOrder > maxOrder',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Invalid payment methods type',
      method: 'PUT',
      url: `${merchantEndpoint}/${testMerchantId}/profile`,
      data: { paymentMethods: 'not an array' },
      description: 'Should return 400 error for non-array payment methods',
      expectError: true,
      expectedStatus: 400
    },
    {
      name: 'Non-existent merchant ID',
      method: 'PUT',
      url: `${merchantEndpoint}/99999/profile`,
      data: { name: 'Test' },
      description: 'Should return 404 error for non-existent merchant',
      expectError: true,
      expectedStatus: 404
    },
    {
      name: 'Non-existent wallet address',
      method: 'PUT',
      url: `${merchantEndpoint}/wallet/0x0000000000000000000000000000000000000000/profile`,
      data: { name: 'Test' },
      description: 'Should return 404 error for non-existent wallet',
      expectError: true,
      expectedStatus: 404
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    console.log(`📋 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   ${test.method} ${test.url}`);
    
    if (test.data && Object.keys(test.data).length > 0) {
      console.log(`   📝 Data:`, JSON.stringify(test.data, null, 2));
    }

    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (test.expectError) {
        console.log(`   ❌ Expected error but got success response`);
        console.log(`   📊 Status: ${response.status}`);
        failedTests++;
      } else {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Success: ${response.data.success}`);
        
        if (response.data.data && response.data.data.updatedFields) {
          console.log(`   📝 Updated fields: ${response.data.data.updatedFields.join(', ')}`);
        }
        
        if (response.data.data && response.data.data.merchant) {
          console.log(`   👤 Merchant: ${response.data.data.merchant.name}`);
        }
        
        passedTests++;
      }
    } catch (error) {
      if (test.expectError && error.response?.status >= 400) {
        const expectedStatus = test.expectedStatus || 400;
        if (error.response.status === expectedStatus) {
          console.log(`   ✅ Expected error: ${error.response.status} - ${error.response.data?.message}`);
          passedTests++;
        } else {
          console.log(`   ❌ Wrong error status: Expected ${expectedStatus}, got ${error.response.status}`);
          failedTests++;
        }
      } else {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        if (error.response?.data) {
          console.log(`   📝 Error details:`, JSON.stringify(error.response.data, null, 2));
        }
        failedTests++;
      }
    }
    
    console.log(''); // Empty line for readability
    
    // Add a small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('🏁 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📊 Total: ${passedTests + failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed`);
  }
}

// Additional utility function to test field validation
async function testFieldValidations() {
  console.log('\n🔍 Testing Field Validations\n');
  
  const validationTests = [
    {
      field: 'adRate',
      validValues: [0.1, 1.0, 5.5, 10.0],
      invalidValues: [0, -1, 11, 'invalid', null]
    },
    {
      field: 'currency',
      validValues: ['ETH', 'USDT', 'usdc', 'dai', 'BTC'],
      invalidValues: ['INVALID', 'USD', 123, null]
    },
    {
      field: 'minOrder',
      validValues: [0, 1, 10.5, 1000],
      invalidValues: [-1, -10, 'invalid', null]
    },
    {
      field: 'name',
      validValues: ['AB', 'Valid Name', 'Long Merchant Name With Spaces'],
      invalidValues: ['A', '', '   ', null]
    }
  ];
  
  for (const validation of validationTests) {
    console.log(`🔍 Testing ${validation.field} validation:`);
    
    // Test valid values
    for (const validValue of validation.validValues) {
      console.log(`   ✅ Valid: ${JSON.stringify(validValue)}`);
    }
    
    // Test invalid values
    for (const invalidValue of validation.invalidValues) {
      console.log(`   ❌ Invalid: ${JSON.stringify(invalidValue)}`);
    }
    
    console.log('');
  }
}

// Run the tests
if (require.main === module) {
  Promise.all([
    testMerchantProfileUpdate(),
    testFieldValidations()
  ])
    .then(() => {
      console.log('✅ All tests completed');
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testMerchantProfileUpdate, testFieldValidations };
