const crypto = require("crypto");

async function hooksCron2() {
  try {
    const payload = `
    {
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
    }`;

    const signatureValue = "Kt9095hQxfgmVbx6iz7G2tPhHdbdXgLlyY/mf35sptw=";
    const nombaTimeStamp = "2025-09-29T10:51:44Z";
    const secret = "sampleSecret";

    const mySig = generateSignature(payload, secret, nombaTimeStamp);

    console.log(`Generated signature [${mySig}]`);
    console.log(`Expected signature [${signatureValue}]`);

    if (signatureValue.toLowerCase() === mySig.toLowerCase()) {
      console.log(">>>>>>> Signatures match <<<<<<<<<<<");
    } else {
      console.log("<<<<<<<<< Signatures did not match >>>>>>>>>");
    }
  } catch (ex) {
    console.error("Error occurred while generating signature:", ex.message);
  }
}

function generateSignature(payload, secret, timeStamp) {
  const requestPayload = JSON.parse(payload);
  const data = requestPayload.data || {};
  const merchant = data.merchant || {};
  const transaction = data.transaction || {};

  const eventType = requestPayload.event_type || "";
  const requestId = requestPayload.requestId || "";
  const userId = merchant.userId || "";
  const walletId = merchant.walletId || "";
  const transactionId = transaction.transactionId || "";
  const transactionType = transaction.type || "";
  const transactionTime = transaction.time || "";
  let transactionResponseCode = transaction.responseCode || "";

  if (transactionResponseCode === "null") {
    transactionResponseCode = "";
  }

  const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${transactionResponseCode}:${timeStamp}`;

  console.log(`::: payload to hash --> [${hashingPayload}] :::`);

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(hashingPayload);
  const hash = hmac.digest("base64");

  return hash;
}

// Run
hooksCron2();