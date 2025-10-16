import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './config/web3';
import '@rainbow-me/rainbowkit/styles.css';
import { Layout } from "./components/Layout";
import Overview from "./pages/Overview";
import Wallet from "./pages/Wallet";
import Ad from "./pages/Ad";
import Pending from "./pages/Pending";
import History from "./pages/History";
import Support from "./pages/Support";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Overview /></Layout>} />
              <Route path="/wallet" element={<Layout><Wallet /></Layout>} />
              <Route path="/ad" element={<Layout><Ad /></Layout>} />
              <Route path="/pending" element={<Layout><Pending /></Layout>} />
              <Route path="/history" element={<Layout><History /></Layout>} />
              <Route path="/support" element={<Layout><Support /></Layout>} />
              <Route path="/team" element={<Layout><Team /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
