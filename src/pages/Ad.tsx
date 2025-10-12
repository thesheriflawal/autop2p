import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const mockAds = [
  {
    id: 1,
    type: "buy",
    amount: "5,000 USDT",
    price: "₦1,580",
    status: "active",
    automate: true,
  },
  {
    id: 2,
    type: "sell",
    amount: "3,000 USDT",
    price: "₦1,590",
    status: "paused",
    automate: false,
  },
];

const Ad = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [automatePayment, setAutomatePayment] = useState(false);
  const { toast } = useToast();

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Ad Created",
      description: "Your ad has been posted successfully.",
    });
    setShowCreateForm(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advertisement</h1>
        <p className="text-muted-foreground">Create and manage your trading ads</p>
      </div>

      <Tabs defaultValue="my-ads" className="w-full">
        <TabsList>
          <TabsTrigger value="my-ads">My Ads</TabsTrigger>
          <TabsTrigger value="create">Create Ad</TabsTrigger>
        </TabsList>

        <TabsContent value="my-ads" className="space-y-4 pt-4">
          {mockAds.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No ads posted yet</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Ad
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mockAds.map((ad) => (
                <Card key={ad.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={ad.type === "buy" ? "default" : "destructive"}>
                      {ad.type.toUpperCase()}
                    </Badge>
                    <Badge variant={ad.status === "active" ? "default" : "secondary"}>
                      {ad.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="font-semibold">{ad.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-semibold">{ad.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Automated Payment
                      </span>
                      <span className="text-sm">
                        {ad.automate ? "Yes" : "Manual"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="pt-4">
          <Card className="p-6 max-w-2xl">
            <h3 className="text-xl font-semibold mb-6">Create New Ad</h3>
            <form onSubmit={handleCreateAd} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ad-type">Ad Type</Label>
                <select
                  id="ad-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select type</option>
                  <option value="buy">Buy USDT</option>
                  <option value="sell">Sell USDT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (NGN)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price per USDT"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Min Limit (NGN)</Label>
                  <Input
                    id="min"
                    type="number"
                    placeholder="Minimum"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Max Limit (NGN)</Label>
                  <Input
                    id="max"
                    type="number"
                    placeholder="Maximum"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="automate">Automate Payment</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic payment processing
                  </p>
                </div>
                <Switch 
                  id="automate"
                  checked={automatePayment}
                  onCheckedChange={setAutomatePayment}
                />
              </div>

              {!automatePayment && (
                <div className="space-y-2">
                  <Label htmlFor="payment-methods">Payment Methods</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Bank Transfer</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Opay</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Palmpay</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Moniepoint</span>
                    </label>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Ad
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Ad;
