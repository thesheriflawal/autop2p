const crypto = require('crypto');

/**
 * Test Nomba webhook signature verification
 * This file can be used to test the signature generation algorithm
 */

function testNombaSignature() {
  console.log('=== Testing Nomba Webhook Signature Verification ===\n');

  // Sample data from Nomba documentation
  const payload = {
    "event_type": "payment_success",
    "requestId": "45f2dc2d-d559-4773-bba3-2XXXXXXXXXX",
    "data": {
      "merchant": {
        "walletId": "6756ff80aafe04XXXXXXXXXX",
        "walletBalance": 6052,
        "userId": "b7b10e81-**-**-**-f4e23a132bbf"
      },
      "terminal": {},
      "transaction": {
        "aliasAccountNumber": "5343270516",
        "fee": 5,
        "sessionId": "IFAP-TRANSFER-46501-e0339485-1a2f-4b43-9bd5-XXXXXXXXXX",
        "type": "vact_transfer",
        "transactionId": "API-VACT_TRA-B7B10-0435b274-807a-4bc7-8abe-9XXXXXXXXXX",
        "aliasAccountName": "SAMPLE/JOHN DOE",
        "responseCode": "",
        "originatingFrom": "api",
        "transactionAmount": 10,
        "narration": "John Does Transfer 10.00 To SAMPLE/JOHN DOE - Nomba",
        "time": "2025-09-29T10:51:44Z",
        "aliasAccountReference": "sampleAccountReference",
        "aliasAccountType": "VIRTUAL"
      },
      "customer": {
        "bankCode": "090645",
        "senderName": "John Does",
        "bankName": "Nombank",
        "accountNumber": "0000000000"
      }
    }
  };

  const expectedSignature = "Kt9095hQxfgmVbx6iz7G2tPhHdbdXgLlyY/mf35sptw=";
  const nombaTimeStamp = "2025-09-29T10:51:44Z";
  const secret = "sampleSecret";

  const generatedSignature = generateNombaSignature(JSON.stringify(payload), secret, nombaTimeStamp);

  console.log('Test Data:');
  console.log('- Event Type:', payload.event_type);
  console.log('- Request ID:', payload.requestId);
  console.log('- Transaction ID:', payload.data.transaction.transactionId);
  console.log('- Timestamp:', nombaTimeStamp);
  console.log('- Secret:', secret);
  console.log('');

  console.log('Signature Comparison:');
  console.log('- Expected: ', expectedSignature);
  console.log('- Generated:', generatedSignature);
  console.log('- Match:    ', expectedSignature === generatedSignature ? '✓ YES' : '✗ NO');
  console.log('');

  // Debug: Let's see what fields we have
  console.log('Payload analysis:');
  console.log('- Event Type:', payload.event_type);
  console.log('- Request ID:', payload.requestId);
  console.log('- User ID:', payload.data.merchant.userId);
  console.log('- Wallet ID:', payload.data.merchant.walletId);
  console.log('- Transaction ID:', payload.data.transaction.transactionId);
  console.log('- Transaction Type:', payload.data.transaction.type);
  console.log('- Transaction Time:', payload.data.transaction.time);
  console.log('- Response Code:', JSON.stringify(payload.data.transaction.responseCode));
  console.log('');
  
  // Test if our signature matches when we fix the logic
  console.log('Testing different approaches...');
  
  // Let's manually build the exact string and see
  const parts = [
    payload.event_type || '',
    payload.requestId || '',
    payload.data.merchant.userId || '',
    payload.data.merchant.walletId || '',
    payload.data.transaction.transactionId || '',
    payload.data.transaction.type || '',
    payload.data.transaction.time || '',
    payload.data.transaction.responseCode === null ? '' : (payload.data.transaction.responseCode || ''),
    nombaTimeStamp
  ];
  
  const manualHashingPayload = parts.join(':');
  console.log('Manual hashing payload:', manualHashingPayload);
  
  const manualHmac = crypto.createHmac('sha256', secret);
  manualHmac.update(manualHashingPayload);
  const manualHash = manualHmac.digest('base64');
  
  console.log('Manual signature:', manualHash);
  console.log('Manual match:', expectedSignature === manualHash ? '✓ YES' : '✗ NO');

  console.log('\n=== Test Complete ===');
}

function generateNombaSignature(payload, secret, timeStamp) {
  try {
    const requestPayload = JSON.parse(payload);
    const data = requestPayload.data || {};
    const merchant = data.merchant || {};
    const transaction = data.transaction || {};

    const eventType = requestPayload.event_type || '';
    const requestId = requestPayload.requestId || '';
    const userId = merchant.userId || '';
    const walletId = merchant.walletId || '';
    const transactionId = transaction.transactionId || '';
    const transactionType = transaction.type || '';
    const transactionTime = transaction.time || '';
    let transactionResponseCode = transaction.responseCode || '';

    // Handle null response code
    if (transactionResponseCode === 'null' || transactionResponseCode === null) {
      transactionResponseCode = '';
    }

    // Create the hashing payload according to Nomba's specification
    const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${transactionResponseCode}:${timeStamp}`;

    console.log('Hashing Payload:', hashingPayload);
    console.log('');

    // Generate HMAC SHA256 signature in base64 format
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(hashingPayload);
    const hash = hmac.digest('base64');

    return hash;
  } catch (error) {
    console.error('Error generating signature:', error.message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testNombaSignature();
}

module.exports = {
  testNombaSignature,
  generateNombaSignature
};