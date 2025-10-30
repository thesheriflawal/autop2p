# AutoP2P API - Swagger Documentation Setup

## 🎉 What's Implemented

Your AutoP2P backend now has comprehensive **Swagger/OpenAPI 3.0 documentation** with interactive API explorer functionality.

## 📦 Files Added/Modified

### **New Files:**
1. **`src/config/swagger.js`** - Complete Swagger configuration
   - ✅ OpenAPI 3.0 specification
   - ✅ Comprehensive schemas and components
   - ✅ Reusable parameters and responses
   - ✅ Multiple server environments

### **Modified Files:**
1. **`src/app.js`** - Added Swagger UI integration
   - ✅ Swagger UI middleware setup
   - ✅ Interactive documentation at `/docs`
   - ✅ Updated logging to show documentation URL

2. **`src/routes/merchants.js`** - Complete JSDoc annotations
   - ✅ All 9 merchant endpoints documented
   - ✅ Request/response schemas
   - ✅ Parameter validation specs
   - ✅ Error response documentation

3. **`src/routes/index.js`** - System endpoints documentation
   - ✅ Health check endpoint
   - ✅ API information endpoint

4. **`package.json`** - Added Swagger dependencies
   - ✅ swagger-ui-express
   - ✅ swagger-jsdoc

## 🚀 **Accessing Documentation**

### **Interactive Swagger UI**
```
http://localhost:3000/docs
```
- 📖 **Full API Documentation** with interactive testing
- 🧪 **Try It Out** functionality for all endpoints
- 📋 **Request/Response Examples** with real data
- 🔧 **Schema Validation** with field descriptions

### **API Information**
```
http://localhost:3000/api
```
- 📊 **Endpoint Overview** with descriptions
- ℹ️ **Version Information** and system details
- 🔗 **Direct Links** to documentation

### **Health Check**
```
http://localhost:3000/api/health
```
- ❤️ **System Health Status**
- 🕐 **Timestamp** and environment info

## 📋 **Documented Endpoints**

### **✅ Merchant Endpoints (9 total)**
1. **`GET /api/merchants`** - Get all merchants (paginated)
2. **`POST /api/merchants`** - Create new merchant
3. **`GET /api/merchants/{walletAddress}`** - Get specific merchant
4. **`GET /api/merchants/{walletAddress}/rate`** - Get merchant rate
5. **`PUT /api/merchants/{merchantId}/rate`** - Update rate (legacy)
6. **`PUT /api/merchants/{merchantId}/profile`** - Update profile by ID
7. **`PUT /api/merchants/wallet/{walletAddress}/profile`** - Update by wallet
8. **`GET /api/merchants/{merchantId}/stats`** - Get merchant statistics
9. **`GET /api/merchants/{merchantId}/transactions`** - Get transactions

### **✅ System Endpoints (2 total)**
1. **`GET /api/health`** - Health check
2. **`GET /api`** - API information

## 🔧 **Key Features**

### **📊 Comprehensive Schemas**
- **Merchant** - Complete merchant data structure
- **MerchantCreateRequest** - Merchant creation payload
- **MerchantUpdateRequest** - Profile update payload
- **PaginatedMerchantsResponse** - Paginated results
- **Transaction** - Transaction data structure
- **ErrorResponse** - Standard error format
- **ValidationErrorResponse** - Detailed validation errors

### **🎯 Reusable Components**
- **Parameters** - Common query/path parameters
- **Responses** - Standard HTTP responses
- **Validation** - Field validation rules
- **Examples** - Real-world data examples

### **🛡️ Validation Specifications**
- **Field Types** - String, integer, boolean, array
- **Constraints** - Min/max values, patterns, enums
- **Required Fields** - Clearly marked required parameters
- **Format Validation** - Email, date-time, patterns

### **🎨 Advanced Features**
- **Interactive Testing** - Try endpoints directly in browser
- **Request Snippets** - Code examples in multiple languages
- **Model Expansion** - Collapsible schema views
- **Search/Filter** - Find endpoints quickly
- **Tag Organization** - Grouped by functionality

## 🌍 **Multi-Environment Support**

### **Development Server**
```yaml
url: http://localhost:3000
description: Development server
```

### **Production Server**
```yaml
url: https://api.autop2p.com
description: Production server
```

## 📝 **Example Usage**

### **1. View All Merchants**
- Open: `http://localhost:3000/docs`
- Navigate to: **Merchants → GET /api/merchants**
- Click: **Try it out**
- Modify parameters (page, limit, currency, etc.)
- Click: **Execute**
- View: Response body and status

### **2. Create New Merchant**
- Navigate to: **Merchants → POST /api/merchants**
- Click: **Try it out**
- Edit the request body:
```json
{
  "walletAddress": "0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1",
  "name": "Test Merchant",
  "email": "test@merchant.com",
  "currency": "USDT",
  "paymentMethods": ["Bank Transfer", "PayPal"]
}
```
- Click: **Execute**
- View: Created merchant response

