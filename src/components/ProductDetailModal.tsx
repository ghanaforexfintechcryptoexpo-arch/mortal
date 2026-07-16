/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Star, Heart, ShoppingCart, MessageSquare, ShieldAlert, Zap, Layers, Sparkles, ShieldCheck, Award, RefreshCw, Battery } from 'lucide-react';
import { Product } from '../types.js';

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  currency: 'GHS' | 'USD';
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onBuyNow: (product: Product, selectedColor: string) => void;
  onOpenAR?: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  allProducts,
  currency,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onBuyNow,
  onOpenAR,
}: ProductDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Default');
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0); // 0 to 360 degrees
  const [comparisonProductId, setComparisonProductId] = useState('');
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'compare' | 'warranty'>('specs');
  const [fastTrackDelivery, setFastTrackDelivery] = useState(false);

  // Battery Health Check and States
  // A phone is a smartphone if its category has 'phone' or 'smartphone'
  const isSmartphone = (product.category || '').toLowerCase().includes('smartphones') || (product.category || '').toLowerCase().includes('phone');
  const [isPreOwnedSimulated, setIsPreOwnedSimulated] = useState(!product.isNew);

  const getBatteryHealthPercent = () => {
    // Return a stable battery health based on the product id for pre-owned
    if (product.isNew && !isPreOwnedSimulated) return 100;
    let hash = 0;
    for (let i = 0; i < (product.id || '').length; i++) {
      hash += (product.id || '').charCodeAt(i);
    }
    return 86 + (hash % 11); // returns 86 to 96
  };

  const batteryHealth = getBatteryHealthPercent();

  // Trade-in Calculator States
  const [tradeInBrand, setTradeInBrand] = useState('Apple');
  const [tradeInModel, setTradeInModel] = useState('');
  const [tradeInCondition, setTradeInCondition] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [isCalculatingTradeIn, setIsCalculatingTradeIn] = useState(false);
  const [calculatedTradeIn, setCalculatedTradeIn] = useState<{
    creditGHS: number;
    creditUSD: number;
    finalPriceGHS: number;
    finalPriceUSD: number;
    deviceName: string;
    conditionLabel: string;
  } | null>(null);

  const handleCalculateTradeIn = () => {
    if (!tradeInModel.trim()) return;
    setIsCalculatingTradeIn(true);
    setCalculatedTradeIn(null);

    setTimeout(() => {
      let baseUSD = 150;
      const modelLower = tradeInModel.toLowerCase();
      
      if (modelLower.includes('15') || modelLower.includes('s24') || modelLower.includes('s23')) {
        baseUSD = 450;
      } else if (modelLower.includes('14') || modelLower.includes('s22') || modelLower.includes('fold') || modelLower.includes('m2')) {
        baseUSD = 350;
      } else if (modelLower.includes('13') || modelLower.includes('s21') || modelLower.includes('m1')) {
        baseUSD = 250;
      } else if (modelLower.includes('12') || modelLower.includes('s20') || modelLower.includes('pixel 7')) {
        baseUSD = 180;
      }

      const conditionMultiplier = {
        excellent: 1.15,
        good: 0.95,
        fair: 0.65,
        poor: 0.35,
      }[tradeInCondition];

      const creditUSD = Math.round(baseUSD * conditionMultiplier);
      const exchangeRate = 15.0; 
      const creditGHS = Math.round(creditUSD * exchangeRate);

      const minPriceUSD = Math.round(product.priceUSD * 0.15);
      const minPriceGHS = Math.round(product.priceGHS * 0.15);

      const finalPriceUSD = Math.max(minPriceUSD, product.priceUSD - creditUSD);
      const finalPriceGHS = Math.max(minPriceGHS, product.priceGHS - creditGHS);

      const conditionLabels = {
        excellent: 'Flawless (No Scratches)',
        good: 'Light Use (Minor Scuffs)',
        fair: 'Visible Wear (Dent/Scratch)',
        poor: 'Heavy Wear / Broken Back',
      };

      setCalculatedTradeIn({
        creditGHS,
        creditUSD,
        finalPriceGHS,
        finalPriceUSD,
        deviceName: `${tradeInBrand} ${tradeInModel}`,
        conditionLabel: conditionLabels[tradeInCondition]
      });
      setIsCalculatingTradeIn(false);
    }, 850);
  };

  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [imgZoomScale, setImgZoomScale] = useState(1.0);
  const [isZoomScrolling, setIsZoomScrolling] = useState(false);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);

  // Drag to pan states
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPanOffsetRef = useRef({ x: 0, y: 0 });

  // Reset zoom & pan when switching active image or product
  useEffect(() => {
    setImgZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [activeImageIdx, product.id]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = zoomContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (is360Mode) return;
      
      // Stop window scroll while scrolling to zoom the image
      e.preventDefault();
      setImgZoomScale(prev => {
        const zoomStep = 0.15;
        let nextScale = prev + (e.deltaY < 0 ? zoomStep : -zoomStep);
        nextScale = Math.max(1.0, Math.min(3.5, nextScale));
        return Number(nextScale.toFixed(2));
      });

      // Track active scrolling for badge fade-in/out
      setIsZoomScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsZoomScrolling(false);
      }, 1500); // Fades out after 1.5 seconds of scroll inactivity
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [is360Mode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomContainerRef.current) return;

    if (isDragging && imgZoomScale > 1.0) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      const { width, height } = zoomContainerRef.current.getBoundingClientRect();
      const maxPanX = (width * (imgZoomScale - 1)) / 2;
      const maxPanY = (height * (imgZoomScale - 1)) / 2;
      
      const targetX = lastPanOffsetRef.current.x + dx;
      const targetY = lastPanOffsetRef.current.y + dy;
      
      // Allow panning with a tiny bit of elastic margin
      const clampedX = Math.max(-maxPanX - 40, Math.min(maxPanX + 40, targetX));
      const clampedY = Math.max(-maxPanY - 40, Math.min(maxPanY + 40, targetY));
      
      setPanOffset({ x: clampedX, y: clampedY });
      return;
    }

    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Convert to percentages
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    
    // Bound values between 0 and 100
    const boundedX = Math.max(0, Math.min(100, xPercent));
    const boundedY = Math.max(0, Math.min(100, yPercent));
    
    setZoomPos({
      x: boundedX,
      y: boundedY,
      bgX: boundedX,
      bgY: boundedY,
    });
  };

  const deliveryFeeGHS = fastTrackDelivery ? 150 : 0;
  const deliveryFeeUSD = fastTrackDelivery ? 10 : 0;

  const totalValueGHS = product.priceGHS + deliveryFeeGHS;
  const totalValueUSD = product.priceUSD + deliveryFeeUSD;

  const displayPrice = currency === 'GHS' 
    ? `₵ ${totalValueGHS.toLocaleString()}` 
    : `$ ${totalValueUSD.toLocaleString()}`;

  // Find similar products for comparison dropdown
  const similarProducts = allProducts.filter(
    p => p.category === product.category && p.id !== product.id
  );

  const compareProduct = allProducts.find(p => p.id === comparisonProductId);

  // Simulated 360 degree product view images depending on angle
  // We'll apply different CSS scale/rotate/brightness transforms to simulate 360 rotation of the image!
  const getRotatedStyle = () => {
    const scaleY = Math.cos((rotationAngle * Math.PI) / 180);
    const skewY = Math.sin((rotationAngle * Math.PI) / 180) * 15;
    return {
      transform: `scaleX(${scaleY}) skewY(${skewY}deg)`,
      transition: 'transform 0.1s ease-out',
    };
  };

  const getWhatsAppLink = () => {
    const priceText = currency === 'GHS' ? `₵${totalValueGHS.toLocaleString()}` : `$${totalValueUSD.toLocaleString()}`;
    const deliveryText = fastTrackDelivery ? ' with Fast-Track Priority Delivery (2 hours)' : ' with Standard Delivery';
    const message = encodeURIComponent(
      `Hello Immortal Electronics! I'd like to order the ${product.name} (${selectedColor} color) for ${priceText}${deliveryText}. Is it available?`
    );
    return `https://wa.me/233500000000?text=${message}`; // Accra placeholder
  };

  const getWarrantyDuration = () => {
    const cat = (product.category || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    
    if (cat.includes('laptop') || cat.includes('comput') || (brand.includes('apple') && product.name.toLowerCase().includes('macbook'))) {
      return '24-Month Gold Business Warranty';
    } else if (cat.includes('smartphones') || cat.includes('phone')) {
      return '12-Month Premium Unlocked Warranty';
    } else if (cat.includes('accessories') || cat.includes('charger') || cat.includes('audio') || cat.includes('cable')) {
      return '6-Month Direct Replacement Warranty';
    } else {
      return '12-Month Standard Immortal Warranty';
    }
  };

  const isEligibleForRepair = () => {
    const cat = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    if (name.includes('cable') || name.includes('adapter') || name.includes('sleeve') || name.includes('case')) {
      return false;
    }
    return cat.includes('laptop') || cat.includes('comput') || cat.includes('smartphones') || cat.includes('phone') || cat.includes('audio') || cat.includes('tablet');
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl rounded-2xl bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="detail-modal-close"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:scale-105 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Media Gallery & 360 View */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
          <div>
            {/* Top toggles */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setIs360Mode(false)}
                className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                  !is360Mode 
                    ? 'bg-[#0066FF] text-white border-[#0066FF]' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent'
                }`}
              >
                Standard Gallery
              </button>
              <button
                onClick={() => setIs360Mode(true)}
                id="toggle-360-view"
                className={`px-3 py-1 text-xs font-mono rounded-full border transition-all flex items-center space-x-1 ${
                  is360Mode 
                    ? 'bg-[#0066FF] text-white border-[#0066FF]' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span>🔄 360° View</span>
              </button>
              {onOpenAR && (
                <button
                  onClick={() => onOpenAR(product)}
                  id="toggle-ar-view"
                  className="px-3 py-1 text-xs font-mono rounded-full border bg-amber-400/10 text-amber-500 border-amber-400/20 hover:bg-amber-400/20 transition-all flex items-center space-x-1 animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Spatial AR View</span>
                </button>
              )}
            </div>

            {/* Media Container */}
            <div className="h-72 w-full flex items-center justify-center bg-gray-50 dark:bg-black/40 rounded-xl relative overflow-hidden border border-gray-100 dark:border-gray-900">
              {is360Mode ? (
                <div className="flex flex-col items-center justify-center p-4 w-full">
                  <div className="w-48 h-48 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      style={getRotatedStyle()}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                    />
                  </div>
                  <div className="w-full max-w-xs mt-6 flex flex-col items-center space-y-1">
                    <span className="text-[10px] font-mono text-gray-400">DRAG SLIDER TO ROTATE DEVICE</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotationAngle}
                      onChange={(e) => setRotationAngle(Number(e.target.value))}
                      className="w-full accent-[#0066FF] h-1 bg-gray-200 dark:bg-gray-800 rounded-lg cursor-pointer"
                      id="rotation-slider"
                    />
                    <div className="flex justify-between w-full text-[9px] font-mono text-gray-500">
                      <span>Front</span>
                      <span>Left Side</span>
                      <span>Back</span>
                      <span>Right Side</span>
                      <span>Front</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className={`relative w-full h-full flex items-center justify-center overflow-hidden group select-none ${
                    imgZoomScale > 1.0 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
                  }`}
                  onMouseEnter={() => setShowZoom(true)}
                  onMouseLeave={() => {
                    setShowZoom(false);
                    setImgZoomScale(1.0);
                    setIsZoomScrolling(false);
                    setIsDragging(false);
                    if (scrollTimeoutRef.current) {
                      clearTimeout(scrollTimeoutRef.current);
                    }
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseDown={(e) => {
                    if (imgZoomScale <= 1.0) return;
                    e.preventDefault();
                    setIsDragging(true);
                    dragStartRef.current = { x: e.clientX, y: e.clientY };
                    lastPanOffsetRef.current = panOffset;
                  }}
                  onMouseUp={() => {
                    setIsDragging(false);
                  }}
                  ref={zoomContainerRef}
                  id="detail-modal-zoom-container"
                >
                  <img
                    src={product.images[activeImageIdx] || product.image}
                    alt={product.name}
                    id="product-detail-modal-image"
                    className={`max-h-full max-w-full object-contain p-6 filter drop-shadow-md transition-opacity duration-200 ${
                      showZoom && imgZoomScale === 1.0 ? 'opacity-30' : 'opacity-100'
                    }`}
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${imgZoomScale})`,
                      transformOrigin: imgZoomScale > 1.0 ? '50% 50%' : `${zoomPos.x}% ${zoomPos.y}%`,
                      transition: isDragging 
                        ? 'none' 
                        : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                    }}
                  />
                  {showZoom && imgZoomScale === 1.0 && (
                    <div
                       className="absolute pointer-events-none border-2 border-[#0066FF] rounded-full shadow-2xl bg-no-repeat bg-white dark:bg-gray-900 z-10"
                      style={{
                        width: '140px',
                        height: '140px',
                        left: `${zoomPos.x}%`,
                        top: `${zoomPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundImage: `url(${product.images[activeImageIdx] || product.image})`,
                        backgroundPosition: `${zoomPos.bgX}% ${zoomPos.bgY}%`,
                        backgroundSize: '450% 450%',
                      }}
                      id="magnifying-lens"
                    />
                  )}
 
                  {/* Dynamic Zoom Percentage Badge */}
                  {imgZoomScale > 1.0 && (
                    <div 
                      className="absolute top-3 left-3 bg-black/85 backdrop-blur-sm text-white text-[10px] font-bold font-mono px-2 py-1 rounded-md shadow-lg border border-gray-800 z-20 flex items-center gap-1.5 animate-in fade-in zoom-in duration-200"
                      id="zoom-percentage-badge"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ZOOM: {Math.round(imgZoomScale * 100)}%</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgZoomScale(1.0);
                          setPanOffset({ x: 0, y: 0 });
                          setIsDragging(false);
                        }}
                        className="ml-1 text-[8px] uppercase tracking-wider bg-gray-800 hover:bg-gray-700 px-1 py-0.5 rounded transition font-black text-gray-300"
                      >
                        Reset
                      </button>
                    </div>
                  )}
 
                  {/* Persistent Zoom Magnification Badge */}
                  <div 
                    className={`absolute top-3 right-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg px-2 py-1 text-[10px] font-bold font-mono tracking-wider flex items-center gap-1.5 z-20 transition-all duration-300 ${
                      isZoomScrolling ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                    }`}
                    id="product-zoom-magnification-badge"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-250 ${imgZoomScale > 1.0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    <span className="text-gray-400 dark:text-gray-500 uppercase font-black text-[8px]">MAG</span>
                    <span className="text-gray-900 dark:text-white font-black">{imgZoomScale.toFixed(1)}x</span>
                  </div>
 
                  {/* Guided magnification assist label */}
                  <span className="absolute bottom-2.5 right-2.5 bg-black/75 px-2 py-1 rounded text-[9px] font-mono font-black tracking-wider text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    🔍 Scroll wheel to zoom | {imgZoomScale > 1.0 ? 'Drag to pan' : 'Hover to inspect'}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {!is360Mode && product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-14 w-14 rounded-lg overflow-hidden border p-1 bg-gray-50 dark:bg-black/20 ${
                      activeImageIdx === idx 
                        ? 'border-[#0066FF] ring-2 ring-[#0066FF]/20' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-[#0066FF]/55'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Info Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center space-x-2 text-xs text-[#0066FF] font-mono">
              <span className="bg-[#0066FF]/10 px-2 py-0.5 rounded">Accra Store Pickup</span>
              <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded">In Stock</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Order now to secure physical inventory. We offer same-day home or office delivery across Accra and overnight dispatch nationwide in Ghana.
            </p>
          </div>
        </div>

        {/* Right Side: Options, Cart & Interactive Comparison Tabs */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-full">
          <div>
            {/* Header Product Titles */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#0066FF] font-bold">
                {product.brand} Flagship
              </span>
              <h2 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h2>
              
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 ml-1">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">({product.reviewsCount} customer reviews)</span>
                {isOutOfStock ? (
                  <span className="text-xs text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-xs text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded animate-pulse">Low Stock: {product.stock} items</span>
                ) : (
                  <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded">In Stock</span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#0066FF] dark:text-blue-400 block uppercase font-bold tracking-wider">
                  {fastTrackDelivery ? 'Total Price (with Fast-Track)' : 'Total Price'}
                </span>
                <span className="text-2xl font-black text-[#0066FF]" id="detail-modal-price">
                  {displayPrice}
                </span>
              </div>
              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-2 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors ${
                  isWishlisted ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-mono text-gray-400 block mb-2">CHOOSE COLOR: {selectedColor}</span>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                        selectedColor === color
                          ? 'border-[#0066FF] bg-[#0066FF]/10 text-[#0066FF] scale-105'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fast-Track Delivery Switch */}
            <div className="mt-4 p-3.5 bg-gray-50 dark:bg-[#121212]/50 border border-gray-150 dark:border-gray-800/65 rounded-xl space-y-2.5" id="delivery-speed-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
                  <span className="text-xs font-bold text-gray-950 dark:text-white uppercase font-mono">Delivery Configuration</span>
                </div>
                <span className="text-[9px] font-mono text-[#0066FF] uppercase tracking-wider font-bold bg-[#0066FF]/10 px-1.5 py-0.5 rounded">Accra Express</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Fast-Track Delivery Option</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    Same-day express dispatch. Under 2 hours to Accra (under 6 hours nationwide). Adds a dynamic priority fee.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFastTrackDelivery(!fastTrackDelivery)}
                  id="fast-track-delivery-toggle"
                  className={`w-11 h-6 shrink-0 rounded-full transition-all relative focus:outline-none border border-transparent ${
                    fastTrackDelivery ? 'bg-[#0066FF]' : 'bg-gray-250 dark:bg-gray-800'
                  }`}
                  aria-label="Toggle Fast-Track Priority Delivery"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-md transition-all ${
                      fastTrackDelivery ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60 text-[10.5px] font-mono">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[9px] uppercase">ETA Speed</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {fastTrackDelivery ? '🚀 Under 2 Hours' : '📅 24 - 48 Hours'}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-400 text-[9px] uppercase">Priority Fee</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {fastTrackDelivery 
                      ? (currency === 'GHS' ? '₵ 150.00' : '$ 10.00') 
                      : 'FREE Standard'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs Selector: Specs / Reviews / Compare */}
            <div className="mt-6 border-b border-gray-200 dark:border-gray-800 flex space-x-4">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 text-xs font-mono font-bold uppercase transition-all border-b-2 ${
                  activeTab === 'specs' 
                    ? 'border-[#0066FF] text-[#0066FF]' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Specs
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 text-xs font-mono font-bold uppercase transition-all border-b-2 ${
                  activeTab === 'reviews' 
                    ? 'border-[#0066FF] text-[#0066FF]' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                id="tab-compare"
                className={`pb-2 text-xs font-mono font-bold uppercase transition-all border-b-2 ${
                  activeTab === 'compare' 
                    ? 'border-[#0066FF] text-[#0066FF]' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Compare
              </button>
              <button
                onClick={() => setActiveTab('warranty')}
                id="tab-warranty"
                className={`pb-2 text-xs font-mono font-bold uppercase transition-all border-b-2 ${
                  activeTab === 'warranty' 
                    ? 'border-[#0066FF] text-[#0066FF]' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Warranty & Certs
              </button>
            </div>

            {/* Tab content area */}
            <div className="py-4 max-h-48 overflow-y-auto pr-2">
              {activeTab === 'specs' && (
                <table className="w-full text-xs text-left">
                  <tbody>
                    {Object.entries(product.specs || {}).map(([key, val]) => (
                      <tr key={key} className="border-b border-gray-100 dark:border-gray-900/60">
                        <td className="py-2 font-semibold text-gray-500 dark:text-gray-400 w-28 uppercase font-mono tracking-wider">{key}</td>
                        <td className="py-2 text-gray-800 dark:text-gray-200">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-[#121212]/50 border border-gray-100 dark:border-gray-900/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Alhassan I.</span>
                      <div className="flex text-amber-400"><Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /></div>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Verified Accra Buyer • 2 weeks ago</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Excellent flagship. Unlocked for MTN MoMo 5G speed directly in East Legon. The delivery took just 2 hours!</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-[#121212]/50 border border-gray-100 dark:border-gray-900/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Sefa B.</span>
                      <div className="flex text-amber-400"><Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3.5 h-3.5" /></div>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Verified Kumasi Buyer • 1 month ago</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Very fast customer support. Love the build, fits premium requirements. Packaging is Apple level.</p>
                  </div>
                </div>
              )}

              {activeTab === 'compare' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">Select product to compare:</span>
                    <select
                      value={comparisonProductId}
                      onChange={(e) => setComparisonProductId(e.target.value)}
                      className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-1.5 rounded-lg text-gray-800 dark:text-white"
                      id="compare-product-select"
                    >
                      <option value="">-- Choose Similar --</option>
                      {similarProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({currency === 'GHS' ? `₵${p.priceGHS}` : `$${p.priceUSD}`})</option>
                      ))}
                    </select>
                  </div>

                  {compareProduct ? (
                    <div className="grid grid-cols-3 gap-2 text-[11px] border border-gray-100 dark:border-gray-800/80 p-2.5 rounded-xl bg-gray-50/50 dark:bg-[#121212]/20">
                      <div></div>
                      <div className="font-bold text-center text-[#0066FF]">{product.name}</div>
                      <div className="font-bold text-center text-amber-500">{compareProduct.name}</div>

                      <div className="font-bold text-gray-500">Price</div>
                      <div className="text-center">{displayPrice}</div>
                      <div className="text-center font-bold">
                        {currency === 'GHS' ? `₵ ${compareProduct.priceGHS.toLocaleString()}` : `$ ${compareProduct.priceUSD.toLocaleString()}`}
                      </div>

                      <div className="font-bold text-gray-500">Brand</div>
                      <div className="text-center">{product.brand}</div>
                      <div className="text-center">{compareProduct.brand}</div>

                      <div className="font-bold text-gray-500">Rating</div>
                      <div className="text-center">⭐ {product.rating.toFixed(1)}</div>
                      <div className="text-center">⭐ {compareProduct.rating.toFixed(1)}</div>

                      <div className="font-bold text-gray-500">Stock</div>
                      <div className="text-center">{product.stock} units</div>
                      <div className="text-center">{compareProduct.stock} units</div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-gray-400 font-mono">
                      No comparison product selected.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'warranty' && (
                <div className="space-y-4">
                  {/* Warranty Banner */}
                  <div className="p-3 bg-[#0066FF]/5 border border-[#0066FF]/20 rounded-xl flex items-start space-x-3" id="warranty-tab-banner">
                    <ShieldCheck className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">Immortal Warranty Coverage</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5" id="warranty-status-row">
                        <span className="text-[11px] text-[#0066FF] font-black font-mono">{getWarrantyDuration()}</span>
                        {isEligibleForRepair() ? (
                          <span 
                            id="product-repair-eligible-tag"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            title="This specific model is fully eligible for standard in-house hardware repair & maintenance services."
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                            🔧 REPAIR ELIGIBLE
                          </span>
                        ) : (
                          <span 
                            id="product-repair-eligible-tag"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            title="Low-profile parts & accessories are covered via direct hassle-free replacements under warranty."
                          >
                            🔄 REPLACEMENT COVERAGE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                        Covers physical parts, genuine hardware replacements, and screen/battery degradation protection. Fully serviceable at our standard repair labs located at Accra Mall and Kumasi. Same-day claims processing.
                      </p>
                    </div>
                  </div>

                  {/* 40-Point Hardware Certification Status */}
                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3" id="diagnostic-certification-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">40-Point Diagnostics</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black font-mono bg-emerald-500/15 text-emerald-500 rounded-full uppercase tracking-wider animate-pulse">
                        ● PASSED &amp; SEALED
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                      This unit has successfully completed our professional 40-point diagnostics scan, verifying cosmetic, logical, and structural components.
                    </p>

                    {/* Battery Health Visual Indicator for Smartphones */}
                    {isSmartphone && (
                      <div className="p-2.5 bg-white dark:bg-gray-900/40 border border-emerald-500/10 dark:border-emerald-500/5 rounded-lg space-y-2" id="battery-health-widget">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Battery className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-black font-mono text-gray-700 dark:text-gray-300 uppercase">Battery Health Integrity</span>
                          </div>
                          <span className="text-[10.5px] font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded animate-pulse">
                            {batteryHealth}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                            style={{ width: `${batteryHealth}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 dark:text-gray-500">
                          <span>Status: {batteryHealth === 100 ? 'Factory New Grade' : 'Premium Certified Used'}</span>
                          <span>Passed Peak Capacity</span>
                        </div>

                        {/* Switch simulated pre-owned toggle to let people see it if they click */}
                        <div className="flex justify-between items-center pt-1.5 border-t border-gray-100 dark:border-gray-800/40">
                          <span className="text-[8px] text-gray-400 uppercase font-mono">
                            Type: <strong className="text-gray-600 dark:text-gray-300">{product.isNew && !isPreOwnedSimulated ? 'New Retail' : 'Certified Pre-Owned'}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsPreOwnedSimulated(!isPreOwnedSimulated)}
                            className="text-[8px] font-black font-mono uppercase bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded transition"
                            id="simulate-battery-health-btn"
                          >
                            {isPreOwnedSimulated ? "View New 100%" : "Simulate Pre-Owned"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Diagnostic list */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-gray-100 dark:border-gray-900/60 pt-3">
                      <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{isSmartphone ? `Battery Health: ${batteryHealth}%` : 'Battery Capacity > 95%'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Accra 5G/LTE Network bands</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Active OLED Panel Quality</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Face ID / Biometric Security</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Diagnostic Thermal Load</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Stereo Speakers &amp; Mic Output</span>
                      </div>
                    </div>

                    {/* Bottom verification seal sign */}
                    <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-900/40">
                      <span>Seal: IMMORTAL LABS CERTIFIED QA</span>
                      <span className="font-bold text-gray-500 dark:text-gray-400">ID: IE-ACCRA-QA9</span>
                    </div>
                  </div>

                  {/* Estimated Trade-in Credit Calculator Card */}
                  <div className="p-3.5 bg-[#0066FF]/5 border border-[#0066FF]/15 rounded-xl space-y-3" id="trade-in-calculator-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className={`w-4 h-4 text-[#0066FF] ${isCalculatingTradeIn ? 'animate-spin' : ''}`} />
                        <span className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">Calculate Trade-in Value</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#0066FF] uppercase tracking-wider font-bold bg-[#0066FF]/10 px-1.5 py-0.5 rounded">Upgrade Assist</span>
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                      Trade in your current device to instantly offset the price of this {product.name}. Calculate your credit value below:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-gray-450 mb-1">Brand</label>
                        <select
                          value={tradeInBrand}
                          onChange={(e) => setTradeInBrand(e.target.value)}
                          className="w-full bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 p-1.5 rounded text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                          id="trade-in-brand-select"
                        >
                          <option value="Apple">Apple</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Google">Google</option>
                          <option value="Dell">Dell</option>
                          <option value="HP">HP</option>
                          <option value="Huawei">Huawei</option>
                          <option value="Xiaomi">Xiaomi</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono uppercase text-gray-450 mb-1">Model Name</label>
                        <input
                          type="text"
                          placeholder="e.g. iPhone 13 Pro"
                          value={tradeInModel}
                          onChange={(e) => setTradeInModel(e.target.value)}
                          className="w-full bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 p-1.5 rounded text-gray-800 dark:text-white placeholder-gray-400 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                          id="trade-in-model-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono uppercase text-gray-450">Current Condition</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['poor', 'fair', 'good', 'excellent'] as const).map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => setTradeInCondition(cond)}
                            className={`py-1 rounded text-[9px] font-bold uppercase transition border ${
                              tradeInCondition === cond
                                ? 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/35'
                                : 'bg-white dark:bg-gray-850 text-gray-500 border-gray-200 dark:border-gray-800 hover:text-gray-700 dark:hover:text-gray-350'
                            }`}
                            id={`trade-in-cond-${cond}`}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={!tradeInModel.trim() || isCalculatingTradeIn}
                        onClick={handleCalculateTradeIn}
                        id="calculate-tradein-btn"
                        className="w-full py-1.5 bg-[#0066FF] hover:bg-[#0055DD] text-white text-[10.5px] font-bold font-mono uppercase rounded-lg transition disabled:bg-gray-100 dark:disabled:bg-gray-850 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {isCalculatingTradeIn ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Calculating Value...</span>
                          </>
                        ) : (
                          <span>Calculate Trade-in Value</span>
                        )}
                      </button>
                    </div>

                    {calculatedTradeIn && (
                      <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/25 rounded-lg space-y-1.5" id="trade-in-result-badge">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-gray-400 uppercase font-bold text-[9px]">Trade-in Device:</span>
                          <span className="text-gray-900 dark:text-white font-black truncate max-w-[140px]">{calculatedTradeIn.deviceName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-gray-400 uppercase font-bold text-[9px]">Condition:</span>
                          <span className="text-emerald-500 font-bold">{calculatedTradeIn.conditionLabel}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-emerald-500/10 pt-1.5">
                          <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase">Estimated Credit:</span>
                          <span className="text-xs font-black font-mono text-emerald-500 animate-pulse">
                            {currency === 'GHS' 
                              ? `₵ ${calculatedTradeIn.creditGHS.toLocaleString()}` 
                              : `$ ${calculatedTradeIn.creditUSD.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-emerald-500/10 pt-1.5">
                          <span className="text-[9.5px] font-bold font-mono text-[#0066FF] uppercase">Effective Price:</span>
                          <span className="text-[11px] font-black font-mono text-gray-900 dark:text-white">
                            {currency === 'GHS' 
                              ? `₵ ${calculatedTradeIn.finalPriceGHS.toLocaleString()}` 
                              : `$ ${calculatedTradeIn.finalPriceUSD.toLocaleString()}`}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-gray-400 leading-tight pt-1 border-t border-emerald-500/10">
                          *Estimated value assumes diagnostic verification by in-store Immortal technicians at our repair centers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={isOutOfStock}
                onClick={() => onAddToCart(product, selectedColor)}
                id="detail-modal-add-cart"
                className="w-full py-3 px-4 rounded-xl font-medium border border-[#0066FF] text-[#0066FF] dark:text-[#0066FF] hover:bg-[#0066FF]/10 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:border-transparent disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => onBuyNow(product, selectedColor)}
                id="detail-modal-buy-now"
                className="w-full py-3 px-4 rounded-xl font-bold bg-[#0066FF] hover:bg-[#0055DD] text-white disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#0066FF]/20"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* WhatsApp Integration Button */}
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              id="detail-modal-whatsapp"
              className="w-full py-3 px-4 rounded-xl font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white text-center flex items-center justify-center space-x-2 transition-all shadow-md shadow-green-500/10"
            >
              <span>💬 Order Instantly via WhatsApp</span>
            </a>

            {onOpenAR && (
              <button
                onClick={() => onOpenAR(product)}
                id="detail-modal-ar-cta"
                className="w-full py-3 px-4 rounded-xl font-bold bg-amber-400 hover:bg-amber-500 text-gray-950 text-center flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-400/20"
              >
                <Sparkles className="w-4 h-4 animate-pulse text-gray-950" />
                <span>Launch Interactive AR Space projection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
