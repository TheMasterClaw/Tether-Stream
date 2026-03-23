import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { BILLING_REGISTRY_ABI } from '../utils/contracts';
import { 
  Search, 
  Plus, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  Zap,
  Clock,
  Globe,
  Tag,
  DollarSign,
  Timer,
  RefreshCw
} from 'lucide-react';

const BILLING_REGISTRY_ADDRESS = (import.meta.env.VITE_BILLING_REGISTRY_ADDRESS || '0xb623478107adB1b7153f4df72Fc7FC81A8440107') as `0x${string}`;

interface Service {
  serviceId: string;
  provider: string;
  name: string;
  description: string;
  endpoint: string;
  billingType: number;
  rate: bigint;
  minDuration: bigint;
  maxDuration: bigint;
  isActive: boolean;
  totalEarned: bigint;
  totalRequests: bigint;
  ratingSum: bigint;
  ratingCount: bigint;
  tags: string[];
}

export function ServiceMarketplace() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [marketplaceStats, setMarketplaceStats] = useState({ totalServices: 0, totalVolume: 0n, totalProviders: 0 });

  const tags = ['AI', 'LLM', 'Image', 'Data', 'Security', 'Streaming', 'Finance', 'Smart Contracts'];

  const billingTypeLabels: Record<number, string> = {
    0: 'Per Second',
    1: 'Per Call',
    2: 'Per Token',
    3: 'Fixed',
    4: 'Hybrid',
  };

  // Fetch marketplace stats
  const { data: statsData, refetch: refetchStats } = useReadContract({
    address: BILLING_REGISTRY_ADDRESS,
    abi: BILLING_REGISTRY_ABI,
    functionName: 'getMarketplaceStats',
    query: { enabled: isConnected },
  });

  // Fetch active service IDs
  const { data: activeServiceIds, refetch: refetchServices } = useReadContract({
    address: BILLING_REGISTRY_ADDRESS,
    abi: BILLING_REGISTRY_ABI,
    functionName: 'getActiveServices',
    args: [0n, 50n], // offset, limit
    query: { enabled: isConnected },
  });

  // Fetch service details
  const fetchServiceDetails = useCallback(async () => {
    if (!publicClient || !isConnected) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const serviceIds = (activeServiceIds as string[]) || [];

      if (serviceIds.length === 0) {
        setServices([]);
        setIsLoading(false);
        return;
      }

      // Fetch details for each service
      const serviceDetails = await Promise.all(
        serviceIds.map(async (serviceId) => {
          try {
            const serviceData = await publicClient.readContract({
              address: BILLING_REGISTRY_ADDRESS,
              abi: BILLING_REGISTRY_ABI,
              functionName: 'getService',
              args: [serviceId as `0x${string}`],
            }) as Service;

            return {
              ...serviceData,
              serviceId,
            };
          } catch (err) {
            console.error(`Failed to fetch service ${serviceId}:`, err);
            return null;
          }
        })
      );

      const validServices = serviceDetails.filter((s): s is Service => s !== null && s.isActive);
      setServices(validServices);

      // Update stats
      if (statsData) {
        const [totalServices, totalVolume, totalProviders] = statsData as [number, bigint, number];
        setMarketplaceStats({ totalServices, totalVolume, totalProviders });
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Failed to load services from blockchain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, activeServiceIds, statsData, isConnected]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || service.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleStartStream = (service: Service) => {
    // Navigate to create stream with service pre-filled
    window.location.hash = `#/app/create?service=${service.serviceId}&rate=${service.rate.toString()}&provider=${service.provider}`;
  };

  const getAverageRating = (service: Service) => {
    if (service.ratingCount === 0n) return 0;
    return Number(service.ratingSum) / Number(service.ratingCount) / 20; // Scale from 0-100 to 0-5
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Connect Your Wallet</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Connect your wallet to browse and use AI services on the marketplace
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Service Marketplace</h1>
          <p className="text-gray-400">Discover and pay for AI services with transparent pricing</p>
        </div>        
        <div className="flex items-center gap-3">
          <button
            onClick={() => { refetchServices(); refetchStats(); fetchServiceDetails(); }}
            disabled={isLoading}
            className="p-3 bg-black/30 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
            title="Refresh marketplace"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 gradient-cta rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Register Service
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">Total Services</p>
          <p className="text-2xl font-bold text-white">{marketplaceStats.totalServices}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">Total Volume</p>
          <p className="text-2xl font-bold text-[var(--color-cta)]">
            {formatUnits(marketplaceStats.totalVolume, 6)} USDT
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">Providers</p>
          <p className="text-2xl font-bold text-white">{marketplaceStats.totalProviders}</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50"
          />
        </div>        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedTag === '' 
                ? 'bg-[var(--color-cta)]/20 text-[var(--color-cta)] border border-[var(--color-cta)]/30' 
                : 'bg-black/30 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedTag === tag 
                  ? 'bg-[var(--color-cta)]/20 text-[var(--color-cta)] border border-[var(--color-cta)]/30' 
                  : 'bg-black/30 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto text-[var(--color-primary)] animate-spin mb-4" />
          <p className="text-gray-400">Loading services from blockchain...</p>
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const rating = getAverageRating(service);
            return (
              <div
                key={service.serviceId}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-[var(--color-primary)]/30 transition-all group hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-white group-hover:text-[var(--color-cta)] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                            />
                          ))}
                          <span className="text-sm text-gray-400 ml-1">{rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">
                          {service.totalRequests.toLocaleString()} uses
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-black/30 text-gray-400 rounded-lg border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500">{billingTypeLabels[service.billingType]}</p>
                      <p className="text-lg font-semibold text-[var(--color-cta)]">
                        {service.billingType === 0 ? (
                          `${(Number(service.rate) / 1e6).toFixed(6)} USDT/sec`
                        ) : service.billingType === 1 ? (
                          `${(Number(service.rate) / 1e6).toFixed(2)} USDT/call`
                        ) : service.billingType === 2 ? (
                          `${(Number(service.rate)).toFixed(4)} USDT/token`
                        ) : (
                          `${(Number(service.rate) / 1e6).toFixed(2)} USDT`
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartStream(service)}
                      className="px-4 py-2 gradient-cta rounded-lg font-medium text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
                    >
                      {service.billingType === 0 ? 'Start Stream' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredServices.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">No services found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery || selectedTag 
              ? "Try adjusting your search or filters"
              : "Be the first to register a service on the marketplace!"
            }
          </p>
          {searchQuery || selectedTag ? (
            <button
              onClick={() => { setSearchQuery(''); setSelectedTag(''); }}
              className="text-[var(--color-cta)] hover:underline font-medium"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 gradient-cta rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Register First Service
            </button>
          )}
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <CreateServiceModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            setTimeout(() => setSuccessMessage(null), 5000);
            fetchServiceDetails();
          }}
          onError={(msg) => {
            setError(msg);
            setTimeout(() => setError(null), 5000);
          }}
        />
      )}
    </div>
  );
}

