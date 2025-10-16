import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useCreateTrade } from '@/hooks/useTrades';
import type { Merchant } from '@/services/api';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant | null;
  tradeType: 'buy' | 'sell';
}

export const TradeModal = ({ isOpen, onClose, merchant, tradeType }: TradeModalProps) => {
  const { address } = useAccount();
  const { 
    initiateTrade, 
    executeTrade, 
    isLoading, 
    isApprovalConfirmed, 
    isTradeConfirmed, 
    error 
  } = useCreateTrade();

  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [step, setStep] = useState(1); // 1: details, 2: approval, 3: trade

  if (!merchant) return null;

  const handleSubmit = async () => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (!amount || !accountName || !accountNumber || !bankCode) {
      alert('Please fill in all fields');
      return;
    }

    const tradeData = {
      merchantId: merchant.id,
      merchantAddress: merchant.walletAddress,
      accountName,
      accountNumber,
      bankCode,
      amount,
    };

    try {
      setStep(2);
      await initiateTrade(tradeData);
      
      // After approval is confirmed, execute the trade
      if (isApprovalConfirmed) {
        setStep(3);
        executeTrade(tradeData);
      }
    } catch (error) {
      console.error('Trade error:', error);
    }
  };

  const calculateTotal = () => {
    if (!amount) return 0;
    const basePrice = 1580; // Base USDT price in NGN
    const adjustedPrice = basePrice * parseFloat(merchant.adRate);
    return parseFloat(amount) * adjustedPrice;
  };

  const resetModal = () => {
    setStep(1);
    setAmount('');
    setAccountName('');
    setAccountNumber('');
    setBankCode('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tradeType === 'buy' ? 'Buy USDT' : 'Sell USDT'}
            <Badge variant={tradeType === 'buy' ? 'default' : 'destructive'}>
              {tradeType.toUpperCase()}
            </Badge>
          </DialogTitle>
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
                <p className="text-xs text-gray-600">Rate: ₦{(1580 * parseFloat(merchant.adRate)).toLocaleString()}</p>
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

          {step === 1 && (
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
                    min={merchant.minOrder}
                    max={merchant.maxOrder}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limit: {merchant.minOrder} - {merchant.maxOrder} USDT
                  </p>
                </div>

                {amount && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">You will pay: ₦{calculateTotal().toLocaleString()}</p>
                  </div>
                )}

                {tradeType === 'buy' && (
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
                      <Label htmlFor="bankCode">Bank</Label>
                      <select
                        id="bankCode"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                      >
                        <option value="">Select bank</option>
                        <option value="044">Access Bank</option>
                        <option value="011">First Bank</option>
                        <option value="058">GTBank</option>
                        <option value="999999">Kuda Bank</option>
                        <option value="999992">Opay</option>
                        <option value="999991">Palmpay</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={isLoading || !address}
              >
                {tradeType === 'buy' ? 'Initiate Purchase' : 'Initiate Sale'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
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

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-green-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold">Creating Trade</h3>
              <p className="text-gray-600">
                Your trade is being created on the blockchain. Please wait...
              </p>
            </div>
          )}

          {isTradeConfirmed && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">Trade Created!</h3>
              <p className="text-gray-600">
                Your trade has been created successfully. You can track it in the Pending section.
              </p>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
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