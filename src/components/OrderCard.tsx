import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderCardProps {
  type: "buy" | "sell";
  user: string;
  amount: string;
  price: string;
  limit: string;
  payment: string[];
  rate?: string;
}

export const OrderCard = ({ type, user, amount, price, limit, payment, rate }: OrderCardProps) => {
  return (
    <Card className="p-4 hover:shadow-soft transition-all duration-300 w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
            {user[0]}
          </div>
          <div>
            <p className="font-semibold">{user}</p>
            {rate && (
              <p className="text-xs text-muted-foreground">
                {rate}% completion rate
              </p>
            )}
          </div>
        </div>
        <Badge variant={type === "buy" ? "default" : "destructive"}>
          {type.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-semibold">{amount} USDT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="font-semibold">₦{price}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Limit</span>
          <span className="text-sm">{limit}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Payment Methods</p>
        <div className="flex flex-wrap gap-2">
          {payment.map((method) => (
            <Badge key={method} variant="outline" className="text-xs">
              {method}
            </Badge>
          ))}
        </div>
      </div>

      <Button 
        className="w-full" 
        variant={type === "buy" ? "default" : "destructive"}
      >
        {type === "buy" ? "Buy USDT" : "Sell USDT"}
      </Button>
    </Card>
  );
};
