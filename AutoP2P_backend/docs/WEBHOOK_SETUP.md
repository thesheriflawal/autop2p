# Nomba Webhook Integration

This document describes how to set up and use the Nomba webhook integration in the AirP2P backend.

## Overview

The Nomba webhook integration allows your AirP2P backend to automatically receive notifications about payment status changes from Nomba. This enables real-time updates to transaction statuses without needing to poll the Nomba API.

## Supported Events

The webhook service currently supports the following Nomba events:

- `transfer.successful` - Transfer completed successfully
- `transfer.failed` - Transfer failed
- `transfer.pending` - Transfer is pending
- `transfer.reversed` - Transfer was reversed/refunded
- `payment.successful` - Incoming payment successful
- `payment.failed` - Incoming payment failed
- `payment.pending` - Incoming payment pending

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Nomba Configuration
NOMBA_API_KEY=your_nomba_api_key
NOMBA_BASE_URL=https://api.nomba.com
NOMBA_WEBHOOK_SECRET=your_nomba_webhook_secret_from_dashboard
```

### 2. Configure Webhook URL in Nomba Dashboard

1. Log into your Nomba merchant dashboard
2. Navigate to the Webhooks/API settings section
3. Add the following webhook URL:
   ```
   https://yourdomain.com/api/webhooks/nomba
   ```
4. Select the events you want to receive (recommend all payment/transfer events)
5. Save the configuration and copy the webhook secret
6. Update your `NOMBA_WEBHOOK_SECRET` environment variable

### 3. Test Webhook Configuration

You can test your webhook setup using these endpoints:

```bash
# Check webhook configuration
GET /api/webhooks/nomba/test

# Check webhook service health
GET /api/webhooks/health

# Simulate a webhook (development only)
POST /api/webhooks/nomba/simulate
{
  "event": "transfer.successful",
  "data": {
    "id": "test_123",
    "reference": "REF_TEST",
    "amount": 1000,
    "currency": "NGN",
    "status": "successful"
  }
}
```

## Webhook Endpoints

### Main Webhook Endpoint
- **URL**: `POST /api/webhooks/nomba`
- **Purpose**: Receive webhook notifications from Nomba
- **Security**: Verifies HMAC SHA256 signature

### Testing & Management Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/nomba/test` | GET | Test webhook configuration |
| `/api/webhooks/nomba/simulate` | POST | Simulate webhook (dev only) |
| `/api/webhooks/nomba/logs` | GET | Get webhook status info |
| `/api/webhooks/nomba/retry` | POST | Retry failed webhook processing |
| `/api/webhooks/health` | GET | Webhook service health check |

### Security Features

### Signature Verification
- All webhooks are verified using HMAC SHA256 signatures with Nomba's specific algorithm
- The signature is generated from: `event_type:requestId:userId:walletId:transactionId:transactionType:transactionTime:responseCode:timestamp`
- Signatures are compared using timing-safe comparison to prevent timing attacks
- Invalid signatures result in webhook rejection
- Requires both `x-nomba-signature` and `x-nomba-timestamp` headers

### Rate Limiting
- Webhook endpoints are rate-limited to 100 requests per minute per IP
- Health check endpoints are exempt from rate limiting

### Error Handling
- Webhook processing errors are logged but don't prevent acknowledgment
- Signature validation failures return 401 status
- Other errors return 200 to prevent unnecessary retries

## Webhook Processing Flow

1. **Receive Webhook**: Nomba sends webhook to your endpoint
2. **Verify Signature**: Check HMAC SHA256 signature against webhook secret
3. **Parse Payload**: Extract event type and data
4. **Find Transaction**: Look up transaction in database by reference
5. **Update Status**: Update transaction status based on webhook event
6. **Trigger Actions**: Execute any post-processing logic (notifications, etc.)
7. **Respond**: Return 200 OK to acknowledge receipt

## Transaction Matching

The webhook service tries to match incoming webhook events to transactions in your database using these fields:

- `nombaReference` - Reference from Nomba
- `merchantTxRef` - Your internal transaction reference
- `paymentId` - Payment ID from your system
- `txHash` - Blockchain transaction hash

## Debugging

### Check Webhook Configuration
```bash
curl -X GET https://yourdomain.com/api/webhooks/nomba/test
```

### Check Service Health
```bash
curl -X GET https://yourdomain.com/api/webhooks/health
```

### View Logs
Check your application logs for webhook processing information:
- Successful processing: `INFO` level logs
- Errors: `ERROR` level logs
- Warnings: `WARN` level logs

### Common Issues

1. **Invalid Signature Error**
   - Check that `NOMBA_WEBHOOK_SECRET` matches the secret in Nomba dashboard
   - Ensure secret doesn't have extra spaces or characters

2. **Transaction Not Found**
   - Webhook received but no matching transaction in database
   - Check that transaction references match between Nomba and your database

3. **Rate Limiting**
   - Too many webhook requests from same IP
   - Contact support if legitimate traffic is being blocked

## Development & Testing

### Local Development
For local development, you can use ngrok or similar tools to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local port 3000
ngrok http 3000

# Use the ngrok URL in Nomba dashboard
# Example: https://abc123.ngrok.io/api/webhooks/nomba
```

### Testing with Simulation
In development/test environments, you can simulate webhooks:

```bash
curl -X POST https://yourdomain.com/api/webhooks/nomba/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "event": "transfer.successful",
    "data": {
      "id": "test_123",
      "reference": "REF_TEST",
      "amount": 1000,
      "currency": "NGN",
      "status": "successful"
    }
  }'
```

## Monitoring

### Key Metrics to Monitor
- Webhook processing success rate
- Average processing time
- Error rates by event type
- Transaction matching success rate

### Alerting
Set up alerts for:
- High error rates (>5% failures)
- Signature verification failures
- Service unavailability
- Long processing times (>30 seconds)

## Extending the Integration

### Adding New Event Types
To support additional Nomba events:

1. Add the event name to `supportedEvents` array in `NombaWebhookService`
2. Add a new handler method (e.g., `handleNewEvent`)
3. Add the case to the switch statement in `processWebhook`
4. Update documentation

### Custom Business Logic
Add custom logic in the `onTransferSuccess`, `onTransferFailure`, and `onTransferReversal` methods:

```javascript
async onTransferSuccess(transaction, webhookData) {
  // Send success notification to user
  // Update merchant balance
  // Trigger any business logic
}
```

## Support

If you encounter issues with the webhook integration:

1. Check the logs for error details
2. Verify webhook configuration using test endpoints
3. Ensure your server is accessible from Nomba's servers
4. Check rate limiting and firewall settings
5. Contact Nomba support if webhook delivery seems to be failing