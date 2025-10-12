import { useState } from "react";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockOrders = {
  buy: [
    {
      user: "Trader001",
      amount: "5,000",
      price: "1,580",
      limit: "₦500 - ₦50,000",
      payment: ["Bank Transfer", "Opay"],
      rate: "98.5",
    },
    {
      user: "CryptoKing",
      amount: "10,000",
      price: "1,575",
      limit: "₦1,000 - ₦100,000",
      payment: ["Bank Transfer", "Palmpay"],
      rate: "99.2",
    },
    {
      user: "NaijaCrypto",
      amount: "3,000",
      price: "1,582",
      limit: "₦500 - ₦30,000",
      payment: ["Bank Transfer", "Moniepoint"],
      rate: "97.8",
    },
  ],
  sell: [
    {
      user: "FastTrader",
      amount: "8,000",
      price: "1,590",
      limit: "₦1,000 - ₦80,000",
      payment: ["Bank Transfer", "Opay", "Kuda"],
      rate: "99.5",
    },
    {
      user: "P2PMaster",
      amount: "15,000",
      price: "1,588",
      limit: "₦2,000 - ₦150,000",
      payment: ["Bank Transfer"],
      rate: "98.9",
    },
    {
      user: "QuickPay",
      amount: "6,000",
      price: "1,592",
      limit: "₦500 - ₦60,000",
      payment: ["Bank Transfer", "Palmpay", "Opay"],
      rate: "99.1",
    },
  ],
};

const Overview = () => {
  const [activeTab, setActiveTab] = useState("buy");

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
          <Button>Create Ad</Button>
        </div>

        <TabsContent value="buy" className="space-y-4">
          <div className="flex flex-col gap-4">
            {mockOrders.buy.map((order, index) => (
              <OrderCard key={index} type="buy" {...order} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <div className="flex flex-col gap-4">
            {mockOrders.sell.map((order, index) => (
              <OrderCard key={index} type="sell" {...order} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Overview;
