/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Heart, ShoppingCart, Sparkles, GitCompare } from 'lucide-react';
import { Product } from '../types.js';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  currency: 'GHS' | 'USD';
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpenAR?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isComparing?: boolean;
}

export default function ProductCard({
  product,
  currency,
  onViewDetails,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onOpenAR,
  onToggleCompare,
  isComparing = false,
}: ProductCardProps) {
  const displayPrice = currency === 'GHS' 
    ? `₵ ${product.priceGHS.toLocaleString()}` 
    : `$ ${product.priceUSD.toLocaleString()}`;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div 
      className="group relative rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] overflow-hidden hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
      id={`product-card-${product.id}`}
    >
      {/* Badges & Actions Trigger */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          {product.isBestSeller && (
            <span className="bg-[#0066FF] text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm">
              BESTSELLER
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-amber-400 text-gray-900 text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm">
              NEW ARRIVAL
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm">
              OUT OF STOCK
            </span>
          )}
          {isLowStock && (
            <span className="bg-orange-500 text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase animate-pulse shadow-sm">
              LOW STOCK: {product.stock}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1.5">
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product);
              }}
              id={`compare-toggle-${product.id}`}
              className={`p-2 rounded-full border backdrop-blur-md transition-all duration-200 shadow-sm ${
                isComparing 
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 scale-110' 
                  : 'bg-white/80 dark:bg-black/80 text-gray-400 hover:text-blue-500 hover:scale-110 border-gray-100 dark:border-gray-800'
              }`}
              title={isComparing ? "Selected for comparison" : "Add to comparison"}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            id={`wishlist-toggle-${product.id}`}
            className={`p-2 rounded-full border border-gray-100 dark:border-gray-800 backdrop-blur-md transition-all duration-200 shadow-sm ${
              isWishlisted 
                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                : 'bg-white/80 dark:bg-black/80 text-gray-400 hover:text-red-500 hover:scale-110'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Image Gallery Trigger */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative pt-[100%] cursor-pointer overflow-hidden bg-gray-50 dark:bg-black/40"
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 filter brightness-95 dark:brightness-90"
          loading="lazy"
        />
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {product.brand} • {product.category}
          </span>
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-sm font-semibold mt-1 text-gray-900 dark:text-white line-clamp-1 hover:text-[#0066FF] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>
          
          {/* Star Ratings */}
          <div className="flex items-center space-x-1 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              ({product.reviewsCount} reviews)
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-gray-400 block">PRICE</span>
            <span className="text-base font-bold text-[#0066FF] dark:text-[#0066FF]">
              {displayPrice}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenAR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAR(product);
                }}
                id={`ar-view-${product.id}`}
                className="px-2 py-1.5 text-xs font-semibold text-amber-500 hover:text-amber-600 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/10 rounded-lg transition-all flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95"
                title="Visualize in 3D Space via Augmented Reality"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>AR</span>
              </button>
            )}
            <button
              onClick={() => onViewDetails(product)}
              className="px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Info
            </button>
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              id={`add-to-cart-${product.id}`}
              className="p-2 rounded-lg bg-[#0066FF] hover:bg-[#0055DD] disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white shadow-lg shadow-[#0066FF]/10 active:scale-95 transition-all"
              title={isOutOfStock ? 'Out of stock' : 'Add to Cart'}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
