/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Layers, ClipboardList, Hammer, RefreshCw, Smartphone, Percent, BookOpen, Users, TrendingUp, DollarSign, AlertCircle, Sparkles, Check, Building2, Mail } from 'lucide-react';
import { Product, RepairRequest, TradeInRequest, Order, BlogPost, Coupon, BulkInquiry } from '../types.js';
import GmailHub from './GmailHub.js';

interface AdminPanelProps {
  products: Product[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  orders: Order[];
  coupons: Coupon[];
  currency: 'GHS' | 'USD';
  bulkInquiries?: BulkInquiry[];
  onUpdateStock: (productId: string, newStock: number) => Promise<Product>;
  onUpdateRepair: (repairId: string, status: any, notes: string, quoteGHS: number) => Promise<RepairRequest>;
  onUpdateTradeIn: (tradeInId: string, status: any, notes: string, finalOfferGHS: number) => Promise<TradeInRequest>;
  onUpdateOrder: (orderId: string, status: any) => Promise<Order>;
  onCreateCoupon: (couponData: Coupon) => Promise<Coupon>;
  onUpdateBulkInquiry?: (inquiryId: string, status: string) => Promise<BulkInquiry>;
  onClose: () => void;
}

export default function AdminPanel({
  products,
  repairs,
  tradeins,
  orders,
  coupons,
  currency,
  bulkInquiries = [],
  onUpdateStock,
  onUpdateRepair,
  onUpdateTradeIn,
  onUpdateOrder,
  onCreateCoupon,
  onUpdateBulkInquiry,
  onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'repairs' | 'tradeins' | 'inventory' | 'coupons' | 'bulkinquiries' | 'gmail'>('analytics');
  
  // Prep-populate state for Gmail portal integration
  const [gmailPrepopulate, setGmailPrepopulate] = useState<{
    email: string;
    subject: string;
    body: string;
    templateType?: 'dispatch' | 'repair' | 'tradein' | 'coupon';
    templateData?: any;
  } | null>(null);
  
  // Simulation Role State
  const [staffRole, setStaffRole] = useState<'Administrator' | 'Chief Technician' | 'Product Manager'>('Administrator');

  // Inventory adjustment state
  const [editingProductId, setEditingProductId] = useState('');
  const [adjustingStock, setAdjustingStock] = useState<number>(0);

  // Repair updating state
  const [selectedRepairId, setSelectedRepairId] = useState('');
  const [repairStatus, setRepairStatus] = useState<any>('');
  const [repairNotes, setRepairNotes] = useState('');
  const [repairQuoteGHS, setRepairQuoteGHS] = useState<number>(0);

  // Trade-In updating state
  const [selectedTradeInId, setSelectedTradeInId] = useState('');
  const [tradeInStatus, setTradeInStatus] = useState<any>('');
  const [tradeInNotes, setTradeInNotes] = useState('');
  const [tradeInOfferGHS, setTradeInOfferGHS] = useState<number>(0);

  // Order status state
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<any>('');

  // Bulk Inquiry status state
  const [selectedInquiryId, setSelectedInquiryId] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState<any>('');

  // Coupon creator state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState<number>(10);
  const [newCouponMinSpend, setNewCouponMinSpend] = useState<number>(0);

  // Analytics helper tallies
  const totalSalesGHS = orders.reduce((sum, o) => sum + o.totalGHS, 0);
  const totalSalesUSD = orders.reduce((sum, o) => sum + o.totalUSD, 0);
  const activeRepairsCount = repairs.filter(r => r.status !== 'Returned').length;
  const pendingTradeInsCount = tradeins.filter(t => t.status === 'Submitted').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const handleStockSave = async (id: string) => {
    try {
      await onUpdateStock(id, adjustingStock);
      setEditingProductId('');
    } catch (err) {
      console.error(err);
      alert('Failed to update stock');
    }
  };

  const handleRepairSave = async (id: string) => {
    try {
      await onUpdateRepair(id, repairStatus, repairNotes, repairQuoteGHS);
      setSelectedRepairId('');
    } catch (err) {
      console.error(err);
      alert('Failed to update repair request');
    }
  };

  const handleTradeInSave = async (id: string) => {
    try {
      await onUpdateTradeIn(id, tradeInStatus, tradeInNotes, tradeInOfferGHS);
      setSelectedTradeInId('');
    } catch (err) {
      console.error(err);
      alert('Failed to update trade-in');
    }
  };

  const handleOrderSave = async (id: string) => {
    try {
      await onUpdateOrder(id, orderStatus);
      setSelectedOrderId('');
    } catch (err) {
      console.error(err);
      alert('Failed to update order');
    }
  };

  const handleInquirySave = async (id: string) => {
    try {
      if (onUpdateBulkInquiry) {
        await onUpdateBulkInquiry(id, inquiryStatus);
        setSelectedInquiryId('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update bulk inquiry status');
    }
  };

  const handleCouponCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponPercent) return;
    try {
      await onCreateCoupon({
        code: newCouponCode.toUpperCase(),
        discountPercent: newCouponPercent,
        active: true,
        minSpendGHS: newCouponMinSpend > 0 ? newCouponMinSpend : undefined
      });
      setNewCouponCode('');
      setNewCouponPercent(10);
      setNewCouponMinSpend(0);
      alert('Coupon created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create coupon');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto text-gray-900 dark:text-white">
      <div 
        className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800/80 bg-gradient-to-r from-amber-500/5 to-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500 text-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-md font-extrabold tracking-tight flex items-center space-x-1.5">
                <span>Immortal Backend Management Desk</span>
                <span className="bg-amber-400 text-gray-950 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">Staff Gate</span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">Role Simulator: {staffRole}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Role Switcher */}
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as any)}
              className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-1.5 rounded-lg text-gray-800 dark:text-white font-mono"
              id="staff-role-switcher"
            >
              <option value="Administrator">Administrator (All access)</option>
              <option value="Chief Technician">Chief Technician (Repairs)</option>
              <option value="Product Manager">Product Manager (Inventory)</option>
            </select>

            <button
              onClick={onClose}
              id="admin-panel-close"
              className="px-4 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-900 border border-gray-800 text-xs font-semibold text-white"
            >
              Exit Desk
            </button>
          </div>
        </div>

        {/* Core Layout with sidebar and workspace */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-[#121212]/20 flex md:flex-col gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'analytics' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Real-Time Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              disabled={staffRole === 'Chief Technician'}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 disabled:opacity-40 ${
                activeTab === 'orders' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Orders Dispatch ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              disabled={staffRole === 'Product Manager'}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 disabled:opacity-40 ${
                activeTab === 'repairs' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Hammer className="w-4 h-4" />
              <span>Repairs Workbench ({repairs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tradeins')}
              disabled={staffRole === 'Chief Technician'}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 disabled:opacity-40 ${
                activeTab === 'tradeins' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Appraisal Desk ({tradeins.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              disabled={staffRole === 'Chief Technician'}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 disabled:opacity-40 ${
                activeTab === 'inventory' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Stock Inventory ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              disabled={staffRole !== 'Administrator'}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 disabled:opacity-40 ${
                activeTab === 'coupons' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Coupon Settings ({coupons.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('bulkinquiries')}
              disabled={staffRole === 'Chief Technician'}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 disabled:opacity-40 ${
                activeTab === 'bulkinquiries' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="admin-bulkinquiries-tab"
            >
              <Building2 className="w-4 h-4" />
              <span>Bulk Inquiries ({bulkInquiries.length})</span>
            </button>
            <button
              onClick={() => {
                setGmailPrepopulate(null);
                setActiveTab('gmail');
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'gmail' ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="admin-gmail-tab"
            >
              <Mail className="w-4 h-4" />
              <span>Gmail Desk</span>
            </button>
          </div>

          {/* Workspace Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* 1. ANALYTICS WORKSPACE */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold tracking-wide uppercase font-mono">Operations Dashboard</h3>
                
                {/* 4 Cards Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-mono text-gray-400">Total Store Revenue</span>
                      <DollarSign className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-xl font-bold block text-green-500">
                      {currency === 'GHS' ? `₵ ${totalSalesGHS.toLocaleString()}` : `$ ${totalSalesUSD.toLocaleString()}`}
                    </span>
                    <span className="text-[9px] text-gray-400 block font-mono">From {orders.length} secure checkouts</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-mono text-gray-400">Repairs Queue</span>
                      <Hammer className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xl font-bold block text-[#0066FF]">{activeRepairsCount} Active Tickets</span>
                    <span className="text-[9px] text-gray-400 block font-mono">Including motherboard macros</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-mono text-gray-400">Swaps Appraisals</span>
                      <RefreshCw className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-xl font-bold block text-amber-400">{pendingTradeInsCount} Pending Reviews</span>
                    <span className="text-[9px] text-gray-400 block font-mono">Awaiting physical drop-offs</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-mono text-gray-400">Low Stock Alerts</span>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-xl font-bold block text-red-500">{lowStockProducts.length} Items Alert</span>
                    <span className="text-[9px] text-gray-400 block font-mono">Below 5 items remaining</span>
                  </div>
                </div>

                {/* Custom Analytical Bar Charts using standard CSS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 border border-gray-150 dark:border-gray-800/60 bg-gray-50/40 dark:bg-[#121212]/30 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase font-mono mb-4 text-gray-400">Inventory Distribution</h4>
                    <div className="space-y-3 text-xs">
                      {[
                        { cat: 'Smartphones', count: products.filter(p => p.category === 'Smartphones').length, total: products.length, color: 'bg-[#0066FF]' },
                        { cat: 'Accessories', count: products.filter(p => p.category === 'Accessories').length, total: products.length, color: 'bg-green-500' },
                        { cat: 'Computing', count: products.filter(p => p.category === 'Computing').length, total: products.length, color: 'bg-indigo-500' },
                        { cat: 'Gaming', count: products.filter(p => p.category === 'Gaming').length, total: products.length, color: 'bg-amber-400' }
                      ].map((item) => {
                        const percent = item.total > 0 ? (item.count / item.total) * 100 : 0;
                        return (
                          <div key={item.cat} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="font-semibold">{item.cat}</span>
                              <span className="text-gray-400">{item.count} models ({percent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-5 border border-gray-150 dark:border-gray-800/60 bg-gray-50/40 dark:bg-[#121212]/30 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase font-mono mb-4 text-gray-400">Order Dispatch Progress</h4>
                    <div className="space-y-3 text-xs">
                      {[
                        { status: 'Pending Approval', count: orders.filter(o => o.status === 'Pending').length, total: orders.length, color: 'bg-gray-400' },
                        { status: 'Processing', count: orders.filter(o => o.status === 'Processing').length, total: orders.length, color: 'bg-blue-500' },
                        { status: 'In Transit', count: orders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length, total: orders.length, color: 'bg-amber-400' },
                        { status: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, total: orders.length, color: 'bg-green-500' }
                      ].map((item) => {
                        const percent = item.total > 0 ? (item.count / item.total) * 100 : 0;
                        return (
                          <div key={item.status} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="font-semibold">{item.status}</span>
                              <span className="text-gray-400">{item.count} items ({percent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ORDERS MANAGEMENT TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase font-mono">Store Dispatch Orders</h3>
                
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl text-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-2">
                          <div>
                            <span className="font-mono text-[10px] text-gray-400">TRACKING CODE</span>
                            <span className="font-bold text-gray-900 dark:text-white font-mono block">{order.trackingNumber}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-gray-400 block text-right">PAYMENT</span>
                            <span className="font-semibold block text-green-500 uppercase">{order.paymentStatus} via {order.paymentProvider || 'MoMo'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-gray-400 block text-right">DISPATCH</span>
                            {selectedOrderId === order.id ? (
                              <div className="flex items-center space-x-1 mt-1">
                                <select
                                  value={orderStatus}
                                  onChange={(e) => setOrderStatus(e.target.value as any)}
                                  className="p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-white rounded"
                                  id="order-status-select"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => handleOrderSave(order.id)}
                                  id={`save-order-status-${order.id}`}
                                  className="px-2 py-1 bg-green-500 text-white rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  onClick={() => { setSelectedOrderId(order.id); setOrderStatus(order.status); }}
                                  id={`edit-order-btn-${order.id}`}
                                  className="px-2.5 py-1 rounded bg-[#0066FF] text-white font-bold"
                                >
                                  {order.status} ✎
                                </button>
                                <button
                                  onClick={() => {
                                    setGmailPrepopulate({
                                      email: order.customerEmail || '',
                                      subject: '',
                                      body: '',
                                      templateType: 'dispatch',
                                      templateData: order
                                    });
                                    setActiveTab('gmail');
                                  }}
                                  className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold text-[9px] uppercase font-mono flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Email Dispatch</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block">DELIVER TO:</span>
                            <span className="block font-medium text-gray-800 dark:text-gray-200">{order.customerName}</span>
                            <span className="block">{order.customerPhone}</span>
                            <span className="block italic text-gray-500">{order.address}, {order.city}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block">ITEMS QUANTITY TALLY:</span>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="font-medium text-gray-800 dark:text-gray-200">
                                • {item.product.name} (x{item.quantity}) {item.selectedColor && `[${item.selectedColor}]`}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-400 font-mono">No purchase orders recorded yet.</p>
                )}
              </div>
            )}

            {/* 3. REPAIRS WORKBENCH TAB */}
            {activeTab === 'repairs' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase font-mono">Certified Repairs workbench</h3>
                
                {repairs.length > 0 ? (
                  <div className="space-y-4">
                    {repairs.map((repair) => (
                      <div key={repair.id} className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl text-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-2">
                          <div>
                            <span className="font-mono text-[10px] text-gray-400">REPAIR IDENTIFIER</span>
                            <span className="font-bold text-gray-900 dark:text-white font-mono block">{repair.trackingNumber}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-gray-400 block text-right">CUSTOMER</span>
                            <span className="font-semibold block">{repair.customerName} ({repair.customerPhone})</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-gray-400 block text-right">WORKBENCH TASK STATUS</span>
                            {selectedRepairId === repair.id ? (
                              <div className="flex items-center space-x-1 mt-1">
                                <select
                                  value={repairStatus}
                                  onChange={(e) => setRepairStatus(e.target.value as any)}
                                  className="p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-white rounded"
                                  id="repair-status-select"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Awaiting Parts">Awaiting Parts</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Returned">Returned</option>
                                </select>
                                <button
                                  onClick={() => handleRepairSave(repair.id)}
                                  id={`save-repair-status-${repair.id}`}
                                  className="px-2 py-1 bg-green-500 text-white rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedRepairId(repair.id);
                                    setRepairStatus(repair.status);
                                    setRepairNotes(repair.technicianNotes || '');
                                    setRepairQuoteGHS(repair.quotationGHS);
                                  }}
                                  id={`edit-repair-btn-${repair.id}`}
                                  className="px-2.5 py-1 rounded bg-[#0066FF] text-white font-bold"
                                >
                                  {repair.status} ✎
                                </button>
                                <button
                                  onClick={() => {
                                    setGmailPrepopulate({
                                      email: repair.customerEmail || '',
                                      subject: '',
                                      body: '',
                                      templateType: 'repair',
                                      templateData: repair
                                    });
                                    setActiveTab('gmail');
                                  }}
                                  className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold text-[9px] uppercase font-mono flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Email Assessment</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Diagnostic adjustment inputs */}
                        {selectedRepairId === repair.id ? (
                          <div className="p-3 bg-gray-50 dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-850 rounded-xl space-y-3">
                            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block">Adjust Diagnostic Valuation</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] text-gray-400 font-mono">Service Quotation (GHS)</label>
                                <input
                                  type="number"
                                  value={repairQuoteGHS}
                                  onChange={(e) => setRepairQuoteGHS(Number(e.target.value))}
                                  className="w-full mt-1 p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded text-xs text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-gray-400 font-mono">Technician Notes</label>
                                <input
                                  type="text"
                                  value={repairNotes}
                                  onChange={(e) => setRepairNotes(e.target.value)}
                                  className="w-full mt-1 p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded text-xs text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] font-mono text-gray-400 block">FAULT INQUIRY:</span>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{repair.brand} {repair.model} ({repair.faultCategory})</p>
                              <p className="text-gray-500 italic mt-0.5">"{repair.faultDescription}"</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-gray-400 block">DIAGNOSTIC SERVICE FEE:</span>
                              <span className="text-sm font-bold text-[#0066FF]">
                                {currency === 'GHS' ? `₵ ${repair.quotationGHS.toLocaleString()}` : `$ ${repair.quotationUSD.toLocaleString()}`}
                              </span>
                              <p className="text-gray-400 italic text-[10px] mt-1">{repair.technicianNotes || 'Awaiting visual diagnostics'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-400 font-mono">No repairs booked yet.</p>
                )}
              </div>
            )}

            {/* 4. TRADE-IN APPRAISAL DESK */}
            {activeTab === 'tradeins' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase font-mono">Device Appraisal Desk</h3>
                
                {tradeins.length > 0 ? (
                  <div className="space-y-4">
                    {tradeins.map((trade) => (
                      <div key={trade.id} className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl text-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-2">
                          <div>
                            <span className="font-mono text-[10px] text-gray-400">APPRAISAL CODE</span>
                            <span className="font-bold text-gray-900 dark:text-white font-mono block">{trade.trackingNumber}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-gray-400 block text-right">CUSTOMER</span>
                            <span className="font-semibold block">{trade.customerName} ({trade.customerPhone})</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-gray-400 block text-right">APPRAISAL VERDICT</span>
                            {selectedTradeInId === trade.id ? (
                              <div className="flex items-center space-x-1 mt-1">
                                <select
                                  value={tradeInStatus}
                                  onChange={(e) => setTradeInStatus(e.target.value as any)}
                                  className="p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-white rounded"
                                  id="tradein-status-select"
                                >
                                  <option value="Submitted">Submitted</option>
                                  <option value="Inspected">Inspected</option>
                                  <option value="Offer Generated">Offer Generated</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Declined">Declined</option>
                                  <option value="Completed">Completed</option>
                                </select>
                                <button
                                  onClick={() => handleTradeInSave(trade.id)}
                                  id={`save-tradein-status-${trade.id}`}
                                  className="px-2 py-1 bg-green-500 text-white rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedTradeInId(trade.id);
                                    setTradeInStatus(trade.status);
                                    setTradeInNotes(trade.notes || '');
                                    setTradeInOfferGHS(trade.finalOfferGHS || trade.valuationEstimateGHS);
                                  }}
                                  id={`edit-tradein-btn-${trade.id}`}
                                  className="px-2.5 py-1 rounded bg-[#0066FF] text-white font-bold"
                                >
                                  {trade.status} ✎
                                </button>
                                <button
                                  onClick={() => {
                                    setGmailPrepopulate({
                                      email: trade.customerEmail || '',
                                      subject: '',
                                      body: '',
                                      templateType: 'tradein',
                                      templateData: trade
                                    });
                                    setActiveTab('gmail');
                                  }}
                                  className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold text-[9px] uppercase font-mono flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Email Offer</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedTradeInId === trade.id ? (
                          <div className="p-3 bg-gray-50 dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-855 rounded-xl space-y-3">
                            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block">Set definitive Trade-In Swap Offer</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] text-gray-400 font-mono">Verified Swap Cash Offer (GHS)</label>
                                <input
                                  type="number"
                                  value={tradeInOfferGHS}
                                  onChange={(e) => setTradeInOfferGHS(Number(e.target.value))}
                                  className="w-full mt-1 p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded text-xs text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-gray-400 font-mono">Appraisal Remarks</label>
                                <input
                                  type="text"
                                  value={tradeInNotes}
                                  onChange={(e) => setTradeInNotes(e.target.value)}
                                  className="w-full mt-1 p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded text-xs text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] font-mono text-gray-400 block">DEVICE SPECS:</span>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{trade.brand} {trade.model} ({trade.condition})</p>
                              {trade.notes && <p className="text-gray-500 mt-0.5">Remarks: "{trade.notes}"</p>}
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-gray-400 block">CASH VERIFICATION VALUATION:</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="font-bold text-gray-400 line-through">
                                  GHS {trade.valuationEstimateGHS.toLocaleString()}
                                </span>
                                <span className="text-sm font-extrabold text-green-500">
                                  GHS {trade.finalOfferGHS ? trade.finalOfferGHS.toLocaleString() : 'N/A (Awaiting Verify)'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-400 font-mono">No trade-ins requested yet.</p>
                )}
              </div>
            )}

            {/* 5. INVENTORY & STOCK MANAGEMENT TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase font-mono">Stock Inventory</h3>
                
                <div className="space-y-2">
                  {products.map((product) => {
                    const isLowStock = product.stock <= 5;
                    return (
                      <div 
                        key={product.id} 
                        className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-colors ${
                          isLowStock 
                            ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/40' 
                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] hover:border-[#0066FF]/30'
                        }`}
                        id={`admin-inventory-${product.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-contain p-1 bg-gray-50 rounded" />
                          <div>
                            <span className="font-bold block text-gray-900 dark:text-white">{product.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase">{product.category} • {product.brand}</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="text-[9px] text-gray-400 font-mono block">STORE PRICE</span>
                          <span className="font-bold text-[#0066FF]">
                            GHS {product.priceGHS.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <span className="text-[9px] text-gray-400 font-mono block">CURRENT STOCK</span>
                            {editingProductId === product.id ? (
                              <div className="flex items-center space-x-1 mt-1">
                                <input
                                  type="number"
                                  value={adjustingStock}
                                  onChange={(e) => setAdjustingStock(Math.max(0, Number(e.target.value)))}
                                  className="w-12 p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs rounded text-center text-gray-950 dark:text-white"
                                  id={`stock-input-${product.id}`}
                                />
                                <button
                                  onClick={() => handleStockSave(product.id)}
                                  id={`save-stock-btn-${product.id}`}
                                  className="px-2 py-1 bg-green-500 text-white font-bold rounded"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingProductId(product.id); setAdjustingStock(product.stock); }}
                                id={`edit-stock-btn-${product.id}`}
                                className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${
                                  isLowStock ? 'text-red-500 bg-red-500/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                {product.stock} Units ✎
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. COUPON SETTINGS TAB */}
            {activeTab === 'coupons' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Coupon creation form */}
                <form onSubmit={handleCouponCreate} className="md:col-span-5 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold uppercase font-mono text-amber-500 flex items-center space-x-1">
                    <Percent className="w-4 h-4" />
                    <span>Create Promo Coupon</span>
                  </h4>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Promo Code (All Caps)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SPECIAL30"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                      id="input-coupon-code"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Discount Percent</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={newCouponPercent}
                        onChange={(e) => setNewCouponPercent(Number(e.target.value))}
                        className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-950 dark:text-white"
                        id="input-coupon-percent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Min Spend (GHS)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCouponMinSpend}
                        onChange={(e) => setNewCouponMinSpend(Number(e.target.value))}
                        className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-950 dark:text-white"
                        id="input-coupon-minspend"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="submit-coupon-btn"
                    className="w-full py-2.5 bg-amber-500 text-black rounded-xl font-bold text-xs"
                  >
                    Deploy Coupon Code
                  </button>
                </form>

                {/* Coupons listing */}
                <div className="md:col-span-7 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 p-5 rounded-2xl space-y-3 max-h-80 overflow-y-auto">
                  <h4 className="text-xs font-bold uppercase font-mono text-gray-400">Deployed Promo Codes</h4>
                  <div className="space-y-2">
                    {coupons.map((coupon, idx) => (
                      <div key={idx} className="p-3 border border-gray-100 dark:border-gray-900 rounded-lg flex items-center justify-between text-xs bg-gray-50/50 dark:bg-black/10">
                        <div>
                          <span className="font-extrabold text-[#0066FF] font-mono tracking-wider">{coupon.code}</span>
                          {coupon.minSpendGHS && <span className="text-[10px] text-gray-400 block font-mono">Requires Min GHS {coupon.minSpendGHS}</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-amber-500 block">{coupon.discountPercent}% OFF</span>
                          <span className="text-[9px] text-gray-400 font-mono">STATUS: {coupon.active ? 'ACTIVE' : 'EXPIRED'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. BULK INQUIRIES WORKSPACE */}
            {activeTab === 'bulkinquiries' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide uppercase font-mono">Wholesale & Corporate Inquiries</h3>
                  <p className="text-xs text-gray-500 mt-1">Review large volume purchasing requests and track outreach pipelines.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: List of Inquiries */}
                  <div className="lg:col-span-6 space-y-3">
                    {bulkInquiries.length === 0 ? (
                      <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400 font-mono">
                        No corporate inquiries received yet.
                      </div>
                    ) : (
                      bulkInquiries.map((inq) => {
                        const isSelected = selectedInquiryId === inq.id;
                        return (
                          <div
                            key={inq.id}
                            onClick={() => {
                              setSelectedInquiryId(inq.id);
                              setInquiryStatus(inq.status);
                            }}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-[#0066FF] bg-blue-500/5' 
                                : 'border-gray-150 dark:border-gray-800/80 bg-white dark:bg-[#121212] hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <span>{inq.companyName}</span>
                                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono px-2 py-0.5 rounded font-normal">
                                    {inq.estimatedQuantity} Qty
                                  </span>
                                </h4>
                                <p className="text-xs text-gray-400 font-medium mt-1">{inq.contactName} • {inq.deliveryLocation}</p>
                              </div>
                              <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase ${
                                inq.status === 'Pending' ? 'bg-amber-400/10 text-amber-500' :
                                inq.status === 'Contacted' ? 'bg-blue-500/10 text-blue-400' :
                                inq.status === 'Quoted' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-green-500/10 text-green-500'
                              }`}>
                                {inq.status}
                              </span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/60 flex justify-between text-[10px] text-gray-400 font-mono">
                              <span>TIMELINE: {inq.timeline}</span>
                              <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Inquiry Details & Actions */}
                  <div className="lg:col-span-6">
                    {selectedInquiryId ? (() => {
                      const inq = bulkInquiries.find(i => i.id === selectedInquiryId);
                      if (!inq) return <div className="p-6 text-center text-xs text-gray-400">Inquiry not found</div>;
                      return (
                        <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800/80 rounded-2xl p-6 space-y-5">
                          <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800/60 pb-4">
                            <div>
                              <span className="text-[9px] font-mono text-gray-400 block uppercase">CORPORATE ACCOUNT PROSPECT</span>
                              <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">{inq.companyName}</h3>
                              <p className="text-xs text-[#0066FF] font-semibold mt-0.5 font-mono">{inq.id.replace('inq-', 'IM-B2B-')}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(inq.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {/* Bid Specifications Grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Contact Name</span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{inq.contactName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Email Address</span>
                              <a href={`mailto:${inq.email}`} className="font-semibold text-[#0066FF] hover:underline block truncate">{inq.email}</a>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Phone Number</span>
                              <a href={`tel:${inq.phone}`} className="font-semibold hover:underline block">{inq.phone}</a>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Volume Tier</span>
                              <span className="font-bold text-amber-500 block">{inq.estimatedQuantity} Devices</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Timeline</span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{inq.timeline}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Payment Preference</span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{inq.preferredPayment}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Delivery Location</span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{inq.deliveryLocation}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-mono text-gray-400 block">Target Budget</span>
                              <span className="font-semibold text-amber-500">{inq.targetBudget || 'Not specified'}</span>
                            </div>
                          </div>

                          {/* Categories interested */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-mono text-gray-400 block">Interests</span>
                            <div className="flex flex-wrap gap-1.5">
                              {inq.productsOfInterest.map((p, i) => (
                                <span key={i} className="px-2 py-0.5 bg-[#0066FF]/10 text-[#0066FF] text-[10px] font-bold rounded-md font-mono">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Message */}
                          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <span className="text-[9px] uppercase font-mono text-gray-400 block font-semibold">Message & Device Specifications</span>
                            <p className="leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                          </div>

                          {/* Save / Update status */}
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60 space-y-3">
                            <span className="text-[10px] uppercase font-mono text-gray-400 block">Update Pipeline Stage</span>
                            <div className="flex gap-2.5">
                              <select
                                value={inquiryStatus}
                                onChange={(e) => setInquiryStatus(e.target.value as any)}
                                className="flex-1 p-2 bg-gray-50 dark:bg-[#0B0B0B] border border-gray-200 dark:border-gray-800 text-xs rounded-lg"
                              >
                                <option value="Pending">Pending (Awaiting quotation)</option>
                                <option value="Contacted">Contacted (Outreach initiated)</option>
                                <option value="Quoted">Quoted (Proposal/Invoice generated)</option>
                                <option value="Closed">Closed (Deal locked)</option>
                              </select>
                              <button
                                onClick={() => handleInquirySave(inq.id)}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black rounded-lg transition"
                                id="save-inquiry-status-btn"
                              >
                                Save Status
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400 font-mono bg-white dark:bg-[#121212]">
                        Select an inquiry from the left column to view procurement details.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gmail' && (
              <GmailHub
                orders={orders}
                repairs={repairs}
                tradeins={tradeins}
                bulkInquiries={bulkInquiries}
                prepopulateTarget={gmailPrepopulate}
                onClearPrepopulate={() => setGmailPrepopulate(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
