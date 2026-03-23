import { useEffect, useRef, useState } from 'react';
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
  Lock,
  Bot,
  Cpu,
  DollarSign,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ==========================================
// HOOKS
// ==========================================

// Intersection Observer hook for scroll-triggered animations
const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
};

// Animated counter hook
const useCounter = (end: number, duration = 2000, startOnView = false, isInView = true) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView && startOnView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isInView, startOnView]);
  return count;
};

// ==========================================
// PARTICLE NETWORK BACKGROUND
// ==========================================
const ParticleNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = [];
      const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.15 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10"
      style={{ opacity: 0.6 }}
    />
  );
};

// ==========================================
// ANIMATED STREAM LINE (hero visual)
// ==========================================
const StreamVisualization = () => {
  const [dots, setDots] = useState<{ id: number; left: number }[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        const updated = prev
          .map(d => ({ ...d, left: d.left + 2 }))
          .filter(d => d.left < 110);
        if (Math.random() > 0.3) {
          updated.push({ id: nextId.current++, left: -5 });
        }
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-16 my-12">
      {/* Line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      {/* Source node */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center z-10">
        <Bot className="w-5 h-5 text-emerald-400" />
      </div>
      {/* Destination node */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center z-10">
        <Cpu className="w-5 h-5 text-emerald-400" />
      </div>
      {/* Flowing dots */}
      {dots.map(d => (
        <div
          key={d.id}
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
          style={{ left: `${d.left}%`, transition: 'left 50ms linear' }}
        />
      ))}
      {/* Labels */}
      <div className="absolute left-0 -bottom-2 text-xs text-gray-500 font-mono">Agent</div>
      <div className="absolute right-0 -bottom-2 text-xs text-gray-500 font-mono">Service</div>
    </div>
  );
};

// ==========================================
// LIVE TICKER
// ==========================================
const LiveTicker = () => {
  const [amount, setAmount] = useState(142857.63);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount(prev => prev + Math.random() * 0.5 + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
      <span className="font-mono text-sm text-emerald-400">
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT streamed
      </span>
    </div>
  );
};

// ==========================================
// SEO
// ==========================================
const SEO = () => {
  useEffect(() => {
    document.title = 'TetherStream - Agent Wallet Infrastructure | WDK by Tether';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Self-custodial agent wallets powered by Tether WDK. Autonomous AI agents hold wallets, enforce spending policies, and settle USDT payments onchain.');
    }
  }, []);
  return null;
};

// ==========================================
// NAVIGATION
// ==========================================
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#stats', label: 'Stats' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || mobileOpen ? 'glass-nav shadow-lg shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="TetherStream" className="w-9 h-9 rounded-lg" />
            <span className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              TetherStream
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} className="text-gray-400 hover:text-white transition-colors font-medium">{link.label}</a>
            ))}
            <Link to="/app" className="btn-primary text-sm">
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-custom py-4 border-t border-white/10 flex flex-col gap-3">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/app"
            className="btn-primary text-sm mt-2 justify-center"
            onClick={() => setMobileOpen(false)}
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

