import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
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
import { WDKAgentWallets } from './components/WDKAgentWallets';
import { LivePaymentTicker, useRealTimeStreams } from './components/RealTimeStreams';
import { WebSocketStatus } from './components/WebSocketStatus';
import LandingPage from './components/LandingPage';
import { BarChart3, LayoutTemplate, History, Play, Shield, Menu, X } from 'lucide-react';

// Dashboard Layout - for authenticated app sections
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  const { liveStreamCount } = useRealTimeStreams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1280) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const navLinks = [
    { to: '/app', label: 'Dashboard', icon: null },
    { to: '/app/streams', label: 'Streams', icon: null },
    { to: '/app/marketplace', label: 'Marketplace', icon: null },
    { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/app/agent-wallets', label: 'Wallets', icon: Shield },
    { to: '/app/demo', label: 'Demo', icon: Play },
    { to: '/app/create', label: 'Create', icon: null },
  ];

  const mobileOnlyLinks = [
    { to: '/app/history', label: 'History', icon: History },
    { to: '/app/templates', label: 'Templates', icon: LayoutTemplate },
  ];

  const allNavLinks = [...navLinks, ...mobileOnlyLinks];

  return (
    <div className="min-h-screen dashboard-dark">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img src="/favicon.png" alt="TetherStream" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  TetherStream
                </span>
                {liveStreamCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full animate-pulse">
                    {liveStreamCount} Live
                  </span>
                )}
              </Link>
            </div>
            
            {/* Desktop nav */}
            <div className="hidden xl:flex items-center space-x-5">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1 whitespace-nowrap ${
                    location.pathname === link.to ? 'text-white' : ''
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {isConnected && <WebSocketStatus isConnected={true} />}
              <div className="hidden sm:block">
                <ConnectButton />
              </div>
              {/* Mobile/tablet hamburger button */}
              <button
                className="xl:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(prev => !prev)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="container-custom py-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-1">
            {allNavLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 text-sm ${
                  location.pathname === link.to ? 'text-white bg-white/5' : ''
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            <div className="col-span-full pt-3 border-t border-white/10 mt-2 sm:hidden">
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
      <Route path="/app/agent-wallets" element={
        <DashboardLayout>
          <WDKAgentWallets />
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
