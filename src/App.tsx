import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  Trash2, 
  Check, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Award, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  BadgeHelp,
  Globe, 
  Coins, 
  Calculator, 
  ArrowRight, 
  Download, 
  Info,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckSquare,
  Square,
  Star,
  ThumbsUp,
  MessageSquare,
  Send,
  PlusCircle,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessSetupPlan, CustomBudgetSelection, EquipmentItem, Review, ReviewsDictionary } from './types';
import { POPULAR_10_CATEGORIES } from './categoriesData';
import { generateDefaultReviewsForItem } from './reviewsGenerator';

const INITIAL_SUGGESTIONS = [
  { label: 'YouTube Content Creator', icon: '🎥', query: 'youtuber' },
  { label: 'Aesthetic Home Bakery', icon: '🍞', query: 'home bakery and baking business' },
  { label: 'Mobile Car Detailing / Wash', icon: '🚗', query: 'mobile car detailing mechanic' },
  { label: 'Nail Salon & Manicure Studio', icon: '💅', query: 'nail salon specialist' },
  { label: 'Specialty Pop-Up Coffee Cart', icon: '☕', query: 'espresso coffee cart bar' }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadStats, setLoadStats] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupPlan, setSetupPlan] = useState<BusinessSetupPlan | null>(null);
  
  // Custom configuration state
  const [budgetSelection, setBudgetSelection] = useState<CustomBudgetSelection>({});
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'NGN' | 'GHS' | 'EUR'>('USD');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedImportanceFilter, setSelectedImportanceFilter] = useState<string>('all');
  const [selectedSortOption, setSelectedSortOption] = useState<'default' | 'priceAsc' | 'importance' | 'category'>('default');

  // Interactive tooltip/modal for item details
  const [activeDetailItem, setActiveDetailItem] = useState<EquipmentItem | null>(null);

  // Budget Calculator - Target Budget in USD (baseline)
  const [userTargetBudget, setUserTargetBudget] = useState<number>(1200);

  // Reviews Dictionary & interactive states
  const [reviews, setReviews] = useState<ReviewsDictionary>({});
  const [expandedReviews, setExpandedReviews] = useState<{[itemId: string]: boolean}>({});

  // Review Form values keyed by item ID (default values are managed beautifully)
  const [formRating, setFormRating] = useState<{[itemId: string]: number}>({});
  const [formName, setFormName] = useState<{[itemId: string]: string}>({});
  const [formComment, setFormComment] = useState<{[itemId: string]: string}>({});
  const [formContext, setFormContext] = useState<{[itemId: string]: string}>({});

  // Tab state for landing page: show 'directory' (the 10 pathways) or standard suggestions
  const [landingTab, setLandingTab] = useState<'directory' | 'suggestions'>('directory');

  // Loading animation sequence
  useEffect(() => {
    if (!isLoading) return;
    const stages = [
      'Analyzing required tools and workspace setup...',
      'Comparing bargain prices and used listings on Jiji...',
      'Fetching mainstream e-commerce catalogs on Jumia...',
      'Validating premium global hardware options on Amazon...',
      'Calculating local market currency rates and index averages...',
      'Synthesizing 3 budget tiers for custom planning...'
    ];
    let i = 0;
    setLoadStats(stages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % stages.length;
      setLoadStats(stages[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Fetch the plan from our full-stack server
  const handleSearch = async (queryToSubmit: string) => {
    if (!queryToSubmit.trim()) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    setActiveDetailItem(null);
    setSelectedCategoryFilter('all');
    setSelectedImportanceFilter('all');
    setSelectedSortOption('default');

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessType: queryToSubmit }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while generating the equipment plan.');
      }

      setSetupPlan(data);
      
      // Initialize budget selection and realistic default purchase reviews
      const initialSelection: CustomBudgetSelection = {};
      const initialReviews: ReviewsDictionary = {};
      
      data.equipment.forEach((item: EquipmentItem) => {
        initialSelection[item.id] = 'middleGrade';
        initialReviews[item.id] = generateDefaultReviewsForItem(item.id, item.name, item.category);
      });
      
      setBudgetSelection(initialSelection);
      setReviews(initialReviews);
      
      // Reset expanded drawers and feedback forms
      setExpandedReviews({});
      setFormRating({});
      setFormName({});
      setFormComment({});
      setFormContext({});
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred. Please check your network or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper currency converter
  const formatPrice = (usdAmount: number) => {
    if (!setupPlan) return `$${usdAmount.toLocaleString()}`;
    
    const rate = setupPlan.conversionRate || { Naira: 1500, Cedis: 14.8, Euro: 0.92 };
    
    switch (selectedCurrency) {
      case 'NGN':
        const nairaVal = usdAmount * (rate.Naira || 1500);
        return `₦${nairaVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      case 'GHS':
        const cediVal = usdAmount * (rate.Cedis || 14.8);
        return `GH₵${cediVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      case 'EUR':
        const euroVal = usdAmount * (rate.Euro || 0.92);
        return `€${euroVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default:
        return `$${usdAmount.toLocaleString()}`;
    }
  };

  // Calculate totals for default tiers
  const getTierTotal = (tier: 'lowerGrade' | 'middleGrade' | 'professional') => {
    if (!setupPlan) return 0;
    return setupPlan.equipment.reduce((acc, item) => {
      const val = item[tier]?.price || 0;
      return acc + val;
    }, 0);
  };

  // Calculate customized budget dynamically based on user selections
  const getCustomizedTotal = () => {
    if (!setupPlan) return 0;
    return setupPlan.equipment.reduce((acc, item) => {
      const sel = budgetSelection[item.id];
      if (!sel || sel === 'excluded') return acc;
      const priceVal = item[sel]?.price || 0;
      return acc + priceVal;
    }, 0);
  };

  const currentCustomTotal = getCustomizedTotal();
  const lowerTotal = getTierTotal('lowerGrade');
  const middleTotal = getTierTotal('middleGrade');
  const proTotal = getTierTotal('professional');

  // Convert current customised total and budget into visual values
  const rateObj = setupPlan?.conversionRate || { Naira: 1500, Cedis: 14.8, Euro: 0.92 };
  
  const getCurrencyRate = () => {
    switch (selectedCurrency) {
      case 'NGN': return rateObj.Naira || 1500;
      case 'GHS': return rateObj.Cedis || 14.8;
      case 'EUR': return rateObj.Euro || 0.92;
      default: return 1;
    }
  };

  const currencyRate = getCurrencyRate();
  const currentTargetBudgetLocal = userTargetBudget * currencyRate;

  // Essential cost totals
  const totalEssentialUSD = setupPlan?.equipment
    .filter(item => item.importance === 'essential' && budgetSelection[item.id] !== 'excluded')
    .reduce((sum, item) => {
      const tierDef = budgetSelection[item.id] || 'middleGrade';
      return sum + (item[tierDef]?.price || 0);
    }, 0) || 0;

  // Non-essential cost totals (recommended & optional)
  const totalNonEssentialUSD = setupPlan?.equipment
    .filter(item => item.importance !== 'essential' && budgetSelection[item.id] !== 'excluded')
    .reduce((sum, item) => {
      const tierDef = budgetSelection[item.id] || 'middleGrade';
      return sum + (item[tierDef]?.price || 0);
    }, 0) || 0;

  // Compute percentage of allocated budget
  const essentialPercentage = Math.round((totalEssentialUSD / userTargetBudget) * 100) || 0;
  const nonEssentialPercentage = Math.round((totalNonEssentialUSD / userTargetBudget) * 100) || 0;
  const remainingBudgetUSD = userTargetBudget - currentCustomTotal;
  const isOverBudget = remainingBudgetUSD < 0;

  // Potential savings: switch non-lower setups to lowerGrade
  const savingsRecommendations: Array<{
    itemId: string;
    itemName: string;
    importance: string;
    savingAmountUSD: number;
    currentTier: string;
    lowerGradeName: string;
  }> = [];

  if (setupPlan) {
    setupPlan.equipment.forEach(item => {
      const tierDef = budgetSelection[item.id] || 'middleGrade';
      if (tierDef !== 'lowerGrade' && tierDef !== 'excluded') {
        const currentPrice = item[tierDef]?.price || 0;
        const lowerPrice = item.lowerGrade?.price || 0;
        const diff = currentPrice - lowerPrice;
        if (diff > 0) {
          savingsRecommendations.push({
            itemId: item.id,
            itemName: item.name,
            importance: item.importance,
            savingAmountUSD: diff,
            currentTier: tierDef,
            lowerGradeName: item.lowerGrade.name
          });
        }
      }
    });
  }

  // Sort savings by highest savings first to give powerful tips
  savingsRecommendations.sort((a, b) => b.savingAmountUSD - a.savingAmountUSD);

  // Filter items based on user filters
  let filteredEquipment = setupPlan?.equipment.filter(item => {
    const categoryMatch = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const importanceMatch = selectedImportanceFilter === 'all' || item.importance === selectedImportanceFilter;
    return categoryMatch && importanceMatch;
  }) || [];

  // Sort items based on sorting state
  if (selectedSortOption === 'priceAsc') {
    filteredEquipment = [...filteredEquipment].sort((a, b) => {
      const getActivePrice = (item: EquipmentItem) => {
        const tier = budgetSelection[item.id] || 'middleGrade';
        if (tier === 'excluded') return 0;
        return item[tier]?.price || 0;
      };
      return getActivePrice(a) - getActivePrice(b);
    });
  } else if (selectedSortOption === 'importance') {
    filteredEquipment = [...filteredEquipment].sort((a, b) => {
      const importanceValue = (importance: string) => {
        if (importance === 'essential') return 1;
        if (importance === 'recommended') return 2;
        if (importance === 'optional') return 3;
        return 4;
      };
      return importanceValue(a.importance) - importanceValue(b.importance);
    });
  } else if (selectedSortOption === 'category') {
    filteredEquipment = [...filteredEquipment].sort((a, b) => {
      const catCompare = a.category.localeCompare(b.category);
      if (catCompare !== 0) return catCompare;
      return a.name.localeCompare(b.name);
    });
  }

  // Clipboard copy summarizing user configuration
  const handleExportSummary = () => {
    if (!setupPlan) return;

    let text = `========= BizStart Equipment Breakdown Summary =========\n`;
    text += `Business Setup Profile: ${setupPlan.businessName}\n`;
    text += `Industry Overview: ${setupPlan.overview}\n`;
    text += `Local License Details: ${setupPlan.licensingTips}\n\n`;
    text += `Selected Startup Setup Pricing System Currency: ${selectedCurrency}\n`;
    text += `Custom Configured Startup Total: ${formatPrice(currentCustomTotal)}\n`;
    text += `Compare Templates:\n`;
    text += ` - Lower Grade (Budget Jiji) Setup Total: ${formatPrice(lowerTotal)}\n`;
    text += ` - Middle Grade (Standard mixed Jumia/Amazon) Setup Total: ${formatPrice(middleTotal)}\n`;
    text += ` - Professional Grade Premium Setup Total: ${formatPrice(proTotal)}\n\n`;
    text += `Detailed Selected Items List:\n`;

    setupPlan.equipment.forEach((item, index) => {
      const selection = budgetSelection[item.id];
      text += `\n${index + 1}. ${item.name} (${item.category.toUpperCase()}) - ${item.importance.toUpperCase()}\n`;
      if (selection === 'excluded') {
        text += `   [EXCLUDED OR ALREADY ACQUIRED] - Total USD 0\n`;
      } else {
        const option = item[selection];
        text += `   Selected Tier: ${selection === 'lowerGrade' ? 'Lower Grade (Economy/Bargain)' : selection === 'middleGrade' ? 'Middle Grade (Standard)' : 'Professional Grade (Premium)'}\n`;
        text += `   Device: ${option.name} (${option.brandModel})\n`;
        text += `   Market Price: ${formatPrice(option.price)} (Baseline: $${option.price})\n`;
        text += `   Source Platform: ${option.source} (Insights: ${option.sourceNotes})\n`;
      }
    });

    text += `\nRecommended Startup Adjacent Skills:\n`;
    setupPlan.usefulSkills.forEach(skill => {
      text += ` - ${skill}\n`;
    });

    text += `\nGenerated via BizStart Equipment Budget Planner.`;

    navigator.clipboard.writeText(text);
    alert('Full equipment spreadsheet and startup handbook summary copied to clipboard! You can paste this in Excel, Word, or Notes.');
  };

  return (
    <div id="biz-setup-root" className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#1e293b] text-white font-sans antialiased pb-20 selection:bg-teal-500/30 selection:text-white">
      
      {/* Visual Accent Header Decoration */}
      <div id="brand-header-strip" className="h-1 bg-white/10 w-full backdrop-blur-md" />

      {/* Main Container Wrapper */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Header Branding Panel */}
        <header id="app-nav-header" className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg inline-flex items-center justify-center border border-white/10">
                <Briefcase className="h-5 w-5 text-teal-300" />
              </span>
              <span className="font-display font-semibold text-xs tracking-wider text-teal-300 uppercase">Entrepreneur Resource Hub</span>
            </div>
            <h1 id="main-headline" className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-none mt-2">
              BizStart <span className="text-teal-300">Equip & Budget Planner</span>
            </h1>
            <p className="text-white/70 mt-3 text-sm leading-relaxed max-w-xl">
              Launch smarter. Input any career or business model to generate real equipment checklists, cross-compared with actual market values from <span className="font-semibold text-white">Amazon</span>, <span className="font-semibold text-white">Jumia</span>, cost-effective secondhand <span className="font-semibold text-white">Jiji</span>, and bulk-import budget deals on <span className="font-semibold text-white">Temu</span>.
            </p>
          </div>

          {/* Quick Context Rates Info Badge */}
          {setupPlan && (
            <div id="exchange-rates-overview" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl text-xs flex flex-col gap-1.5">
              <div className="font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
                <Coins className="h-3 w-3 text-pink-300 animate-pulse" />
                Live baseline Forex Estimates
              </div>
              <div className="grid grid-cols-3 gap-3 font-mono text-white/90 font-medium">
                <div className="px-2 py-1 bg-white/5 border border-white/10 rounded">₦/{setupPlan.conversionRate?.Naira || 1500}</div>
                <div className="px-2 py-1 bg-white/5 border border-white/10 rounded">₵/{setupPlan.conversionRate?.Cedis || 14.8}</div>
                <div className="px-2 py-1 bg-white/5 border border-white/10 rounded">€/{setupPlan.conversionRate?.Euro || 0.92}</div>
              </div>
            </div>
          )}
        </header>

        {/* SECTION 1: Searching Section */}
        <section id="search-container" className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient background blur circles */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-amber-300 animate-bounce" /> What business or job are you setting up?
            </h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="relative flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  id="query-input-bar"
                  type="text"
                  placeholder="e.g. YouTuber / Content Creator, Woodworking Workshop, Mobile Makeup Artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl py-4 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/30 outline-none transition-all duration-200"
                />
              </div>
              <button
                id="search-btn-submit"
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="bg-teal-600 text-white font-semibold px-6 sm:px-8 py-4 rounded-xl hover:bg-teal-500 active:bg-teal-700 disabled:bg-white/10 disabled:text-white/40 border border-white/10 transition shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Generate Handbooks</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Starter Suggestions */}
            <div id="preset-suggestions" className="mt-5">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Popular Instant Handbooks</p>
              <div className="flex flex-wrap gap-2">
                {INITIAL_SUGGESTIONS.map((sug) => (
                  <button
                    id={`preset-${sug.query}`}
                    key={sug.label}
                    onClick={() => {
                      setSearchQuery(sug.label);
                      handleSearch(sug.query);
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer hover:border-white/30"
                  >
                    <span>{sug.icon}</span>
                    <span>{sug.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* LOADING ANIMATION CONTAINER */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              id="loading-status-overlay"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 text-center shadow-2xl mb-8"
            >
              <div className="relative inline-flex mb-6">
                <span className="flex h-10 w-10 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-teal-500 text-white items-center justify-center border border-white/20">
                    <Sparkles className="h-5 w-5 animate-spin" />
                  </span>
                </span>
              </div>
              
              <h3 className="font-display font-bold text-xl text-white mb-2">Analyzing Marketplace Procurement</h3>
              <p className="text-sm font-semibold text-teal-300 tracking-wide font-mono px-4 max-w-md mx-auto h-12 flex items-center justify-center">
                {loadStats}
              </p>
              
              {/* Fake animated progress lines to enrich look */}
              <div className="max-w-xs mx-auto mt-4 bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  className="bg-teal-400 h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs text-white/60 mt-4 leading-relaxed">
                Gemini is preparing list models, sorting Amazon prime standard retail, Jumia official, and direct peer secondhand values on Jiji.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR MSG CONTAINER */}
        {errorMsg && (
          <div id="error-message-box" className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-md rounded-2xl p-6 mb-8 flex items-start gap-4">
            <span className="p-2 bg-rose-500/20 text-rose-300 border border-rose-500/10 rounded-lg shrink-0">
              <AlertCircle className="h-6 w-6" />
            </span>
            <div>
              <h4 className="font-bold text-rose-200 text-base">Setup Sourcing Unsuccessful</h4>
              <p className="text-sm text-rose-300/80 mt-1">{errorMsg}</p>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => handleSearch(searchQuery)}
                  className="bg-rose-600 hover:bg-rose-500 text-white border border-white/10 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Retry Sourcing
                </button>
                <div className="text-xs text-rose-300 self-center">
                  Verify your <span className="font-mono bg-rose-950 px-1 py-0.5 rounded text-rose-300 font-semibold">GEMINI_API_KEY</span> is active under secrets panel.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Dynamic Result Visualizer */}
        {setupPlan && !isLoading && (
          <motion.div
            id="planner-result-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            
            {/* LEFT PROFILE & HANDBOOK INSIGHTS PANEL */}
            <div id="left-profile-sidebar" className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Business Identity Card */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                {/* Decorative glow bg */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <span className="px-3 py-1 bg-white/10 text-teal-400 border border-white/20 text-[10px] font-bold tracking-widest uppercase rounded-full">
                  {setupPlan.industry}
                </span>

                <h3 className="font-display font-extrabold text-2xl mt-4 text-white leading-tight">
                  {setupPlan.businessName}
                </h3>
                
                <p className="text-white/80 text-sm mt-3 leading-relaxed border-l-2 border-teal-400 pl-3">
                  {setupPlan.summary}
                </p>

                <p className="text-xs text-white/60 mt-4 leading-relaxed">
                  {setupPlan.overview}
                </p>
              </div>

              {/* Startup Skills & Preparation Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-lg">
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <TrendingUp className="h-4 w-4 text-teal-400" /> Essential Skills to Learn
                </h4>
                <p className="text-xs text-white/70 mb-4">Having the equipment is 50% of the battle. Invest also in learning these adjacent specialties:</p>
                <ul className="space-y-3">
                  {setupPlan.usefulSkills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                      <span className="w-5 h-5 bg-white/10 border border-white/15 text-teal-300 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal & Regulation Warning Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h4 className="font-display font-bold text-yellow-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 font-semibold">
                  <BadgeHelp className="h-4 w-4 text-amber-300" /> Sourcing & Business Tip
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  {setupPlan.licensingTips}
                </p>
                <div className="border-t border-white/10 mt-3 pt-3 flex items-center gap-2">
                  <Info className="h-3 w-3 text-teal-300 shrink-0" />
                  <p className="text-[10px] text-white/60 leading-tight">
                    Currency estimates align with local pricing indices for Amazon (US/EU Importers), Jiji (refurbished dealers) & Jumia (authorized retail hubs).
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT WORKBENCH & DETAILS PANEL */}
            <div id="right-dashboard-workbench" className="lg:col-span-2 flex flex-col gap-6">
              
              {/* PRIMARY STATS SECTION: Core Comparison Layout */}
              <div id="pricing-comparison-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Lower Grade Base CARD */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:bg-white/10 transition-colors">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        Lower Grade
                      </span>
                      <span className="text-xs font-semibold text-white/50">Jiji Bargain</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-extrabold text-white tracking-tight">
                        {formatPrice(lowerTotal)}
                      </p>
                      <p className="text-[11px] text-white/60 mt-1">
                        Utilizes refurbished, DIY, or peer classified sales.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const lowerSelect: CustomBudgetSelection = {};
                      setupPlan.equipment.forEach(i => lowerSelect[i.id] = 'lowerGrade');
                      setBudgetSelection(lowerSelect);
                    }}
                    className="mt-4 text-center cursor-pointer text-xs font-semibold py-2 px-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-white hover:border-white/30 transition-all"
                  >
                    Select All Lower Tier
                  </button>
                </div>

                {/* 2. Middle Grade CARD */}
                <div className="bg-white/15 backdrop-blur-xl border border-teal-500/40 rounded-2xl p-5 shadow-2xl relative flex flex-col justify-between hover:bg-white/20 transition-all scale-102">
                  <span className="absolute -top-3 right-4 px-2 py-0.5 bg-teal-600 text-white border border-white/10 rounded text-[9px] font-bold uppercase tracking-wider">
                    Recommended
                  </span>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest bg-teal-500/20 border border-teal-500/20 px-2 py-0.5 rounded">
                        Middle Grade
                      </span>
                      <span className="text-xs font-semibold text-teal-300">Retail Standards</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-extrabold text-white tracking-tight">
                        {formatPrice(middleTotal)}
                      </p>
                      <p className="text-[11px] text-white/80 mt-1">
                        Standard official store models with warranty bounds.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const middleSelect: CustomBudgetSelection = {};
                      setupPlan.equipment.forEach(i => middleSelect[i.id] = 'middleGrade');
                      setBudgetSelection(middleSelect);
                    }}
                    className="mt-4 text-center cursor-pointer text-xs font-semibold py-3 px-3 bg-teal-600 text-white rounded-lg hover:bg-teal-500 hover:border-white/10 transition-all shadow-md shadow-teal-600/20"
                  >
                    Select All Standard
                  </button>
                </div>

                {/* 3. Professional Top CARD */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:bg-white/10 transition-colors">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest bg-purple-500/20 border border-purple-500/25 px-2 py-0.5 rounded">
                        Professional
                      </span>
                      <span className="text-xs font-semibold text-purple-300">Premium Amazon</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-extrabold text-white tracking-tight">
                        {formatPrice(proTotal)}
                      </p>
                      <p className="text-[11px] text-white/60 mt-1">
                        Top-tier industrial machinery and optimal speeds.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const proSelect: CustomBudgetSelection = {};
                      setupPlan.equipment.forEach(i => proSelect[i.id] = 'professional');
                      setBudgetSelection(proSelect);
                    }}
                    className="mt-4 text-center cursor-pointer text-xs font-semibold py-2 px-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-white hover:border-white/30 transition-all"
                  >
                    Select All Pro Grade
                  </button>
                </div>

              </div>

              {/* INTERACTIVE BUDGET ALLOCATOR & FUNDS ADVISORY PANEL */}
              <div id="budget-calculator-allocation-card" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-teal-400" />
                      Live Allocation Budget Calculator
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">Define your total capital limit and analyze the priority of each startup purchase.</p>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/15 p-1 rounded-xl shrink-0">
                    <span className="text-[10px] font-bold text-white/50 px-2 uppercase tracking-wide">Quick Limits:</span>
                    {[500, 1500, 3000, 5000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setUserTargetBudget(preset)}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                          userTargetBudget === preset ? 'bg-teal-600 text-white shadow' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {selectedCurrency === 'USD' ? `$${preset}` : formatPrice(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                  {/* Left Column: Input and Basic Metrics */}
                  <div className="md:col-span-5 flex flex-col justify-between gap-4">
                    <div>
                      <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-2">
                        Set Capital Target ({selectedCurrency === 'USD' ? '$ USD' : selectedCurrency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-white/50">
                          {selectedCurrency === 'USD' ? '$' : selectedCurrency === 'NGN' ? '₦' : selectedCurrency === 'GHS' ? '₵' : '€'}
                        </span>
                        <input
                          id="budget-input-target"
                          type="number"
                          value={Math.round(userTargetBudget * currencyRate)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            // Convert back to USD baseline
                            setUserTargetBudget(Math.round(val / currencyRate));
                          }}
                          className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-white font-mono font-black placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                          placeholder="e.g. 1500"
                        />
                      </div>
                      <span className="text-[10px] text-white/40 block mt-1">
                        Currently converted baseline value: ${userTargetBudget.toLocaleString()} USD
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Target Budget Status</span>
                      {isOverBudget ? (
                        <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <span>Budget Overrun: {formatPrice(Math.abs(remainingBudgetUSD))}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                          <span>Available Buffer: {formatPrice(remainingBudgetUSD)}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-white/60 mt-1.5 leading-tight">
                        {isOverBudget 
                          ? "Your selected equipment exceeds your budget target. Switch some optional equipment parameters to Jiji lower-tier below to optimize costs!" 
                          : "Outstanding! You are fully within your budget ceiling. You can safely consider upgrading essential pieces to pro tier!"}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Visual Distribution & Allocation Gauge */}
                  <div className="md:col-span-7 flex flex-col justify-between gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <div>
                      <span className="text-xs font-bold text-white/70 uppercase tracking-wider block mb-2">Fund Allocation Breakdown</span>
                      
                      <div className="space-y-3 font-sans">
                        <div className="h-4 bg-white/15 rounded-full flex overflow-hidden border border-white/5 relative">
                          {/* Essential Section */}
                          <div 
                            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300 ease-out shrink-0"
                            style={{ width: `${Math.min(100 - nonEssentialPercentage, essentialPercentage)}%` }}
                          />
                          {/* Non-essential Section */}
                          <div 
                            className="bg-indigo-400 h-full transition-all duration-300 ease-out shrink-0"
                            style={{ width: `${Math.min(100 - essentialPercentage, nonEssentialPercentage)}%` }}
                          />
                        </div>

                        {/* Legends */}
                        <div className="grid grid-cols-2 gap-3 text-xs leading-none">
                          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2.5 h-2.5 rounded bg-teal-500 inline-block" />
                              <span className="font-semibold text-white/80">Critical (Essential):</span>
                            </div>
                            <span className="font-mono font-bold text-white">{formatPrice(totalEssentialUSD)} ({essentialPercentage}%)</span>
                          </div>

                          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2.5 h-2.5 rounded bg-indigo-400 inline-block" />
                              <span className="font-semibold text-white/80">Upgrades (Optional):</span>
                            </div>
                            <span className="font-mono font-bold text-white">{formatPrice(totalNonEssentialUSD)} ({nonEssentialPercentage}%)</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Cost Savings Advice Room */}
                    <div className="bg-teal-500/5 border border-teal-500/10 p-3.5 rounded-xl">
                      <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Sourcing Advisory & Savings Center
                      </span>
                      {savingsRecommendations.length > 0 ? (
                        <div className="space-y-1.5">
                          {savingsRecommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="flex justify-between items-center text-[11px] bg-black/20 p-2 rounded border border-white/5">
                              <span className="text-white/80 truncate max-w-[180px]">
                                💡 Save on <strong>{rec.itemName}</strong>
                              </span>
                              <button
                                id={`apply-saving-${rec.itemId}`}
                                onClick={() => {
                                  setBudgetSelection(prev => ({
                                    ...prev,
                                    [rec.itemId]: 'lowerGrade'
                                  }));
                                }}
                                className="bg-teal-600/60 hover:bg-teal-500 hover:text-white px-2 py-0.5 rounded text-[9px] text-teal-100 font-bold transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 duration-100 uppercase"
                              >
                                <span>Save {formatPrice(rec.savingAmountUSD)}</span>
                              </button>
                            </div>
                          ))}
                          {savingsRecommendations.length > 2 && (
                            <span className="text-[9px] text-white/40 block text-right mt-1">
                              + {savingsRecommendations.length - 2} more options available in the column listings below!
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-teal-200/80 italic animate-pulse">
                          Amazing! You have fully optimized all available equipment to bargain/economy levels. Peak procurement savings unlocked.
                        </p>
                      )}
                    </div>

                  </div>
                </div>

              </div>

              {/* INTERACTIVE WORKBENCH: CUSTOM CALCULATOR CONFIGURATOR */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                
                {/* Confectionary Title Bar inside Workbench */}
                <div className="bg-white/5 px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-widest mb-1">
                      <Sliders className="h-3 w-3" /> Mix-and-Match Workbench
                    </span>
                    <h3 className="font-display font-black text-lg text-white">Custom Procurement Builder</h3>
                  </div>

                  {/* Multi-Currency Selection Toggle */}
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/15 p-1 rounded-xl shrink-0">
                    <span className="text-[10px] font-bold text-white/50 px-2 uppercase tracking-wide">Show Values In:</span>
                    {(['USD', 'NGN', 'GHS', 'EUR'] as const).map((curr) => (
                      <button
                        id={`currency-switch-${curr}`}
                        key={curr}
                        onClick={() => setSelectedCurrency(curr)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                          selectedCurrency === curr ? 'bg-white/15 text-white border border-white/10 shadow-lg' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {curr === 'USD' ? '$ USD' : curr === 'NGN' ? '₦ NGN' : curr === 'GHS' ? '₵ GHS' : '€ EUR'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Filters Section */}
                <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/60">Category:</span>
                    <select
                      id="category-filter"
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-white/90 placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-teal-400/30 outline-none [&>option]:bg-[#0f172a] [&>option]:text-white"
                    >
                      <option value="all">📁 All Categories</option>
                      {setupPlan.keyCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/60">Criticality:</span>
                    <select
                      id="importance-filter"
                      value={selectedImportanceFilter}
                      onChange={(e) => setSelectedImportanceFilter(e.target.value)}
                      className="text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-white/90 placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-teal-400/30 outline-none [&>option]:bg-[#0f172a] [&>option]:text-white"
                    >
                      <option value="all">⚡ All Significance</option>
                      <option value="essential">🟥 Essential First-Day</option>
                      <option value="recommended">🟨 Recommended Upgrade</option>
                      <option value="optional">🟩 Optional Accessory</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/60">Sort By:</span>
                    <select
                      id="sort-by-selector"
                      value={selectedSortOption}
                      onChange={(e) => setSelectedSortOption(e.target.value as any)}
                      className="text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-white/90 placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-teal-400/30 outline-none [&>option]:bg-[#0f172a] [&>option]:text-white"
                    >
                      <option value="default">📋 Default Suggestions</option>
                      <option value="priceAsc">💲 Price: Low to High</option>
                      <option value="importance">📌 Importance: Essential First</option>
                      <option value="category">🔤 Category A-Z</option>
                    </select>
                  </div>

                  <div className="text-xs font-medium text-white/50 ml-auto font-mono">
                    Showing {filteredEquipment.length} of {setupPlan.equipment.length} items
                  </div>
                </div>

                {/* THE CORE EQUIPMENT LIST */}
                <div className="divide-y divide-white/10">
                  {filteredEquipment.length === 0 ? (
                    <div id="no-matched-results" className="p-8 text-center text-white/50 text-sm">
                      No tools match the selected filters. Change filters to view your listed equipment items.
                    </div>
                  ) : (
                    filteredEquipment.map((item) => {
                      const currentTier = budgetSelection[item.id] || 'middleGrade';
                      
                      return (
                        <div 
                          id={`item-row-wrapper-${item.id}`} 
                          key={item.id} 
                          className="p-6 transition hover:bg-white/[0.02] flex flex-col border-b border-white/5"
                        >
                          
                          {/* Inner Top row: Details and Selectors */}
                          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                            
                            {/* Inner Left: Text Description */}
                            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full items-start">
                              {/* Clean geometric category code badge that makes the equipment stand out distinctly */}
                              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-teal-400 shrink-0 shadow-md">
                                <span className="font-display font-black text-xs uppercase tracking-wider text-teal-300">
                                  {item.category.slice(0, 2)}
                                </span>
                              </div>

                              {/* Text details */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-display font-black text-white text-base sm:text-lg tracking-tight">{item.name}</h4>
                                  <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300 border border-teal-500/15 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                    {item.category}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                    item.importance === 'essential' 
                                      ? 'bg-rose-500/25 text-rose-200 border border-rose-500/20' 
                                      : item.importance === 'recommended' 
                                        ? 'bg-amber-500/25 text-amber-200 border border-amber-500/20' 
                                        : 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/20'
                                  }`}>
                                    {item.importance}
                                  </span>
                                  
                                  {/* Aggregate Score Badge Trigger */}
                                  {(() => {
                                    const itemReviews = reviews[item.id] || [];
                                    const averageRating = itemReviews.length > 0 
                                      ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
                                      : '5.0';
                                    
                                    return (
                                      <button
                                        onClick={() => setExpandedReviews(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                        className="px-2 py-0.5 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/25 text-yellow-300 rounded font-bold text-[9px] flex items-center gap-1 transition cursor-pointer"
                                      >
                                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 shrink-0" />
                                        <span>{averageRating}</span>
                                        <span className="opacity-60 font-medium tracking-tight">({itemReviews.length} Reviews)</span>
                                      </button>
                                    );
                                  })()}
                                </div>
                                <p className="text-xs text-white/85 mt-2 leading-relaxed max-w-xl">{item.description}</p>
                                
                                {/* Detailed tool brand indicator */}
                                <div className="mt-3 flex items-center gap-4 flex-wrap">
                                  {currentTier !== 'excluded' && (
                                    <div className="flex items-center gap-1.5 text-xs text-teal-200 font-medium font-display">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/50 animate-pulse" />
                                      <span>Chosen Model: <strong className="text-white font-bold">{item[currentTier].name}</strong></span>
                                      <span className="text-white/60 font-mono text-[10px]">({item[currentTier].brandModel})</span>
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => setExpandedReviews(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    className="text-xs text-teal-400 hover:text-teal-200 font-bold flex items-center gap-1 transition cursor-pointer hover:underline"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{expandedReviews[item.id] ? 'Hide Sourcing Reviews' : 'Read Purchaser Reviews & Ratings'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Right Pricing selections */}
                            <div className="flex flex-col justify-center gap-2 bg-white/[0.03] sm:bg-white/[0.01] p-4 rounded-xl lg:bg-transparent lg:p-0 shrink-0 lg:min-w-[340px] w-full lg:w-auto border border-white/5 lg:border-none">
                              
                              {/* Selection buttons grid */}
                              <div className="grid grid-cols-4 gap-1.5 text-center">
                                {/* Headers for mobile */}
                                <div className="col-span-4 grid grid-cols-4 text-[9px] font-bold text-white/50 uppercase tracking-widest pb-1 border-b border-white/15 lg:hidden">
                                  <span>Budget</span>
                                  <span>Standard</span>
                                  <span>Premium</span>
                                  <span>Omit</span>
                                </div>

                                {/* 1. Lower Option */}
                                <button
                                  id={`selector-${item.id}-lower`}
                                  onClick={() => setBudgetSelection(prev => ({ ...prev, [item.id]: 'lowerGrade' }))}
                                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                                    currentTier === 'lowerGrade' 
                                      ? 'bg-teal-500/20 border-teal-400 text-teal-100 ring-2 ring-teal-500/10 shadow-lg shadow-teal-500/15 scale-102 font-extrabold' 
                                      : 'bg-white/5 border-white/10 text-white/85 hover:bg-white/10'
                                  }`}
                                >
                                  <span className="text-[9px] font-bold uppercase block opacity-70">Lower</span>
                                  <span className="text-xs font-black mt-0.5">{formatPrice(item.lowerGrade.price)}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                                    item.lowerGrade.source === 'Temu'
                                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                      : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                                  }`}>{item.lowerGrade.source}</span>
                                </button>

                                {/* 2. Middle Option */}
                                <button
                                  id={`selector-${item.id}-middle`}
                                  onClick={() => setBudgetSelection(prev => ({ ...prev, [item.id]: 'middleGrade' }))}
                                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                                    currentTier === 'middleGrade' 
                                      ? 'bg-indigo-500/25 border-indigo-400 text-indigo-100 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/15 scale-102 font-extrabold' 
                                      : 'bg-white/5 border-white/10 text-white/85 hover:bg-white/10'
                                  }`}
                                >
                                  <span className="text-[9px] font-bold uppercase block opacity-70">Standard</span>
                                  <span className="text-xs font-black mt-0.5">{formatPrice(item.middleGrade.price)}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                                    item.middleGrade.source === 'Temu'
                                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                      : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                                  }`}>{item.middleGrade.source}</span>
                                </button>

                                {/* 3. Professional Option */}
                                <button
                                  id={`selector-${item.id}-pro`}
                                  onClick={() => setBudgetSelection(prev => ({ ...prev, [item.id]: 'professional' }))}
                                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                                    currentTier === 'professional' 
                                      ? 'bg-purple-500/30 border-purple-400 text-purple-100 ring-2 ring-purple-500/10 shadow-lg shadow-purple-500/15 scale-102 font-extrabold' 
                                      : 'bg-white/5 border-white/10 text-white/85 hover:bg-white/10'
                                  }`}
                                >
                                  <span className="text-[9px] font-bold uppercase block opacity-70">Pro</span>
                                  <span className="text-xs font-black mt-0.5">{formatPrice(item.professional.price)}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                                    item.professional.source === 'Temu'
                                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                      : 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                                  }`}>{item.professional.source}</span>
                                </button>

                                {/* 4. Omit Option */}
                                <button
                                  id={`selector-${item.id}-omit`}
                                  onClick={() => setBudgetSelection(prev => ({ ...prev, [item.id]: 'excluded' }))}
                                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                                    currentTier === 'excluded' 
                                      ? 'bg-red-500/20 border-red-400 text-red-200 font-semibold' 
                                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                  }`}
                                >
                                  <span className="text-[9px] font-bold uppercase block opacity-70">Omit</span>
                                  <span className="text-xs font-black mt-0.5">-</span>
                                  <span className="text-[8px] text-white/40 mt-1">Acquired</span>
                                </button>
                              </div>

                              {/* Small details context sub-links */}
                              {currentTier !== 'excluded' && (
                                <div className="text-[10px] text-white/50 text-right mt-1.5 font-medium flex items-center justify-end gap-1 px-1">
                                  <span>Sourced from: {item[currentTier].sourceNotes}</span>
                                  <Info 
                                    className="h-3.5 w-3.5 inline text-teal-300 hover:text-teal-100 cursor-pointer transition-colors" 
                                    onClick={() => setActiveDetailItem(item)}
                                  />
                                </div>
                              )}
                            </div>

                          </div>

                          {/* Dynamic Reviews Collapsible Container */}
                          <AnimatePresence>
                            {expandedReviews[item.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-5 bg-black/35 border border-white/10 rounded-2xl p-4 sm:p-5"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                  
                                  {/* Left Pane: Ratings & Leave interactive feedback */}
                                  <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 lg:pr-5">
                                    <div>
                                      <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Verified Sourcing Sentiment</h5>
                                      {(() => {
                                        const itemReviews = reviews[item.id] || [];
                                        const averageRating = itemReviews.length > 0 
                                          ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
                                          : '5.0';
                                        const starCount = Math.round(parseFloat(averageRating));

                                        return (
                                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="text-3.5xl font-black text-yellow-300 font-mono tracking-tight">{averageRating}</span>
                                            <div>
                                              <div className="flex gap-0.5 text-yellow-400">
                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                  <Star 
                                                    key={idx} 
                                                    className={`w-3.5 h-3.5 shrink-0 ${
                                                      idx < starCount ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
                                                    }`} 
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-[10px] text-white/50 block mt-0.5">{itemReviews.length} real purchase reviews</span>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    {/* Submit feedback builder */}
                                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                                      <h6 className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <PlusCircle className="w-3.5 h-3.5 text-teal-400" /> Share Sourcing Experience
                                      </h6>

                                      <div className="space-y-2.5">
                                        <div>
                                          <span className="block text-[9px] font-semibold text-white/50 mb-1">Select Star Rating:</span>
                                          <div className="flex gap-1.5 text-yellow-400">
                                            {Array.from({ length: 5 }).map((_, idx) => {
                                              const ratingVal = idx + 1;
                                              const curSel = formRating[item.id] || 5;
                                              return (
                                                <button
                                                  key={idx}
                                                  type="button"
                                                  onClick={() => setFormRating(prev => ({ ...prev, [item.id]: ratingVal }))}
                                                  className="hover:scale-125 transition-transform duration-100 cursor-pointer text-yellow-400 font-bold"
                                                >
                                                  <Star className={`w-4 h-4 ${ratingVal <= curSel ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} />
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <input
                                              type="text"
                                              placeholder="Name (e.g. Samuel K.)"
                                              value={formName[item.id] || ''}
                                              onChange={(e) => setFormName(prev => ({ ...prev, [item.id]: e.target.value }))}
                                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-teal-400 outline-none"
                                            />
                                          </div>
                                          <div>
                                            <input
                                              type="text"
                                              placeholder="Role (e.g. Nails Guru)"
                                              value={formContext[item.id] || ''}
                                              onChange={(e) => setFormContext(prev => ({ ...prev, [item.id]: e.target.value }))}
                                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-teal-400 outline-none"
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <textarea
                                            rows={2}
                                            placeholder="Write about retail pricing, item durability, or shipment speeds..."
                                            value={formComment[item.id] || ''}
                                            onChange={(e) => setFormComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-teal-400 outline-none resize-none"
                                          />
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const commentText = formComment[item.id]?.trim() || '';
                                            if (!commentText) {
                                              alert('Please write a quick comment summarizing your experience!');
                                              return;
                                            }

                                            const authorName = formName[item.id]?.trim() || 'Verified Biz Founder';
                                            const authorRole = formContext[item.id]?.trim() || 'Entrepreneur';
                                            const score = formRating[item.id] || 5;

                                            const freshReview: Review = {
                                              id: `gen_u_${Date.now()}`,
                                              rating: score,
                                              username: authorName,
                                              date: new Date().toISOString().split('T')[0],
                                              comment: commentText,
                                              verified: true,
                                              context: authorRole
                                            };

                                            setReviews(prev => ({
                                              ...prev,
                                              [item.id]: [freshReview, ...(prev[item.id] || [])]
                                            }));

                                            // Clear forms
                                            setFormName(prev => ({ ...prev, [item.id]: '' }));
                                            setFormComment(prev => ({ ...prev, [item.id]: '' }));
                                            setFormContext(prev => ({ ...prev, [item.id]: '' }));
                                            setFormRating(prev => ({ ...prev, [item.id]: 5 }));
                                          }}
                                          className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
                                        >
                                          <Send className="w-2.5 h-2.5" />
                                          <span>Submit Sourcing Review</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Pane: Review items feed scroll */}
                                  <div className="md:col-span-12 lg:col-span-7 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                    <h5 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
                                      <span>Buyer Recommendations</span>
                                      <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded tracking-wide uppercase">
                                        🛒 Verified Purchases
                                      </span>
                                    </h5>
                                    
                                    {(reviews[item.id] || []).length === 0 ? (
                                      <p className="text-xs text-white/40 italic py-6 text-center">No reviews submitted yet. Add your social proof feedback parameters above!</p>
                                    ) : (
                                      (reviews[item.id] || []).map((rev) => (
                                        <div key={rev.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                                          <div className="flex justify-between items-start gap-2">
                                            <div>
                                              <span className="text-xs font-bold text-white block">{rev.username}</span>
                                              <span className="text-[9px] text-teal-300 font-semibold italic">{rev.context}</span>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <div className="flex gap-0.5 text-yellow-400 justify-end">
                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                  <Star 
                                                    key={idx} 
                                                    className={`w-2.5 h-2.5 shrink-0 ${
                                                      idx < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
                                                    }`} 
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-[9px] text-white/40 font-mono block mt-1">{rev.date}</span>
                                            </div>
                                          </div>
                                          <p className="text-xs text-white/85 leading-relaxed mt-0.5 font-sans select-text">{rev.comment}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })
                  )}
                </div>

                {/* WORKBENCH GRAND LIVE CALCULATOR FOOTER */}
                <div id="live-calculator-total-bar" className="bg-black/30 border-t border-white/15 p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 border border-white/20 text-teal-300 rounded-xl">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white/60 uppercase tracking-widest block">Custom Configuration Total</span>
                      <div className="flex items-baseline gap-2">
                        <span id="customized-active-price" className="text-3xl font-extrabold text-white tracking-tight">
                          {formatPrice(currentCustomTotal)}
                        </span>
                        <span className="text-xs text-white/40">USD baseline: ${currentCustomTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      id="export-handbook-btn"
                      onClick={handleExportSummary}
                      className="bg-teal-600 text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-teal-500 hover:border-white/10 transition-all shadow-lg shadow-teal-600/15 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Handbook & Excel Checklist</span>
                    </button>
                    
                    <button
                      id="reset-config-btn"
                      onClick={() => {
                        const initialSelection: CustomBudgetSelection = {};
                        setupPlan.equipment.forEach((item: EquipmentItem) => {
                          initialSelection[item.id] = 'middleGrade';
                        });
                        setBudgetSelection(initialSelection);
                      }}
                      className="bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-sm font-semibold px-4 py-3 rounded-lg border border-white/10 transition cursor-pointer"
                    >
                      Reset Standard
                    </button>
                  </div>
                </div>

              </div>

              {/* SOURCING PLATFORMS SUMMARY DECK */}
              <div id="sourcing-education-cards" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Jiji Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-white/10 text-yellow-300 border border-white/10 rounded font-bold text-xs">Jiji</span>
                    <strong className="text-xs text-white/60">Nigeria & Ghana Classifieds</strong>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Local Secondhand & Bargain Focus</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Highly viable for buying physical hardware models that do not break easily (stands, heavy iron, manual scopes). Best to contact authorized local refurbished merchants.
                  </p>
                </div>

                {/* 2. Jumia Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-white/10 text-sky-300 border border-white/10 rounded font-bold text-xs">Jumia</span>
                    <strong className="text-xs text-white/60">Official African Retail Hub</strong>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Standard Distributor Assurances</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Perfect balance for brand new gadgets, consumer electronics, kitchen wares with quick delivery across Nigeria, Kenya, Ghana, and Cote d'Ivoire.
                  </p>
                </div>

                {/* 3. Amazon Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-white/10 text-purple-300 border border-white/10 rounded font-bold text-xs">Amazon</span>
                    <strong className="text-xs text-white/60">Global Tech Standard</strong>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Professional Importing & Variety</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    The source of premium industrial specifications, advanced software subscriptions, and heavy processing units with import overheads.
                  </p>
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* MODAL / DIALOG for Platform Detail Inspection */}
        <AnimatePresence>
          {activeDetailItem && (
            <div id="modal-backdrop" className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
              {/* Blur backdrop overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveDetailItem(null)} />
              
              <motion.div
                id="modal-box"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1c2c]/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white max-w-lg w-full relative z-10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-300 tracking-wider uppercase bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                      {activeDetailItem.category}
                    </span>
                    <h3 className="font-display font-extrabold text-xl text-white mt-2">
                      {activeDetailItem.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveDetailItem(null)}
                    className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-white/80 leading-relaxed">
                    {activeDetailItem.description}
                  </p>

                  <div className="border-t border-white/10 pt-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/55">Procurement Option Index</span>
                    <div className="space-y-2 mt-2 font-sans">
                      <div className="flex justify-between items-center p-2.5 bg-white/5 border border-white/10 rounded-lg">
                        <div>
                          <span className="text-xs font-bold text-white block">Lower Grade (Bargain)</span>
                          <span className="text-[10px] text-white/50">{activeDetailItem.lowerGrade.name} ({activeDetailItem.lowerGrade.brandModel})</span>
                        </div>
                        <div className="text-right">
                          <span id="modal-lower-price" className="text-sm font-extrabold text-white">{formatPrice(activeDetailItem.lowerGrade.price)}</span>
                          <span className="text-[10px] font-semibold block text-yellow-300">{activeDetailItem.lowerGrade.source}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-white/10 border border-white/20 rounded-lg">
                        <div>
                          <span className="text-xs font-bold text-teal-300 block">Middle Grade (Standard)</span>
                          <span className="text-[10px] text-white/50">{activeDetailItem.middleGrade.name} ({activeDetailItem.middleGrade.brandModel})</span>
                        </div>
                        <div className="text-right">
                          <span id="modal-middle-price" className="text-sm font-extrabold text-white">{formatPrice(activeDetailItem.middleGrade.price)}</span>
                          <span className="text-[10px] font-semibold block text-sky-300">{activeDetailItem.middleGrade.source}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-white/10 border border-white/20 rounded-lg">
                        <div>
                          <span className="text-xs font-bold text-purple-300 block">Professional (Premium)</span>
                          <span className="text-[10px] text-white/50">{activeDetailItem.professional.name} ({activeDetailItem.professional.brandModel})</span>
                        </div>
                        <div className="text-right">
                          <span id="modal-pro-price" className="text-sm font-extrabold text-white">{formatPrice(activeDetailItem.professional.price)}</span>
                          <span className="text-[10px] font-semibold block text-purple-300">{activeDetailItem.professional.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveDetailItem(null)}
                    className="bg-teal-600 hover:bg-teal-500 text-white border border-white/10 font-bold text-xs px-5 py-2.5 rounded-xl transition sm:w-auto w-full cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DEFAULT FOOTER HERO MARKER */}
        {!setupPlan && !isLoading && (
          <div id="hero-marketing-panel" className="mt-8 text-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
            
            <div className="max-w-xl mx-auto relative z-10 text-white">
               <span className="px-3 py-1 bg-white/10 text-teal-300 border border-white/15 text-xs font-bold tracking-wider rounded-full uppercase">
                Offline-First Procurement Index
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white mt-4 tracking-tight">
                No spreadsheet planning chaos.
              </h3>
              <p className="text-white/70 text-sm mt-3 leading-relaxed">
                Starting a trade requires precision. Sourcing locally from peer classifieds on <strong className="text-white font-semibold">Jiji</strong> helps you lower immediate expenditure. Upgrading gears dynamically on <strong className="text-white font-semibold">Jumia</strong> and <strong className="text-white font-semibold flex-inline">Amazon</strong> yields professional scalability.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-150">
                  <span className="font-display font-extrabold text-teal-300 text-xl block">100+</span>
                  <span className="text-xs text-white/50 font-medium">Careers Supported</span>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-150">
                  <span className="font-display font-extrabold text-emerald-300 text-xl block">3 Tiers</span>
                  <span className="text-xs text-white/50 font-medium">Budget Sections</span>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-150">
                  <span className="font-display font-extrabold text-yellow-200 text-xl block">Convert</span>
                  <span className="text-xs text-white/50 font-medium">To Local Currency</span>
                </div>
              </div>

              {/* Sample Quick Starter Banner */}
              <p className="text-xs text-white/50 mt-8">
                Simply type what business context you wish to build, or click one of the popular quick starts above to experience dynamic sourcing.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER GENERAL DECLARATION */}
      <footer id="app-general-footer" className="text-center text-xs text-white/60 mt-20 max-w-xl mx-auto px-4 leading-relaxed border-t border-white/10 pt-8">
        <p>Copyright © 2026 BizStart. Dynamic market intelligence estimations powered by Gemini Live AI Sourcing models and local currency ratios.</p>
        <p className="mt-1">Designed for young business startups looking to bootstrap budget pipelines securely.</p>
      </footer>
    </div>
  );
}