// ==========================================
// HERO
// ==========================================
const Hero = () => (
  <section className="pt-32 lg:pt-44 pb-20 lg:pb-28 relative overflow-hidden min-h-[90vh] flex items-center">
    <ParticleNetwork />
    {/* Gradient orbs */}
    <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/8 rounded-full blur-[120px]" />
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/6 rounded-full blur-[100px]" />

    <div className="container-custom relative">
      <div className="max-w-4xl mx-auto text-center">
        {/* Live ticker */}
        <div className="mb-8 animate-fade-in">
          <LiveTicker />
        </div>

        {/* Headline */}
        <h1 className="hero-title text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Agent Wallet Infrastructure{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400">
            Powered by WDK
          </span>
        </h1>

        {/* Sub */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Self-custodial wallets for autonomous AI agents. Stream USDT payments, enforce spending policies, 
          and settle value onchain — all powered by Tether WDK.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link to="/app" className="btn-primary text-lg px-8 py-4">
            Launch App <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/app/demo" className="btn-secondary text-lg px-8 py-4">
            <Play className="w-5 h-5" /> Live Demo
          </Link>
        </div>

        {/* Stream visualization */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <StreamVisualization />
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          {['Self-Custodial', 'WDK by Tether', 'Base Sepolia', 'Non-Custodial'].map(badge => (
            <div key={badge} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ==========================================
// STATS SECTION (animated counters)
// ==========================================
const Stats = () => {
  const { ref, isInView } = useInView();
  const streams = useCounter(1247, 2000, true, isInView);
  const volume = useCounter(2400000, 2500, true, isInView);
  const agents = useCounter(89, 1500, true, isInView);
  const uptime = useCounter(99, 1000, true, isInView);

  const stats = [
    { label: 'Active Streams', value: streams.toLocaleString(), suffix: '+', icon: Activity },
    { label: 'USDT Streamed', value: `$${(volume / 1000000).toFixed(1)}M`, suffix: '', icon: DollarSign },
    { label: 'Agent Wallets', value: agents.toString(), suffix: '+', icon: Bot },
    { label: 'Uptime', value: uptime.toString(), suffix: '.9%', icon: TrendingUp },
  ];

  return (
    <section id="stats" className="py-16 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
      <div className="container-custom relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl lg:text-4xl font-bold text-white font-mono">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// FEATURES
// ==========================================
const Features = () => {
  const { ref, isInView } = useInView();

  const features = [
    { icon: Zap, title: 'Real-Time Streaming', description: 'Stream USDT payments continuously, second-by-second. Perfect for AI agents, APIs, and subscription services.' },
    { icon: Shield, title: 'Secure & Non-Custodial', description: 'Agents hold their own wallets via WDK. Smart contracts enforce spending limits — no custodians.' },
    { icon: Clock, title: 'Instant Settlements', description: 'No billing cycles. Service providers receive funds immediately as they are earned.' },
    { icon: Wallet, title: 'WDK Wallet Integration', description: 'Tether WDK creates self-custodial wallets for each agent. Deterministic, recoverable, policy-controlled.' },
    { icon: Activity, title: 'Live Monitoring', description: 'Track active payment streams in real-time. Get insights into agent spending patterns and revenue flow.' },
    { icon: Globe, title: 'Multi-Chain Ready', description: 'Built on Base with WDK multi-chain support. Borderless agent payments across EVM chains.' },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 relative">
      <div className="container-custom" ref={ref}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider font-mono">Features</span>
          <h2 className="text-3xl lg:text-4xl font-normal text-white mt-4 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Everything agents need to move money
          </h2>
          <p className="text-lg text-gray-400">
            From micropayments to enterprise billing, TetherStream provides WDK-powered 
            infrastructure for autonomous agent finance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm 
                hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-500 cursor-default
                ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5 
                group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// HOW IT WORKS
// ==========================================
const HowItWorks = () => {
  const { ref, isInView } = useInView();

  const steps = [
    { number: '01', title: 'Agent Gets Task', description: 'An AI agent receives a task that requires payment — API call, compute, data access.', icon: Bot },
    { number: '02', title: 'WDK Creates Wallet', description: 'TetherStream uses Tether WDK to create a self-custodial wallet for the agent. Keys never leave the device.', icon: Wallet },
    { number: '03', title: 'Policy Check', description: 'Smart contract enforces spend limits, daily caps, and allowed recipients before any USDT moves.', icon: Lock },
    { number: '04', title: 'Stream & Settle', description: 'USDT streams in real-time to the service. Agent pays only for what it uses, settling onchain.', icon: Activity },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
      <div className="container-custom relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider font-mono">How It Works</span>
          <h2 className="text-3xl lg:text-4xl font-normal text-white mt-4 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Agent autonomy, onchain
          </h2>
          <p className="text-lg text-gray-400">From task to settlement in seconds. No human in the loop.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl border border-white/5 bg-white/[0.02]
                transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="text-5xl font-bold text-emerald-500/10 mb-3 font-mono">{step.number}</div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 -right-3 w-6 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// USE CASES
// ==========================================
const UseCases = () => {
  const { ref, isInView } = useInView();

  const cases = [
    { title: 'AI Agent Payments', description: 'Autonomous agents pay for API calls, compute, and data in real-time. No human approval needed.', metric: '$0.001', metricLabel: 'per request', icon: Bot },
    { title: 'Compute Streaming', description: 'Rent GPU/CPU by the second. Agents scale up and down, paying only for what they use.', metric: '24/7', metricLabel: 'autonomous', icon: Cpu },
    { title: 'Service Settlements', description: 'Multi-agent workflows settle between each other onchain. Full audit trail, instant finality.', metric: '< 2s', metricLabel: 'settlement', icon: TrendingUp },
  ];

  return (
    <section className="py-20 lg:py-32 relative" ref={ref}>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider font-mono">Use Cases</span>
          <h2 className="text-3xl lg:text-4xl font-normal text-white mt-4 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Built for the agent economy
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((item, index) => (
            <div
              key={index}
              className={`group p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center
                hover:border-emerald-500/20 transition-all duration-500
                ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-1 font-mono">
                {item.metric}
              </div>
              <div className="text-xs text-gray-500 mb-4 font-mono uppercase tracking-wider">{item.metricLabel}</div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// CTA
// ==========================================
const CTASection = () => {
  const { ref, isInView } = useInView();

  return (
    <section className="py-20 lg:py-32" ref={ref}>
      <div className="container-custom">
        <div className={`relative rounded-3xl overflow-hidden transition-all duration-1000 ${
          isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="absolute inset-0 gradient-primary" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          <div className="relative px-8 py-16 lg:px-16 lg:py-24 text-center">
            <h2 className="text-3xl lg:text-5xl font-normal text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to give your agents wallets?
            </h2>
            <p className="text-lg text-emerald-100/70 max-w-2xl mx-auto mb-10">
              Deploy self-custodial agent wallets in minutes. WDK by Tether handles the keys,
              smart contracts enforce the rules.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app" className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-all hover:shadow-lg hover:shadow-white/20 inline-flex items-center gap-2">
                Launch App <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/app/agent-wallets" className="text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                Explore Agent Wallets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// FOOTER
// ==========================================
const Footer = () => (
  <footer className="border-t border-white/5 py-16">
    <div className="container-custom">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <img src="/favicon.png" alt="TetherStream" className="w-9 h-9 rounded-lg" />
            <span className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              TetherStream
            </span>
          </div>
          <p className="text-gray-500 max-w-sm mb-6">
            Agent wallet infrastructure powered by Tether WDK. Self-custodial wallets, 
            policy-controlled spending, onchain settlement.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
          <ul className="space-y-3 text-gray-500 text-sm">
            <li><Link to="/app" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link to="/app/agent-wallets" className="hover:text-white transition-colors">Agent Wallets</Link></li>
            <li><Link to="/app/demo" className="hover:text-white transition-colors">Live Demo</Link></li>
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Resources</h4>
          <ul className="space-y-3 text-gray-500 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            <li><a href="#" className="hover:text-white transition-colors">WDK Guide</a></li>
            <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub</a></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-sm">© 2026 TetherStream. Built for the Tether Hackathon Galactica.</p>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(34,197,94,0.8)]" />
            All systems operational
          </span>
        </div>
      </div>
    </div>
  </footer>
);

// ==========================================
// MAIN LANDING PAGE
// ==========================================
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <SEO />
      <Navigation />
      <main>
        <Hero />
        <Stats />
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
