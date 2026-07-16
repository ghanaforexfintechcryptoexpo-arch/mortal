import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Send, Inbox, LogOut, RefreshCw, FileText, CheckCircle, Search, 
  Sparkles, Plus, AlertCircle, ArrowRight, User, Clock, ChevronRight, Copy
} from 'lucide-react';
import { 
  googleSignIn, logout, initAuth, fetchGmailMessages, sendGmailMessage, 
  GmailMessage, fetchGmailMessageDetail 
} from '../lib/gmail';
import { Order, RepairRequest, TradeInRequest, BulkInquiry } from '../types';

interface GmailHubProps {
  orders: Order[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  bulkInquiries?: BulkInquiry[];
  prepopulateTarget?: {
    email: string;
    subject: string;
    body: string;
    templateType?: 'dispatch' | 'repair' | 'tradein' | 'coupon';
    templateData?: any;
  } | null;
  onClearPrepopulate?: () => void;
}

export default function GmailHub({
  orders,
  repairs,
  tradeins,
  bulkInquiries = [],
  prepopulateTarget = null,
  onClearPrepopulate
}: GmailHubProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Email client states
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Compose / Template states
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Quick lookup drawer
  const [showLookupDrawer, setShowLookupDrawer] = useState(false);
  const [lookupFilter, setLookupFilter] = useState<'orders' | 'repairs' | 'tradeins'>('orders');
  const [lookupSearch, setLookupSearch] = useState('');

  // Setup auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthenticated(true);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Generate Quick-Fill templates dynamically based on real data
  const applyTemplate = (templateType: 'dispatch' | 'repair' | 'tradein' | 'coupon', data?: any) => {
    let tSubject = '';
    let tBody = '';

    if (templateType === 'dispatch') {
      const ord = data || orders[0];
      const trackingCode = ord?.trackingNumber || 'IM-ORD-892415';
      const customer = ord?.customerName || 'Customer';
      const amount = ord ? `GHS ${ord.totalGHS.toLocaleString()}` : 'GHS 21,500';

      tSubject = `📦 Dispatch Confirmed - Immortal Electronics Order [${trackingCode}]`;
      tBody = `<div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px;">
        <h2 style="color: #0066FF; margin-top: 0;">Order Dispatch Confirmation 🚀</h2>
        <p>Dear <strong>${customer}</strong>,</p>
        <p>We are excited to inform you that your certified device from <strong>Immortal Electronics</strong> has been hand-inspected, packed in protective packaging, and handed over to our regional dispatch fleet!</p>
        
        <div style="background-color: #f3f4f6; border-left: 4px solid #0066FF; padding: 12px 16px; margin: 18px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 4px 0;"><strong>Order Code:</strong> ${trackingCode}</p>
          <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${ord?.address || 'Kwame Nkrumah Avenue'}, ${ord?.city || 'Accra'}</p>
          <p style="margin: 4px 0;"><strong>Total Value:</strong> ${amount}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> Regional Dispatch Outbound</p>
        </div>

        <p>Our dispatch courier will call your telephone number (<strong>${ord?.customerPhone || '0244192834'}</strong>) to coordinate doorstep delivery. Please keep your phone line active for MoMo prompt alerts or cash delivery validation.</p>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 11px; color: #6b7280; font-style: italic;">Thank you for trusting Immortal Electronics - Certified Tech Longevity.</p>
      </div>`;
    } 
    else if (templateType === 'repair') {
      const rep = data || repairs[0];
      const trackingCode = rep?.trackingNumber || 'IM-REP-412893';
      const customer = rep?.customerName || 'Customer';
      const fault = rep?.faultCategory || 'Screen Damage';
      const device = `${rep?.brand || 'Apple'} ${rep?.model || 'iPhone 15 Pro Max'}`;
      const quote = rep ? `GHS ${rep.quotationGHS.toLocaleString()}` : 'GHS 1,800';

      tSubject = `🔧 Diagnostic & Quotation Report - Repair Tracking [${trackingCode}]`;
      tBody = `<div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px;">
        <h2 style="color: #059669; margin-top: 0;">Certified Diagnostic Report 🔧</h2>
        <p>Dear <strong>${customer}</strong>,</p>
        <p>Our lead technician has completed a full diagnostic inspection on your <strong>${device}</strong> submitted for repair.</p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 12px 16px; margin: 18px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 4px 0;"><strong>Repair Ticket:</strong> ${trackingCode}</p>
          <p style="margin: 4px 0;"><strong>Identified Issue:</strong> ${fault}</p>
          <p style="margin: 4px 0;"><strong>Technician Assessment:</strong> ${rep?.technicianNotes || 'Requires premium modular component replacement.'}</p>
          <p style="margin: 4px 0;"><strong>Estimated Invoice Quote:</strong> <span style="font-size: 16px; color: #059669; font-weight: bold;">${quote}</span></p>
        </div>

        <p><strong>Next Step Required:</strong> Please reply directly to this email or call us to confirm approval of this quotation. Once approved, our technicians will finalize the repair within 45 minutes.</p>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 11px; color: #6b7280; font-style: italic;">Immortal Electronics Accra - Authorised Diagnostics.</p>
      </div>`;
    }
    else if (templateType === 'tradein') {
      const trd = data || tradeins[0];
      const trackingCode = trd?.trackingNumber || 'IM-TRD-531092';
      const customer = trd?.customerName || 'Customer';
      const device = `${trd?.brand || 'Samsung'} ${trd?.model || 'Galaxy S24'}`;
      const valuation = trd ? `GHS ${trd.valuationEstimateGHS.toLocaleString()}` : 'GHS 7,500';

      tSubject = `🔄 Instant Swap Offer Appraisal [${trackingCode}] - Immortal Electronics`;
      tBody = `<div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px;">
        <h2 style="color: #6366f1; margin-top: 0;">Instant Appraisal Swap Offer 🔄</h2>
        <p>Dear <strong>${customer}</strong>,</p>
        <p>Thank you for submitting your <strong>${device}</strong> for instant trade-in appraisal with Immortal Electronics.</p>
        
        <div style="background-color: #f5f3ff; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 18px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 4px 0;"><strong>Appraisal Ticket:</strong> ${trackingCode}</p>
          <p style="margin: 4px 0;"><strong>Declared Condition:</strong> ${trd?.condition || 'Good'}</p>
          <p style="margin: 4px 0;"><strong>Estimated Swap Credit Valuation:</strong> <span style="font-size: 16px; color: #6366f1; font-weight: bold;">${valuation}</span></p>
        </div>

        <p><strong>Swap Instructions:</strong> To redeem this appraisal for cash or trade-in store credit toward a flagship upgrade, please bring your device to our headquarters at <strong>42 Kwame Nkrumah Avenue, Adabraka, Accra</strong>.</p>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 11px; color: #6b7280; font-style: italic;">Redeemable for up to 7 days from submission.</p>
      </div>`;
    }
    else if (templateType === 'coupon') {
      tSubject = `🎁 Special VIP Loyalty Coupon Alert - Immortal Electronics`;
      tBody = `<div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px;">
        <h2 style="color: #d97706; margin-top: 0;">Exquisite VIP Loyalty Token 🎁</h2>
        <p>Hello valued customer,</p>
        <p>To celebrate our TechLongevity community in Ghana, we have provisioned an exclusive discount token for your next flagship purchase or premium diagnostic repair service!</p>
        
        <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 16px; margin: 18px 0; border-radius: 8px; text-align: center;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #b45309; font-weight: bold; display: block;">PROMO DISCOUNT CODE</span>
          <span style="font-size: 28px; font-weight: 900; color: #d97706; letter-spacing: 2px; display: block; margin: 8px 0;">WELCOME10</span>
          <span style="font-size: 12px; color: #78350f; font-weight: bold; display: block;">Get 10% Flat Discount on all store transactions</span>
        </div>

        <p>Redeem this code during checkout in our shop, or mention it to our billing clerk at our Adabraka branch to unlock instantaneous savings.</p>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 11px; color: #6b7280; font-style: italic;">Certified Tech Longevity - Adabraka, Accra, Ghana.</p>
      </div>`;
    }

    setSubject(tSubject);
    setBodyText(tBody);
    setActiveTemplate(templateType);
  };

  // Handle auto-prepopulation from parent actions
  useEffect(() => {
    if (prepopulateTarget && isAuthenticated) {
      setRecipient(prepopulateTarget.email || '');
      if (prepopulateTarget.templateType) {
        applyTemplate(prepopulateTarget.templateType, prepopulateTarget.templateData);
      } else {
        setSubject(prepopulateTarget.subject || '');
        setBodyText(prepopulateTarget.body || '');
        setActiveTemplate('prepopulated');
      }
    }
  }, [prepopulateTarget, isAuthenticated]);

  // Fetch emails when token is available
  useEffect(() => {
    if (token && isAuthenticated) {
      handleLoadEmails();
    }
  }, [token, isAuthenticated]);

  const handleLoadEmails = async (search: string = '') => {
    if (!token) return;
    setIsEmailsLoading(true);
    try {
      const msgs = await fetchGmailMessages(token, search);
      setEmails(msgs);
    } catch (err) {
      console.error('Failed to load Gmail messages', err);
    } finally {
      setIsEmailsLoading(false);
    }
  };

  const handleEmailClick = async (email: GmailMessage) => {
    if (!token) return;
    setIsDetailLoading(true);
    setSelectedEmail(email);
    try {
      const detailed = await fetchGmailMessageDetail(token, email.id);
      setSelectedEmail(detailed);
    } catch (err) {
      console.error('Failed to fetch detailed email body', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Login flow failed', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      setEmails([]);
      setSelectedEmail(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!recipient || !subject || !bodyText) {
      setSendError('Please fill out all email fields.');
      return;
    }

    const confirmSend = window.confirm(`Are you sure you want to send this email to ${recipient}? This is a real email sent from your Gmail account.`);
    if (!confirmSend) return;

    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      const res = await sendGmailMessage(token, recipient, subject, bodyText);
      setSendSuccess(`Email dispatched successfully! Thread ID: ${res.threadId}`);
      
      // Clear fields on success
      setRecipient('');
      setSubject('');
      setBodyText('');
      setActiveTemplate(null);
      if (onClearPrepopulate) onClearPrepopulate();
      
      // Reload inbox to see outbound email
      handleLoadEmails(searchQuery);
    } catch (err: any) {
      console.error('Error dispatching Gmail message:', err);
      setSendError(err.message || 'Failed to send email. Check your scopes or daily limits.');
    } finally {
      setIsSending(false);
    }
  };

  // Safe html rendering for gmail message body
  const renderEmailBody = (html: string) => {
    // If body looks like raw HTML, wrap it or use iframe sandboxed for security
    return (
      <div 
        className="text-xs text-gray-800 dark:text-gray-100 space-y-2 overflow-y-auto max-h-[350px] p-3 rounded-lg bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-900 leading-relaxed font-sans"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  // Search filter for Quick Lookup Drawer
  const filteredLookupItems = () => {
    const q = lookupSearch.trim().toLowerCase();
    if (lookupFilter === 'orders') {
      return orders.filter(o => 
        o.trackingNumber.toLowerCase().includes(q) || 
        o.customerName.toLowerCase().includes(q) || 
        o.customerPhone.includes(q)
      );
    } else if (lookupFilter === 'repairs') {
      return repairs.filter(r => 
        r.trackingNumber.toLowerCase().includes(q) || 
        r.customerName.toLowerCase().includes(q) || 
        r.customerPhone.includes(q)
      );
    } else {
      return tradeins.filter(t => 
        t.trackingNumber.toLowerCase().includes(q) || 
        t.customerName.toLowerCase().includes(q) || 
        t.customerPhone.includes(q)
      );
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden" id="gmail-hub-container">
      {/* Header bar */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-red-500/10 via-blue-500/5 to-transparent border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-gray-950 dark:text-white uppercase font-mono flex items-center gap-2">
              <span>Gmail Communications Desk</span>
              <span className="bg-[#0066FF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans uppercase">API Verified</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Coordinated CRM updates, dispatch receipts, and diagnostic quote dispatches.
            </p>
          </div>
        </div>

        {/* Authentication Status widget */}
        <div>
          {isAuthLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <RefreshCw className="w-3 h-3 animate-spin text-[#0066FF]" />
              <span>Checking token registry...</span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-700" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-xs font-black">
                  {user.displayName?.charAt(0) || 'G'}
                </div>
              )}
              <div className="text-left">
                <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold leading-none">SIGNED IN OPERATOR</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white block truncate max-w-[140px]">{user.displayName || user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                title="Disconnect Google Account"
                id="btn-gmail-disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button text-xs font-medium cursor-pointer shadow-sm flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 p-2 border border-gray-300 dark:border-gray-700 rounded-xl"
              id="btn-gmail-signin"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Signing In...</span>
                </>
              ) : (
                <>
                  <div className="gsi-material-button-icon shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="font-mono text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">Connect Google Workspace</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main interface area */}
      {!isAuthenticated ? (
        <div className="p-10 text-center space-y-4 max-w-xl mx-auto my-6" id="gmail-unauthenticated-state">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-8 h-8" />
          </div>
          <h4 className="text-md font-bold text-gray-900 dark:text-white font-mono uppercase tracking-tight">Connect with Gmail to Coordinate Orders</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            By connecting your Google Workspace credentials, you can directly query customer inbound emails by order tracking identifiers, inspect customer issues, and dispatch real CRM emails utilizing pre-formatted operations templates.
          </p>
          <div className="pt-2">
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs uppercase tracking-widest font-mono rounded-xl shadow-lg shadow-red-500/15 active:scale-95 transition-all cursor-pointer"
            >
              {isLoggingIn ? 'Establishing Tunnel...' : 'Authorize Gmail API Access'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-800">
          
          {/* Column Left: Inbox List (4/12 width) */}
          <div className="lg:col-span-5 flex flex-col h-[580px]" id="gmail-inbox-column">
            {/* Inbox Search bar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Gmail (e.g. IM-ORD, alhassan)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadEmails(searchQuery)}
                  className="w-full pl-9 pr-8 py-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF] text-gray-900 dark:text-white"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); handleLoadEmails(''); }}
                    className="absolute right-2.5 top-2 text-[10px] text-gray-400 hover:text-gray-200 uppercase font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-400">
                <span className="uppercase tracking-wider flex items-center gap-1">
                  <Inbox className="w-3 h-3 text-red-500" />
                  <span>Interactive Mailbox</span>
                </span>
                <button 
                  onClick={() => handleLoadEmails(searchQuery)}
                  className="hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isEmailsLoading ? 'animate-spin' : ''}`} />
                  <span>REFRESH</span>
                </button>
              </div>
            </div>

            {/* Email Inbox list */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-900 bg-gray-50/50 dark:bg-black/5">
              {isEmailsLoading ? (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0066FF] mx-auto" />
                  <p className="text-[11px] text-gray-400 font-mono uppercase">Retrieving messages via Gmail API...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Mail className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-400">No emails found matching query.</p>
                  <button 
                    onClick={() => handleLoadEmails('')}
                    className="mt-2 text-[10px] text-[#0066FF] hover:underline uppercase font-bold font-mono"
                  >
                    Clear Query
                  </button>
                </div>
              ) : (
                emails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={`p-3 cursor-pointer text-left transition-colors relative ${
                        isSelected 
                          ? 'bg-blue-500/10 border-l-4 border-[#0066FF] dark:bg-blue-500/5' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-900 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                          {email.isSent ? '📤 Sent Update' : email.from?.replace(/<.*>/, '').trim()}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono shrink-0">
                          {email.date ? new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <h5 className="text-[11px] font-black tracking-tight text-gray-800 dark:text-gray-200 truncate leading-tight">
                        {email.subject || '(No Subject)'}
                      </h5>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal">
                        {email.snippet}
                      </p>

                      {/* Flag labels inside email */}
                      <div className="flex gap-1.5 mt-2">
                        {email.subject?.includes('IM-ORD-') && (
                          <span className="bg-blue-500/10 text-blue-500 text-[8px] font-bold font-mono px-1 py-0.5 rounded uppercase">Order Update</span>
                        )}
                        {email.subject?.includes('IM-REP-') && (
                          <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-bold font-mono px-1 py-0.5 rounded uppercase">Repair Quote</span>
                        )}
                        {email.subject?.includes('IM-TRD-') && (
                          <span className="bg-indigo-500/10 text-indigo-500 text-[8px] font-bold font-mono px-1 py-0.5 rounded uppercase">Trade-In Offer</span>
                        )}
                        {email.isSent && (
                          <span className="bg-amber-500/10 text-amber-500 text-[8px] font-bold font-mono px-1 py-0.5 rounded uppercase">SENT OUTBOUND</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column Right: Email detail view / Compose Panel (7/12 width) */}
          <div className="lg:col-span-7 flex flex-col h-[580px]" id="gmail-workspace-column">
            
            {/* Header: Toggle Compose vs View mode */}
            <div className="bg-gray-50/50 dark:bg-black/10 p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">
                {selectedEmail ? '🔬 Message Inspection' : '✏️ Dispatch Outbound Console'}
              </span>
              
              <div className="flex gap-2">
                {selectedEmail && (
                  <button
                    onClick={() => {
                      // Prepopulate reply
                      setRecipient(selectedEmail.from?.match(/<([^>]+)>/)?.[1] || selectedEmail.from || '');
                      setSubject(`Re: ${selectedEmail.subject}`);
                      setBodyText(`\n\nOn ${selectedEmail.date}, ${selectedEmail.from} wrote:\n> ${selectedEmail.snippet}`);
                      setSelectedEmail(null);
                      setActiveTemplate(null);
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Reply
                  </button>
                )}
                
                {selectedEmail && (
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Compose New
                  </button>
                )}
              </div>
            </div>

            {/* Content area: Detail view OR Compose Editor */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* RENDER DETAILED VIEW */}
              {selectedEmail ? (
                <div className="space-y-4 animate-fade-in" id="gmail-detail-view">
                  {isDetailLoading ? (
                    <div className="p-12 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0066FF] mx-auto" />
                      <p className="text-[11px] text-gray-400 font-mono uppercase">Downloading full MIME payloads...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                            {selectedEmail.subject || '(No Subject)'}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-gray-400 pt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-red-500" />
                            <strong>From:</strong> {selectedEmail.from}
                          </span>
                          <span className="flex items-center gap-1">
                            <strong>To:</strong> {selectedEmail.to}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <strong>Date:</strong> {selectedEmail.date}
                          </span>
                        </div>
                      </div>

                      {/* Display rendered body safely */}
                      {renderEmailBody(selectedEmail.body || selectedEmail.snippet || '')}

                      {/* Fast Reply Suggestions based on body */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase block tracking-wider">Fast Response Templates</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => {
                              setRecipient(selectedEmail.from?.match(/<([^>]+)>/)?.[1] || selectedEmail.from || '');
                              setSubject(`Update: ${selectedEmail.subject}`);
                              setBodyText(`<p>Dear Customer,</p><p>We have successfully received your inquiry about device support. Your ticket is currently in processing. We will notify you via our regional Adabraka coordinates as soon as diagnostics conclude.</p>`);
                              setSelectedEmail(null);
                              setActiveTemplate('prepopulated');
                            }}
                            className="px-2 py-1 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-[10px] transition-all font-mono font-bold"
                          >
                            ⚡ Confirming Receipt
                          </button>
                          <button
                            onClick={() => {
                              setRecipient(selectedEmail.from?.match(/<([^>]+)>/)?.[1] || selectedEmail.from || '');
                              setSubject(`Ready for Pickup: ${selectedEmail.subject}`);
                              setBodyText(`<p>Dear Customer,</p><p>Great news! Your flagship device repair or trade-in trade exchange is fully completed and processed at our headquarters in Adabraka, Accra.</p><p>Please stop by with your diagnostic booking receipt to finalize collection.</p>`);
                              setSelectedEmail(null);
                              setActiveTemplate('prepopulated');
                            }}
                            className="px-2 py-1 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-[10px] transition-all font-mono font-bold"
                          >
                            ⚡ Ready for Pickup
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* RENDER COMPOSE EDITOR */
                <form onSubmit={handleSendEmail} className="space-y-4 animate-fade-in" id="gmail-compose-form">
                  
                  {/* Select Templates */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                        Select Premium Operations Templates
                      </span>
                      
                      {/* Lookup drawer trigger */}
                      <button
                        type="button"
                        onClick={() => setShowLookupDrawer(!showLookupDrawer)}
                        className="text-[9px] font-mono font-bold text-[#0066FF] hover:underline uppercase flex items-center gap-1"
                      >
                        {showLookupDrawer ? 'Hide Lookup Drawer' : '🔍 Lookup Order/Ticket'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => applyTemplate('dispatch')}
                        className={`p-2 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-[55px] ${
                          activeTemplate === 'dispatch'
                            ? 'border-[#0066FF] bg-blue-500/5'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase font-mono block truncate">📦 Dispatch Confirmation</span>
                        <span className="text-[8px] text-gray-400 block font-sans">Pre-filled order dispatch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTemplate('repair')}
                        className={`p-2 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-[55px] ${
                          activeTemplate === 'repair'
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase font-mono block truncate">🔧 Repair Diagnostics</span>
                        <span className="text-[8px] text-gray-400 block font-sans">Quotation & fault report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTemplate('tradein')}
                        className={`p-2 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-[55px] ${
                          activeTemplate === 'tradein'
                            ? 'border-indigo-500 bg-indigo-500/5'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase font-mono block truncate">🔄 Swap Appraisal</span>
                        <span className="text-[8px] text-gray-400 block font-sans">Estimated swap valuation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTemplate('coupon')}
                        className={`p-2 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-[55px] ${
                          activeTemplate === 'coupon'
                            ? 'border-amber-500 bg-amber-500/5'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase font-mono block truncate">🎁 Loyalty coupon</span>
                        <span className="text-[8px] text-gray-400 block font-sans">VIP WELCOME10 code</span>
                      </button>
                    </div>
                  </div>

                  {/* QUICK LOOKUP DRAWER GRID */}
                  {showLookupDrawer && (
                    <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {(['orders', 'repairs', 'tradeins'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setLookupFilter(type)}
                              className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded ${
                                lookupFilter === type
                                  ? 'bg-[#0066FF] text-white'
                                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Filter catalog items..."
                          value={lookupSearch}
                          onChange={(e) => setLookupSearch(e.target.value)}
                          className="w-[140px] px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-[9px] text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="max-h-[120px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-900 space-y-1">
                        {filteredLookupItems().length === 0 ? (
                          <p className="text-[10px] text-gray-400 italic text-center py-2">No matching tickets found.</p>
                        ) : (
                          filteredLookupItems().map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center py-1 text-[10px]">
                              <div>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">{item.trackingNumber}</span>
                                <span className="text-gray-400 mx-1.5">|</span>
                                <span className="text-gray-500">{item.customerName}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setRecipient(item.customerEmail || '');
                                  applyTemplate(
                                    lookupFilter === 'orders' ? 'dispatch' : lookupFilter === 'repairs' ? 'repair' : 'tradein',
                                    item
                                  );
                                  setShowLookupDrawer(false);
                                }}
                                className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 hover:text-white text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider rounded text-[8px] font-mono transition-colors"
                              >
                                Select & Load
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mail fields inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-semibold text-gray-400 uppercase font-mono tracking-wider">Recipient Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="customer@gmail.com"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF]"
                        id="gmail-recipient-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-gray-400 uppercase font-mono tracking-wider">Subject Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="Immortal Electronics Update"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF]"
                        id="gmail-subject-input"
                      />
                    </div>
                  </div>

                  {/* Body text area */}
                  <div>
                    <label className="block text-[9px] font-semibold text-gray-400 uppercase font-mono tracking-wider">Email Body Content (HTML supported) *</label>
                    <textarea
                      required
                      rows={10}
                      placeholder="Write customer update here... (Html templates recommended)"
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF] font-mono leading-relaxed"
                      id="gmail-body-input"
                    />
                  </div>

                  {/* Success / Error indicators */}
                  {sendSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-emerald-600 dark:text-emerald-500 text-[11px]">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Dispatch Confirmed!</span>
                        <p>{sendSuccess}</p>
                      </div>
                    </div>
                  )}

                  {sendError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-500 text-[11px]">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Transmission Failed</span>
                        <p>{sendError}</p>
                      </div>
                    </div>
                  )}

                  {/* Bottom triggers */}
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-900 pt-3">
                    <span className="text-[10px] font-mono text-gray-400 max-w-[280px]">
                      🚨 Emails sent here are routed via your real authenticated Google Account as permanent correspondence.
                    </span>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2 bg-[#0066FF] text-white hover:bg-blue-600 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      id="btn-gmail-submit"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send with Gmail</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
