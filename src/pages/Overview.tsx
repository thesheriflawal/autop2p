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
  
  // Fetch merchants (legacy)
  const { data: merchantsResponse, isLoading, error } = useMerchants({
    hasBalance: true,
    currency: "USDT",
    sortBy: "adRate",
    sortOrder: "ASC",
    limit: 20
  });

  // Fetch ads to show in marketplace
  const { data: adsResponse } = useAds({ token: 'USDT', localCurrency: 'NGN', type: activeTab.toUpperCase() as 'BUY' | 'SELL', isActive: true, limit: 50, sortBy: 'lastActiveAt', sortOrder: 'DESC' });
  
  // For debugging: also fetch all ads to ensure they exist
  const { data: allAdsResponse } = useAds({ token: 'USDT', localCurrency: 'NGN', isActive: true, limit: 100 });

  const handleTradeClick = (merchant: Merchant, type: "buy" | "sell") => {
    setSelectedMerchant(merchant);
    setTradeType(type);
    setShowTradeModal(true);
  };

const handleCreateAd = () => {
    navigate('/ad?tab=create');
  };

  const merchants = merchantsResponse?.data?.merchants || [];
  
  // Filter merchants for buy/sell orders
  // For buy orders: show merchants who are selling USDT (have balance)
  // For sell orders: show merchants who are buying USDT (accepting orders)
  const availableMerchants = merchants.filter((merchant: Merchant) => 
    merchant.isActive && parseFloat(merchant.balance) > 0
  );

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
            {adsResponse?.data?.ads?.length ? (
              adsResponse.data.ads.map((ad: any) => (
                <div key={`ad-buy-${ad.id}`} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">₦{(ad.exchangeRate || ad.rate)?.toLocaleString()} / USDT</div>
                      <div className="text-sm text-muted-foreground">Limits: {(ad.minAmount ?? ad.minOrder)} - {(ad.maxAmount ?? ad.maxOrder)} USDT • Available: {ad.availableAmount} USDT</div>
                    </div>
                    <div className="text-xs rounded px-2 py-1 bg-muted">BUY</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground p-8 text-center">No ads available</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <div className="flex flex-col gap-4">
            {adsResponse?.data?.ads?.length ? (
              adsResponse.data.ads.map((ad: any) => (
                <div key={`ad-sell-${ad.id}`} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">₦{(ad.exchangeRate || ad.rate)?.toLocaleString()} / USDT</div>
                      <div className="text-sm text-muted-foreground">Limits: {(ad.minAmount ?? ad.minOrder)} - {(ad.maxAmount ?? ad.maxOrder)} USDT • Available: {ad.availableAmount} USDT</div>
                    </div>
                    <div className="text-xs rounded px-2 py-1 bg-muted">SELL</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground p-8 text-center">No ads available</div>
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
