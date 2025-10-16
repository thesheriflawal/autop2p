import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coins,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useUSDTBalance, useUSDT } from "@/hooks/useContract";
import { useMerchant, useMerchantWithdrawal } from "@/hooks/useMerchants";
import RegistrationGate from "@/components/RegistrationGate";
import { merchantApi, paymentsApi } from "@/services/api";

const WalletComponent = () => {
  const [showReReg, setShowReReg] = useState(false);
  const { address } = useAccount();
  const { balance: usdtBalance, isLoading: balanceLoading, refetch: refetchBalance } = useUSDTBalance(address);
  const { faucet, isPending: faucetPending, isConfirmed: faucetConfirmed } = useUSDT();
const { data: merchantData, refetch: refetchMerchant } = useMerchant(address);
  const merchantWithdrawal = useMerchantWithdrawal();
  
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [banks, setBanks] = useState<{ name: string; code: string; logo: string }[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  // Lightweight fallback mapping for bank codes if backend still requires it
  const BANK_CODE_MAP: Record<string, string> = {
    "Access Bank": "044",
    "First Bank of Nigeria": "011",
    "GTBank": "058",
    "Guaranty Trust Bank": "058",
    "UBA": "033",
    "Zenith Bank": "057",
    "Kuda Bank": "50211",
    "Moniepoint": "50515",
    "Opay": "999992",
    "Palmpay": "999991",
  };
  const [withdrawalStatus, setWithdrawalStatus] = useState<{
    type: string;
    message: string;
    ref?: string;
    estimatedTime?: string;
  } | null>(null);

  const merchantId = merchantData?.data?.id;
  const nairaBalance = merchantData?.data?.balance || "0";
  const isSubmitting = merchantWithdrawal.isPending;


// Poll Naira balance to reflect deposits
  useEffect(() => {
    const id = setInterval(() => {
      refetchMerchant();
    }, 5000);
    return () => clearInterval(id);
  }, [refetchMerchant]);

  // Refetch USDT balance when faucet is confirmed
  useEffect(() => {
    if (faucetConfirmed) {
      refetchBalance();
    }
  }, [faucetConfirmed, refetchBalance]);

  // Load banks for withdraw select
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBanksLoading(true);
        const res = await paymentsApi.getBanks();
        if (mounted && res?.data) {
          const sorted = [...res.data].sort((a, b) => a.name.localeCompare(b.name));
          setBanks(sorted);
        }
      } catch (e) {
        // silent fail; fallback to static map options
        console.warn("[Banks] failed to load", e);
      } finally {
        setBanksLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeposit = () => {
    window.open("https://checkout.nomba.com/payment-link/5614141336", "_blank");
  };

  const handleFaucet = () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }
    faucet();
  };

  const handleWithdraw = async () => {
    console.log("[Withdraw] start", {
      address,
      merchantId,
      withdrawalAmount,
      bankName,
      nairaBalance,
    });

    const getErrorInfo = (e: unknown) => {
      let responseData: unknown = undefined;
      let message: string | undefined = undefined;
      if (typeof e === 'object' && e !== null) {
        const maybeResp = e as { response?: { data?: unknown } };
        responseData = maybeResp.response?.data;
        if ('message' in e && typeof (e as Record<string, unknown>).message === 'string') {
          message = (e as Record<string, unknown>).message as string;
        }
      }
      return { responseData, message };
    };

    const amountNum = parseFloat(withdrawalAmount);

    if (!withdrawalAmount || isNaN(amountNum) || amountNum <= 0 || !bankName || !accountNumber) {
      console.warn("[Withdraw] invalid inputs", {
        withdrawalAmount,
        amountNum,
        bankName,
        accountNumber,
      });
      setWithdrawalStatus({
        type: "error",
        message: "Please fill in all fields with valid values",
      });
      return;
    }

    if (accountNumber.length !== 10) {
      console.warn("[Withdraw] invalid account number length", accountNumber);
      setWithdrawalStatus({ type: "error", message: "Account number must be 10 digits" });
      return;
    }

    if (!merchantId) {
      console.warn("[Withdraw] missing merchantId");
      setWithdrawalStatus({
        type: "error",
        message: "Merchant profile not found. Please create a merchant profile first.",
      });
      return;
    }

    setWithdrawalStatus(null);

    try {
      // Optional: check eligibility first for clearer errors
      try {
        console.log("[Withdraw] check eligibility", { merchantId, amountNum });
        const elig = await merchantApi.checkWithdrawalEligibility(merchantId, amountNum);
        console.log("[Withdraw] eligibility response", elig);
        const eligible = elig?.data?.eligible ?? true;
        if (!eligible) {
          setWithdrawalStatus({ type: "error", message: elig?.message || "Not eligible for withdrawal" });
          return;
        }
      } catch (eligErr: unknown) {
        const info = getErrorInfo(eligErr);
        console.warn("[Withdraw] eligibility check failed (continuing)", info.responseData ?? info.message ?? String(eligErr));
        // proceed even if eligibility endpoint not available
      }

      const mappedCode = bankCode || BANK_CODE_MAP[bankName];
      const payload = {
        merchantId,
        data: {
          amount: amountNum,
          bankName: bankName,
          accountNumber: accountNumber,
          accountName: merchantData?.data?.name || "",
          narration: `Withdrawal - ${merchantData?.data?.name || "Withdrawal"}`,
          ...(mappedCode ? { bankCode: mappedCode, bankCode: mappedCode } : {}),
        },
      } as const;
      console.log("[Withdraw] payload", JSON.parse(JSON.stringify(payload)));

      const result = await merchantWithdrawal.mutateAsync(payload);

      console.log("[Withdraw] response", result);

      if (result?.success) {
        setWithdrawalStatus({
          type: "success",
          message: "Withdrawal request submitted successfully!",
          ref: result?.data?.withdrawalRef,
          estimatedTime: result?.data?.estimatedProcessingTime,
        });
        setWithdrawalAmount("");
        setBankName("");
        setAccountNumber("");
        setBankCode("");
        // refresh merchant balance after successful request
        refetchMerchant();
      } else {
        setWithdrawalStatus({
          type: "error",
          message: result?.message || "Withdrawal failed. Please try again.",
        });
      }
    } catch (error: unknown) {
      const info = getErrorInfo(error);
      console.error("[Withdraw] error", info.responseData ?? info.message ?? String(error));
      setWithdrawalStatus({
        type: "error",
        message:
          (typeof info.responseData === 'object' && info.responseData && 'message' in info.responseData && typeof (info.responseData as Record<string, unknown>).message === 'string'
            ? ((info.responseData as Record<string, unknown>).message as string)
            : info.message) || "Network error. Please check your connection and try again.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-gray-600">Manage your Naira portfolio</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowReReg((v) => !v)}>
          Re-register
        </Button>
      </div>

      {showReReg && (
        <div className="mb-6">
          <RegistrationGate title="Update registration" description="Update your name/email. Make sure it matches deposits." alwaysShow />
        </div>
      )}

      {/* USDT Balance */}
      <Card className="p-6 mb-4 bg-gradient-to-br from-green-600 to-green-800 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Coins className="h-8 w-8" />
            <span className="text-lg font-medium">USDT Balance</span>
          </div>
          <Button
            onClick={handleFaucet}
            variant="secondary"
            size="sm"
            disabled={!address || faucetPending}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {faucetPending ? "Getting..." : "Get Test USDT"}
          </Button>
        </div>
        <div className="text-4xl font-bold mb-2">
          {balanceLoading ? "Loading..." : `${parseFloat(usdtBalance).toLocaleString()} USDT`}
        </div>
        <p className="text-green-100 text-sm">
          Available for trading
        </p>
      </Card>

      {/* Naira Balance */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="h-8 w-8" />
          <span className="text-lg font-medium">Naira Balance</span>
        </div>
        <div className="text-4xl font-bold mb-2">
          ₦{parseFloat(nairaBalance).toLocaleString()}
        </div>
        <p className="text-blue-100 text-sm">
          Available for trading and withdrawal
        </p>
      </Card>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="deposit" className="gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="usdt" className="gap-2">
            <Coins className="h-4 w-4" />
            USDT
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2">
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw
          </TabsTrigger>
        </TabsList>

<TabsContent value="deposit">
          {!address || !merchantData?.data?.walletAddress ? (
            <RegistrationGate 
              title="Register to deposit"
              description="Kindly register and ensure you use this same email when paying so your Naira balance updates automatically."
            />
          ) : (
          <Card className="p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowDownToLine className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Deposit Naira</h3>
                <p className="text-gray-600">
                  Click the button below to securely deposit funds via Nomba
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>
                    You'll be redirected to Nomba's secure payment page. Your
                    deposit will be reflected in your wallet immediately after
                    payment confirmation.
                  </span>
                </p>
              </div>

              <Button
                onClick={handleDeposit}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                Proceed to Deposit
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                Powered by Nomba - Secure payment processing
              </p>
            </div>
</Card>
          )}
        </TabsContent>

        <TabsContent value="usdt">
          <Card className="p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Get Test USDT</h3>
                <p className="text-gray-600">
                  Get test USDT tokens for testing the P2P trading platform
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Current Balance: <span className="font-semibold">{usdtBalance} USDT</span>
                </p>
              </div>

              <Button
                onClick={handleFaucet}
                disabled={!address || faucetPending}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
              >
                {faucetPending ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-5 w-5" />
                    Get 1000 Test USDT
                  </>
                )}
              </Button>

              {!address && (
                <p className="text-sm text-red-600 mt-4">
                  Please connect your wallet to get test USDT
                </p>
              )}

              <p className="text-xs text-gray-500 mt-4">
                Test tokens for Lisk Sepolia testnet only
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-1">Withdraw Naira</h3>
            <p className="text-sm text-gray-600 mb-2">
              Transfer funds to your bank account
            </p>

      <div className="mb-6">
              <div className="rounded-md border p-3 bg-gray-50">
                <div className="text-xs text-gray-500">Account Name</div>
                <div className="font-medium">{merchantData?.data?.name || "Not set"}</div>
              </div>
            </div>

            {withdrawalStatus && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  withdrawalStatus.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {withdrawalStatus.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      withdrawalStatus.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {withdrawalStatus.message}
                  </p>
                  {withdrawalStatus.ref && (
                    <p className="text-sm text-green-700 mt-1">
                      Reference: {withdrawalStatus.ref}
                    </p>
                  )}
                  {withdrawalStatus.estimatedTime && (
                    <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Processing time: {withdrawalStatus.estimatedTime}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (NGN)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Available: ₦{parseFloat(nairaBalance).toLocaleString()} • Minimum: ₦10.00
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank</Label>
                <select
                  id="bank-name"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  value={bankCode || ""}
                  onChange={(e) => {
                    const code = e.target.value;
                    setBankCode(code);
                    const found = banks.find((b) => b.code === code);
                    setBankName(found?.name || "");
                  }}
                  disabled={isSubmitting || banksLoading}
                >
                  <option value="">{banksLoading ? "Loading banks..." : "Select a bank"}</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  type="text"
                  placeholder="10-digit account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1">
                <Label>Account Name</Label>
                <div className="text-sm text-muted-foreground">
                  Will be validated automatically from your merchant profile
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Withdrawals are processed within 1-3 business days. Ensure
                    your account details are correct to avoid delays.
                  </span>
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                className="w-full h-11 bg-red-600 hover:bg-red-700"
                disabled={isSubmitting || !merchantId}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowUpFromLine className="mr-2 h-4 w-4" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletComponent;