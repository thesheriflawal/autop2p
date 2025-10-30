INSERT INTO "Merchants" (
    id,
    "walletAddress",
    name,
    email,
    "adRate",
    balance,
    currency,
    "isActive",
    "minOrder",
    "maxOrder",
    "paymentMethods",
    "createdAt",
    "updatedAt"
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '0x9a8F5bC3D45aE2A7f6C1E123e5B8dC7C1a4fB7D2',
    'John Doe',
    'john.doe@example.com',
    1.0500,
    25000.75000000,
    'ETH',
    TRUE,
    10.00000000,
    1000.00000000,
    '["bank_transfer", "crypto"]',
    NOW(),
    NOW()
);
