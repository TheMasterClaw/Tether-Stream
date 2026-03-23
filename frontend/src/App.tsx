import { Routes, Route, Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { StreamManager } from './components/StreamManager';
import { WalletDashboard } from './components/WalletDashboard';
import { ServiceMarketplace } from './components/ServiceMarketplace';
import { ActiveStreams } from './components/ActiveStreams';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { StreamTemplates } from './components/StreamTemplates';
import { TransactionHistory } from './components/TransactionHistory';
import { DemoMode } from './components/DemoMode';
import { LivePaymentTicker, useRealTimeStreams } from './components/RealTimeStreams';
import { WebSocketStatus } from './components/WebSocketStatus';
import LandingPage from './components/LandingPage';
import { Zap, BarChart3, LayoutTemplate, History, Play } from 'lucide-react';

// Dashboard Layout - for authenticated app sections
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  const { liveStreamCount } = useRealTimeStreams();
  
  return (
    <div className="min-h-screen dashboard-dark">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  PayStream
                </span>
                {liveStreamCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full animate-pulse">
                    {liveStreamCount} Live
                  </span>
                )}
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/app" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/app/streams" className="text-gray-300 hover:text-white transition-colors">
                Active Streams
              </Link>
              <Link to="/app/history" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                <History className="w-4 h-4" />
                History
              </Link>
              <Link to="/app/marketplace" className="text-gray-300 hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link to="/app/analytics" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link to="/app/templates" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                <LayoutTemplate className="w-4 h-4" />
                Templates
              </Link>
              <Link to="/app/demo" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                <Play className="w-4 h-4" />
                Demo
              </Link>
              <Link to="/app/create" className="text-gray-300 hover:text-white transition-colors">
                Create Stream
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              {isConnected && <WebSocketStatus isConnected={true} />}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="container-custom py-8">
        {children}
      </main>
      
      {isConnected && <LivePaymentTicker />}
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Landing Page - Professional marketing site */}
      <Route path="/" element={<LandingPage />} />
      
      {/* App Routes - Dashboard with dark theme */}
      <Route path="/app" element={
        <DashboardLayout>
          <WalletDashboard />
        </DashboardLayout>
      } />
      <Route path="/app/streams" element={
        <DashboardLayout>
          <ActiveStreams />
        </DashboardLayout>
      } />
      <Route path="/app/history" element={
        <DashboardLayout>
          <TransactionHistory />
        </DashboardLayout>
      } />
      <Route path="/app/marketplace" element={
        <DashboardLayout>
          <ServiceMarketplace />
        </DashboardLayout>
      } />
      <Route path="/app/analytics" element={
        <DashboardLayout>
          <AnalyticsDashboard />
        </DashboardLayout>
      } />
      <Route path="/app/templates" element={
        <DashboardLayout>
          <StreamTemplates />
        </DashboardLayout>
      } />
      <Route path="/app/demo" element={
        <DashboardLayout>
          <DemoMode />
        </DashboardLayout>
      } />
      <Route path="/app/create" element={
        <DashboardLayout>
          <StreamManager />
        </DashboardLayout>
      } />
      
      {/* Legacy routes redirect to new paths */}
      <Route path="/streams" element={<div className="p-8"><Link to="/app/streams" className="btn-primary">Go to Active Streams</Link></div>} />
      <Route path="/marketplace" element={<div className="p-8"><Link to="/app/marketplace" className="btn-primary">Go to Marketplace</Link></div>} />
      <Route path="/create" element={<div className="p-8"><Link to="/app/create" className="btn-primary">Go to Create Stream</Link></div>} />
    </Routes>
  );
}

export default App;
