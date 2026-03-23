import { useState } from 'react';
import {
  Bot,
  Cpu,
  Video,
  Cloud,
  Database,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StreamTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  gradient: string;
  defaultRecipient: string;
  defaultAmount: string;
  defaultDuration: string;
  serviceId: string;
  estimatedCost: string;
  useCase: string;
  popular?: boolean;
}

const templates: StreamTemplate[] = [
  {
    id: 'ai-agent',
    name: 'AI Agent Service',
    description: 'Pay for AI inference services per second of compute time',
    icon: Bot,
    iconColor: 'text-teal-400',
    gradient: 'from-teal-500/20 to-pink-500/20 border-teal-500/30',
    defaultRecipient: '',
    defaultAmount: '50',
    defaultDuration: '3600',
    serviceId: 'ai-inference-v1',
    estimatedCost: '50 USDT/hr',
    useCase: 'GPT-4, Claude, or custom model inference',
    popular: true
  },
  {
    id: 'gpu-compute',
    name: 'GPU Compute',
    description: 'Rent GPU resources for ML training or rendering',
    icon: Cpu,
    iconColor: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    defaultRecipient: '',
    defaultAmount: '100',
    defaultDuration: '7200',
    serviceId: 'gpu-rental-a100',
    estimatedCost: '100 USDT/2hr',
    useCase: 'ML training, 3D rendering, simulations'
  },
  {
    id: 'content-streaming',
    name: 'Content Access',
    description: 'Stream payments for premium content consumption',
    icon: Video,
    iconColor: 'text-red-400',
    gradient: 'from-red-500/20 to-emerald-500/20 border-red-500/30',
    defaultRecipient: '',
    defaultAmount: '10',
    defaultDuration: '3600',
    serviceId: 'premium-content',
    estimatedCost: '10 USDT/hr',
    useCase: 'Movies, music, educational content'
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Pay for decentralized storage by the hour',
    icon: Cloud,
    iconColor: 'text-blue-400',
    gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    defaultRecipient: '',
    defaultAmount: '5',
    defaultDuration: '86400',
    serviceId: 'storage-ipfs',
    estimatedCost: '5 USDT/day',
    useCase: 'File storage, backups, data archiving'
  },
  {
    id: 'data-api',
    name: 'Data API Access',
    description: 'Real-time data streaming for trading or analytics',
    icon: Database,
    iconColor: 'text-green-400',
    gradient: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    defaultRecipient: '',
    defaultAmount: '25',
    defaultDuration: '3600',
    serviceId: 'market-data-feed',
    estimatedCost: '25 USDT/hr',
    useCase: 'Price feeds, analytics, market data'
  },
  {
    id: 'custom',
    name: 'Custom Stream',
    description: 'Create a completely custom payment stream',
    icon: Zap,
    iconColor: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    defaultRecipient: '',
    defaultAmount: '',
    defaultDuration: '3600',
    serviceId: 'custom-service',
    estimatedCost: 'Custom',
    useCase: 'Any payment scenario you can imagine'
  }
];

export function StreamTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelect = (template: StreamTemplate) => {
    setSelectedTemplate(template.id);
  };

  const getTemplateLink = (template: StreamTemplate) => {
    const params = new URLSearchParams({
      template: template.id,
      amount: template.defaultAmount,
      duration: template.defaultDuration,
      serviceId: template.serviceId
    });
    return `/app/create?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Stream Templates
          </h2>
          <p className="text-gray-400">Quick-start presets for common payment scenarios</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-full border border-teal-500/20">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm text-teal-400">{templates.length} templates available</span>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <div
              key={template.id}
              onClick={() => handleSelect(template)}
              className={`relative p-6 rounded-2xl border cursor-pointer transition-all group ${
                isSelected 
                  ? 'bg-white/10 border-[var(--color-primary)]/50 shadow-lg shadow-[var(--color-primary)]/10' 
                  : `bg-gradient-to-br ${template.gradient} hover:bg-white/5`
              }`}
            >
              {template.popular && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-teal-500 to-pink-500 rounded-full text-xs font-semibold text-white shadow-lg">
                  Popular
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${template.iconColor}`} />
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{template.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Estimated:</span>
                  <span className="text-[var(--color-cta)] font-medium">{template.estimatedCost}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="text-gray-300">{formatDuration(template.defaultDuration)}</span>
                </div>
              </div>
              
              <Link
                to={getTemplateLink(template)}
                className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                Use Template
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Why Use Streaming */}
      <div className="mt-12 p-6 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-2xl border border-[var(--color-primary)]/20">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--color-cta)]" />
          Why Stream Payments?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <BenefitCard
            title="Pay Per Second"
            description="Only pay for the exact time you use. No more monthly subscriptions for services you barely use."
            icon={Zap}
          />
          <BenefitCard
            title="Instant Settlement"
            description="Funds flow continuously. Service providers can withdraw earnings at any time."
            icon={ArrowRight}
          />
          <BenefitCard
            title="Cancel Anytime"
            description="Stop the stream whenever you want. Unused funds are automatically returned."
            icon={CheckCircle}
          />
        </div>
      </div>

      {/* Compare Costs */}
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Compare with Traditional Billing</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                <th className="pb-3 font-medium">Service Type</th>
                <th className="pb-3 font-medium">Traditional</th>
                <th className="pb-3 font-medium text-[var(--color-cta)]">TetherStream</th>
                <th className="pb-3 font-medium">Savings</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <CostRow
                service="AI API"
                traditional="$20/month"
                paystream="$0.05/hour used"
                savings="Up to 90%"
              />
              <CostRow
                service="GPU Compute"
                traditional="$500/month"
                paystream="$2/hour used"
                savings="Up to 70%"
              />
              <CostRow
                service="Cloud Storage"
                traditional="$10/month"
                paystream="$0.20/day used"
                savings="Up to 40%"
              />
              <CostRow
                service="Data API"
                traditional="$100/month"
                paystream="$1/hour used"
                savings="Up to 80%"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ title, description, icon: Icon }: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function CostRow({ service, traditional, paystream, savings }: {
  service: string;
  traditional: string;
  paystream: string;
  savings: string;
}) {
  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="py-4 text-white">{service}</td>
      <td className="py-4 text-gray-400">{traditional}</td>
      <td className="py-4 text-[var(--color-cta)]">{paystream}</td>
      <td className="py-4">
        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
          {savings}
        </span>
      </td>
    </tr>
  );
}

function formatDuration(seconds: string): string {
  const secs = parseInt(seconds);
  if (secs < 3600) return `${(secs / 60).toFixed(0)} min`;
  if (secs < 86400) return `${(secs / 3600).toFixed(0)} hr`;
  return `${(secs / 86400).toFixed(0)} days`;
}
