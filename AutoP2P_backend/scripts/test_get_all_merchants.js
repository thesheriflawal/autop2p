const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const endpoint = `${API_BASE_URL}/api/merchants`;

async function testGetAllMerchants() {
  console.log('🧪 Testing GET /api/merchants endpoint\n');

  const tests = [
    {
      name: 'Basic request - Get all merchants',
      url: endpoint,
      description: 'Should return paginated list of merchants'
    },
    {
      name: 'Pagination test',
      url: `${endpoint}?page=1&limit=5`,
      description: 'Should return first 5 merchants'
    },
    {
      name: 'Filter by currency',
      url: `${endpoint}?currency=ETH`,
      description: 'Should return only ETH merchants'
    },
    {
      name: 'Filter by rate range',
      url: `${endpoint}?minRate=1.0&maxRate=2.0`,
      description: 'Should return merchants with rates between 1.0 and 2.0'
    },
    {
      name: 'Filter merchants with balance',
      url: `${endpoint}?hasBalance=true`,
      description: 'Should return only merchants with balance > 0'
    },
    {
      name: 'Sort by ad rate ascending',
      url: `${endpoint}?sortBy=adRate&sortOrder=ASC`,
      description: 'Should return merchants sorted by ad rate in ascending order'
    },
    {
      name: 'Search merchants',
      url: `${endpoint}?search=test`,
      description: 'Should return merchants matching search term'
    },
    {
      name: 'Invalid page parameter',
      url: `${endpoint}?page=0`,
      description: 'Should return 400 error for invalid page',
      expectError: true
    },
    {
      name: 'Invalid limit parameter',
      url: `${endpoint}?limit=150`,
      description: 'Should return 400 error for limit > 100',
      expectError: true
    }
  ];

  for (const test of tests) {
    console.log(`📋 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   URL: ${test.url}`);

    try {
      const response = await axios.get(test.url);
      
      if (test.expectError) {
        console.log(`   ❌ Expected error but got success response`);
      } else {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Success: ${response.data.success}`);
        
        if (response.data.data) {
          console.log(`   📊 Merchants found: ${response.data.data.merchants?.length || 0}`);
          if (response.data.data.pagination) {
            const p = response.data.data.pagination;
            console.log(`   📄 Page ${p.currentPage} of ${p.totalPages} (${p.totalItems} total)`);
          }
        }
      }
    } catch (error) {
      if (test.expectError && error.response?.status >= 400) {
        console.log(`   ✅ Expected error: ${error.response.status} - ${error.response.data?.message}`);
      } else {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        if (error.response?.data) {
          console.log(`   📝 Error details:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🏁 Test completed!');
}

// Run the tests
if (require.main === module) {
  testGetAllMerchants()
    .then(() => {
      console.log('✅ All tests completed successfully');
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = testGetAllMerchants;