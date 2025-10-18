import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowRight, Clock, Search } from "lucide-react";
import { useAccount } from "wagmi";
import { useCreateTrade } from "@/hooks/useTrades";
import type { Merchant } from "@/services/api";
import { paymentsApi } from "@/services/api";
import { toast } from "@/components/ui/sonner";
import { paymentsApi } from "@/services/api";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant | null;
  adId?: number; // required by contract createTrade
  tradeType: "buy" | "sell";
}

// Inline widget to reflect live on-chain status for the last created trade
const TradeStatusWidget = ({ tradeId, onClose }: { tradeId: number; onClose: () => void }) => {
  const { trade, isLoading } = useTrade(tradeId);
  const statusNum = (() => {
    const t: any = trade as any;
    return Number(t?.status ?? t?.[10] ?? -1);
  })();
  const statusText = (() => {
    switch (statusNum) {
      case 0: return 'Deposited (escrowed)';
      case 1: return 'Payment Made';
      case 2: return 'Completed (released)';
      case 3: return 'Disputed';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  })();
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Clock className={`h-8 w-8 ${statusNum === 2 ? 'text-green-600' : 'text-green-600 animate-spin'}`} />
      </div>
      <h3 className="text-lg font-semibold">Trade #{tradeId}</h3>
      <p className="text-gray-600">Status: {isLoading ? 'Loading...' : statusText}</p>
      <Button onClick={onClose} className="w-full">Close</Button>
    </div>
  );
};

