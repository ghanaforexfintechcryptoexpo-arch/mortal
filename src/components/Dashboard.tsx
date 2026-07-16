/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, ClipboardList, Hammer, RefreshCw, MapPin, CheckCircle2, Receipt, Phone, Mail, FileText, Calendar } from 'lucide-react';
import { Order, RepairRequest, TradeInRequest } from '../types.js';

interface DashboardProps {
  orders: Order[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  currency: 'GHS' | 'USD';
  onClose: () => void;
}

export default function Dashboard({ orders, repairs, tradeins, currency, onClose }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'repairs' | 'tradeins' | 'profile'>('orders');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Simulated Customer Profile
  const [profileName, setProfileName] = useState('Alhassan Ibrahim');
  const [profilePhone, setProfilePhone] = useState('0244192834');
  const [profileEmail, setProfileEmail] = useState('alhassan@gmail.com');
  const [profileAddress, setProfileAddress] = useState('42 Kwame Nkrumah Avenue, Adabraka');
  const [profileCity, setProfileCity] = useState('Accra');

  const [isSaved, setIsSaved] = useState(false);

  // Filter records specifically for our logged-in customer name
  const customerOrders = orders.filter(
    o => o.customerName.toLowerCase() === profileName.toLowerCase() || o.customerPhone === profilePhone
  );

  const customerRepairs = repairs.filter(
    r => r.customerName.toLowerCase() === profileName.toLowerCase() || r.customerPhone === profilePhone
  );

  const customerTradeins = tradeins.filter(
    t => t.customerName.toLowerCase() === profileName.toLowerCase() || t.customerPhone === profilePhone
  );

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto text-gray-900 dark:text-white">
      <div 
        className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#121212] dark:to-[#121212]/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#0066FF] text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Accra Customer Account</h2>
              <p className="text-xs text-gray-400 font-mono">Logged in as {profileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="dashboard-close-btn"
            className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold"
          >
            Close Dashboard
          </button>
        </div>

        {/* Inner layout with sidebar and main content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-[#121212]/20 flex md:flex-col gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => { setActiveTab('orders'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-orders"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Purchase Orders ({customerOrders.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('repairs'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'repairs'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-repairs"
            >
              <Hammer className="w-4 h-4" />
              <span>Active Repairs ({customerRepairs.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('tradeins'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'tradeins'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-tradeins"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Swap Trade-Ins ({customerTradeins.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-profile"
            >
              <User className="w-4 h-4" />
              <span>Profile Addresses</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* INVOICE SIMULATOR SCREEN */}
            {selectedInvoiceOrder ? (
              <div className="space-y-6" id="invoice-simulation-view">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="text-sm font-extrabold flex items-center space-x-1">
                    <Receipt className="w-4 h-4 text-[#0066FF]" />
                    <span>IMMORTAL TAX INVOICE</span>
                  </h3>
                  <button
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="text-[10px] text-gray-400 font-mono hover:underline uppercase"
                  >
                    ← Back to List
                  </button>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-2xl space-y-6 text-xs text-gray-700 dark:text-gray-300 relative">
                  {/* Watermark design */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-center select-none">
                    <span className="text-6xl font-extrabold tracking-widest text-[#0066FF]">IMMORTAL</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-bold text-gray-950 dark:text-white block">IMMORTAL ELECTRONICS LTD.</span>
                      <span className="block mt-1">42 Kwame Nkrumah Avenue</span>
                      <span className="block">Adabraka, Accra, Ghana</span>
                      <span className="block">Phone: +233 24 419 2834</span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">TAX TRANSACTION STATEMENT</span>
                      <span className="block font-bold text-gray-950 dark:text-white">INVOICE #{selectedInvoiceOrder.trackingNumber}</span>
                      <span className="block">Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</span>
                      <span className="block">Status: <span className="text-green-500 font-bold uppercase">{selectedInvoiceOrder.paymentStatus}</span></span>
                      <span className="block">Gateway: {selectedInvoiceOrder.paymentProvider || 'Mobile Money'}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white uppercase font-mono block text-[10px]">BILLED TO:</span>
                      <span className="block font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceOrder.customerName}</span>
                      <span className="block">{selectedInvoiceOrder.customerPhone}</span>
                      <span className="block">{selectedInvoiceOrder.customerEmail}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white uppercase font-mono block text-[10px]">SHIPPING DESTINATION:</span>
                      <span className="block font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceOrder.address}</span>
                      <span className="block">{selectedInvoiceOrder.city}, Ghana</span>
                      <span className="block">Option: {selectedInvoiceOrder.deliveryOption}</span>
                    </div>
                  </div>

                  {/* Itemized pricing table */}
                  <table className="w-full text-left mt-6 border-t border-gray-100 dark:border-gray-800">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-mono text-gray-400">
                        <th className="py-2">Item Details</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Unit Price</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoiceOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-900/40">
                          <td className="py-3 font-semibold text-gray-900 dark:text-white">
                            {item.product.name} {item.selectedColor && `(${item.selectedColor})`}
                          </td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right">
                            {currency === 'GHS' ? `₵ ${item.product.priceGHS.toLocaleString()}` : `$ ${item.product.priceUSD.toLocaleString()}`}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {currency === 'GHS' 
                              ? `₵ ${(item.product.priceGHS * item.quantity).toLocaleString()}` 
                              : `$ ${(item.product.priceUSD * item.quantity).toLocaleString()}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-4">
                    <div className="w-64 space-y-1.5 text-right border-t border-gray-100 dark:border-gray-800 pt-3">
                      <div className="flex justify-between text-[11px]">
                        <span>Subtotal:</span>
                        <span>{currency === 'GHS' ? `₵ ${(selectedInvoiceOrder.totalGHS - selectedInvoiceOrder.deliveryCostGHS).toLocaleString()}` : `$ ${(selectedInvoiceOrder.totalUSD - Math.round(selectedInvoiceOrder.deliveryCostGHS / 14.5)).toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Accra Local Delivery:</span>
                        <span>{currency === 'GHS' ? `₵ ${selectedInvoiceOrder.deliveryCostGHS}` : `$ ${Math.round(selectedInvoiceOrder.deliveryCostGHS / 14.5)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#0066FF] border-t border-gray-100 dark:border-gray-900 pt-2">
                        <span>Grand Total:</span>
                        <span>{currency === 'GHS' ? `₵ ${selectedInvoiceOrder.totalGHS.toLocaleString()}` : `$ ${selectedInvoiceOrder.totalUSD.toLocaleString()}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-gray-400 font-mono border-t border-gray-100 dark:border-gray-900 pt-4">
                    Thank you for shopping at Immortal Electronics. Under Ghanaian Consumer Council care.
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2.5 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-all"
                  >
                    🖨️ Print Tax Invoice
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* PURCHASE ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold">Your Purchase Orders</h3>
                    {customerOrders.length > 0 ? (
                      <div className="space-y-3">
                        {customerOrders.map((order) => (
                          <div 
                            key={order.id} 
                            className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl flex items-center justify-between text-xs hover:border-[#0066FF]/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-gray-400 block">ORDER TRACKING</span>
                              <span className="font-bold text-gray-900 dark:text-white font-mono block">{order.trackingNumber}</span>
                              <span className="text-gray-400 block">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</span>
                            </div>

                            <div className="text-center">
                              <span className="text-[10px] font-mono text-gray-400 block">TOTAL VALUE</span>
                              <span className="font-bold text-[#0066FF] block">
                                {currency === 'GHS' ? `₵ ${order.totalGHS.toLocaleString()}` : `$ ${order.totalUSD.toLocaleString()}`}
                              </span>
                            </div>

                            <div className="text-right flex items-center space-x-3">
                              <div>
                                <span className="text-[10px] font-mono text-gray-400 block">STATUS</span>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">{order.status}</span>
                              </div>
                              <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                id={`view-invoice-${order.id}`}
                                title="View Receipt Invoice"
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                              >
                                <Receipt className="w-4 h-4 text-[#0066FF]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <ClipboardList className="w-8 h-8 mx-auto text-gray-400 animate-bounce" />
                        <p className="text-xs text-gray-400 mt-2 font-mono">No purchase orders under profile "{profileName}".</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTIVE REPAIRS TAB */}
                {activeTab === 'repairs' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold">Active Repair Tickets</h3>
                    {customerRepairs.length > 0 ? (
                      <div className="space-y-3">
                        {customerRepairs.map((repair) => (
                          <div 
                            key={repair.id} 
                            className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl flex items-center justify-between text-xs hover:border-[#0066FF]/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-gray-400 block">REPAIR CODE</span>
                              <span className="font-bold text-gray-900 dark:text-white font-mono block">{repair.trackingNumber}</span>
                              <span className="text-gray-500 block font-medium">{repair.brand} {repair.model} ({repair.faultCategory})</span>
                            </div>

                            <div className="text-center">
                              <span className="text-[10px] font-mono text-gray-400 block">SERVICE CHARGE</span>
                              <span className="font-bold text-[#0066FF] block">
                                {currency === 'GHS' ? `₵ ${repair.quotationGHS.toLocaleString()}` : `$ ${repair.quotationUSD.toLocaleString()}`}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-mono text-gray-400 block">STATUS</span>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">{repair.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <Hammer className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-400 mt-2 font-mono">No active repair tickets under profile "{profileName}".</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SWAP TRADE-INS TAB */}
                {activeTab === 'tradeins' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold">Your Swap Appraisals</h3>
                    {customerTradeins.length > 0 ? (
                      <div className="space-y-3">
                        {customerTradeins.map((trade) => (
                          <div 
                            key={trade.id} 
                            className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl flex items-center justify-between text-xs hover:border-[#0066FF]/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-gray-400 block">APPRAISAL TRANSACTION</span>
                              <span className="font-bold text-gray-900 dark:text-white font-mono block">{trade.trackingNumber}</span>
                              <span className="text-gray-500 block font-medium">{trade.brand} {trade.model} ({trade.condition})</span>
                            </div>

                            <div className="text-center">
                              <span className="text-[10px] font-mono text-gray-400 block">PRE-VALUATION</span>
                              <span className="font-bold text-[#0066FF] block">
                                {currency === 'GHS' ? `₵ ${trade.valuationEstimateGHS.toLocaleString()}` : `$ ${trade.valuationEstimateUSD.toLocaleString()}`}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-mono text-gray-400 block">STATUS</span>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">{trade.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <RefreshCw className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-400 mt-2 font-mono">No trade-in appraisal requests under profile "{profileName}".</p>
                      </div>
                    )}
                  </div>
                )}

                {/* PROFILE ADDRESSES TAB */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <h3 className="text-sm font-extrabold">Delivery Addresses & Profile Settings</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Contact Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Ghanaian Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Region / City</label>
                        <input
                          type="text"
                          required
                          value={profileCity}
                          onChange={(e) => setProfileCity(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Delivery Address (Street, House No, Area)</label>
                      <input
                        type="text"
                        required
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#0066FF]/20"
                      >
                        Save Profile Addresses
                      </button>

                      {isSaved && (
                        <span className="text-xs text-green-500 font-bold flex items-center animate-bounce">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Profile saved successfully!
                        </span>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
