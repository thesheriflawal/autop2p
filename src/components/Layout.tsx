import { ReactNode, useState } from "react";
import { useAccount } from "wagmi";
import { useUSDTBalance } from "@/hooks/useContract";
import { useMerchant } from "@/hooks/useMerchants";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  Megaphone, 
  Clock, 
  History, 
  MessageCircle,
  Users,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: Megaphone, label: "Ad", path: "/ad" },
  { icon: Clock, label: "Pending", path: "/pending" },
  { icon: History, label: "Trade History", path: "/history" },
  { icon: MessageCircle, label: "Trade Support", path: "/support" },
  { icon: Users, label: "Team Details", path: "/team" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { address } = useAccount();
  const { balance: headerUsdt } = useUSDTBalance(address);
  const { data: headerMerchant } = useMerchant(address);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Sidebar - Above header with higher z-index */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen w-full md:w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out z-[60]",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
<div 
            className="flex h-16 items-center justify-between border-b border-sidebar-border px-6 cursor-pointer"
            onClick={() => setIsSidebarOpen((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <img src={logo} alt="AutoP2P" className="h-8 w-8" />
              <span className="text-xl font-bold text-sidebar-foreground">AutoP2P</span>
            </div>
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
<div className="flex items-center gap-3">
          {address && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="rounded-md bg-muted px-2 py-1">USDT: {parseFloat(headerUsdt || '0').toLocaleString()}</span>
              <span className="rounded-md bg-muted px-2 py-1">NGN: ₦{parseFloat(headerMerchant?.data?.balance || '0').toLocaleString()}</span>
            </div>
          )}
          <ConnectButton />
        </div>
      </header>

      <div className="flex w-full">
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300",
            "md:ml-64"
          )}
        >
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