export const TradeModal = ({
  isOpen,
  onClose,
  merchant,
  adId,
  tradeType,
}: TradeModalProps) => {
  const { address } = useAccount();
  const {
    initiateTrade,
    executeTrade,
    isLoading,
    isApprovalConfirmed,
    isTradeConfirmed,
    error,
  } = useCreateTrade();

  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"wallet" | "bank">("bank");
  const [step, setStep] = useState(1); // 1: details, 2: approval, 3: trade
  const [createdTradeId, setCreatedTradeId] = useState<number | null>(null);

  // Banks search list
  const [banks, setBanks] = useState<{ name: string; code: string; logo?: string }[]>([]);
  const [bankSearch, setBankSearch] = useState("");
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await paymentsApi.getBanks();
        if (mounted && res?.data) setBanks(res.data);
      } catch (e) {
        // ignore; fallback will be empty list
        console.warn("[banks] failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const filteredBanks = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    const list = q ? banks.filter((b) => b.name.toLowerCase().includes(q)) : banks;
    return list.slice(0, 5);
  }, [banks, bankSearch]);

  // Reset modal state on open
  const resetModal = useCallback(() => {
    setStep(1);
    setAmount("");
    setAccountName("");
    setAccountNumber("");
    setBankCode("");
    setCreatedTradeId(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen, resetModal]);

  const handleSubmit = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Validate
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const minLim = Number((merchant as any).minAmount ?? (merchant as any).minOrder ?? 0);
    const maxLim = Number((merchant as any).maxAmount ?? (merchant as any).maxOrder ?? 0);
    if (minLim && amountNum < minLim) {
      toast.error(`Amount is below minimum (${minLim})`);
      return;
    }
    if (maxLim && amountNum > maxLim) {
      toast.error(`Amount is above maximum (${maxLim})`);
      return;
    }
    if (
      tradeType === "sell" &&
      payoutMethod === "bank" &&
      (!accountName || !accountNumber || !bankCode)
    ) {
      toast.error("Please enter your bank details");
      return;
    }

    const isWalletPayout = tradeType === "sell" && payoutMethod === "wallet";

    const tradeData = {
      merchantId: merchant.id,
      merchantAddress: merchant.walletAddress,
      adId: Number(adId ?? (merchant as any).adId ?? 0),
      accountName:
        tradeType === "sell" ? (isWalletPayout ? "WALLET" : accountName) : "",
      accountNumber:
        tradeType === "sell" ? (isWalletPayout ? "WALLET" : accountNumber) : "",
      bankCode:
        tradeType === "sell" ? (isWalletPayout ? "WALLET" : bankCode) : "",
      amount,
    } as const;

    try {
      setStep(2);
      // initiateTrade now handles approve + trade
      const res = await initiateTrade(tradeData);
      if (res?.tradeId) {
        setCreatedTradeId(Number(res.tradeId));
        setStep(3);
      } else {
        setStep(1);
      }
    } catch (error) {
      console.error("Trade error:", error);
      setStep(1);
    }
  };

  const calculateTotal = () => {
    if (!amount) return 0;
    const explicitRate = Number(
      (merchant as any).exchangeRate ?? (merchant as any).ngnRate ?? 0
    );
    const effectiveRate =
      isFinite(explicitRate) && explicitRate > 0
        ? explicitRate
        : 1580 *
          (isFinite(parseFloat((merchant as any).adRate))
            ? parseFloat((merchant as any).adRate)
            : 1);
    return parseFloat(amount) * effectiveRate;
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!merchant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tradeType === "buy" ? "Buy USDT" : "Sell USDT"}
            <Badge variant={tradeType === "buy" ? "default" : "destructive"}>
              {tradeType.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Initiate a {tradeType} trade with the selected merchant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Merchant Info */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {merchant.name[0]}
              </div>
              <div>
                <p className="font-semibold">{merchant.name}</p>
                <p className="text-xs text-gray-600">
                  Rate: ₦
                  {(() => {
                    const rate = Number(
                      (merchant as any).exchangeRate ??
                        (merchant as any).ngnRate ??
                        0
                    );
                    if (isFinite(rate) && rate > 0)
                      return rate.toLocaleString();
                    const mul = parseFloat((merchant as any).adRate ?? "1");
                    return (1580 * (isFinite(mul) ? mul : 1)).toLocaleString();
                  })()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {merchant.paymentMethods.map((method) => (
                <Badge key={method} variant="outline" className="text-xs">
                  {method}
                </Badge>
              ))}
            </div>
          </Card>

          {createdTradeId === null && step === 1 && (
            <>
              {/* Trade Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={Number(
                      (merchant as any).minAmount ??
                        (merchant as any).minOrder ??
                        0
                    )}
                    max={Number(
                      (merchant as any).maxAmount ??
                        (merchant as any).maxOrder ??
                        0
                    )}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limit:{" "}
                    {Number(
                      (merchant as any).minAmount ??
                        (merchant as any).minOrder ??
                        0
                    )}{" "}
                    -{" "}
                    {Number(
                      (merchant as any).maxAmount ??
                        (merchant as any).maxOrder ??
                        0
                    )}{" "}
                    USDT
                  </p>
                </div>

                {amount && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">
                      You will receive: ₦{calculateTotal().toLocaleString()}
                    </p>
                  </div>
                )}

                {tradeType === "sell" && (
                  <>
                    <div className="space-y-2">
                      <Label>Payout Destination</Label>
                      <div className="flex gap-3 text-sm">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payout"
                            value="wallet"
                            checked={payoutMethod === "wallet"}
                            onChange={() => setPayoutMethod("wallet")}
                          />
                          Naira Wallet (in-app)
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payout"
                            value="bank"
                            checked={payoutMethod === "bank"}
                            onChange={() => setPayoutMethod("bank")}
                          />
                          External Bank
                        </label>
                      </div>
                    </div>

                    {payoutMethod === "bank" && (
                      <>
                        <div>
                          <Label htmlFor="accountName">Account Name</Label>
                          <Input
                            id="accountName"
                            placeholder="Your full name"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            placeholder="10-digit account number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            maxLength={10}
                          />
                        </div>

                        <div>
                          <Label htmlFor="bankCode">Bank {bankCode && <span className="text-xs text-muted-foreground">(selected: {bankCode})</span>}</Label>
                          <div className="relative">
                            <Input
                              id="bankCode"
                              placeholder="Search your bank name"
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                            />
                            <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          <div className="mt-2 space-y-1 max-h-56 overflow-auto">
                            {filteredBanks.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No banks found</p>
                            ) : (
                              filteredBanks.map((b) => (
                                <button
                                  key={b.code}
                                  type="button"
                                  onClick={() => {
                                    setBankCode(b.code);
                                    setBankSearch(b.name);
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded border ${
                                    bankCode === b.code ? 'bg-blue-50 border-blue-200' : 'border-input hover:bg-muted'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">{b.name}</span>
                                    <span className="text-xs text-muted-foreground">{b.code}</span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={isLoading || !address}
              >
                {tradeType === "buy" ? "Initiate Purchase" : "Initiate Sale"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {createdTradeId === null && step === 2 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold">Waiting for Approval</h3>
              <p className="text-gray-600">
                Please approve the USDT spending in your wallet to continue.
              </p>
            </div>
          )}

          {createdTradeId === null && step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-green-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold">Finalizing</h3>
              <p className="text-gray-600">
                Waiting for confirmations and status from the network...
              </p>
            </div>
          )}

          {createdTradeId !== null && (
            <TradeStatusWidget tradeId={createdTradeId} onClose={handleClose} />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
