import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useMerchant, useCreateMerchant, useUpdateMerchantByWallet } from "@/hooks/useMerchants";
import { useMerchantAds, useCreateAd, useToggleAd, useUpdateAd, useDeleteAd } from "@/hooks/useAds";
import type { Merchant } from "@/services/api";
import RegistrationGate from "@/components/RegistrationGate";
import { useUSDTBalance } from "@/hooks/useContract";

const Ad = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const { data: merchantData, isLoading: merchantLoading } = useMerchant(address);
  const createMerchant = useCreateMerchant();
  const updateMerchant = useUpdateMerchantByWallet();

  const [activeTab, setActiveTab] = useState<'my-ads' | 'create'>('my-ads');

  // Form state
  const [adRate, setAdRate] = useState(''); // NGN per USDT
  const [minOrder, setMinOrder] = useState('');
  const [maxOrder, setMaxOrder] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantEmail, setMerchantEmail] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [isCreatingMerchant, setIsCreatingMerchant] = useState(false);

  const merchant = merchantData?.data;
  const isMerchant = !!merchant;

  const { data: merchantAdsResp, isLoading: adsLoading } = useMerchantAds(merchant?.id);
  const createAd = useCreateAd(merchant?.id);
  const toggleAd = useToggleAd(merchant?.id);
  const updateAd = useUpdateAd(merchant?.id);
  const deleteAd = useDeleteAd(merchant?.id);
  const { balance: usdtBalance } = useUSDTBalance(address);

  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Initialize form with merchant data if available
  useEffect(() => {
    if (merchant) {
      setMerchantName(merchant.name || '');
      setMerchantEmail(merchant.email || '');
      setMinOrder(merchant.minOrder || '');
      setMaxOrder(merchant.maxOrder || '');
      setPaymentMethods(merchant.paymentMethods || []);
    }
  }, [merchant]);

  // Set tab from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'create') setActiveTab('create');
  }, []);

  // Prefill limits from merchant NGN balance and rate if available
  useEffect(() => {
    const rate = Number(adRate);
    const fiat = Number(merchant?.balance || 0); // NGN
    if (isMerchant && isFinite(rate) && rate > 0) {
      const available = Math.floor(fiat / rate) || 0;
      if (!minOrder) setMinOrder(String(Math.max(1, Math.min(10, available))));
      if (!maxOrder) setMaxOrder(String(Math.max(10, available)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMerchant, adRate, merchant?.balance]);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !isMerchant) {
      toast({ title: 'Error', description: 'Please connect wallet and register first.', variant: 'destructive' });
      return;
    }

    if (!adRate || !minOrder || !maxOrder) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    try {
      // Parse numbers safely
      const rate = Number(adRate);
      const fiat = Number(merchant?.balance || 0); // NGN available for payouts
      let minAmt = Number(minOrder);
      let maxAmt = Number(maxOrder);

      if (!isFinite(rate) || rate <= 0) {
        toast({ title: 'Invalid price', description: 'Enter a valid NGN price per USDT.' , variant: 'destructive' });
        return;
      }

      // Enforce whole-number USDT and minimums
      minAmt = Math.floor(!isFinite(minAmt) || minAmt <= 0 ? 10 : minAmt);
      maxAmt = Math.floor(!isFinite(maxAmt) || maxAmt <= 0 ? minAmt : maxAmt);

      if (!isFinite(fiat) || fiat <= 0) {
        toast({ title: 'Insufficient NGN balance', description: 'Your merchant NGN balance is 0. Fund your account first.', variant: 'destructive' });
        return;
      }

      // Available USDT determined by NGN balance divided by rate
      const availableFromFiat = Math.floor(fiat / rate);

      // Ensure max does not exceed available, and min <= max
      if (maxAmt > availableFromFiat) {
        maxAmt = availableFromFiat;
        toast({ title: 'Adjusted Max Order', description: 'Max order reduced to (NGN balance / price).' });
      }
      if (minAmt > maxAmt) minAmt = Math.max(10, Math.min(minAmt, maxAmt));

      const available = Math.max(minAmt, availableFromFiat);

      const methods = (merchant.paymentMethods && merchant.paymentMethods.length > 0)
        ? merchant.paymentMethods
        : ["Bank Transfer"];

      const payload = {
        title: 'Buy USDT for Naira - Best Rates',
        token: 'USDT' as const,
        type: 'BUY' as const,
        // Both schemas supported
        exchangeRate: rate,
        rate,
        localCurrency: 'NGN' as const,
        minAmount: minAmt,
        maxAmount: maxAmt,
        minOrder: minAmt,
        maxOrder: maxAmt,
        availableAmount: available,
        paymentMethods: methods,
        tradingTerms: 'Payment within 30 minutes. No third-party payments.',
      };

      if (editingAdId) {
        await updateAd.mutateAsync({ adId: editingAdId, data: payload });
        toast({ title: 'Buy Ad Updated', description: 'Your ad has been updated successfully.' });
      } else {
        await createAd.mutateAsync(payload);
        toast({ title: 'Buy Ad Created', description: 'Your buy ad has been created successfully.' });
      }

      setEditingAdId(null);
      setActiveTab('my-ads');
    } catch (err: any) {
      const data = err?.response?.data;
      const details = Array.isArray(data?.errors) ? `: ${data.errors.join(', ')}` : '';
      const backendMsg = (data?.message || data?.error || (typeof data === 'string' ? data : '') || err?.message || 'Failed to create ad.') + details;
      toast({
        title: 'Error',
        description: backendMsg,
        variant: 'destructive',
      });
    }
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setPaymentMethods(prev => [...prev, method]);
    } else {
      setPaymentMethods(prev => prev.filter(m => m !== method));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advertisement</h1>
        <p className="text-muted-foreground">Create and manage your trading ads</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'my-ads' | 'create')} className="w-full">
        <TabsList>
          <TabsTrigger value="my-ads">My Ads</TabsTrigger>
          <TabsTrigger value="create">Create Buy Ad</TabsTrigger>
        </TabsList>

        <TabsContent value="my-ads" className="space-y-4 pt-4">
          {merchantLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading merchant profile...</p>
            </Card>
          ) : !address ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Please connect your wallet to manage ads</p>
            </Card>
          ) : !isMerchant ? (
            <RegistrationGate 
              title="Kindly register before you can create or manage ads"
              description="Ensure you use the same email when paying so deposits map to your account."
            />
          ) : (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge variant={merchant.isActive ? "default" : "secondary"}>
                      {merchant.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                    <Badge variant="default">BUY AD</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingMerchant((s) => !s)}>
                    Re-register
                  </Button>
                </div>

                {isCreatingMerchant && (
                  <div className="mb-4">
                    <RegistrationGate title="Update registration" description="Change your name or email mapping." alwaysShow />
                  </div>
                )}

                <div className="space-y-3 mb-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Merchant Name</span>
                    <span className="font-semibold">{merchant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="font-semibold">₦{parseFloat(merchant.balance).toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Payment Methods</span>
                    <div className="flex flex-wrap gap-2">
                      {merchant.paymentMethods.map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setActiveTab('create');
                    }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Buy Ad
                  </Button>
                </div>
              </Card>

              <div>
                {adsLoading ? (
                  <Card className="p-6 text-center">Loading ads...</Card>
                ) : (merchantAdsResp?.data?.ads?.length ?? 0) === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">No ads yet.</Card>
                ) : (
                  <div className="flex flex-col gap-3">
                    {merchantAdsResp?.data?.ads?.map((ad) => (
                      <Card key={ad.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge>BUY</Badge>
                              <span className="font-semibold">₦{Number(ad.exchangeRate ?? ad.rate ?? 0).toLocaleString()} / USDT</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Limits: {Number(ad.minAmount ?? ad.minOrder ?? 0)} - {Number(ad.maxAmount ?? ad.maxOrder ?? 0)} USDT • Available: {Number(ad.availableAmount ?? Math.floor((parseFloat(String(merchant.balance)) || 0) / (Number(ad.exchangeRate ?? ad.rate ?? 0) || 1))) || 0} USDT
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(ad.paymentMethods || []).map((m: string) => (
                                <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={ad.isActive ? 'default' : 'secondary'}>{ad.isActive ? 'Active' : 'Inactive'}</Badge>
                            <Switch
                              checked={!!ad.isActive}
                              onCheckedChange={async (checked) => {
                                try {
                                  setTogglingId(ad.id);
                                  await updateAd.mutateAsync({ adId: ad.id, data: { isActive: checked } });
                                } finally {
                                  setTogglingId(null);
                                }
                              }}
                              disabled={togglingId === ad.id}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingAdId(ad.id);
                                setActiveTab('create');
                                setAdRate(String(ad.exchangeRate ?? ad.rate ?? ''));
                                setMinOrder(String(ad.minAmount ?? ad.minOrder ?? ''));
                                setMaxOrder(String(ad.maxAmount ?? ad.maxOrder ?? ''));
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteId(ad.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="pt-4">
          {!address || !isMerchant ? (
            <RegistrationGate 
              title="Kindly register before you can create any ad"
              description="Ensure you input the same email when paying so deposits map to your account."
            />
          ) : (
          <Card className="p-6 max-w-2xl">
            <h3 className="text-xl font-semibold mb-6">Buy Ad Settings</h3>
            
            {!address && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Please connect your wallet to create a merchant profile.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleCreateAd} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant-name">Merchant Name</Label>
                  <Input
                    id="merchant-name"
                    type="text"
                    placeholder="Enter merchant name"
                    value={merchantName}
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-email">Email Address</Label>
                  <Input
                    id="merchant-email"
                    type="email"
                    placeholder="merchant@example.com"
                    value={merchantEmail}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad-rate">Buy Ad Price (NGN per USDT)</Label>
                <Input
                  id="ad-rate"
                  type="number"
                  step="1"
                  min="100"
                  placeholder="e.g., 1580 (your price per USDT in NGN)"
                  value={adRate}
                  onChange={(e) => setAdRate(e.target.value)}
                  onFocus={(e) => (e.target as HTMLInputElement).select()}
                  required
                  disabled={!address || !isMerchant}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-order">Min Order (USDT)</Label>
                  <Input
                    id="min-order"
                    type="number"
                    step="1"
                    min={10}
                    placeholder="10"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    onFocus={(e) => (e.target as HTMLInputElement).select()}
                    required
                    disabled={!address || !isMerchant}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-order">Max Order (USDT) — capped by NGN/rate</Label>
                  <Input
                    id="max-order"
                    type="number"
                    placeholder="1000"
                    value={maxOrder}
                    onChange={(e) => setMaxOrder(e.target.value)}
                    onFocus={(e) => (e.target as HTMLInputElement).select()}
                    min={minOrder || '1'}
max={(() => {
                      const r = Number(adRate) || 0;
                      const fiat = Number(merchant?.balance || 0);
                      return r > 0 ? Math.floor(fiat / r) : undefined;
                    })()}
                    required
                    disabled={!address || !isMerchant}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={!address || !isMerchant || createAd.isPending}
              >
                {(createAd.isPending || updateAd.isPending) ? (
                  <>Saving...</>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {editingAdId ? 'Update Buy Ad' : 'Create Buy Ad'}
                  </>
                )}
              </Button>
            </form>
          </Card>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ad?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove your ad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId === null) return;
                await deleteAd.mutateAsync(deleteId);
                setDeleteId(null);
                toast({ title: 'Ad Deleted', description: 'Your ad has been removed.' });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Ad;
