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
import { useEffect } from "react";
import { formatUnits } from "viem";

const History = () => {
  const { address } = useAccount();
  const { tradeIds, isLoading, refetch } = useUserTrades(address);

  useEffect(() => {
    const id = setInterval(() => refetch(), 5000);
    return () => clearInterval(id);
  }, [refetch]);

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
          <TableCell colSpan={7} className="text-center py-4">
            <div className="animate-pulse">Loading trade...</div>
          </TableCell>
        </TableRow>
      );
    }

    const t: any = trade as any;
    const tradeId_ = t.tradeId ?? t[0];
    const accountName = t.accountName ?? t[4] ?? '';
    const bankCode = t.bankCode ?? t[6] ?? '';
    const amount = t.amount ?? t[7] ?? 0n;
    const depositTime = t.depositTime ?? t[8] ?? 0n;
    const status = Number(t.status ?? t[10] ?? -1);

    // Only show completed or cancelled trades in history
    if (status !== 2 && status !== 4) return null;

    const amtBI = typeof amount === 'bigint' ? amount : BigInt(amount || 0);
    let formattedAmount = '0';
    try { formattedAmount = formatUnits(amtBI, 6); } catch {}
    const depBI = typeof depositTime === 'bigint' ? depositTime : BigInt(depositTime || 0);
    const date = formatDate(depBI);

    return (
      <TableRow>
        <TableCell className="font-medium">#{String(tradeId_)}</TableCell>
        <TableCell>
          <Badge variant="destructive">SELL</Badge>
        </TableCell>
        <TableCell>{parseFloat(formattedAmount).toLocaleString()} USDT</TableCell>
        <TableCell className="font-medium">{accountName || '—'}</TableCell>
        <TableCell>{bankCode || '—'}</TableCell>
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
          <div className="flex items-center justify-end p-3 pt-4">
            <button className="text-sm underline" onClick={() => refetch()}>Refresh</button>
          </div>
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
              {[...(tradeIds || [])]
                .slice()
                .sort((a, b) => Number(b) - Number(a))
                .map((tradeId) => (
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
