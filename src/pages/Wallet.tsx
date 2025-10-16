import { useState } from "react";
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
} from "lucide-react";

const WalletComponent = () => {
  const [balance] = useState("45,000.00");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState(null);

  const merchantId = 1;

  const handleDeposit = () => {
    window.open("https://checkout.nomba.com/payment-link/5614141336", "_blank");
  };

  const handleWithdraw = async () => {
    if (!withdrawalAmount || !bankName || !accountNumber || !accountName) {
      setWithdrawalStatus({
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    setIsSubmitting(true);
    setWithdrawalStatus(null);

    try {
      const response = await fetch(
        `https://airp2p-backend.onrender.com/api/merchants/${merchantId}/withdrawal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(withdrawalAmount),
            bankName: bankName,
            accountNumber: accountNumber,
            accountName: accountName,
            narration: `Withdrawal - ${accountName}`,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setWithdrawalStatus({
          type: "success",
          message: "Withdrawal request submitted successfully!",
          ref: data.data.withdrawalRef,
          estimatedTime: data.data.estimatedProcessingTime,
        });
        setWithdrawalAmount("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");
      } else {
        setWithdrawalStatus({
          type: "error",
          message: data.message || "Withdrawal failed. Please try again.",
        });
      }
    } catch (error) {
      setWithdrawalStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-gray-600">Manage your Naira portfolio</p>
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="h-8 w-8" />
          <span className="text-lg font-medium">Naira Balance</span>
        </div>
        <div className="text-5xl font-bold mb-2">₦{balance}</div>
        <p className="text-blue-100 text-sm">
          Available for trading and withdrawal
        </p>
      </Card>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="deposit" className="gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2">
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
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
        </TabsContent>

        <TabsContent value="withdraw">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-1">Withdraw Naira</h3>
            <p className="text-sm text-gray-600 mb-6">
              Transfer funds to your bank account
            </p>

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
                  Available: ₦{balance} • Minimum: ₦10.00
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <select
                  id="bank-name"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select a bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="First Bank of Nigeria">
                    First Bank of Nigeria
                  </option>
                  <option value="GTBank">GTBank</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="Opay">Opay</option>
                  <option value="Palmpay">Palmpay</option>
                  <option value="UBA">UBA</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Other">Other</option>
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

              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  type="text"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  disabled={isSubmitting}
                />
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
                disabled={isSubmitting}
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