### **3. Update Merchant Profile**
- Navigate to: **Merchants → PUT /api/merchants/{merchantId}/profile**
- Click: **Try it out**
- Enter merchant ID: `1`
- Edit request body:
```json
{
  "name": "Updated Merchant Name",
  "adRate": 1.05,
  "paymentMethods": ["Bank Transfer", "Credit Card"]
}
```
- Click: **Execute**
- View: Updated merchant data

## 🎯 **Schema Examples**

### **Merchant Schema**
```json
{
  "id": 1,
  "walletAddress": "0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1",
  "name": "Premium Crypto Exchange",
  "email": "merchant@example.com",
  "adRate": "1.0500",
  "balance": "1000.50000000",
  "currency": "USDT",
  "isActive": true,
  "minOrder": "10.00000000",
  "maxOrder": "1000.00000000",
  "paymentMethods": ["Bank Transfer", "PayPal", "Credit Card"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

### **Error Response Schema**
```json
{
  "success": false,
  "message": "Error message description"
}
```

### **Validation Error Schema**
```json
{
  "success": false,
  "message": "No valid fields provided. Updatable fields are: name, email, adRate, currency, minOrder, maxOrder, paymentMethods",
  "providedFields": ["invalidField"],
  "updatableFields": ["name", "email", "adRate", "currency", "minOrder", "maxOrder", "paymentMethods"]
}
```

## 🔍 **Query Parameters Documentation**

### **Pagination Parameters**
- **`page`** - Page number (min: 1, default: 1)
- **`limit`** - Items per page (min: 1, max: 100, default: 20)

### **Filtering Parameters**
- **`currency`** - Filter by currency (ETH, USDT, USDC, DAI, BTC)
- **`minRate`** - Minimum ad rate (number, min: 0)
- **`maxRate`** - Maximum ad rate (number, min: 0)
- **`search`** - Search by merchant name (string)
- **`hasBalance`** - Only merchants with balance > 0 (boolean)

### **Sorting Parameters**
- **`sortBy`** - Field to sort by (createdAt, updatedAt, name, adRate, balance)
- **`sortOrder`** - Sort direction (ASC, DESC)

## 🚦 **HTTP Status Codes**

### **Success Responses**
- **`200 OK`** - Request successful
- **`201 Created`** - Resource created successfully

### **Error Responses**
- **`400 Bad Request`** - Validation error or invalid parameters
- **`404 Not Found`** - Resource not found
- **`500 Internal Server Error`** - Server-side error

## 🔧 **Swagger UI Configuration**

### **Features Enabled**
- **Explorer** - Navigate through endpoints easily
- **Filter** - Search functionality
- **Request Duration** - Show response times
- **Try It Out** - Interactive testing
- **Request Snippets** - Code generation
- **Model Expansion** - Detailed schema views

### **Customization Options**
- **Theme** - Clean, professional appearance
- **Layout** - Organized by tags and operations
- **Expansion** - Auto-expand important sections
- **Validation** - Real-time schema validation

## 📚 **Integration Benefits**

### **For Developers**
- ✅ **Interactive Testing** - Test endpoints without external tools
- ✅ **Code Generation** - Automatic client code snippets
- ✅ **Schema Validation** - Understand request/response formats
- ✅ **Error Handling** - See all possible error scenarios

### **For Frontend Teams**
- ✅ **Contract Definition** - Clear API contract
- ✅ **Type Information** - TypeScript-friendly schemas
- ✅ **Example Data** - Real-world request/response examples
- ✅ **Validation Rules** - Frontend validation guidance

### **For QA Teams**
- ✅ **Test Cases** - Comprehensive endpoint coverage
- ✅ **Edge Cases** - Error scenarios documented
- ✅ **Data Validation** - Field constraints clearly defined
- ✅ **Manual Testing** - Direct browser testing capability

## 🚀 **Production Considerations**

### **Security**
- Consider authentication for production docs
- Rate limiting on documentation endpoints
- Environment-specific server URLs

### **Performance**
- Swagger UI assets are served efficiently
- Documentation generation is optimized
- Minimal impact on API performance

### **Maintenance**
- Keep documentation in sync with code
- Update examples with real data
- Version documentation with API changes

## 📞 **Next Steps**

1. **🔐 Add Authentication** - JWT/API key documentation
2. **📊 Add Transaction Endpoints** - Complete transaction docs
3. **🎨 Custom Branding** - Add your logo and colors
4. **🌍 Environment Variables** - Dynamic server URLs
5. **📱 Mobile Testing** - Responsive design verification

---

**Status**: ✅ **Production Ready**

Your AutoP2P API now has professional-grade documentation that enhances developer experience and accelerates integration efforts. The interactive Swagger UI makes it easy for frontend developers, partners, and your team to understand and test the API.

**Access your documentation at: http://localhost:3000/docs**