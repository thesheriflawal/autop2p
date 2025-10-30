# Get All Merchants API Endpoint

## Overview
This endpoint retrieves a paginated list of all active merchants with optional filtering and sorting capabilities.

## Endpoint
```
GET /api/merchants
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination (min: 1) |
| `limit` | integer | No | 20 | Number of items per page (min: 1, max: 100) |
| `currency` | string | No | null | Filter by currency (e.g., 'ETH', 'USDT') |
| `minRate` | number | No | null | Minimum ad rate filter |
| `maxRate` | number | No | null | Maximum ad rate filter |
| `sortBy` | string | No | 'createdAt' | Sort field (createdAt, updatedAt, name, adRate, balance) |
| `sortOrder` | string | No | 'DESC' | Sort order (ASC or DESC) |
| `search` | string | No | null | Search merchants by name or email |
| `hasBalance` | boolean | No | false | Filter merchants with balance > 0 |

## Example Requests

### Basic Request
```bash
curl -X GET "http://localhost:3000/api/merchants"
```

### Paginated Request
```bash
curl -X GET "http://localhost:3000/api/merchants?page=2&limit=10"
```

### Filtered Request
```bash
curl -X GET "http://localhost:3000/api/merchants?currency=ETH&minRate=1.0&maxRate=2.0&hasBalance=true"
```

### Sorted Request
```bash
curl -X GET "http://localhost:3000/api/merchants?sortBy=adRate&sortOrder=ASC"
```

### Search Request
```bash
curl -X GET "http://localhost:3000/api/merchants?search=john&page=1&limit=5"
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Merchants retrieved successfully",
  "data": {
    "merchants": [
      {
        "id": 1,
        "walletAddress": "0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1",
        "name": "John's Exchange",
        "adRate": "1.0500",
        "balance": "1000.50000000",
        "currency": "ETH",
        "isActive": true,
        "minOrder": "0.10000000",
        "maxOrder": "50.00000000",
        "paymentMethods": ["Bank Transfer", "PayPal"],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:45:00.000Z"
      }
    ],
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

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Page must be greater than 0"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error message"
}
```

## Response Fields

### Merchant Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique merchant identifier |
| `walletAddress` | string | Ethereum wallet address |
| `name` | string | Merchant display name |
| `adRate` | string | Current ad rate multiplier |
| `balance` | string | Current merchant balance |
| `currency` | string | Supported currency |
| `isActive` | boolean | Whether merchant is active |
| `minOrder` | string | Minimum order amount |
| `maxOrder` | string | Maximum order amount |
| `paymentMethods` | array | Supported payment methods |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last update timestamp |

**Note:** Email field is excluded from public listing for privacy.

### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `currentPage` | integer | Current page number |
| `totalPages` | integer | Total number of pages |
| `totalItems` | integer | Total number of merchants |
| `itemsPerPage` | integer | Items per page |
| `hasNextPage` | boolean | Whether next page exists |
| `hasPreviousPage` | boolean | Whether previous page exists |
| `nextPage` | integer/null | Next page number |
| `previousPage` | integer/null | Previous page number |

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | "Page must be greater than 0" | Invalid page parameter |
| 400 | "Limit must be between 1 and 100" | Invalid limit parameter |
| 400 | "Invalid minRate parameter" | Invalid minRate value |
| 400 | "Invalid maxRate parameter" | Invalid maxRate value |
| 500 | Various error messages | Server-side errors |

## Use Cases

1. **Frontend Merchant Listing**: Display all available merchants to users
2. **Admin Dashboard**: Manage and view all merchants
3. **Merchant Discovery**: Search and filter merchants based on criteria
4. **Rate Comparison**: Compare merchant rates and balances
5. **Mobile App Integration**: Paginated merchant loading

## Security Considerations

- Email addresses are excluded from responses for privacy
- Only active merchants are returned
- Rate limiting should be implemented to prevent abuse
- Consider implementing authentication for admin-specific features

## Performance Notes

- Results are limited to 100 items per page maximum
- Database queries are optimized with proper indexing
- Consider implementing caching for frequently accessed data
- Pagination prevents memory issues with large datasets

## Integration Example (JavaScript/React)

```javascript
// Fetch merchants with pagination
const fetchMerchants = async (page = 1, filters = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit: 20,
    ...filters
  });

  try {
    const response = await fetch(`/api/merchants?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching merchants:', error);
    throw error;
  }
};

// Usage
const merchantData = await fetchMerchants(1, {
  currency: 'ETH',
  hasBalance: true,
  sortBy: 'adRate',
  sortOrder: 'ASC'
});
```