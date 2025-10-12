import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare } from "lucide-react";

const mockPendingOrders = [
  {
    id: "ORD-001",
    type: "buy",
    amount: "1,000 USDT",
    price: "₦1,580,000",
    counterparty: "Trader001",
    status: "waiting_payment",
    timestamp: "2 minutes ago",
  },
  {
    id: "ORD-002",
    type: "sell",
    amount: "500 USDT",
    price: "₦795,000",
    counterparty: "CryptoKing",
    status: "payment_sent",
    timestamp: "5 minutes ago",
  },
];

const Pending = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pending Orders</h1>
        <p className="text-muted-foreground">
          Track your orders currently being processed
        </p>
      </div>

      {mockPendingOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Pending Orders</h3>
          <p className="text-muted-foreground">
            Your pending orders will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockPendingOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      variant={order.type === "buy" ? "default" : "destructive"}
                    >
                      {order.type.toUpperCase()}
                    </Badge>
                    <span className="font-semibold">{order.id}</span>
                    <Badge variant="outline">{order.status.replace("_", " ")}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold">{order.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold">{order.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Counterparty
                      </p>
                      <p className="font-semibold">{order.counterparty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold">{order.timestamp}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                  {order.status === "waiting_payment" && (
                    <Button>Confirm Payment</Button>
                  )}
                  {order.status === "payment_sent" && (
                    <Button>Release USDT</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pending;
