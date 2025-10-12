import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const [balance] = useState("45,000.00");
  const { toast } = useToast();

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Deposit Initiated",
      description: "Your deposit request has been received.",
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Withdrawal Initiated",
      description: "Your withdrawal request is being processed.",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your Naira portfolio</p>
      </div>

      {/* Balance Card */}
      <Card className="p-6 mb-8 bg-gradient-primary text-white">
        <div className="flex items-center gap-3 mb-4">
          <WalletIcon className="h-8 w-8" />
          <span className="text-lg font-medium">Naira Balance</span>
        </div>
        <div className="text-4xl font-bold mb-2">₦{balance}</div>
        <p className="text-white/80 text-sm">Available for trading</p>
      </Card>

      {/* Deposit/Withdraw Tabs */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
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
          <Card className="p-6 max-w-md">
            <h3 className="text-xl font-semibold mb-4">Deposit Naira</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount (NGN)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Select Bank</Label>
                <select
                  id="bank"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select a bank</option>
                  <option value="opay">Opay</option>
                  <option value="palmpay">Palmpay</option>
                  <option value="kuda">Kuda</option>
                  <option value="gtbank">GTBank</option>
                  <option value="access">Access Bank</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account Number</Label>
                <Input
                  id="account"
                  placeholder="Enter account number"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Deposit Funds
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card className="p-6 max-w-md">
            <h3 className="text-xl font-semibold mb-4">Withdraw Naira</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (NGN)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Available: ₦{balance}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-bank">Bank Name</Label>
                <Input
                  id="withdraw-bank"
                  placeholder="Enter bank name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-account">Account Number</Label>
                <Input
                  id="withdraw-account"
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  placeholder="Enter account name"
                  required
                />
              </div>
              <Button type="submit" variant="destructive" className="w-full">
                Withdraw Funds
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Wallet;
