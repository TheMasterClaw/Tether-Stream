import { useEffect } from 'react';
import { 
  Zap, 
  Shield, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  Wallet,
  Activity,
  Globe,
  Play,
  BarChart3,
  Lock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

// SEO Component
const SEO = () => {
  useEffect(() => {
    // Update document title and meta tags
    document.title = 'TetherStream - Real-Time USDT Payment Streaming for AI Agents';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'TetherStream enables real-time USDT micropayment streaming for AI agents. Automate payments, manage subscriptions, and power pay-per-use AI services on Base.');
    }
    
    // Analytics placeholder
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'TetherStream Landing',
        page_location: window.location.href,
      });
    }
  }, []);
  
  return null;
};

// Navigation Component
const Navigation = () => (
  <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
    <div className="container-custom">
      <div className="flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>
            TetherStream
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-medium">
            How It Works
          </a>
          <a href="#pricing" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-medium">
            Pricing
          </a>
          <Link to="/app" className="btn-primary text-sm">
            Launch App
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-[var(--color-text)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
);

// Hero Section
const Hero = () => (
  <section className="pt-32 lg:pt-40 pb-20 lg:pb-32 relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-500/10 rounded-full blur-3xl" />
    </div>
    
    <div className="container-custom">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-primary)]">Built on Base</span>
        </div>
        
        {/* Main headline */}
        <h1 className="hero-title text-[var(--color-text)] mb-6 animate-fade-in stagger-1">
          Real-Time Payment Streaming for{' '}
          <span className="text-gradient">AI Agents</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 animate-fade-in stagger-2" style={{ fontFamily: 'var(--font-body)' }}>
          Enable seamless USDT micropayments for your AI services. Stream payments in real-time, 
          automate billing, and unlock new revenue models with pay-per-use infrastructure.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in stagger-3">
          <Link to="/app" className="btn-primary text-lg px-8 py-4">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#demo" className="btn-secondary text-lg px-8 py-4">
            <Play className="w-5 h-5" />
            Watch Demo
          </a>
        </div>
        
        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--color-text-muted)] animate-fade-in stagger-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No setup fees</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Instant settlements</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Non-custodial</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Features Section
const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'Real-Time Streaming',
      description: 'Stream USDT payments continuously, second-by-second. Perfect for AI agents, APIs, and subscription services.',
    },
    {
      icon: Shield,
      title: 'Secure & Non-Custodial',
      description: 'Users maintain full control of their funds. Smart contracts hold only streamed amounts, not deposits.',
    },
    {
      icon: Clock,
      title: 'Instant Settlements',
      description: 'No waiting for monthly billing cycles. Service providers receive funds immediately as they are earned.',
    },
    {
      icon: Wallet,
      title: 'Wallet Integration',
      description: 'Seamless connection with RainbowKit, MetaMask, and 100+ wallets. One-click onboarding for users.',
    },
    {
      icon: Activity,
      title: 'Live Monitoring',
      description: 'Track all active payment streams in real-time. Get insights into revenue flow and usage patterns.',
    },
    {
      icon: Globe,
      title: 'Global by Design',
      description: 'Built on Base for fast, low-cost transactions. Borderless payments for borderless AI services.',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[var(--color-primary)] font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="section-title text-[var(--color-text)] mt-4 mb-6">
            Everything you need to monetize AI
          </h2>
          <p className="text-lg text-[var(--color-text-muted)]">
            From micropayments to enterprise billing, TetherStream provides the infrastructure 
            for modern AI service monetization.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card group"
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                {feature.title}
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Connect Wallet',
      description: 'Users connect their wallet in seconds. No email required, no passwords to remember.',
      icon: Wallet,
    },
    {
      number: '02',
      title: 'Approve USDT',
      description: 'One-time approval to enable streaming. Users maintain full control and can cancel anytime.',
      icon: Lock,
    },
    {
      number: '03',
      title: 'Start Streaming',
      description: 'Payments flow automatically as services are consumed. Track everything in real-time.',
      icon: Activity,
    },
    {
      number: '04',
      title: 'Earn Instantly',
      description: 'Service providers receive funds continuously. Withdraw anytime to your wallet.',
      icon: BarChart3,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-[var(--color-background)]">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[var(--color-primary)] font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="section-title text-[var(--color-text)] mt-4 mb-6">
            Simple as streaming music
          </h2>
          <p className="text-lg text-[var(--color-text-muted)]">
            Get started in minutes. No complex setup, no hidden fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-blue-100 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {step.number}
              </div>
              <div className="w-10 h-10 rounded-lg bg-white border border-[var(--color-border)] flex items-center justify-center mb-4 shadow-sm">
                <step.icon className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {step.title}
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                {step.description}
              </p>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-[var(--color-border)] to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Use Cases Section
const UseCases = () => {
  const cases = [
    {
      title: 'AI APIs',
      description: 'Charge per API call in real-time. Perfect for LLM tokens, image generation, and compute.',
      metric: '$0.001',
      metricLabel: 'per request',
    },
    {
      title: 'Content Streaming',
      description: 'Pay-per-minute for video, audio, or interactive content. No more subscription fatigue.',
      metric: '24/7',
      metricLabel: 'availability',
    },
    {
      title: 'Compute Resources',
      description: 'Rent GPU/CPU by the second. Ideal for rendering, ML training, and simulations.',
      metric: '99.9%',
      metricLabel: 'uptime',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[var(--color-primary)] font-semibold text-sm uppercase tracking-wider">Use Cases</span>
          <h2 className="section-title text-[var(--color-text)] mt-4 mb-6">
            Built for the AI economy
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((item, index) => (
            <div key={index} className="card text-center">
              <div className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {item.metric}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] mb-4">{item.metricLabel}</div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {item.title}
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => (
  <section className="py-20 lg:py-32">
    <div className="container-custom">
      <div className="relative rounded-3xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative px-8 py-16 lg:px-16 lg:py-24 text-center">
          <h2 className="text-3xl lg:text-5xl font-normal text-white mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            Ready to stream payments?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10">
            Join the future of AI monetization. Start accepting real-time payments in minutes, 
            not days.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app" className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
              Launch App
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#" className="text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Read Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-[var(--color-text)] text-white py-16">
    <div className="container-custom">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              TetherStream
            </span>
          </div>
          <p className="text-gray-400 max-w-sm mb-6">
            Real-time USDT payment streaming infrastructure for AI agents and modern services. 
            Built on Base for speed and scalability.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </a>
          </div>
        </div>
        
        {/* Links */}
        <div>
          <h4 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Product</h4>
          <ul className="space-y-3 text-gray-400">
            <li><Link to="/app" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Company</h4>
          <ul className="space-y-3 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">
          © 2026 TetherStream. Built for the Tether Hackathon.
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <SEO />
      <Navigation />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
