import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useOrderActions } from "@/hooks/useTrades";
import type { Merchant } from "@/services/api";

interface OrderCardProps {
  type: "buy" | "sell";
  merchant: Merchant;
  onTradeClick?: (merchant: Merchant, type: "buy" | "sell") => void;
}

export const OrderCard = ({ type, merchant, onTradeClick }: OrderCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { handleBuyOrder, handleSellOrder, isLoading, error } = useOrderActions();

  const handleClick = async () => {
    if (onTradeClick) {
      onTradeClick(merchant, type);
      return;
    }

    try {
      setIsProcessing(true);
      
      if (type === "buy") {
        // This would typically open a modal to collect bank details
        // For now, we'll call the onTradeClick callback
        console.log('Buy order clicked for merchant:', merchant.name);
      } else {
        // Handle sell order
        console.log('Sell order clicked for merchant:', merchant.name);
      }
    } catch (err) {
      console.error('Trade error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toLocaleString();
  };

  const formatPrice = (rate: string) => {
    const basePrice = 1580; // Base USDT price in NGN
    const adjustedPrice = basePrice * parseFloat(rate);
    return adjustedPrice.toLocaleString();
  };

  const formatLimit = () => {
    const min = formatAmount(merchant.minOrder);
    const max = formatAmount(merchant.maxOrder);
    return `₦${min} - ₦${max}`;
  };

  return (
    <Card className="p-4 hover:shadow-soft transition-all duration-300 w-full max-w-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
            {merchant.name[0]}
          </div>
          <div>
            <p className="font-semibold">{merchant.name}</p>
            <p className="text-xs text-muted-foreground">
              {merchant.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        <Badge variant={type === "buy" ? "default" : "destructive"}>
          {type.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Available</span>
          <span className="font-semibold">{formatAmount(merchant.balance)} USDT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Rate</span>
          <span className="font-semibold">₦{formatPrice(merchant.adRate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Limit</span>
          <span className="text-sm">{formatLimit()}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Payment Methods</p>
        <div className="flex flex-wrap gap-2">
          {merchant.paymentMethods.map((method) => (
            <Badge key={method} variant="outline" className="text-xs">
              {method}
            </Badge>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <Button 
        className="w-full" 
        variant={type === "buy" ? "default" : "destructive"}
        onClick={handleClick}
        disabled={isLoading || isProcessing || !merchant.isActive || parseFloat(merchant.balance) <= 0}
      >
        {isLoading || isProcessing ? (
          <>Loading...</>
        ) : (
          type === "buy" ? "Buy USDT" : "Sell USDT"
        )}
      </Button>
    </Card>
  );
};
