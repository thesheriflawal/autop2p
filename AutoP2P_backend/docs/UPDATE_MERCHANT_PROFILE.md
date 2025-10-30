# Update Merchant Profile API Endpoints

## Overview
These endpoints allow merchants to update their profile details beyond just the ad rate. Merchants can update their name, email, currency preferences, order limits, payment methods, and ad rates.

## Endpoints

### 1. Update Merchant Profile by ID
```
PUT /api/merchants/:merchantId/profile
```

### 2. Update Merchant Profile by Wallet Address
```
PUT /api/merchants/wallet/:walletAddress/profile
```

## Updatable Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `name` | string | Merchant display name | Min 2 characters, trimmed |
| `email` | string | Merchant email address | Valid email, unique, lowercase |
| `adRate` | number | Rate multiplier for deposits | 0 < rate ≤ 10 |
| `currency` | string | Supported currency | ETH, USDT, USDC, DAI, BTC |
| `minOrder` | number | Minimum order amount | Non-negative number |
| `maxOrder` | number | Maximum order amount | Non-negative, ≥ minOrder |
| `paymentMethods` | array | Supported payment methods | Array of valid payment method strings |

## Request Examples

### Update Multiple Fields
```bash
curl -X PUT "http://localhost:3000/api/merchants/1/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Merchant Name",
    "email": "newmerchant@example.com",
    "adRate": 1.05,
    "currency": "USDT",
    "minOrder": 10,
    "maxOrder": 1000,
    "paymentMethods": ["Bank Transfer", "PayPal", "Credit Card"]
  }'
```

### Update Single Field (Name)
```bash
curl -X PUT "http://localhost:3000/api/merchants/wallet/0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Merchant Name"
  }'
```

### Update Ad Rate and Limits
```bash
curl -X PUT "http://localhost:3000/api/merchants/1/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "adRate": 1.08,
    "minOrder": 5,
    "maxOrder": 500
  }'
```

### Update Payment Methods Only
```bash
curl -X PUT "http://localhost:3000/api/merchants/1/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethods": ["Bank Transfer", "Zelle", "Cash App", "Venmo"]
  }'
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Merchant profile updated successfully",
  "data": {
    "merchant": {
      "id": 1,
      "walletAddress": "0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1",
      "name": "Updated Merchant Name",
      "email": "newmerchant@example.com",
      "adRate": "1.0500",
      "balance": "1000.50000000",
      "currency": "USDT",
      "isActive": true,
      "minOrder": "10.00000000",
      "maxOrder": "1000.00000000",
      "paymentMethods": ["Bank Transfer", "PayPal", "Credit Card"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:45:00.000Z"
    },
    "updatedFields": ["name", "email", "adRate", "currency", "minOrder", "maxOrder", "paymentMethods"]
  }
}
```

### Error Responses

#### 400 Bad Request - No Data Provided
```json
{
  "success": false,
  "message": "No update data provided"
}
```

#### 400 Bad Request - Invalid Fields
```json
{
  "success": false,
  "message": "No valid fields provided. Updatable fields are: name, email, adRate, currency, minOrder, maxOrder, paymentMethods",
  "providedFields": ["invalidField"],
  "updatableFields": ["name", "email", "adRate", "currency", "minOrder", "maxOrder", "paymentMethods"]
}
```

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Ad rate must be a positive number between 0 and 10"
}
```

#### 400 Bad Request - Email Already Exists
```json
{
  "success": false,
  "message": "Email address is already in use by another merchant"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Merchant not found"
}
```

## Field Validations

### Name
- Must be a string
- Minimum 2 characters
- Automatically trimmed
- Required if provided

### Email
- Must be a valid email format
- Converted to lowercase
- Must be unique across all merchants
- Optional field

### Ad Rate
- Must be a positive number
- Must be between 0 and 10 (exclusive of 0, inclusive of 10)
- Used as a multiplier for deposits

### Currency
- Must be one of: ETH, USDT, USDC, DAI, BTC
- Automatically converted to uppercase
- Determines the currency the merchant deals in

### Min/Max Order
- Must be non-negative numbers
- minOrder cannot be greater than maxOrder
- If maxOrder is 0, it means no maximum limit
- Used to set trading limits

### Payment Methods
- Must be an array of strings
- Each method must be a non-empty string
- Duplicates are automatically removed
- Empty strings are filtered out
- Common methods: Bank Transfer, Credit Card, Debit Card, PayPal, Stripe, Cash App, Venmo, Zelle, Wire Transfer, Mobile Money, Cryptocurrency, Other

## Security Features

- Only specified fields can be updated (whitelist approach)
- Email uniqueness is enforced
- All inputs are validated and sanitized
- Balance and isActive cannot be updated via this endpoint (admin-only)
- Wallet address cannot be changed
- Comprehensive logging of all updates

## JavaScript Integration Examples

### Update Merchant Profile
```javascript
const updateMerchantProfile = async (merchantId, updateData) => {
  try {
    const response = await fetch(`/api/merchants/${merchantId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Profile updated successfully:', data.data.updatedFields);
      return data.data.merchant;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error updating merchant profile:', error);
    throw error;
  }
};

// Usage
const updatedMerchant = await updateMerchantProfile(1, {
  name: "New Merchant Name",
  adRate: 1.05,
  paymentMethods: ["Bank Transfer", "PayPal"]
});
```

### Update by Wallet Address
```javascript
const updateMerchantByWallet = async (walletAddress, updateData) => {
  try {
    const response = await fetch(`/api/merchants/wallet/${walletAddress}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating merchant profile:', error);
    throw error;
  }
};
```

### React Hook Example
```javascript
import { useState } from 'react';

const useMerchantProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (merchantId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/merchants/${merchantId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data.merchant;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
};
```

## Common Use Cases

### 1. Update Contact Information
```json
{
  "name": "John's Crypto Exchange",
  "email": "john@cryptoexchange.com"
}
```

### 2. Adjust Trading Parameters
```json
{
  "adRate": 1.03,
  "minOrder": 50,
  "maxOrder": 5000
}
```

### 3. Change Currency and Payment Methods
```json
{
  "currency": "USDT",
  "paymentMethods": ["Bank Transfer", "Zelle", "Cash App"]
}
```

### 4. Complete Profile Update
```json
{
  "name": "Premium Crypto Exchange",
  "email": "contact@premiumcrypto.com",
  "adRate": 1.02,
  "currency": "USDT",
  "minOrder": 100,
  "maxOrder": 10000,
  "paymentMethods": ["Bank Transfer", "Wire Transfer", "Credit Card"]
}
```

## Error Handling Best Practices

1. **Always check response status and success field**
2. **Handle validation errors gracefully in UI**
3. **Provide clear feedback to users about what went wrong**
4. **Implement retry logic for network errors**
5. **Validate input on frontend before sending to API**

## Differences from Legacy Rate Update

The existing `PUT /merchants/:merchantId/rate` endpoint only updates the ad rate. The new profile endpoints:

- ✅ Can update multiple fields in one request
- ✅ Provide comprehensive validation
- ✅ Return detailed information about what was updated
- ✅ Support both ID and wallet address lookup
- ✅ Include better error handling and messages

## Testing

Use the test script to verify functionality:
```bash
# Create a test script similar to test_get_all_merchants.js
node scripts/test_merchant_profile_update.js
```

---

**Status**: ✅ **Ready for Production**

These endpoints provide comprehensive merchant profile management with robust validation and security features.