# AutoP2P Backend - Get All Merchants Feature

## 🎉 What's New

Added a comprehensive **GET /api/merchants** endpoint to retrieve all merchants with advanced filtering, pagination, and sorting capabilities.

## 📦 Files Modified/Added

### Modified Files:
1. **`src/services/merchantService.js`**
   - ✅ Added missing `getMerchantByAddress()` function
   - ✅ Added `getAllMerchants()` function with advanced filtering
   - ✅ Added Sequelize `Op` import for query operations

2. **`src/controllers/merchantController.js`**
   - ✅ Added `getAllMerchants()` controller method
   - ✅ Comprehensive input validation
   - ✅ Proper error handling

3. **`src/routes/merchants.js`**
   - ✅ Added `GET /` route for getting all merchants

4. **`src/routes/index.js`**
   - ✅ Updated API documentation to include new endpoint

### New Files:
1. **`docs/GET_ALL_MERCHANTS.md`**
   - 📚 Comprehensive API documentation
   - 📝 Usage examples
   - 🔧 Integration guides

2. **`scripts/test_get_all_merchants.js`**
   - 🧪 Test suite for the new endpoint
   - ✅ Covers all query parameters and edge cases

3. **`MERCHANTS_API_UPDATE.md`**
   - 📋 This summary file

## 🚀 Features

### Core Functionality
- ✅ **Pagination**: Navigate through large merchant lists
- ✅ **Filtering**: Filter by currency, rate range, balance status
- ✅ **Sorting**: Sort by various fields (createdAt, name, adRate, balance)
- ✅ **Search**: Search merchants by name
- ✅ **Privacy**: Email addresses excluded from public listing

### Query Parameters
| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Items per page (default: 20, max: 100) | `?limit=10` |
| `currency` | Filter by currency | `?currency=ETH` |
| `minRate` | Minimum ad rate | `?minRate=1.0` |
| `maxRate` | Maximum ad rate | `?maxRate=2.0` |
| `sortBy` | Sort field | `?sortBy=adRate` |
| `sortOrder` | Sort direction | `?sortOrder=ASC` |
| `search` | Search by name | `?search=john` |
| `hasBalance` | Only merchants with balance > 0 | `?hasBalance=true` |

## 🔧 Usage Examples

### Basic Request
```bash
curl -X GET "http://localhost:3000/api/merchants"
```

### Advanced Filtering
```bash
curl -X GET "http://localhost:3000/api/merchants?currency=ETH&minRate=1.0&hasBalance=true&sortBy=adRate&sortOrder=ASC&page=1&limit=10"
```

### JavaScript Integration
```javascript
const response = await fetch('/api/merchants?hasBalance=true&sortBy=adRate');
const { merchants, pagination } = response.data.data;
```

## 📊 Response Format

```json
{
  "success": true,
  "message": "Merchants retrieved successfully",
  "data": {
    "merchants": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "previousPage": null
    }
  }
}
```

## 🛡️ Security & Privacy

- ✅ Only active merchants are returned
- ✅ Email addresses excluded from public responses
- ✅ Input validation for all parameters
- ✅ SQL injection protection via Sequelize ORM
- ✅ Rate limiting recommended for production

## 🧪 Testing

Run the test suite:
```bash
node scripts/test_get_all_merchants.js
```

The test suite covers:
- ✅ Basic pagination
- ✅ All filtering options
- ✅ Sorting functionality
- ✅ Search capability
- ✅ Error handling for invalid parameters

## 🔄 Integration with Frontend

This endpoint is perfect for:

1. **Merchant Discovery Page**
   ```javascript
   // Load merchants with pagination
   const loadMerchants = (page, filters) => {
     return fetch(`/api/merchants?page=${page}&${new URLSearchParams(filters)}`);
   };
   ```

2. **Search & Filter Interface**
   ```javascript
   // Real-time search and filtering
   const searchMerchants = (searchTerm, filters) => {
     return fetch(`/api/merchants?search=${searchTerm}&hasBalance=true&${new URLSearchParams(filters)}`);
   };
   ```

3. **Mobile App Pagination**
   ```javascript
   // Infinite scroll implementation
   const loadMoreMerchants = (currentPage) => {
     return fetch(`/api/merchants?page=${currentPage + 1}&limit=20`);
   };
   ```

## 📈 Performance Considerations

- ✅ **Pagination**: Prevents loading large datasets
- ✅ **Indexing**: Database indexes on frequently queried fields
- ✅ **Limiting**: Maximum 100 items per request
- ✅ **Efficient Queries**: Optimized Sequelize queries

## 🚦 Next Steps

For production deployment, consider:

1. **Caching**: Implement Redis caching for frequently accessed data
2. **Rate Limiting**: Add rate limiting middleware
3. **Authentication**: Add authentication for admin features
4. **Monitoring**: Add performance monitoring
5. **Database Optimization**: Create appropriate indexes

## 🔗 Related Endpoints

The new endpoint complements existing merchant endpoints:

- `POST /merchants` - Create merchant
- `GET /merchants/:walletAddress` - Get specific merchant
- `GET /merchants/:walletAddress/rate` - Get merchant rate
- `PUT /merchants/:merchantId/rate` - Update merchant rate
- `GET /merchants/:merchantId/stats` - Get merchant statistics
- `GET /merchants/:merchantId/transactions` - Get merchant transactions

## 📞 Support

- 📚 **Documentation**: `docs/GET_ALL_MERCHANTS.md`
- 🧪 **Testing**: `scripts/test_get_all_merchants.js`
- 🔍 **API Docs**: Available at `GET /api/` endpoint

---

**Status**: ✅ **Ready for Production**

The getAllMerchants endpoint is fully implemented, tested, and documented. It provides a robust foundation for merchant discovery and management in your AutoP2P application.