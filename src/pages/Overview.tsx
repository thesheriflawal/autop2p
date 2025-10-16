import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderCard } from "@/components/OrderCard";
import { TradeModal } from "@/components/TradeModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMerchants } from "@/hooks/useMerchants";
import { useAds } from "@/hooks/useAds";
import { useAccount } from "wagmi";
import type { Merchant } from "@/services/api";

const Overview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("buy");
  const { address } = useAccount();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [showTradeModal, setShowTradeModal] = useState(false);
  
  // Fetch merchants (to map ad.merchantId -> walletAddress etc.)
  const { data: merchantsResponse, isLoading, error } = useMerchants({
    hasBalance: false,
    currency: "USDT",
    limit: 200,
  });

  // Fetch ads: we need both types
  const { data: buyAdsRes } = useAds({ token: 'USDT', localCurrency: 'NGN', type: 'BUY', isActive: true, limit: 100, sortBy: 'lastActiveAt', sortOrder: 'DESC' });
  const { data: sellAdsRes } = useAds({ token: 'USDT', localCurrency: 'NGN', type: 'SELL', isActive: true, limit: 100, sortBy: 'lastActiveAt', sortOrder: 'DESC' });

  const merchants: Merchant[] = merchantsResponse?.data?.merchants || [];
  const merchantsById = new Map<number, Merchant>(merchants.map((m: any) => [m.id, m]));

  // Helper to convert ad -> merchant object with ad overrides
  const adToMerchant = (ad: any): Merchant | null => {
    const base = merchantsById.get(ad.merchantId);
    if (!base) return null;
    const adjusted: any = { ...base };
    // Convert NGN price to factor used in UI components
    const basePrice = 1580;
    adjusted.adRate = (ad.exchangeRate && basePrice > 0) ? (ad.exchangeRate / basePrice).toFixed(4) : base.adRate;
    adjusted.minOrder = String(ad.minAmount ?? base.minOrder ?? '0');
    adjusted.maxOrder = String(ad.maxAmount ?? base.maxOrder ?? '0');
    adjusted.paymentMethods = ad.paymentMethods ?? base.paymentMethods ?? [];
    return adjusted as Merchant;
  };

  const handleTradeClick = (merchant: Merchant, type: "buy" | "sell") => {
    setSelectedMerchant(merchant);
    setTradeType(type);
    setShowTradeModal(true);
  };

const handleCreateAd = () => {
    navigate('/ad?tab=create');
  };


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse available buy and sell orders
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="buy">Buy Orders</TabsTrigger>
            <TabsTrigger value="sell">Sell Orders</TabsTrigger>
          </TabsList>
          <Button onClick={handleCreateAd}>Create Ad</Button>
        </div>

        <TabsContent value="buy" className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Users buying USDT see SELL ads */}
            {(sellAdsRes?.data?.ads || []).length ? (
              (sellAdsRes!.data!.ads as any[])
                .map(adToMerchant)
                .filter(Boolean)
                .map((merchant: any) => (
                  <OrderCard 
                    key={`ad-sell-${merchant.id}`}
                    type="buy"
                    merchant={merchant}
                    onTradeClick={handleTradeClick}
                  />
                ))
            ) : (
              <div className="text-muted-foreground p-8 text-center">No sell ads available</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Users selling USDT see BUY ads */}
            {(buyAdsRes?.data?.ads || []).length ? (
              (buyAdsRes!.data!.ads as any[])
                .map(adToMerchant)
                .filter(Boolean)
                .map((merchant: any) => (
                  <OrderCard 
                    key={`ad-buy-${merchant.id}`}
                    type="sell"
                    merchant={merchant}
                    onTradeClick={handleTradeClick}
                  />
                ))
            ) : (
              <div className="text-muted-foreground p-8 text-center">No buy ads available</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <TradeModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        merchant={selectedMerchant}
        tradeType={tradeType}
      />
    </div>
  );
};

export default Overview;
