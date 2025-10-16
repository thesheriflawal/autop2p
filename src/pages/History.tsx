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
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useUserTrades, useTrade } from "@/hooks/useContract";
import { formatUnits } from "viem";

const History = () => {
  const { address } = useAccount();
  const { tradeIds, isLoading } = useUserTrades(address);

  const formatTradeStatus = (status: number) => {
    const statusMap = {
      0: 'Deposited',
      1: 'Payment Made',
      2: 'Completed',
      3: 'Disputed',
      4: 'Cancelled'
    };
    return statusMap[status as keyof typeof statusMap] || 'Unknown';
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const TradeRow = ({ tradeId }: { tradeId: bigint }) => {
    const { trade, isLoading: tradeLoading } = useTrade(Number(tradeId));

    if (tradeLoading || !trade) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-4">
            <div className="animate-pulse">Loading trade...</div>
          </TableCell>
        </TableRow>
      );
    }

    const [tradeId_, buyer, merchantId, merchantAddress, accountName, accountNumber, bankCode, amount, depositTime, paymentTime, status, disputed, disputeInitiator] = trade;

    // Only show completed or cancelled trades in history
    if (status !== 2 && status !== 4) return null;

    const formattedAmount = formatUnits(amount, 6);
    const statusText = formatTradeStatus(status);
    const date = formatDate(depositTime);

    return (
      <TableRow>
        <TableCell className="font-medium">#{tradeId_.toString()}</TableCell>
        <TableCell>
          <Badge variant="default">
            BUY
          </Badge>
        </TableCell>
        <TableCell>{parseFloat(formattedAmount).toLocaleString()} USDT</TableCell>
        <TableCell className="font-medium">{accountName}</TableCell>
        <TableCell>{bankCode}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {status === 2 ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Completed</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Cancelled</span>
              </>
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {date}
        </TableCell>
      </TableRow>
    );
  };
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trade History</h1>
        <p className="text-muted-foreground">
          View all your completed and cancelled transactions
        </p>
      </div>

      {!address ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to view trade history
          </p>
        </Card>
      ) : isLoading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading trade history...</p>
        </Card>
      ) : !tradeIds || tradeIds.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Trade History</h3>
          <p className="text-muted-foreground">
            Your completed trades will appear here
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trade ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tradeIds.map((tradeId) => (
                <TradeRow key={tradeId.toString()} tradeId={tradeId} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default History;
