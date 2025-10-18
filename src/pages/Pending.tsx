import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useUserTrades, useTrade, useAutoP2P } from "@/hooks/useContract";
import { formatUnits } from "viem";
import { useState, useEffect, useRef } from "react";

const Pending = () => {
  const { address } = useAccount();
  const { tradeIds, isLoading, refetch } = useUserTrades(address);
  const { releaseFunds, isPending: isReleasing } = useAutoP2P();
  const [visibleCount, setVisibleCount] = useState(0);
  const [releasingTradeId, setReleasingTradeId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // reset visible count when tradeIds change
  useEffect(() => { setVisibleCount(0); }, [tradeIds?.length]);

  // Poll for updates while on page (only when wallet connected)
  useEffect(() => {
    if (!address) return;
    const id = setInterval(() => { refetch(); }, 5000);
    return () => clearInterval(id);
  }, [address, refetch]);

  const handleReleaseFunds = (tradeId: number) => {
    setReleasingTradeId(tradeId);
    releaseFunds(tradeId);
  };

  const formatTradeStatus = (status: number) => {
    const statusMap = { 0: 'Deposited', 1: 'Payment Made', 2: 'Completed', 3: 'Disputed', 4: 'Cancelled' } as const;
    return (statusMap as any)[status] ?? 'Unknown';
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const TradeCard = ({ tradeId, onReleaseFunds, isReleasing, onVisible }: {
    tradeId: number;
    onReleaseFunds: (tradeId: number) => void;
    isReleasing: boolean;
    onVisible: () => void;
  }) => {
    const { trade, isLoading: tradeLoading } = useTrade(tradeId);

    // Hooks must be called unconditionally
    const didReport = useRef(false);
    useEffect(() => {
      try {
        const t: any = trade as any;
        const st = Number(t?.status ?? t?.[10] ?? -1);
        if (!didReport.current && trade && st !== 2 && st !== 4) {
          onVisible();
          didReport.current = true;
        }
      } catch {}
    }, [trade, onVisible]);

    if (tradeLoading || !trade) {
      return (
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      );
    }

    // Normalize tuple/object return (defensive)
    const t: any = trade as any;
    const tradeId_ = t?.tradeId ?? t?.[0];
    const accountName = t?.accountName ?? t?.[4] ?? '';
    const bankCode = t?.bankCode ?? t?.[6] ?? '';
    const amount = t?.amount ?? t?.[7] ?? 0n;
    const depositTime = t?.depositTime ?? t?.[8] ?? 0n;
    const status = Number(t?.status ?? t?.[10] ?? -1);
    const disputed = Boolean(t?.disputed ?? t?.[11] ?? false);


    // Only show non-completed trades
    if (status === 2 || status === 4) return null;

    const amtBI = typeof amount === 'bigint' ? amount : BigInt(amount || 0);
    let formattedAmount = '0';
    try { formattedAmount = formatUnits(amtBI, 6); } catch {}
    const statusText = formatTradeStatus(status);
    const depBI = typeof depositTime === 'bigint' ? depositTime : BigInt(depositTime || 0);
    const timeAgo = formatTimeAgo(depBI);

    return (
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="destructive">SELL</Badge>
              <span className="font-semibold">#{String(tradeId_)}</span>
              <Badge variant={disputed ? "destructive" : "outline"}>{disputed ? "DISPUTED" : statusText}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-semibold">{parseFloat(formattedAmount).toLocaleString()} USDT</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account</p>
                <p className="font-semibold">{accountName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank</p>
                <p className="font-semibold">{bankCode || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold">{timeAgo}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            {status === 0 && (
              <Button onClick={() => onReleaseFunds(tradeId)} disabled={isReleasing}>
                {isReleasing ? 'Releasing...' : 'Release USDT'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pending Orders</h1>
        <p className="text-muted-foreground">Track your orders currently being processed</p>
      </div>

      {!address ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
          <p className="text-muted-foreground">Please connect your wallet to view pending orders</p>
        </Card>
      ) : isLoading ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Loading Orders</h3>
          <p className="text-muted-foreground">Fetching your pending orders from the blockchain...</p>
        </Card>
      ) : !tradeIds || tradeIds.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Pending Orders</h3>
          <p className="text-muted-foreground">Your pending orders will appear here</p>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div />
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setRefreshKey((k) => k + 1); refetch(); }}
            >
              Refresh
            </Button>
          </div>
          <div className="space-y-4">
            {[...(tradeIds || [])]
              .slice()
              .sort((a, b) => Number(b) - Number(a))
              .map((tradeId) => (
                <TradeCard
                  key={`${tradeId.toString()}-${refreshKey}`}
                  tradeId={Number(tradeId)}
                  onReleaseFunds={handleReleaseFunds}
                  isReleasing={releasingTradeId === Number(tradeId) && isReleasing}
                  onVisible={() => setVisibleCount((c) => c + 1)}
                />
              ))}
          </div>
          {visibleCount === 0 && (
            <Card className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Pending Orders</h3>
              <p className="text-muted-foreground">You currently have no ongoing trades.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Pending;
