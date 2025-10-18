import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderCard } from "@/components/OrderCard";
import { TradeModal } from "@/components/TradeModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMerchants } from "@/hooks/useMerchants";
import { useAds } from "@/hooks/useAds";
import { useAccount } from "wagmi";
import type { Merchant } from "@/services/api";

const Overview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sell");
  const { address } = useAccount();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [showTradeModal, setShowTradeModal] = useState(false);
  
  // Fetch merchants (to map ad.merchantId -> walletAddress etc.)
  const { data: merchantsResponse, isLoading, error } = useMerchants();

  // Fetch ads: we only support SELL ads for now
  const { data: sellAdsRes } = useAds({ type: 'SELL', isActive: true, limit: 100 });

  const merchants: Merchant[] = merchantsResponse?.data?.merchants || [];
  const merchantsById = new Map<number, Merchant>(merchants.map((m: any) => [m.id, m]));

  // Helper to convert ad -> merchant object with ad overrides
  const adToMerchant = (ad: any): Merchant | null => {
    const base = merchantsById.get(ad.merchantId);
    if (!base) return null;
    const adjusted: any = { ...base };
    const basePrice = 1580;
    adjusted.adRate = (ad.exchangeRate && basePrice > 0) ? (ad.exchangeRate / basePrice).toFixed(4) : base.adRate;
    adjusted.minOrder = String(ad.minAmount ?? base.minOrder ?? '0');
    adjusted.maxOrder = String(ad.maxAmount ?? base.maxOrder ?? '0');
    adjusted.paymentMethods = ad.paymentMethods ?? base.paymentMethods ?? [];
    adjusted.balance = String(ad.availableAmount ?? base.balance ?? '0');
    // carry through exact fields from ad so TradeModal shows the right limits and rate
    (adjusted as any).exchangeRate = Number(ad.exchangeRate ?? ad.rate ?? 0);
    (adjusted as any).minAmount = Number(ad.minAmount ?? ad.minOrder ?? 0);
    (adjusted as any).maxAmount = Number(ad.maxAmount ?? ad.maxOrder ?? 0);
    return adjusted as Merchant;
  };

  const renderAds = (ads: any[], type: 'sell') => {
    if (!ads || ads.length === 0) {
      return <Card className="p-6 text-center text-muted-foreground">No ads available</Card>;
    }

    return (
      <div className="flex flex-col gap-4">
        {ads.map((ad: any) => {
          const rate = Number(ad.exchangeRate ?? ad.rate ?? 0);
          const min = Number(ad.minAmount ?? ad.minOrder ?? 0);
          const max = Number(ad.maxAmount ?? ad.maxOrder ?? 0);
          const available = Number(ad.availableAmount ?? 0);
          const merchant = adToMerchant(ad);
          if (merchant) (merchant as any).adId = ad.id; // attach adId for modal fallback
          return (
            <Card key={`ad-${type}-${ad.id}`} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={type === 'buy' ? 'default' : 'destructive'}>{type.toUpperCase()}</Badge>
                    <span className="font-semibold">₦{rate.toLocaleString()} / USDT</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{merchant?.name || `Merchant #${ad.merchantId}`}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Limits: {min} - {max} USDT • Available: {available} USDT
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(ad.paymentMethods || []).map((m: string) => (
                      <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Button
                    disabled={!merchant}
                    onClick={() => merchant && handleTradeClick({ ...(merchant as any), adId: ad.id }, type)}
                  >
                    {type === 'buy' ? 'Buy USDT' : 'Sell USDT'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
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
            <TabsTrigger value="sell">Sell Orders</TabsTrigger>
          </TabsList>
          <Button onClick={handleCreateAd}>Create Ad</Button>
        </div>

        <TabsContent value="sell" className="space-y-4">
          {renderAds((sellAdsRes?.data?.ads as any[]) || [], 'sell')}
        </TabsContent>
      </Tabs>

      <TradeModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        merchant={selectedMerchant}
        adId={(selectedMerchant as any)?.adId}
        tradeType={tradeType}
      />
    </div>
  );
};

export default Overview;
