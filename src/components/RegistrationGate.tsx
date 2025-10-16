import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useCreateMerchant, useMerchant, useUpdateMerchantByWallet } from "@/hooks/useMerchants";

interface RegistrationGateProps {
  title?: string;
  description?: string;
  onRegistered?: () => void;
  alwaysShow?: boolean;
}

const RegistrationGate = ({ title = "One-time Registration", description = "Kindly register before you can continue and ensure you use this same email when paying.", onRegistered, alwaysShow = false }: RegistrationGateProps) => {
  const { address } = useAccount();
  const { data: merchantData, refetch } = useMerchant(address);
  const createMerchant = useCreateMerchant();
  const updateByWallet = useUpdateMerchantByWallet();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isRegistered = !!merchantData?.data?.walletAddress;

  useEffect(() => {
    if (isRegistered && !alwaysShow && onRegistered) onRegistered();
  }, [isRegistered, alwaysShow, onRegistered]);

  // Prefill if we are showing even when registered
  useEffect(() => {
    if (alwaysShow && merchantData?.data) {
      if (!name) setName(merchantData.data.name || "");
      if (!email) setEmail(merchantData.data.email || "");
    }
  }, [alwaysShow, merchantData, name, email]);

  if (!address) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Connect your wallet</h3>
            <p className="text-sm text-muted-foreground">Please connect your wallet to register.</p>
          </div>
        </div>
      </Card>
    );
  }

  if (isRegistered && !alwaysShow) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      // Attempt to create merchant
      await createMerchant.mutateAsync({
        walletAddress: address!.toLowerCase(),
        name,
        email,
      });
      await refetch();
      setStatus({ type: "success", message: "Registration successful. You can proceed now." });
      if (onRegistered) onRegistered();
    } catch (err: any) {
      const statusCode = err?.response?.status;
      const backendMsg = err?.response?.data?.message;

      // Fallback: if merchant already exists or server errored, try updating by wallet
      try {
        await updateByWallet.mutateAsync({
          walletAddress: address!.toLowerCase(),
          data: { name, email },
        });
        await refetch();
        setStatus({ type: "success", message: "Registration updated. You can proceed now." });
        if (onRegistered) onRegistered();
      } catch (updateErr: any) {
        setStatus({
          type: "error",
          message:
            backendMsg || updateErr?.response?.data?.message || (err instanceof Error ? err.message : "Registration failed"),
        });
      }
    }
  };

  return (
    <Card className="p-6 max-w-xl">
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>
      {status && (
        <div className={`mb-4 rounded-md p-3 flex items-start gap-2 ${status.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          )}
          <p className={`text-sm ${status.type === "success" ? "text-green-800" : "text-red-800"}`}>{status.message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-name">Full Name</Label>
          <Input
            id="reg-name"
            type="text"
            placeholder="e.g., Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "e.g., Jane Doe")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-email">Email Address</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "you@example.com")}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={createMerchant.isPending}>
          {createMerchant.isPending ? "Registering..." : "Register"}
        </Button>
      </form>
    </Card>
  );
};

export default RegistrationGate;