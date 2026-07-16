/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Trash2, X, Percent, Check, AlertCircle, Phone, MapPin, CreditCard, 
  Sparkles, ShieldCheck, Heart, ArrowRight, HelpCircle, Building2, GitCompare,
  Copy, Search, Info, QrCode, Mic, MicOff, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar.js';
import Hero from './components/Hero.js';
import ProductCard from './components/ProductCard.js';
import ProductDetailModal from './components/ProductDetailModal.js';
import RepairBooking from './components/RepairBooking.js';
import TradeInSystem from './components/TradeInSystem.js';
import BlogSystem from './components/BlogSystem.js';
import AIChatbot from './components/AIChatbot.js';
import Dashboard from './components/Dashboard.js';
import AdminPanel from './components/AdminPanel.js';
import ARViewModal from './components/ARViewModal.js';
import BulkInquiryModal from './components/BulkInquiryModal.js';
import ProductComparisonModal from './components/ProductComparisonModal.js';
import QRScannerModal from './components/QRScannerModal.js';
import GmailHub from './components/GmailHub.js';
import { Product, BlogPost, Coupon, Order, RepairRequest, TradeInRequest, CartItem, BulkInquiry } from './types.js';

export default function App() {
  // Navigation & Theme State
  const [currentTab, setCurrentTab] = useState<'shop' | 'repair' | 'tradein' | 'blog' | 'gmail'>('shop');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');

  // API Hydrated States
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [tradeins, setTradeInRequests] = useState<TradeInRequest[]>([]);

  // Wishlist State
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart Drawer & Coupon State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Checkout Flow Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('Accra');
  const [deliveryOption, setDeliveryOption] = useState<'Standard Accra Dispatch' | 'Expedited Motorcycle Courier' | 'In-Store Pickup'>('Standard Accra Dispatch');
  const [paymentProvider, setPaymentProvider] = useState<'MTN MoMo' | 'Telecel Cash' | 'Credit Card' | 'Cash on Delivery'>('MTN MoMo');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutSuccessCode, setCheckoutSuccessCode] = useState<string | null>(null);
  const [checkoutTouched, setCheckoutTouched] = useState({
    name: false,
    phone: false,
    email: false,
    address: false,
    city: false,
  });

  // Comparison & Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [arProduct, setArProduct] = useState<Product | null>(null);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInquiries, setBulkInquiries] = useState<BulkInquiry[]>([]);

  // Search Assistance & Insights States
  const [isSearchAssistOpen, setIsSearchAssistOpen] = useState(false);
  const [showSearchInsights, setShowSearchInsights] = useState(false);
  const [searchCopyFeedback, setSearchCopyFeedback] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Voice Search / Speech Recognition States
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [voiceSpeechText, setVoiceSpeechText] = useState('');
  const [voiceSearchError, setVoiceSearchError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Geolocation States
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectionError, setLocationDetectionError] = useState<string | null>(null);
  const [locationDetectionSuccess, setLocationDetectionSuccess] = useState<string | null>(null);

  // Trending Keywords state with counts and trends
  const [trendingKeywords, setTrendingKeywords] = useState([
    { label: 'iPhone 15', value: 'iPhone 15', count: 342, trend: 'up' as 'up' | 'down' | 'stable' },
    { label: 'Galaxy S24', value: 'S24', count: 215, trend: 'up' as 'up' | 'down' | 'stable' },
    { label: 'Pixel 8', value: 'Pixel 8', count: 189, trend: 'stable' as 'up' | 'down' | 'stable' },
    { label: 'MacBook', value: 'MacBook', count: 403, trend: 'up' as 'up' | 'down' | 'stable' },
    { label: 'Anker', value: 'Anker', count: 156, trend: 'down' as 'up' | 'down' | 'stable' },
  ]);

  const registerTrendInteraction = (term: string) => {
    if (!term) return;
    setTrendingKeywords(prev => {
      return prev.map(item => {
        const isMatch = term.toLowerCase().includes(item.value.toLowerCase()) || 
                        item.value.toLowerCase().includes(term.toLowerCase());
        if (isMatch) {
          const newCount = item.count + 1;
          let newTrend: 'up' | 'down' | 'stable' = item.trend;
          if (newCount > item.count) {
            newTrend = 'up';
          }
          return {
            ...item,
            count: newCount,
            trend: newTrend
          };
        }
        return item;
      });
    });
  };

  // Recent Searches State & Persistence Function
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('immortal_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 3);
      try {
        localStorage.setItem('immortal_recent_searches', JSON.stringify(next));
      } catch (e) {
        console.error('Error saving recent searches:', e);
      }
      return next;
    });
  };

  // Auto-save search queries with custom debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      saveRecentSearch(trimmed);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset active suggestion index when searchQuery changes or suggestions close
  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [searchQuery, showInlineSuggestions]);

  // Real-time checkout validation helpers (Derived State)
  const nameError = (() => {
    const val = checkoutName.trim();
    if (!val) return 'Recipient name is required.';
    if (val.length < 3) return 'Name is too short (minimum 3 characters).';
    if (!/^[a-zA-Z\s\-'\u00C0-\u017F]+$/.test(val)) return 'Name should only contain letters and spaces.';
    return null;
  })();

  const phoneError = (() => {
    const val = checkoutPhone.trim();
    if (!val) return 'Ghanaian phone number is required.';
    
    const cleanPhone = val.replace(/[\s\-()]/g, '');
    
    if (cleanPhone.startsWith('0')) {
      if (cleanPhone.length !== 10) {
        return `Local number must be exactly 10 digits (currently ${cleanPhone.length}).`;
      }
      if (!/^0(20|23|24|25|26|27|28|30|50|53|54|55|56|57|59|29|58)[0-9]{7}$/.test(cleanPhone)) {
        return 'Enter a valid Ghanaian mobile prefix (e.g. starting with 024, 020, 055).';
      }
      return null;
    }
    
    if (cleanPhone.startsWith('+233') || cleanPhone.startsWith('233')) {
      const digitsOnly = cleanPhone.replace('+', '');
      if (digitsOnly.length !== 12) {
        return `International format must be 12 digits (currently ${digitsOnly.length}).`;
      }
      if (!/^233(20|23|24|25|26|27|28|30|50|53|54|55|56|57|59|29|58)[0-9]{7}$/.test(digitsOnly)) {
        return 'Invalid carrier prefix after 233 country code.';
      }
      return null;
    }
    
    return 'Phone number must start with 0 (local) or +233 / 233 (international).';
  })();

  const emailError = (() => {
    const val = checkoutEmail.trim();
    if (!val) return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address (e.g., alhassan@gmail.com).';
    return null;
  })();

  const addressError = (() => {
    const val = checkoutAddress.trim();
    if (!val) return 'Delivery address is required.';
    if (val.length < 8) return 'Complete address required (e.g. Street name, House No., or Landmark).';
    return null;
  })();

  const cityError = (() => {
    const val = checkoutCity.trim();
    if (!val) return 'City or location is required.';
    if (val.length < 3) return 'City/location must be at least 3 characters.';
    return null;
  })();

  // Reset checkout touched state on modal close
  useEffect(() => {
    if (!isCheckoutOpen) {
      setCheckoutTouched({
        name: false,
        phone: false,
        email: false,
        address: false,
        city: false,
      });
    }
  }, [isCheckoutOpen]);

  const getInlineSuggestions = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    
    const results: {
      id: string;
      text: string;
      type: 'product' | 'brand';
      subtitle?: string;
      priceGHS?: number;
      priceUSD?: number;
      product?: Product;
    }[] = [];
    const seen = new Set<string>();

    // First find brand matches
    products.forEach(p => {
      const brandLower = p.brand.toLowerCase();
      if (brandLower.includes(query) && !seen.has(`brand:${p.brand}`)) {
        seen.add(`brand:${p.brand}`);
        results.push({
          id: `brand-${p.brand}`,
          text: p.brand,
          type: 'brand',
          subtitle: 'Brand'
        });
      }
    });

    // Then find product matches
    products.forEach(p => {
      const nameLower = p.name.toLowerCase();
      if (nameLower.includes(query) && !seen.has(`prod:${p.id}`)) {
        seen.add(`prod:${p.id}`);
        results.push({
          id: `prod-${p.id}`,
          text: p.name,
          type: 'product',
          subtitle: p.category,
          priceGHS: p.priceGHS,
          priceUSD: p.priceUSD,
          product: p
        });
      }
    });

    return results.slice(0, 6);
  };

  // Toggle Voice-to-Text Speech Recognition
  const toggleVoiceSearch = () => {
    if (isVoiceSearchActive) {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (e) {
          console.warn("Error stopping recognition:", e);
        }
      }
      setIsVoiceSearchActive(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSearchError("Web Speech API is not natively supported in this browser environment. Showing voice simulator mode.");
      setIsVoiceSearchActive(true);
      setVoiceSpeechText('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceSearchActive(true);
        setVoiceSpeechText('');
        setVoiceSearchError(null);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition warning/error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceSearchError("Microphone access denied. Try the diagnostic voice-to-text simulator options below.");
        } else {
          setVoiceSearchError(`Speech error: ${event.error}. Use the simulator buttons below.`);
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => (result as any)[0])
          .map((result: any) => result.transcript)
          .join('');
        setVoiceSpeechText(transcript);
        setSearchQuery(transcript);
        setIsSearchAssistOpen(true);
      };

      recognition.onend = () => {
        setIsVoiceSearchActive(false);
      };

      setRecognitionInstance(recognition);
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to initiate Web Speech API:", err);
      setVoiceSearchError("Microphone startup failed. Feel free to use the quick simulation options.");
      setIsVoiceSearchActive(true);
      setVoiceSpeechText('');
    }
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationDetectionError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    setLocationDetectionError(null);
    setLocationDetectionSuccess(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'ImmortalElectronicsECommerceApp/1.0'
              }
            }
          );
          if (!response.ok) throw new Error("Reverse geocoding request failed.");
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "Accra";
            const region = addr.region || addr.state || addr.county || "Greater Accra";
            const suburb = addr.suburb || addr.neighbourhood || addr.quarter || "";
            const road = addr.road || "";
            
            setCheckoutCity(city);
            
            // Build suggested street address
            let suggestedAddress = '';
            if (road) suggestedAddress += road;
            if (suburb) {
              suggestedAddress += (suggestedAddress ? `, ${suburb}` : suburb);
            }
            if (region) {
              suggestedAddress += (suggestedAddress ? `, ${region}` : region);
            }
            
            if (suggestedAddress) {
              setCheckoutAddress(suggestedAddress);
            }
            
            setLocationDetectionSuccess(`Detected: ${city}, ${region}`);
          } else {
            setCheckoutCity("Accra");
            setCheckoutAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setLocationDetectionSuccess("Location detected via GPS coordinates");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setCheckoutCity("Accra");
          setCheckoutAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationDetectionSuccess("Detected via GPS (reverse lookup failed)");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "Could not detect location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access denied. Please enable location permissions.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Position unavailable. Please try again.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please try again.";
        }
        
        setLocationDetectionError(`${errorMsg} Click below to simulate Ghanaian GPS.`);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Initialize data from API
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resProd, resBlogs, resCoupons, resOrders, resRepairs, resTrade, resInq] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/blogs').then(r => r.json()),
        fetch('/api/coupons').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/repairs').then(r => r.json()),
        fetch('/api/tradeins').then(r => r.json()),
        fetch('/api/bulkinquiries').then(r => r.json()).catch(() => [])
      ]);

      setProducts(resProd);
      setBlogs(resBlogs);
      setCoupons(resCoupons);
      setOrders(resOrders);
      setRepairs(resRepairs);
      setTradeInRequests(resTrade);
      setBulkInquiries(resInq || []);

      // Check URL parameters for search and product sharing link
      try {
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get('search');
        const productParam = params.get('product');
        if (searchParam) {
          setSearchQuery(decodeURIComponent(searchParam));
        }
        if (productParam && resProd) {
          const matchedProduct = resProd.find((p: any) => String(p.id) === String(productParam));
          if (matchedProduct) {
            setSelectedProduct(matchedProduct);
          }
        }
      } catch (paramErr) {
        console.warn('Could not parse shared URL parameters:', paramErr);
      }
    } catch (err) {
      console.error('Error hydrating data:', err);
    }
  };

  const handleBookBulkInquiry = async (inquiryData: any) => {
    const res = await fetch('/api/bulkinquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  const handleUpdateBulkInquiry = async (inquiryId: string, status: string) => {
    const res = await fetch(`/api/bulkinquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  const handleCopySearchQuery = async () => {
    if (!searchQuery) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(searchQuery);
      } else {
        const el = document.createElement('textarea');
        el.value = searchQuery;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setSearchCopyFeedback(true);
      setTimeout(() => setSearchCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy search text:', err);
    }
  };

  const copyShareLink = async (url: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleShareSearch = async () => {
    const query = searchQuery.trim();
    const baseUrl = window.location.origin + window.location.pathname;
    
    let shareUrl = baseUrl;
    let shareTitle = 'Immortal Electronics Ghana';
    let shareText = 'Explore authentic electronics, laptop, smartphone trade-ins, and diagnostics at Immortal Electronics Ghana!';

    if (selectedProduct) {
      shareUrl = `${baseUrl}?product=${encodeURIComponent(selectedProduct.id)}`;
      shareTitle = `${selectedProduct.name} - Immortal Electronics`;
      shareText = `Check out the ${selectedProduct.name} (${selectedProduct.brand}) available at Immortal Electronics!`;
    } else if (query) {
      shareUrl = `${baseUrl}?search=${encodeURIComponent(query)}`;
      shareTitle = `Immortal Electronics Search: "${query}"`;
      shareText = `Browse authentic electronics matching "${query}" at Immortal Electronics!`;
    }
    
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyShareLink(shareUrl);
        }
      }
    } else {
      copyShareLink(shareUrl);
    }
  };

  // Cart Actions
  const handleAddToCart = (product: Product, selectedColor?: string) => {
    const defaultColor = selectedColor || product.colors[0] || 'Default';
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedColor === defaultColor);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.selectedColor === defaultColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedColor: defaultColor }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, selectedColor: string | undefined, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.product.id === productId && item.selectedColor === selectedColor) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, selectedColor: string | undefined) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedColor === selectedColor)));
  };

  // Wishlist Actions
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Coupon Engine
  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = appliedCouponCode.trim().toUpperCase();
    if (!code) return;

    const matched = coupons.find(c => c.code === code && c.active);
    if (!matched) {
      setCouponError('Invalid or expired coupon code.');
      setActiveCoupon(null);
      return;
    }

    // Min spend validation
    const totalGHS = cart.reduce((sum, item) => sum + item.product.priceGHS * item.quantity, 0);
    if (matched.minSpendGHS && totalGHS < matched.minSpendGHS) {
      setCouponError(`This coupon requires a minimum spend of GHS ${matched.minSpendGHS}.`);
      setActiveCoupon(null);
      return;
    }

    setActiveCoupon(matched);
  };

  // Cart calculations
  const deliveryCostGHS = deliveryOption === 'Expedited Motorcycle Courier' ? 55 : deliveryOption === 'In-Store Pickup' ? 0 : 35;
  const subtotalGHS = cart.reduce((sum, item) => sum + item.product.priceGHS * item.quantity, 0);
  const discountGHS = activeCoupon ? Math.round(subtotalGHS * (activeCoupon.discountPercent / 100)) : 0;
  const finalTotalGHS = Math.max(0, subtotalGHS - discountGHS + deliveryCostGHS);

  const subtotalUSD = Math.round(subtotalGHS / 14.5);
  const discountUSD = activeCoupon ? Math.round(subtotalUSD * (activeCoupon.discountPercent / 100)) : 0;
  const deliveryCostUSD = Math.round(deliveryCostGHS / 14.5);
  const finalTotalUSD = Math.max(0, subtotalUSD - discountUSD + deliveryCostUSD);

  // Checkout Action
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to expose any validation errors
    setCheckoutTouched({
      name: true,
      phone: true,
      email: true,
      address: true,
      city: true,
    });

    if (nameError || phoneError || emailError || addressError || cityError) {
      alert('Please check and correct the highlighted fields in the checkout form.');
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const orderPayload = {
        customerName: checkoutName,
        customerPhone: checkoutPhone,
        customerEmail: checkoutEmail,
        address: checkoutAddress,
        city: checkoutCity,
        items: cart,
        totalGHS: finalTotalGHS,
        totalUSD: finalTotalUSD,
        deliveryOption,
        deliveryCostGHS,
        paymentProvider,
        couponApplied: activeCoupon?.code || undefined
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await res.json();
      if (orderData.trackingNumber) {
        setCheckoutSuccessCode(orderData.trackingNumber);
        setCart([]); // Clear cart
        setActiveCoupon(null);
        setAppliedCouponCode('');
        // Refresh orders
        fetchInitialData();
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout processing.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Repair Actions
  const handleBookRepair = async (bookingData: any) => {
    const res = await fetch('/api/repairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const result = await res.json();
    fetchInitialData(); // Refresh API states
    return result;
  };

  const handleTrackRepair = async (trackingCode: string) => {
    const res = await fetch(`/api/repairs/${trackingCode}`);
    if (res.status === 404) return null;
    return await res.json();
  };

  // Trade-In Actions
  const handleTradeInSubmit = async (tradeInData: any) => {
    const res = await fetch('/api/tradeins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeInData)
    });
    const result = await res.json();
    fetchInitialData(); // Refresh states
    return result;
  };

  const handleTrackTradeIn = async (trackingCode: string) => {
    const res = await fetch(`/api/tradeins/${trackingCode}`);
    if (res.status === 404) return null;
    return await res.json();
  };

  // Blog Actions
  const handleBlogComment = async (blogId: string, author: string, text: string) => {
    const res = await fetch(`/api/blogs/${blogId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  const handleBlogLike = async (blogId: string) => {
    const res = await fetch(`/api/blogs/${blogId}/like`, { method: 'POST' });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  // Admin Desk Callbacks
  const handleUpdateStock = async (productId: string, newStock: number) => {
    const res = await fetch(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  const handleUpdateRepair = async (repairId: string, status: any, notes: string, quoteGHS: number) => {
    const res = await fetch(`/api/repairs/${repairId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, quotationGHS: quoteGHS })
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  const handleUpdateTradeIn = async (tradeInId: string, status: any, notes: string, finalOfferGHS: number) => {
    const res = await fetch(`/api/tradeins/${tradeInId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, finalOfferGHS })
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  const handleUpdateOrder = async (orderId: string, status: any) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  const handleCreateCoupon = async (couponData: Coupon) => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    const result = await res.json();
    fetchInitialData();
    return result;
  };

  // Comparison list togglers
  const handleToggleCompare = (product: Product) => {
    setComparisonList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 gadgets at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  // Product searches
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen font-sans antialiased text-gray-900 dark:text-gray-100 ${theme === 'dark' ? 'bg-[#0B0B0B] dark' : 'bg-gray-50'}`}>
      
      {/* Top Notification banner */}
      <div className="bg-[#0066FF] text-white text-center py-2 px-4 text-xs font-semibold tracking-wider flex items-center justify-center space-x-2 relative z-50 animate-pulse">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>Ghana's Premier Tech Station. Visit our Accra Store or Book Repairs Online. We accept Mobile Money (MoMo).</span>
      </div>

      {/* Navigation Header */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => setCurrentTab(tab as any)} 
        currency={currency}
        setCurrency={setCurrency}
        isDarkMode={theme === 'dark'}
        setIsDarkMode={(dark) => setTheme(dark ? 'dark' : 'light')}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        openCart={() => setIsCartOpen(true)}
        openWishlist={() => alert('Your wishlist contains ' + wishlist.length + ' saved gadgets.')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenCustomerDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 pb-20">
        
        {/* SHOP TAB VIEW */}
        {currentTab === 'shop' && (
          <div className="space-y-8">
            <Hero 
              onShopClick={() => document.getElementById('shop-section-anchor')?.scrollIntoView({ behavior: 'smooth' })}
              onRepairClick={() => setCurrentTab('repair')}
              onWhatsAppClick={() => window.open('https://wa.me/233244192834', '_blank')}
              currency={currency}
            />
            
            <div id="shop-section-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Premium Electronics Grid</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Grade-A quality flagship items with up to 1-year store warranties.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Category Buttons */}
                  <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
                    {['All', 'Smartphones', 'Accessories', 'Computing', 'Gaming'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all shrink-0 ${
                          selectedCategory === cat 
                            ? 'bg-[#0066FF] text-white' 
                            : 'bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="flex flex-col space-y-1.5 w-full sm:w-72" id="search-bar-container-with-trending">
                    {/* Trending keywords row */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5" id="trending-keywords-list">
                      <span className="text-[10px] font-black font-mono text-amber-500 uppercase tracking-widest shrink-0">🔥 Trending:</span>
                      {[
                        { label: 'iPhone 15', value: 'iPhone 15' },
                        { label: 'Galaxy S24', value: 'S24' },
                        { label: 'Pixel 8', value: 'Pixel 8' },
                        { label: 'MacBook', value: 'MacBook' },
                        { label: 'Anker', value: 'Anker' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item.value);
                            saveRecentSearch(item.value);
                            setIsSearchAssistOpen(true);
                            // Adjust category to All if no match in current category
                            const matchesInCurrent = products.some(p => 
                              (p.category === selectedCategory || selectedCategory === 'All') &&
                              (p.name.toLowerCase().includes(item.value.toLowerCase()) || 
                               p.brand.toLowerCase().includes(item.value.toLowerCase()))
                            );
                            if (!matchesInCurrent) {
                              setSelectedCategory('All');
                            }
                          }}
                          className={`px-2 py-0.5 bg-gray-100 hover:bg-[#0066FF]/10 hover:text-[#0066FF] dark:bg-gray-850 dark:hover:bg-[#0066FF]/20 text-[10px] font-black font-mono rounded-md text-gray-500 dark:text-gray-400 hover:border-[#0066FF]/30 border border-transparent dark:border-transparent transition-all whitespace-nowrap shrink-0 ${
                            searchQuery.toLowerCase() === item.value.toLowerCase()
                              ? 'bg-[#0066FF]/15 text-[#0066FF] border-[#0066FF]/40'
                              : ''
                          }`}
                          title={`Search "${item.value}"`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full" id="search-bar-parent">
                    {/* Background overlay helper to click-outside to close */}
                    {(isSearchAssistOpen || (showInlineSuggestions && searchQuery.trim() !== '')) && (
                      <div 
                        className="fixed inset-0 z-30 cursor-default" 
                        onClick={() => {
                          setIsSearchAssistOpen(false);
                          setShowInlineSuggestions(false);
                        }} 
                      />
                    )}
                    
                    {/* Share copied feedback toast */}
                    <AnimatePresence>
                      {shareFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          className="absolute right-0 -top-8 bg-emerald-500 text-white text-[10px] font-black font-mono px-2.5 py-1 rounded-md shadow-lg z-50 flex items-center gap-1 border border-emerald-400"
                          id="search-share-feedback-toast"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>LINK COPIED!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative z-40 flex items-center">
                      <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search Apple, Samsung, accessories..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowInlineSuggestions(true);
                          if (!isSearchAssistOpen) setIsSearchAssistOpen(true);
                        }}
                        onFocus={() => {
                          setShowInlineSuggestions(true);
                          setIsSearchAssistOpen(true);
                        }}
                        onKeyDown={(e) => {
                          const suggestions = getInlineSuggestions();
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (suggestions.length > 0) {
                              setActiveSuggestionIndex(prev => {
                                const nextIndex = prev + 1 >= suggestions.length ? 0 : prev + 1;
                                return nextIndex;
                              });
                            }
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (suggestions.length > 0) {
                              setActiveSuggestionIndex(prev => {
                                const nextIndex = prev - 1 < 0 ? suggestions.length - 1 : prev - 1;
                                return nextIndex;
                              });
                            }
                          } else if (e.key === 'Enter') {
                            if (showInlineSuggestions && activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                              e.preventDefault();
                              const selected = suggestions[activeSuggestionIndex];
                              setSearchQuery(selected.text);
                              saveRecentSearch(selected.text);
                              setShowInlineSuggestions(false);
                              registerTrendInteraction(selected.text);
                              if (selected.type === 'product' && selected.product) {
                                setSelectedProduct(selected.product);
                              }
                            } else {
                              saveRecentSearch(searchQuery);
                              setShowInlineSuggestions(false);
                              setIsSearchAssistOpen(false);
                            }
                          } else if (e.key === 'Escape') {
                            setShowInlineSuggestions(false);
                            setIsSearchAssistOpen(false);
                          }
                        }}
                        className="w-full pl-8 pr-20 py-1.5 text-xs bg-gray-100 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-[#0066FF] transition-all"
                        id="shop-search-field"
                      />
                      
                      {/* Share Results/Product Button */}
                      <button
                        type="button"
                        onClick={handleShareSearch}
                        className="absolute right-14 p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-850 transition"
                        title="Share current search results or product page link"
                        id="search-share-btn"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Voice Hands-free Search Button */}
                      <button
                        type="button"
                        onClick={toggleVoiceSearch}
                        className={`absolute right-8 p-1 rounded transition-all ${
                          isVoiceSearchActive 
                            ? 'text-red-500 bg-red-500/10 animate-bounce scale-110 border border-red-500/20' 
                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-850'
                        }`}
                        title="Voice Search (Hands-free)"
                        id="voice-search-mic-btn"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSearchAssistOpen(!isSearchAssistOpen)}
                        className="absolute right-2.5 p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-850 transition"
                        title="Search Assistance Menu"
                        id="search-assist-toggle"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isSearchAssistOpen ? 'text-[#0066FF] animate-pulse' : ''}`} />
                      </button>
                    </div>

                    {/* Interactive Voice Search Overlay Status Box */}
                    <AnimatePresence>
                      {isVoiceSearchActive && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          className="absolute left-0 right-0 mt-1.5 p-3.5 bg-black/95 dark:bg-[#0B0B0B] border border-red-500/30 dark:border-red-500/20 rounded-xl flex flex-col space-y-2 z-50 shadow-2xl"
                          id="voice-search-indicator-card"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono font-bold uppercase tracking-wider">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              <span>Voice Search Active</span>
                            </span>
                            <button
                              onClick={() => setIsVoiceSearchActive(false)}
                              className="text-gray-400 hover:text-white font-mono text-[9px] uppercase border border-gray-800 hover:border-gray-700 px-1.5 py-0.5 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                          
                          <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-800 min-h-[40px] flex items-center">
                            {voiceSpeechText ? (
                              <p className="text-xs text-white italic font-medium">"{voiceSpeechText}"</p>
                            ) : (
                              <p className="text-xs text-gray-500 animate-pulse">Listening... Speak now into your microphone</p>
                            )}
                          </div>

                          {voiceSearchError && (
                            <div className="text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20 leading-relaxed font-mono">
                              ⚠️ {voiceSearchError}
                            </div>
                          )}

                          <div className="pt-2 border-t border-gray-800 space-y-1">
                            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase block tracking-wider">Speech Sandbox Simulator:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'iPhone 15',
                                'S24 Ultra',
                                'MacBook',
                                'Anker Charger',
                                'Sony XM5'
                              ].map((phrase) => (
                                <button
                                  key={phrase}
                                  type="button"
                                  onClick={() => {
                                    setVoiceSpeechText(phrase);
                                    setSearchQuery(phrase);
                                    setIsVoiceSearchActive(false);
                                    setIsSearchAssistOpen(true);
                                  }}
                                  className="px-2 py-0.5 bg-gray-900 hover:bg-[#0066FF] hover:text-white text-gray-400 text-[10px] rounded-md font-mono transition-all border border-gray-850"
                                >
                                  Speak "{phrase}"
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Inline Suggestions Dropdown */}
                    <AnimatePresence>
                      {showInlineSuggestions && searchQuery.trim() !== '' && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.1 }}
                          className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-gray-150 dark:divide-gray-800/60"
                          id="search-inline-suggestions-dropdown"
                        >
                          <div className="p-2 bg-gray-50/50 dark:bg-gray-850/40 flex items-center justify-between text-[10px] font-mono font-bold text-gray-400">
                            <span>Suggestions for "{searchQuery}"</span>
                            <span className="text-[9px] uppercase tracking-wider text-[#0066FF] px-1.5 py-0.5 bg-[#0066FF]/10 rounded">Smart Autocomplete</span>
                          </div>

                          <div className="py-1 max-h-64 overflow-y-auto no-scrollbar">
                            {getInlineSuggestions().length === 0 ? (
                              <div className="p-3 text-center text-xs text-gray-400 font-mono">
                                No direct match found. Press Enter to search anyway.
                              </div>
                            ) : (
                              getInlineSuggestions().map((suggestion, idx) => {
                                const isActive = idx === activeSuggestionIndex;
                                return (
                                  <button
                                    key={suggestion.id}
                                    type="button"
                                    id={`inline-suggestion-item-${idx}`}
                                    onClick={() => {
                                      setSearchQuery(suggestion.text);
                                      saveRecentSearch(suggestion.text);
                                      setShowInlineSuggestions(false);
                                      registerTrendInteraction(suggestion.text);
                                      if (suggestion.type === 'product' && suggestion.product) {
                                        setSelectedProduct(suggestion.product);
                                      }
                                    }}
                                    onMouseEnter={() => setActiveSuggestionIndex(idx)}
                                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all border-l-2 ${
                                      isActive 
                                        ? 'bg-[#0066FF]/10 dark:bg-[#0066FF]/15 border-l-[#0066FF]' 
                                        : 'hover:bg-[#0066FF]/5 dark:hover:bg-[#0066FF]/10 border-l-transparent'
                                    } group`}
                                  >
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      {suggestion.type === 'brand' ? (
                                        <span className={`w-5 h-5 rounded text-gray-500 font-black font-mono text-[9px] flex items-center justify-center border transition-colors ${
                                          isActive ? 'bg-[#0066FF]/15 border-[#0066FF]/30 text-[#0066FF]' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        }`}>B</span>
                                      ) : (
                                        <span className={`w-5 h-5 rounded font-black font-mono text-[9px] flex items-center justify-center border transition-colors ${
                                          isActive ? 'bg-[#0066FF]/25 text-[#0066FF] border-[#0066FF]/40' : 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/25'
                                        }`}>P</span>
                                      )}
                                      <div className="truncate">
                                        <p className={`text-xs font-semibold transition-colors truncate ${
                                          isActive ? 'text-[#0066FF] dark:text-blue-400 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-[#0066FF]'
                                        }`}>
                                          {suggestion.text}
                                        </p>
                                        <span className="text-[10px] font-mono text-gray-400">
                                          {suggestion.subtitle}
                                        </span>
                                      </div>
                                    </div>

                                    {suggestion.type === 'product' && suggestion.priceGHS !== undefined && (
                                      <div className="text-right shrink-0">
                                        <p className="text-xs font-black text-emerald-500 font-mono">
                                          {currency === 'GHS' 
                                            ? `₵ ${suggestion.priceGHS.toLocaleString()}` 
                                            : `$ ${suggestion.priceUSD?.toLocaleString()}`}
                                        </p>
                                        <span className={`text-[8px] font-bold font-mono uppercase px-1 rounded transition-colors ${
                                          isActive ? 'bg-[#0066FF]/15 text-[#0066FF]' : 'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                          {isActive ? 'Select ↵' : 'View Specs'}
                                        </span>
                                      </div>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Assistance Dropdown Menu */}
                    <AnimatePresence>
                      {isSearchAssistOpen && (!showInlineSuggestions || searchQuery.trim() === '') && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 space-y-3.5 z-40"
                          id="search-assistance-menu"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                            <span className="text-[10px] font-mono font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Search Assistance Desk</span>
                            </span>
                            <button
                              onClick={() => setIsSearchAssistOpen(false)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Actions Grid */}
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={handleCopySearchQuery}
                              disabled={!searchQuery}
                              className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 transition group disabled:opacity-40 disabled:pointer-events-none"
                              id="btn-copy-search-query"
                              title="Copy search query to clipboard"
                            >
                              {searchCopyFeedback ? (
                                <Check className="w-4 h-4 text-green-500 mb-1" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#0066FF] group-hover:scale-105 transition-transform mb-1" />
                              )}
                              <span className="text-[9px] font-bold font-mono text-gray-600 dark:text-gray-300">
                                {searchCopyFeedback ? 'Copied!' : 'Copy Query'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setShowSearchInsights(false);
                              }}
                              disabled={!searchQuery}
                              className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 transition group disabled:opacity-40 disabled:pointer-events-none"
                              id="btn-clear-search-query"
                              title="Clear search query"
                            >
                              <X className="w-4 h-4 text-red-500 group-hover:scale-105 transition-transform mb-1" />
                              <span className="text-[9px] font-bold font-mono text-gray-600 dark:text-gray-300">Clear Field</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowSearchInsights(!showSearchInsights)}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition group ${
                                showSearchInsights 
                                  ? 'bg-[#0066FF]/10 border-[#0066FF]/30' 
                                  : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700'
                              }`}
                              id="btn-view-search-insights"
                              title="Toggle query matches and specs info"
                            >
                              <Info className={`w-4 h-4 mb-1 group-hover:scale-105 transition-transform ${showSearchInsights ? 'text-[#0066FF]' : 'text-gray-400'}`} />
                              <span className="text-[9px] font-bold font-mono text-gray-600 dark:text-gray-300">View Details</span>
                            </button>
                          </div>

                          {/* Recent Searches Section */}
                          <div className="space-y-1.5" id="recent-searches-section">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Searches</span>
                              {recentSearches.length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRecentSearches([]);
                                    localStorage.removeItem('immortal_recent_searches');
                                  }}
                                  className="text-[9px] font-bold font-mono text-red-500 hover:text-red-600 uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
                                  id="clear-recent-searches-btn"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            {recentSearches.length === 0 ? (
                              <p className="text-[10px] font-mono text-gray-400 italic py-1">No recent searches yet.</p>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {recentSearches.map((term, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery(term);
                                      saveRecentSearch(term);
                                      if (selectedCategory !== 'All') {
                                        const matchesInCurrent = products.some(p => 
                                          (p.category === selectedCategory || selectedCategory === 'All') &&
                                          (p.name.toLowerCase().includes(term.toLowerCase()) || 
                                           p.brand.toLowerCase().includes(term.toLowerCase()))
                                        );
                                        if (!matchesInCurrent) {
                                          setSelectedCategory('All');
                                        }
                                      }
                                    }}
                                    className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 hover:bg-[#0066FF]/5 dark:bg-black/25 dark:hover:bg-[#0066FF]/10 rounded-lg text-xs font-medium text-gray-750 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-[#0066FF] transition-all border border-gray-100/50 dark:border-gray-800/40 text-left"
                                    id={`recent-search-item-${idx}`}
                                  >
                                    <span className="truncate max-w-[180px]">{term}</span>
                                    <span className="text-[9px] font-mono text-gray-400 font-bold">#{idx + 1}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Predefined Popular Queries / Templates */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Popular Search Filters</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: ' iPhone', term: 'iPhone' },
                                { label: 'Galaxy S23', term: 'Galaxy' },
                                { label: 'EliteBook', term: 'EliteBook' },
                                { label: 'Fast Charger', term: 'Charger' },
                                { label: 'Nintendo', term: 'Nintendo' },
                                { label: 'MacBook', term: 'MacBook' },
                              ].map((item) => (
                                <button
                                  key={item.label}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(item.term);
                                    saveRecentSearch(item.term);
                                    if (selectedCategory !== 'All') {
                                      const matchesInCurrent = products.some(p => 
                                        (p.category === selectedCategory || selectedCategory === 'All') &&
                                        (p.name.toLowerCase().includes(item.term.toLowerCase()) || 
                                         p.brand.toLowerCase().includes(item.term.toLowerCase()))
                                      );
                                      if (!matchesInCurrent) {
                                        setSelectedCategory('All');
                                      }
                                    }
                                  }}
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${
                                    searchQuery.toLowerCase() === item.term.toLowerCase()
                                      ? 'bg-[#0066FF] text-white'
                                      : 'bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Real-time Insights Details Section */}
                          {showSearchInsights && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-3 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-lg text-xs space-y-2 overflow-hidden"
                              id="search-insights-details"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] font-bold text-[#0066FF] uppercase tracking-wider flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  <span>Query Diagnostics</span>
                                </span>
                                <span className="font-mono text-[9px] text-gray-400">
                                  {searchQuery ? `Active Query: "${searchQuery}"` : 'Global Store View'}
                                </span>
                              </div>

                              <div className="space-y-1 text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                <div className="flex justify-between">
                                  <span>Matching Products:</span>
                                  <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length} items</span>
                                </div>
                                
                                {filteredProducts.length > 0 && (
                                  <>
                                    <div className="flex justify-between">
                                      <span>Average Price:</span>
                                      <span className="font-bold text-emerald-500">
                                        {currency === 'GHS' 
                                          ? `₵ ${(filteredProducts.reduce((sum, p) => sum + p.priceGHS, 0) / filteredProducts.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                          : `$ ${(filteredProducts.reduce((sum, p) => sum + p.priceUSD, 0) / filteredProducts.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                      </span>
                                    </div>

                                    <div className="pt-1.5 border-t border-gray-200/50 dark:border-gray-800/50 space-y-1">
                                      <span className="text-[9px] font-black uppercase text-gray-400 block">Matches by Category:</span>
                                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                                        {Object.entries(
                                          filteredProducts.reduce((acc: Record<string, number>, p) => {
                                            acc[p.category] = (acc[p.category] || 0) + 1;
                                            return acc;
                                          }, {})
                                        ).map(([catName, cnt]) => (
                                          <div key={catName} className="flex justify-between">
                                            <span className="truncate max-w-[90px]">{catName}:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{cnt}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

              {/* Wholesale & B2B Bulk Purchase Promo Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-amber-500/5 to-blue-600/10 border border-blue-500/10 dark:border-blue-500/5 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-[#0066FF] shrink-0">
                    <Building2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black tracking-tight text-gray-950 dark:text-white uppercase font-mono flex items-center gap-1.5">
                      <span>Wholesale & Corporate Procurement Desk</span>
                      <span className="bg-amber-400 text-gray-950 text-[9px] font-bold px-1.5 py-0.5 rounded font-sans">10+ Devices</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                      Equip your team or organization with high-quality certified smartphones, laptops, and accessories. Submit our bulk purchase inquiry form to unlock wholesale volume discounts, tax compliance invoicing, flexible payment terms, and direct regional dispatch across Ghana.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="px-5 py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-black rounded-xl transition-all shrink-0 shadow-lg shadow-[#0066FF]/20 flex items-center justify-center space-x-2"
                  id="shop-bulk-inquiry-trigger"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Submit Bulk Inquiry</span>
                </button>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      onAddToCart={() => handleAddToCart(product)}
                      onViewDetails={() => setSelectedProduct(product)}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.some(p => p.id === product.id)}
                      onOpenAR={(prod) => setArProduct(prod)}
                      onToggleCompare={handleToggleCompare}
                      isComparing={comparisonList.some(p => p.id === product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 animate-bounce" />
                  <h4 className="text-sm font-extrabold text-gray-500 dark:text-gray-400 mt-4 font-mono">No flagship products matched your search.</h4>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPAIRS TAB VIEW */}
        {currentTab === 'repair' && (
          <RepairBooking 
            onBookRepair={handleBookRepair} 
            onTrackRepair={handleTrackRepair} 
            currency={currency} 
          />
        )}

        {/* TRADE-IN TAB VIEW */}
        {currentTab === 'tradein' && (
          <TradeInSystem 
            onSubmitTradeIn={handleTradeInSubmit} 
            onTrackTradeIn={handleTrackTradeIn} 
            currency={currency} 
          />
        )}

        {/* BLOG TAB VIEW */}
        {currentTab === 'blog' && (
          <BlogSystem 
            blogs={blogs} 
            onComment={handleBlogComment} 
            onLike={handleBlogLike} 
          />
        )}

        {/* GMAIL HUB TAB VIEW */}
        {currentTab === 'gmail' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <GmailHub 
              orders={orders} 
              repairs={repairs} 
              tradeins={tradeins} 
              bulkInquiries={bulkInquiries}
            />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-[#060606] py-12 text-xs text-gray-500 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-sans font-black tracking-widest text-lg text-gray-900 dark:text-white block">IMMORTAL</span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Ghana's certified premium hub for luxurious electronics sales, advanced micro-repair operations, and device swap systems. Based in Adabraka, Accra.
            </p>
            <div className="flex space-x-2">
              <span className="bg-[#0066FF]/10 text-[#0066FF] px-2 py-0.5 rounded font-mono font-bold text-[10px]">MTN MOMO</span>
              <span className="bg-amber-400/10 text-amber-500 px-2 py-0.5 rounded font-mono font-bold text-[10px]">TELECEL CASH</span>
            </div>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider block mb-3 text-gray-800 dark:text-gray-200 font-mono">Operations Services</span>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentTab('shop')} className="hover:underline text-left cursor-pointer">Buy Flagship Smartphones</button></li>
              <li><button onClick={() => setCurrentTab('repair')} className="hover:underline text-left cursor-pointer">Book Certified Diagnostics</button></li>
              <li><button onClick={() => setCurrentTab('tradein')} className="hover:underline text-left cursor-pointer">Request Instant Swap Appraisals</button></li>
              <li><button onClick={() => setCurrentTab('blog')} className="hover:underline text-left cursor-pointer">TechLongevity Blog</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider block mb-3 text-gray-800 dark:text-gray-200 font-mono">Store Coordinates</span>
            <ul className="space-y-2">
              <li className="flex items-start"><MapPin className="w-4 h-4 mr-2 text-[#0066FF] shrink-0 mt-0.5" /> <span>42 Kwame Nkrumah Avenue, Adabraka, Accra, Ghana</span></li>
              <li className="flex items-start"><Phone className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" /> <span>+233 24 419 2834</span></li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider block mb-3 text-gray-800 dark:text-gray-200 font-mono">Ghana Consumer Trust</span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              We adhere strictly to local electronics grading standards. Every pre-owned device goes through a 40-point hardware certification audit.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-150 dark:border-gray-900 mt-8 pt-6 text-center text-[10px] text-gray-400">
          © {new Date().getFullYear()} Immortal Electronics Ltd. All rights reserved. Accra, Republic of Ghana.
        </div>
      </footer>

      {/* SHOPPING CART SLIDE-IN PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md h-full bg-white dark:bg-[#0B0B0B] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            id="cart-slideout"
          >
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#0066FF]" />
                <span className="font-extrabold text-sm tracking-wide">YOUR SHOPPING CART</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                id="close-cart-btn"
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {cart.length > 0 ? (
                cart.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-900 rounded-xl flex justify-between gap-3 text-xs">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-contain p-1 bg-white rounded" />
                    
                    <div className="flex-1 space-y-1">
                      <span className="font-bold text-gray-900 dark:text-white block">{item.product.name}</span>
                      {item.selectedColor && <span className="text-[10px] text-gray-400 font-mono block">Color: {item.selectedColor}</span>}
                      
                      <div className="flex items-center space-x-2 pt-1">
                        <button 
                          onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedColor, -1)}
                          className="w-5 h-5 border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold rounded"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedColor, 1)}
                          className="w-5 h-5 border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end">
                      <button 
                        onClick={() => handleRemoveFromCart(item.product.id, item.selectedColor)}
                        className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-[#0066FF] block mt-1">
                        {currency === 'GHS' 
                          ? `₵ ${(item.product.priceGHS * item.quantity).toLocaleString()}` 
                          : `$ ${(item.product.priceUSD * item.quantity).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-400 font-mono italic">
                  Your cart is empty. Explore our gadgets!
                </div>
              )}
            </div>

            {/* Cart checkout footer with Promo Coupon */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121212]/30 space-y-4">
              {/* Promo code bar */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-mono uppercase block">Apply Promo Coupon</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. IMMORTAL20)"
                    value={appliedCouponCode}
                    onChange={(e) => setAppliedCouponCode(e.target.value)}
                    className="flex-1 p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                    id="cart-coupon-input"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    id="cart-apply-coupon"
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-black rounded-lg text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-mono mt-1">{couponError}</p>}
                {activeCoupon && <p className="text-[10px] text-green-500 font-mono mt-1">✓ Applied {activeCoupon.discountPercent}% OFF coupon ({activeCoupon.code})</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 border-t border-gray-200 dark:border-gray-800 pt-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal:</span>
                  <span className="font-semibold text-gray-950 dark:text-white">
                    {currency === 'GHS' ? `₵ ${subtotalGHS.toLocaleString()}` : `$ ${subtotalUSD.toLocaleString()}`}
                  </span>
                </div>
                {discountGHS > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount Applied:</span>
                    <span>-{currency === 'GHS' ? `₵ ${discountGHS.toLocaleString()}` : `$ ${discountUSD.toLocaleString()}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-950 dark:text-white pt-2 border-t border-gray-150 dark:border-gray-900">
                  <span>Subtotal estimate:</span>
                  <span className="text-[#0066FF]">
                    {currency === 'GHS' ? `₵ ${(subtotalGHS - discountGHS).toLocaleString()}` : `$ ${(subtotalUSD - discountUSD).toLocaleString()}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                disabled={cart.length === 0}
                id="cart-checkout-cta"
                className="w-full py-3 bg-[#0066FF] hover:bg-[#0055DD] disabled:bg-gray-200 text-white font-bold rounded-xl text-center shadow-lg shadow-[#0066FF]/20"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT FLOW MODAL WITH MOMO EMULATION */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto text-gray-900 dark:text-white">
          <div 
            className="w-full max-w-2xl bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            id="checkout-modal"
          >
            {checkoutSuccessCode ? (
              <div className="text-center space-y-4 py-8" id="checkout-success-view">
                <div className="text-4xl">🚀</div>
                <h3 className="text-xl font-bold text-green-500">Secure Checkout Order Received!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Your order is registered with our dispatch warehouse. We will send updates to your phone. Use this code to track delivery:
                </p>
                <div className="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl inline-block font-mono">
                  <span className="text-xs text-gray-400 block uppercase">ORDER DISPATCH CODE</span>
                  <span className="text-xl font-extrabold text-[#0066FF] tracking-wider block mt-1">{checkoutSuccessCode}</span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setCheckoutSuccessCode(null);
                      setIsCheckoutOpen(false);
                    }}
                    className="px-6 py-2.5 bg-[#0066FF] text-white rounded-xl text-xs font-bold animate-pulse"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="text-md font-extrabold flex items-center space-x-1.5">
                    <CreditCard className="w-5 h-5 text-[#0066FF]" />
                    <span>Secure Accra Dispatch Checkout</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Form */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block border-b border-gray-100 dark:border-gray-900 pb-1">1. Billing & Shipping Details</span>
                    
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Recipient Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Alhassan Ibrahim"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        onBlur={() => setCheckoutTouched(prev => ({ ...prev, name: true }))}
                        className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all ${
                          checkoutTouched.name
                            ? nameError
                              ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                              : 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-600'
                            : 'border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF]'
                        }`}
                        id="checkout-input-name"
                      />
                      {checkoutTouched.name && nameError ? (
                        <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{nameError}</span>
                        </p>
                      ) : checkoutTouched.name && !nameError ? (
                        <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Looks good!</span>
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Ghanaian Phone Number (MoMo alerts) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0244192834"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        onBlur={() => setCheckoutTouched(prev => ({ ...prev, phone: true }))}
                        className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all ${
                          checkoutTouched.phone
                            ? phoneError
                              ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                              : 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-600'
                            : 'border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF]'
                        }`}
                        id="checkout-input-phone"
                      />
                      {checkoutTouched.phone && phoneError ? (
                        <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1 font-medium leading-normal">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{phoneError}</span>
                        </p>
                      ) : checkoutTouched.phone && !phoneError ? (
                        <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Valid Ghanaian number</span>
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Email Address</label>
                      <input
                        type="email"
                        placeholder="alhassan@gmail.com"
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        onBlur={() => setCheckoutTouched(prev => ({ ...prev, email: true }))}
                        className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all ${
                          checkoutTouched.email && checkoutEmail.trim()
                            ? emailError
                              ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                              : 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-600'
                            : 'border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF]'
                        }`}
                        id="checkout-input-email"
                      />
                      {checkoutTouched.email && checkoutEmail.trim() && emailError ? (
                        <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{emailError}</span>
                        </p>
                      ) : checkoutTouched.email && checkoutEmail.trim() && !emailError ? (
                        <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Valid email format</span>
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Delivery Street Address (Accra/GHS) *</label>
                      <input
                        type="text"
                        required
                        placeholder="42 Kwame Nkrumah Avenue, Adabraka"
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        onBlur={() => setCheckoutTouched(prev => ({ ...prev, address: true }))}
                        className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all ${
                          checkoutTouched.address
                            ? addressError
                              ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                              : 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-600'
                            : 'border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF]'
                        }`}
                        id="checkout-input-address"
                      />
                      {checkoutTouched.address && addressError ? (
                        <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{addressError}</span>
                        </p>
                      ) : checkoutTouched.address && !addressError ? (
                        <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Ready for dispatch delivery</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">City / Location *</label>
                        <input
                          type="text"
                          required
                          value={checkoutCity}
                          onChange={(e) => setCheckoutCity(e.target.value)}
                          onBlur={() => setCheckoutTouched(prev => ({ ...prev, city: true }))}
                          className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all ${
                            checkoutTouched.city
                              ? cityError
                                ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                                : 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-600'
                              : 'border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF]'
                          }`}
                          id="checkout-input-city"
                        />
                        {checkoutTouched.city && cityError ? (
                          <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{cityError}</span>
                          </p>
                        ) : checkoutTouched.city && !cityError ? (
                          <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-medium">
                            <Check className="w-3 h-3 shrink-0" />
                            <span>Location verified</span>
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Dispatch Mode</label>
                        <select
                          value={deliveryOption}
                          onChange={(e) => setDeliveryOption(e.target.value as any)}
                          className="mt-1 w-full p-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-white rounded-lg"
                        >
                          <option value="Standard Accra Dispatch">Standard Dispatch (GHS 35)</option>
                          <option value="Expedited Motorcycle Courier">Expedited Cycle (GHS 55)</option>
                          <option value="In-Store Pickup">Accra In-Store Pick (GHS 0)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Order Summary */}
                  <div className="space-y-4">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block border-b border-gray-100 dark:border-gray-900 pb-1">2. Payment Provider</span>

                    {/* Paystack style provider choice */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'MTN MoMo', label: 'MTN Mobile Money' },
                        { name: 'Telecel Cash', label: 'Telecel Cash' },
                        { name: 'Credit Card', label: 'Visa / Mastercard' },
                        { name: 'Cash on Delivery', label: 'Cash On Delivery' }
                      ].map(prov => (
                        <button
                          key={prov.name}
                          type="button"
                          onClick={() => setPaymentProvider(prov.name as any)}
                          className={`p-3 border rounded-xl text-left text-xs transition-all ${
                            paymentProvider === prov.name 
                              ? 'border-[#0066FF] bg-[#0066FF]/10 font-bold' 
                              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                          }`}
                        >
                          {prov.label}
                        </button>
                      ))}
                    </div>

                    {/* Payment Details Simulator */}
                    {paymentProvider === 'MTN MoMo' && (
                      <div className="p-3 rounded-xl bg-[#F5B800]/10 border border-[#F5B800]/20 text-[11px] text-[#F5B800] space-y-1">
                        <span className="font-bold block">MTN MoMo Gateway</span>
                        <p>We'll send a secure USSD payment prompt request to your telephone. Please confirm with your 4-digit Momo PIN.</p>
                      </div>
                    )}

                    {paymentProvider === 'Telecel Cash' && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 space-y-1">
                        <span className="font-bold block">Telecel Cash Gateway</span>
                        <p>Please ensure you have generated your voucher code (*110#) before confirming checkout dispatch.</p>
                      </div>
                    )}

                    {/* Final Tally */}
                    <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl space-y-2 bg-gray-50/50 dark:bg-black/10">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Receipt Tally</span>
                      <div className="flex justify-between text-xs">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {currency === 'GHS' ? `₵ ${(subtotalGHS - discountGHS).toLocaleString()}` : `$ ${(subtotalUSD - discountUSD).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Dispatch Courier:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {currency === 'GHS' ? `₵ ${deliveryCostGHS}` : `$ ${deliveryCostUSD}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-[#0066FF] pt-2 border-t border-gray-200 dark:border-gray-800">
                        <span>Grand Total:</span>
                        <span>{currency === 'GHS' ? `₵ ${finalTotalGHS.toLocaleString()}` : `$ ${finalTotalUSD.toLocaleString()}`}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCheckoutLoading}
                      id="momo-checkout-confirm"
                      className="w-full py-3 rounded-xl font-bold bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs shadow-lg shadow-[#0066FF]/20"
                    >
                      {isCheckoutLoading ? 'Transmitting Secure Payment Gateway...' : `Authorize & Confirm Checkout`}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DETAILED PRODUCT DIALOGUE MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          currency={currency}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod, color) => handleAddToCart(prod, color)}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some(p => p.id === selectedProduct.id)}
          onBuyNow={(prod, color) => {
            handleAddToCart(prod, color);
            setSelectedProduct(null);
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          onOpenAR={(prod) => {
            setArProduct(prod);
          }}
        />
      )}

      {/* IMMORTAL SPATIAL LABS AR OVERLAY */}
      {arProduct && (
        <ARViewModal
          product={arProduct}
          currency={currency}
          onClose={() => setArProduct(null)}
        />
      )}

      {/* DURABLE ACCRA CUSTOMER ACCOUNT DASHBOARD */}
      {isDashboardOpen && (
        <Dashboard
          orders={orders}
          repairs={repairs}
          tradeins={tradeins}
          currency={currency}
          onClose={() => setIsDashboardOpen(false)}
        />
      )}

      {/* STAFF BACKDOOR DESK CONTROL */}
      {isAdminOpen && (
        <AdminPanel
          products={products}
          repairs={repairs}
          tradeins={tradeins}
          orders={orders}
          coupons={coupons}
          currency={currency}
          bulkInquiries={bulkInquiries}
          onUpdateStock={handleUpdateStock}
          onUpdateRepair={handleUpdateRepair}
          onUpdateTradeIn={handleUpdateTradeIn}
          onUpdateOrder={handleUpdateOrder}
          onCreateCoupon={handleCreateCoupon}
          onUpdateBulkInquiry={handleUpdateBulkInquiry}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* WHOLESALE BULK PURCHASE INQUIRY MODAL */}
      {isBulkModalOpen && (
        <BulkInquiryModal
          products={products}
          onClose={() => setIsBulkModalOpen(false)}
          onSubmitInquiry={handleBookBulkInquiry}
        />
      )}

      {/* PRODUCT COMPARISON MODAL */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <ProductComparisonModal
            comparisonList={comparisonList}
            currency={currency}
            onClose={() => setIsCompareModalOpen(false)}
            onRemoveFromCompare={handleToggleCompare}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* FLOATING COMPARISON BAR */}
      <AnimatePresence>
        {comparisonList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl bg-gray-900/95 dark:bg-black/95 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            id="floating-compare-bar"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#0066FF]/10 text-[#0066FF] rounded-xl">
                <GitCompare className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider text-white uppercase font-mono">Gadget Compare Deck</h4>
                <p className="text-[10px] text-gray-400 font-mono">
                  {comparisonList.length} of 3 items selected
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
              <div className="flex -space-x-2.5 overflow-hidden">
                {comparisonList.map(item => (
                  <div key={item.id} className="relative group w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-black p-0.5 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    <button
                      onClick={() => handleToggleCompare(item)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setComparisonList([])}
                  className="px-3 py-1.5 text-gray-400 hover:text-white text-[10px] font-bold uppercase font-mono transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-black rounded-lg transition-all shadow-md shadow-[#0066FF]/20 flex items-center space-x-1"
                  id="open-compare-desk-btn"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Compare Now</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING GEMINI CHATBOT & VOICE SEARCH SIMULATOR */}
      <AIChatbot currentTab={currentTab} currency={currency} />

      {/* FLOATING QR CODE SCANNER ACTION BUTTON (Only on Shop Tab) */}
      <AnimatePresence>
        {currentTab === 'shop' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            className="fixed bottom-24 right-6 z-40"
            id="qr-fab-container"
          >
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 active:scale-95 text-white font-sans font-bold shadow-xl shadow-emerald-600/30 transition-all border border-white/10 cursor-pointer"
              id="qr-lens-fab"
              title="Open Camera QR Lens"
            >
              <div className="relative">
                <QrCode className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-sm">Scan product QR</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR SCANNER LENS MODAL */}
      <AnimatePresence>
        {isQRScannerOpen && (
          <QRScannerModal
            products={products}
            onClose={() => setIsQRScannerOpen(false)}
            onScanSuccess={(scannedQuery) => {
              setSearchQuery(scannedQuery);
              // Adjust category to All if no match in current category
              const matchesInCurrent = products.some(p => 
                (p.category === selectedCategory || selectedCategory === 'All') &&
                (p.name.toLowerCase().includes(scannedQuery.toLowerCase()) || 
                 p.brand.toLowerCase().includes(scannedQuery.toLowerCase()))
              );
              if (!matchesInCurrent) {
                setSelectedCategory('All');
              }
              // Scroll to products grid to instantly see the matched query search results
              document.getElementById('shop-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