function CreateServiceModal({ 
  onClose, 
  onSuccess, 
  onError 
}: { 
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    billingType: 0,
    rate: '',
    minDuration: '',
    maxDuration: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync: registerService } = useWriteContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await registerService({
        address: BILLING_REGISTRY_ADDRESS,
        abi: BILLING_REGISTRY_ABI,
        functionName: 'registerService',
        args: [
          formData.name,
          formData.description,
          formData.endpoint,
          formData.billingType,
          parseUnits(formData.rate, 6),
          BigInt(formData.minDuration || '0'),
          BigInt(formData.maxDuration || '0'),
          formData.tags.split(',').map((t) => t.trim()).filter(t => t),
        ],
      });
      onSuccess('Service registered successfully!');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl p-8 border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Register Service</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Service Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50"
              required
            />
          </div>          
          
          <textarea
            placeholder="Description *"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 h-24 resize-none"
            required
          />          
          
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="url"
              placeholder="API Endpoint *"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50"
              required
            />
          </div>

          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={formData.billingType}
              onChange={(e) => setFormData({ ...formData, billingType: parseInt(e.target.value) })}
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)]/50 appearance-none"
            >
              <option value={0} className="bg-slate-800">Per Second (Streaming)</option>
              <option value={1} className="bg-slate-800">Per Call</option>
              <option value={2} className="bg-slate-800">Per Token</option>
              <option value={3} className="bg-slate-800">Fixed</option>
              <option value={4} className="bg-slate-800">Hybrid</option>
            </select>
          </div>

          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="number"
              placeholder="Rate (USDT) *"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50"
              required
              step="0.000001"
              min="1"
            />
          </div>

          {formData.billingType === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Timer className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  placeholder="Min Duration (sec)"
                  value={formData.minDuration}
                  onChange={(e) => setFormData({ ...formData, minDuration: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50"
                  min="60"
                />
              </div>
              <div className="relative">
                <Timer className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  placeholder="Max Duration (sec)"
                  value={formData.maxDuration}
                  onChange={(e) => setFormData({ ...formData, maxDuration: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50"
                  min="60"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 gradient-cta rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </span>
            ) : (
              'Register Service'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
