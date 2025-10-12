import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";

const mockHistory = [
  {
    id: "TXN-0015",
    type: "buy",
    amount: "2,000 USDT",
    price: "₦3,160,000",
    counterparty: "FastTrader",
    status: "completed",
    date: "2024-01-15 14:30",
  },
  {
    id: "TXN-0014",
    type: "sell",
    amount: "1,500 USDT",
    price: "₦2,385,000",
    counterparty: "P2PMaster",
    status: "completed",
    date: "2024-01-14 09:15",
  },
  {
    id: "TXN-0013",
    type: "buy",
    amount: "500 USDT",
    price: "₦790,000",
    counterparty: "QuickPay",
    status: "cancelled",
    date: "2024-01-13 16:45",
  },
  {
    id: "TXN-0012",
    type: "sell",
    amount: "3,000 USDT",
    price: "₦4,770,000",
    counterparty: "NaijaCrypto",
    status: "completed",
    date: "2024-01-12 11:20",
  },
  {
    id: "TXN-0011",
    type: "buy",
    amount: "1,000 USDT",
    price: "₦1,580,000",
    counterparty: "Trader001",
    status: "completed",
    date: "2024-01-11 13:00",
  },
];

const History = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trade History</h1>
        <p className="text-muted-foreground">
          View all your completed and cancelled transactions
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.type === "buy" ? "default" : "destructive"
                    }
                  >
                    {transaction.type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell className="font-semibold">
                  {transaction.price}
                </TableCell>
                <TableCell>{transaction.counterparty}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.status === "completed" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-success">Completed</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">Cancelled</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default History;
