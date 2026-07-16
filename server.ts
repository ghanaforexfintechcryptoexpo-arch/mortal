/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { Product, RepairRequest, TradeInRequest, Order, BlogPost, Coupon, BulkInquiry } from './src/types.js';

// Setup environment loading
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to durable file-based database
const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface for database schema
interface DatabaseSchema {
  products: Product[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  orders: Order[];
  blogs: BlogPost[];
  coupons: Coupon[];
  bulkInquiries: BulkInquiry[];
}

// Initial high-fidelity Ghanaian Seed Data
const initialProducts: Product[] = [
  {
    id: 'prod-iphone15promax',
    name: 'iPhone 15 Pro Max',
    description: 'Flagship Apple iPhone with Aerospace-grade titanium design, A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
    priceGHS: 21500,
    priceUSD: 1450,
    category: 'Smartphones',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1695048132959-efd5bf9273c5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1695048133116-3e8be899db94?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 142,
    specs: {
      'Display': '6.7-inch Super Retina XDR OLED, 120Hz',
      'Processor': 'Apple A17 Pro (3nm)',
      'Storage': '256GB / 512GB / 1TB',
      'Main Camera': '48MP Main + 12MP Telephoto (5x zoom) + 12MP Ultra-wide',
      'Battery': '4441 mAh with fast charge',
      'OS': 'iOS 17 (upgradable to iOS 18)'
    },
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Blue', 'Titanium White'],
    isNew: true,
    stock: 12,
    isBestSeller: true
  },
  {
    id: 'prod-s24ultra',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    priceGHS: 23000,
    priceUSD: 1550,
    category: 'Smartphones',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1707151019688-df0b4d4f26ec?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 98,
    specs: {
      'Display': '6.8-inch Dynamic AMOLED 2X, QHD+, 120Hz',
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Storage': '256GB / 512GB / 1TB',
      'Main Camera': '200MP Main + 50MP + 12MP + 10MP Quad Camera',
      'Battery': '5000 mAh, 45W wired charging',
      'OS': 'Android 14 (One UI 6.1)'
    },
    colors: ['Titanium Yellow', 'Titanium Violet', 'Titanium Gray', 'Titanium Black'],
    isNew: true,
    stock: 8,
    isBestSeller: true,
    isNewArrival: true
  },
  {
    id: 'prod-pixel8pro',
    name: 'Google Pixel 8 Pro',
    description: 'The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and can help you get more done, faster.',
    priceGHS: 14500,
    priceUSD: 980,
    category: 'Smartphones',
    brand: 'Google Pixel',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviewsCount: 65,
    specs: {
      'Display': '6.7-inch Super Actua LTPO OLED, 120Hz',
      'Processor': 'Google Tensor G3 (4nm)',
      'Storage': '128GB / 256GB / 512GB',
      'Main Camera': '50MP Main + 48MP Telephoto (5x) + 48MP Ultra-wide',
      'Battery': '5050 mAh with 30W charging',
      'OS': 'Android 14'
    },
    colors: ['Bay Blue', 'Porcelain', 'Obsidian'],
    isNew: true,
    stock: 5,
    isNewArrival: true
  },
  {
    id: 'prod-macbookpro16',
    name: 'MacBook Pro 16" M3 Max',
    description: 'The ultimate pro laptop. With the M3 Max chip, a stunning Liquid Retina XDR display, and up to 22 hours of battery life, it delivers performance without boundaries.',
    priceGHS: 48000,
    priceUSD: 3200,
    category: 'Computing',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop'],
    rating: 5.0,
    reviewsCount: 34,
    specs: {
      'Display': '16.2-inch Liquid Retina XDR display (3456 x 2234)',
      'Processor': 'Apple M3 Max (14-core CPU, 30-core GPU)',
      'RAM': '36GB Unified Memory',
      'Storage': '1TB SSD',
      'Battery': 'Up to 22 hours',
      'Weight': '2.16 kg'
    },
    colors: ['Space Black', 'Silver'],
    isNew: true,
    stock: 3,
    isBestSeller: true
  },
  {
    id: 'prod-ankermini',
    name: 'Anker PowerPort III 65W Pod',
    description: 'High-speed charging for laptops, tablets, and phones in an ultra-compact body. Powered by GaN tech.',
    priceGHS: 650,
    priceUSD: 45,
    category: 'Accessories',
    brand: 'Anker',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviewsCount: 230,
    specs: {
      'Output': '65W USB-C Power Delivery',
      'Technology': 'GaN II Technology',
      'Compatibility': 'Universal (MacBook, iPhone, Galaxy, Pixel)',
      'Safety': 'ActiveShield temperature monitoring'
    },
    colors: ['Black', 'White'],
    isNew: false,
    stock: 50,
    isBestSeller: true
  },
  {
    id: 'prod-sonywh1000xm5',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling overhead headphones with premium sound quality, crystal clear hands-free calling, and Alexa Voice Control.',
    priceGHS: 5800,
    priceUSD: 390,
    category: 'Accessories',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviewsCount: 88,
    specs: {
      'ANC': 'Industry-leading Auto NC Optimizer',
      'Driver': '30mm specially designed dome driver',
      'Battery Life': 'Up to 30 hours (ANC ON)',
      'Connection': 'Bluetooth 5.2, Multipoint connection',
      'Microphones': '8 microphones for outstanding call clarity'
    },
    colors: ['Black', 'Platinum Silver', 'Midnight Blue'],
    isNew: true,
    stock: 10,
    isBestSeller: true
  },
  {
    id: 'prod-ps5controller',
    name: 'PS5 DualSense Wireless Controller',
    description: 'Discover a deeper, highly immersive gaming experience with the innovative new PS5 controller, featuring haptic feedback and dynamic trigger effects.',
    priceGHS: 1200,
    priceUSD: 80,
    category: 'Gaming',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviewsCount: 112,
    specs: {
      'Feedback': 'Haptic feedback and adaptive triggers',
      'Microphone': 'Built-in mic and headset jack',
      'Connection': 'Bluetooth / USB-C',
      'Battery': 'Built-in rechargeable battery'
    },
    colors: ['White', 'Midnight Black', 'Cosmic Red', 'Starlight Blue'],
    isNew: true,
    stock: 15,
    isNewArrival: true
  },
  {
    id: 'prod-smartbulb',
    name: 'TP-Link Kasa Smart Bulb Duo',
    description: 'Multicolor smart bulb with Wi-Fi, compatible with Alexa and Google Assistant. Schedule, dim, and paint your rooms with vibrant colors directly from your phone.',
    priceGHS: 450,
    priceUSD: 30,
    category: 'Smart Home',
    brand: 'TP-Link',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=600&auto=format&fit=crop'],
    rating: 4.6,
    reviewsCount: 45,
    specs: {
      'Brightness': '800 Lumens (equivalent to 60W)',
      'Colors': '16 million dimmable colors',
      'Hub Required': 'No (Connects directly to 2.4GHz Wi-Fi)',
      'App Control': 'Kasa Smart App (iOS/Android)'
    },
    colors: ['RGB Multicolor'],
    isNew: true,
    stock: 30
  }
];

const initialBlogs: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Top 5 Tips to Maximize Your Phone Battery Life in Ghana\'s Tropical Climate',
    content: `Ghana's warm tropical temperatures can cause significant strain on lithium-ion batteries. In Accra, Kumasi, and surrounding cities, ambient temperatures regularly climb, heating up our smartphones. Here are five simple actions you can take today to protect your battery and prolong its overall lifespan:

1. **Avoid Charging in Direct Sunlight**: Never leave your phone charging on the dashboard of your car, or near a sunlit window. The heat combined with charging thermal dynamics damages battery cells rapidly.
2. **Remove Protective Cases While Charging**: Thick cases trap heat. If your smartphone feels notably hot while charging, make it a habit to take the case off.
3. **Use Original or Certified Chargers**: Cheap counterfeit chargers lack voltage regulation. This fluctuation causes high thermal build-up inside the battery.
4. **Use Smart Battery Settings**: Limit maximum charge to 80% if you are on iOS 17/18 or Android 14+, and avoid letting your phone drop below 15%.
5. **Charge in Well-Ventilated Areas**: Try to charge your phone in air-conditioned spaces or under a fan to keep temperatures down.

At Immortal Electronics, we provide instant premium battery replacements with authentic grade-A components for all flagships, including iPhones and Galaxy phones. Book a repair with us today!`,
    author: 'Chief Technician Isaac',
    date: '2026-06-15',
    category: 'Repair Tips',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1584438784894-089d6a128f3e?q=80&w=600&auto=format&fit=crop',
    likes: 42,
    comments: [
      { author: 'Emmanuel K.', text: 'Very useful tips! My iPhone always heats up in traffic in Accra.', date: '2026-06-16' },
      { author: 'Sena A.', text: 'Do you guys do original battery replacements for Samsung S21 Ultra?', date: '2026-06-17' }
    ],
    tags: ['Battery Life', 'Phone Repair', 'Accra Tech', 'Maintenance']
  },
  {
    id: 'blog-2',
    title: 'Smartphone Buying Guide: GHS Price vs. Value in 2026',
    content: `With exchange rate movements in Ghana, purchasing a new flagship smartphone requires careful budgeting. Many buyers in Accra are looking for the best ratio of cost-to-performance. Should you buy a brand new device or opt for a certified used/refurbished flagship?

### The Case for Certified Used Flagships
A certified used iPhone 14 Pro or Samsung Galaxy S23 Ultra often outperforms a brand new mid-range phone at the exact same price point. Flagships offer:
- Superior camera sensors with optical image stabilization (OIS).
- Premium materials (titanium, aluminum, Ceramic Shield glass).
- Better processors that remain fast for 4-5 years.

### What to check before buying used in Ghana:
1. **Network Compatibility**: Ensure the device is fully unlocked for MTN, Telecel, and AirtelTigo.
2. **Battery Health**: Look for battery health above 85% to ensure it lasts a full day.
3. **Face ID / Fingerprint Sensors**: Verify these high-level biometrics work, as they are often unrepairable if damaged by liquid.
4. **Water Resistance Seals**: Used devices that have been repaired previously might lose their water seals.

At Immortal Electronics, all our used smartphones undergo a meticulous 45-point inspection and come with a 6-month warranty. Stop by our Accra store or explore our catalogue!`,
    author: 'Kofi Mensah (Product Manager)',
    date: '2026-07-01',
    category: 'Buying Guides',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
    likes: 29,
    comments: [],
    tags: ['Buying Guide', 'Ghana Cedis', 'Smartphones', 'E-Commerce']
  }
];

const initialCoupons: Coupon[] = [
  { code: 'IMMORTAL5', discountPercent: 5, active: true },
  { code: 'ACCRAFREE', discountPercent: 10, active: true, minSpendGHS: 2000 },
  { code: 'WELCOME10', discountPercent: 10, active: true }
];

// Load or Seed Database
function getDatabase(): DatabaseSchema {
  const sampleInquiry: BulkInquiry = {
    id: 'inq-sample1',
    companyName: 'Ghana Tech Corp',
    contactName: 'Daniel Kwame',
    email: 'd.kwame@ghanatech.com',
    phone: '+233 24 123 4567',
    productsOfInterest: ['iPhone 15 Pro Max', 'MacBook Pro 16" M3 Max'],
    estimatedQuantity: '26-50',
    message: 'We are looking to equip our senior development and executive teams with high-performance Apple gadgets. Looking for a wholesale volume discount quote.',
    timeline: 'Immediate',
    targetBudget: 'GHS 400,000',
    deliveryLocation: 'Airport Residential Area, Accra',
    preferredPayment: 'Bank Transfer',
    createdAt: new Date().toISOString(),
    status: 'Pending'
  };

  if (!fs.existsSync(DB_FILE)) {
    const db: DatabaseSchema = {
      products: initialProducts,
      repairs: [],
      tradeins: [],
      orders: [],
      blogs: initialBlogs,
      coupons: initialCoupons,
      bulkInquiries: [sampleInquiry]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return db;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(data) as DatabaseSchema;
    if (!db.bulkInquiries) {
      db.bulkInquiries = [sampleInquiry];
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    console.error('Error reading database, creating fresh:', error);
    const db: DatabaseSchema = {
      products: initialProducts,
      repairs: [],
      tradeins: [],
      orders: [],
      blogs: initialBlogs,
      coupons: initialCoupons,
      bulkInquiries: [sampleInquiry]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return db;
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// REST API endpoints

// Products
app.get('/api/products', (req, res) => {
  const db = getDatabase();
  res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
  const db = getDatabase();
  const product = db.products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Update product stock (Inventory management)
app.post('/api/products/:id/stock', (req, res) => {
  const { stock } = req.body;
  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ error: 'Invalid stock value' });
  }
  const db = getDatabase();
  const productIndex = db.products.findIndex(p => p.id === req.params.id);
  if (productIndex > -1) {
    db.products[productIndex].stock = stock;
    saveDatabase(db);
    res.json(db.products[productIndex]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Add new product (Admin)
app.post('/api/products', (req, res) => {
  const newProduct: Product = req.body;
  if (!newProduct.name || !newProduct.priceGHS || !newProduct.category) {
    return res.status(400).json({ error: 'Missing required product parameters' });
  }
  const db = getDatabase();
  // Ensure unique ID
  newProduct.id = newProduct.id || `prod-${Date.now()}`;
  db.products.unshift(newProduct);
  saveDatabase(db);
  res.json(newProduct);
});

// Repairs
app.get('/api/repairs', (req, res) => {
  const db = getDatabase();
  res.json(db.repairs);
});

app.get('/api/repairs/:tracking', (req, res) => {
  const db = getDatabase();
  const trackingUpper = req.params.tracking.toUpperCase();
  const repair = db.repairs.find(
    r => r.trackingNumber.toUpperCase() === trackingUpper || r.id === req.params.tracking
  );
  if (repair) {
    res.json(repair);
  } else {
    res.status(404).json({ error: 'Repair request not found' });
  }
});

app.post('/api/repairs', (req, res) => {
  const { customerName, customerPhone, customerEmail, deviceType, brand, model, faultCategory, faultDescription, image } = req.body;
  if (!customerName || !customerPhone || !deviceType || !faultCategory || !faultDescription) {
    return res.status(400).json({ error: 'Missing required repair booking fields' });
  }

  const trackingNumber = `IM-REP-${Math.floor(100000 + Math.random() * 900000)}`;
  const db = getDatabase();

  // Smart simulated quote based on fault category
  let quoteGHS = 350; // default diagnostic
  if (faultCategory === 'Screen') quoteGHS = 1800;
  else if (faultCategory === 'Battery') quoteGHS = 650;
  else if (faultCategory === 'Charging Port') quoteGHS = 450;
  else if (faultCategory === 'Water Damage') quoteGHS = 1200;
  else if (faultCategory === 'Software') quoteGHS = 250;
  else if (faultCategory === 'Motherboard') quoteGHS = 3200;

  const newRepair: RepairRequest = {
    id: `rep-${Date.now()}`,
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    deviceType,
    brand: brand || 'Generic',
    model: model || 'Unknown Model',
    faultCategory,
    faultDescription,
    image: image || '',
    status: 'Pending',
    quotationGHS: quoteGHS,
    quotationUSD: Math.round(quoteGHS / 14.5),
    technicianNotes: 'Device received. Awaiting professional diagnostic check.',
    createdAt: new Date().toISOString(),
    trackingNumber,
    repairHistory: [
      {
        status: 'Pending',
        note: 'Online booking submitted by customer.',
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.repairs.unshift(newRepair);
  saveDatabase(db);
  res.json(newRepair);
});

// Update repair status (Admin / Technician)
app.post('/api/repairs/:id/update', (req, res) => {
  const { status, notes, quotationGHS } = req.body;
  const db = getDatabase();
  const index = db.repairs.findIndex(r => r.id === req.params.id);

  if (index > -1) {
    const repair = db.repairs[index];
    if (status) repair.status = status;
    if (notes) repair.technicianNotes = notes;
    if (typeof quotationGHS === 'number') {
      repair.quotationGHS = quotationGHS;
      repair.quotationUSD = Math.round(quotationGHS / 14.5);
    }

    // Append to repair logs history
    repair.repairHistory = repair.repairHistory || [];
    repair.repairHistory.push({
      status: repair.status,
      note: notes || `Status updated to ${repair.status}`,
      timestamp: new Date().toISOString()
    });

    db.repairs[index] = repair;
    saveDatabase(db);
    res.json(repair);
  } else {
    res.status(404).json({ error: 'Repair request not found' });
  }
});

// Trade-ins
app.get('/api/tradeins', (req, res) => {
  const db = getDatabase();
  res.json(db.tradeins);
});

app.get('/api/tradeins/:tracking', (req, res) => {
  const db = getDatabase();
  const trackingUpper = req.params.tracking.toUpperCase();
  const tradein = db.tradeins.find(
    t => t.trackingNumber.toUpperCase() === trackingUpper || t.id === req.params.tracking
  );
  if (tradein) {
    res.json(tradein);
  } else {
    res.status(404).json({ error: 'Trade-in request not found' });
  }
});

app.post('/api/tradeins', (req, res) => {
  const { customerName, customerPhone, customerEmail, deviceType, brand, model, condition, image, notes } = req.body;
  if (!customerName || !customerPhone || !deviceType || !condition) {
    return res.status(400).json({ error: 'Missing required trade-in booking fields' });
  }

  const trackingNumber = `IM-TRD-${Math.floor(100000 + Math.random() * 900000)}`;
  const db = getDatabase();

  // Smart estimated valuation based on condition & brand
  let estimateGHS = 1500;
  if (brand?.toLowerCase().includes('apple') || brand?.toLowerCase().includes('iphone')) {
    estimateGHS = 4500;
    if (condition === 'Like New') estimateGHS = 8500;
    else if (condition === 'Good') estimateGHS = 6000;
    else if (condition === 'Fair') estimateGHS = 3500;
    else estimateGHS = 1500;
  } else if (brand?.toLowerCase().includes('samsung')) {
    estimateGHS = 3500;
    if (condition === 'Like New') estimateGHS = 7000;
    else if (condition === 'Good') estimateGHS = 5000;
    else if (condition === 'Fair') estimateGHS = 2500;
    else estimateGHS = 1000;
  } else {
    if (condition === 'Like New') estimateGHS = 2000;
    else if (condition === 'Good') estimateGHS = 1500;
    else if (condition === 'Fair') estimateGHS = 800;
    else estimateGHS = 300;
  }

  const newTradeIn: TradeInRequest = {
    id: `trd-${Date.now()}`,
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    deviceType,
    brand: brand || 'Generic',
    model: model || 'Unknown Model',
    condition,
    image: image || '',
    valuationEstimateGHS: estimateGHS,
    valuationEstimateUSD: Math.round(estimateGHS / 14.5),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    trackingNumber,
    notes: notes || ''
  };

  db.tradeins.unshift(newTradeIn);
  saveDatabase(db);
  res.json(newTradeIn);
});

app.post('/api/tradeins/:id/update', (req, res) => {
  const { status, finalOfferGHS, notes } = req.body;
  const db = getDatabase();
  const index = db.tradeins.findIndex(t => t.id === req.params.id);

  if (index > -1) {
    const tradein = db.tradeins[index];
    if (status) tradein.status = status;
    if (notes) tradein.notes = notes;
    if (typeof finalOfferGHS === 'number') {
      tradein.finalOfferGHS = finalOfferGHS;
      tradein.finalOfferUSD = Math.round(finalOfferGHS / 14.5);
    }
    db.tradeins[index] = tradein;
    saveDatabase(db);
    res.json(tradein);
  } else {
    res.status(404).json({ error: 'Trade-in request not found' });
  }
});

// Orders (E-commerce Checkout)
app.get('/api/orders', (req, res) => {
  const db = getDatabase();
  res.json(db.orders);
});

app.get('/api/orders/:tracking', (req, res) => {
  const db = getDatabase();
  const trackingUpper = req.params.tracking.toUpperCase();
  const order = db.orders.find(
    o => o.trackingNumber.toUpperCase() === trackingUpper || o.id === req.params.tracking
  );
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.post('/api/orders', (req, res) => {
  const { items, totalGHS, totalUSD, paymentMethod, paymentProvider, customerName, customerPhone, customerEmail, address, city, deliveryOption, deliveryCostGHS } = req.body;

  if (!items || items.length === 0 || !customerName || !customerPhone || !address || !city) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }

  const trackingNumber = `IM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const db = getDatabase();

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    items,
    totalGHS,
    totalUSD,
    status: 'Pending',
    paymentMethod,
    paymentProvider,
    paymentStatus: paymentMethod === 'Mobile Money' || paymentMethod === 'Card' ? 'Paid' : 'Unpaid',
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    address,
    city,
    deliveryOption,
    deliveryCostGHS: deliveryCostGHS || 0,
    trackingNumber,
    createdAt: new Date().toISOString()
  };

  // Decrement item stock
  items.forEach((item: any) => {
    const pIdx = db.products.findIndex(p => p.id === item.product.id);
    if (pIdx > -1) {
      db.products[pIdx].stock = Math.max(0, db.products[pIdx].stock - item.quantity);
    }
  });

  db.orders.unshift(newOrder);
  saveDatabase(db);
  res.json(newOrder);
});

app.post('/api/orders/:id/update', (req, res) => {
  const { status, paymentStatus } = req.body;
  const db = getDatabase();
  const index = db.orders.findIndex(o => o.id === req.params.id);

  if (index > -1) {
    if (status) db.orders[index].status = status;
    if (paymentStatus) db.orders[index].paymentStatus = paymentStatus;
    saveDatabase(db);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Blog System
app.get('/api/blogs', (req, res) => {
  const db = getDatabase();
  res.json(db.blogs);
});

app.post('/api/blogs/:id/comment', (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Comment author and text are required.' });
  }
  const db = getDatabase();
  const index = db.blogs.findIndex(b => b.id === req.params.id);
  if (index > -1) {
    db.blogs[index].comments = db.blogs[index].comments || [];
    db.blogs[index].comments.push({
      author,
      text,
      date: new Date().toISOString().split('T')[0]
    });
    saveDatabase(db);
    res.json(db.blogs[index]);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

app.post('/api/blogs/:id/like', (req, res) => {
  const db = getDatabase();
  const index = db.blogs.findIndex(b => b.id === req.params.id);
  if (index > -1) {
    db.blogs[index].likes = (db.blogs[index].likes || 0) + 1;
    saveDatabase(db);
    res.json(db.blogs[index]);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

// Coupons
app.get('/api/coupons', (req, res) => {
  const db = getDatabase();
  res.json(db.coupons);
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, spendGHS } = req.body;
  const db = getDatabase();
  const coupon = db.coupons.find(c => c.code.toUpperCase() === code?.toUpperCase() && c.active);

  if (!coupon) {
    return res.status(404).json({ valid: false, error: 'Coupon code is invalid or expired.' });
  }
  if (coupon.minSpendGHS && spendGHS < coupon.minSpendGHS) {
    return res.status(400).json({
      valid: false,
      error: `This coupon requires a minimum spend of GHS ${coupon.minSpendGHS}.`
    });
  }

  res.json({ valid: true, coupon });
});

// Create coupon (Admin)
app.post('/api/coupons', (req, res) => {
  const { code, discountPercent, active, minSpendGHS } = req.body;
  if (!code || typeof discountPercent !== 'number') {
    return res.status(400).json({ error: 'Invalid coupon data' });
  }
  const db = getDatabase();
  const newCoupon: Coupon = {
    code: code.toUpperCase(),
    discountPercent,
    active: active !== undefined ? active : true,
    minSpendGHS: minSpendGHS || undefined
  };
  db.coupons.unshift(newCoupon);
  saveDatabase(db);
  res.json(newCoupon);
});

// Bulk Purchase Inquiries
app.get('/api/bulkinquiries', (req, res) => {
  const db = getDatabase();
  res.json(db.bulkInquiries || []);
});

app.post('/api/bulkinquiries', (req, res) => {
  const { 
    companyName, 
    contactName, 
    email, 
    phone, 
    productsOfInterest, 
    estimatedQuantity, 
    message, 
    timeline, 
    targetBudget, 
    deliveryLocation, 
    preferredPayment 
  } = req.body;

  if (!companyName || !contactName || !email || !phone || !estimatedQuantity || !message) {
    return res.status(400).json({ error: 'Missing required bulk inquiry fields.' });
  }

  const db = getDatabase();
  const newInquiry: BulkInquiry = {
    id: `inq-${Date.now()}`,
    companyName,
    contactName,
    email,
    phone,
    productsOfInterest: productsOfInterest || [],
    estimatedQuantity,
    message,
    timeline: timeline || 'Just inquiring',
    targetBudget: targetBudget || '',
    deliveryLocation: deliveryLocation || 'Accra',
    preferredPayment: preferredPayment || 'Mobile Money',
    createdAt: new Date().toISOString(),
    status: 'Pending'
  };

  db.bulkInquiries = db.bulkInquiries || [];
  db.bulkInquiries.unshift(newInquiry);
  saveDatabase(db);
  res.json(newInquiry);
});

app.patch('/api/bulkinquiries/:id', (req, res) => {
  const { status } = req.body;
  const db = getDatabase();
  db.bulkInquiries = db.bulkInquiries || [];
  const index = db.bulkInquiries.findIndex(i => i.id === req.params.id);

  if (index > -1) {
    if (status) db.bulkInquiries[index].status = status;
    saveDatabase(db);
    res.json(db.bulkInquiries[index]);
  } else {
    res.status(404).json({ error: 'Bulk inquiry not found.' });
  }
});

// simulated Payments
app.post('/api/payments/charge', (req, res) => {
  const { paymentMethod, provider, amountGHS, phoneNumber, cardDetails } = req.body;

  setTimeout(() => {
    // 95% success rate simulation
    const isSuccess = Math.random() < 0.95;

    if (!isSuccess) {
      return res.status(402).json({
        success: false,
        error: 'Transaction declined by mobile network or bank. Please check your funds and PIN and retry.'
      });
    }

    const txId = `IM-TX-${Math.floor(100000000 + Math.random() * 900000000)}`;
    res.json({
      success: true,
      transactionId: txId,
      message: paymentMethod === 'Mobile Money'
        ? `Prompt sent to ${phoneNumber}. Payment of GHS ${amountGHS} processed successfully via ${provider}.`
        : `Card payment of GHS ${amountGHS} successfully authorized.`
    });
  }, 1800); // realistic payment latency
});

// Lazy load Gemini AI Client & Endpoint
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.error('Failed to initialize Gemini Client:', err);
    }
  }
  return aiClient;
}

// AI Diagnostic Advisor Chatbot API
app.post('/api/ai/advisor', async (req, res) => {
  const { message, context, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message query is required' });
  }

  const client = getGeminiClient();

  if (!client) {
    // Simulated Offline AI Diagnostic Response with rich technical credibility
    console.log('Gemini API Key missing or default. Executing client-side fallback simulation.');
    const msgLower = message.toLowerCase();
    let reply = "Hello! I am your Immortal Electronics AI Advisor. I am currently running in standby mode. How can I assist you with smartphone purchases, custom repairs, or device valuations in Accra today?";

    if (msgLower.includes('screen') || msgLower.includes('cracked') || msgLower.includes('broken')) {
      reply = "It sounds like your screen has sustained physical impact. At our Accra workshop, we offer premium replacement panels (OLED/Super Retina) for iPhones and Samsungs. Screen replacement takes 45 minutes and starts around GHS 1,800. I highly advise booking a service online to reserve a certified panel and avoid walk-in delays.";
    } else if (msgLower.includes('battery') || msgLower.includes('charge') || msgLower.includes('drain')) {
      reply = "Rapid battery drain in Ghana is often exacerbated by tropical heat (over 30°C). If your battery health is below 80%, a premium lithium-ion swap is highly recommended. Our battery replacements start at GHS 650, take just 30 minutes, and come with a 6-month warranty. Would you like to book a repair or do a trade-in?";
    } else if (msgLower.includes('water') || msgLower.includes('liquid') || msgLower.includes('rain')) {
      reply = "CRITICAL ADVICE: If your device has water damage, power it off immediately. Do NOT put it in rice (this blocks air vents with fine starch dust and speeds up interior corrosion). Bring it to Immortal Electronics in Accra as soon as possible. Our water damage ultrasonic treatment and chemical decontamination starts at GHS 1,200.";
    } else if (msgLower.includes('trade') || msgLower.includes('swap') || msgLower.includes('sell')) {
      reply = "Our Premium Trade-In Program lets you exchange your older phone for credit towards a brand new model like the iPhone 15 Pro Max or Galaxy S24 Ultra. Just specify your device and condition in our Trade-In tab, and our systems will instantly provide an estimated appraisal value. We pay top market value in GHS!";
    } else if (msgLower.includes('iphone 15') || msgLower.includes('recommend') || msgLower.includes('buy')) {
      reply = "For high performance and ultimate longevity, we strongly recommend the iPhone 15 Pro Max (GHS 21,500) or Samsung Galaxy S24 Ultra (GHS 23,000). Both offer exceptional cameras and high resell value in Ghana. If you are on a budget, consider a certified pre-owned flagship from our store, backed by our local warranty!";
    }

    return res.json({ response: reply, modelUsed: 'Immortal Offline Advisor' });
  }

  try {
    const formattedHistory = (chatHistory || []).map((chat: any) => ({
      role: chat.role === 'user' ? 'user' : 'model',
      parts: [{ text: chat.text }]
    }));

    // Add current context
    const currentPrompt = `
Context details of current customer: ${JSON.stringify(context || {})}
Customer inquiry: "${message}"

Generate a helpful, highly professional, polite response as the "Immortal Electronics AI Advisor" in Accra, Ghana.
Format numbers nicely in Ghana Cedis (GHS) or USD. Keep it informative, highlighting repairs, e-commerce products, or trade-in services.
`;

    const chatInstance = client.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: `You are the ultra-premium AI Assistant and Technical Advisor for "Immortal Electronics" located in Accra, Ghana.
You help customers choose the best smartphones (Apple, Samsung, Google Pixel), accessories, laptops, and smart home gadgets.
You provide instant, expert repair advice for screens, batteries, charging ports, motherboard repairs, and water damage.
Explain issues clearly, professionally, and quote realistic Ghana Cedi prices. Maintain an encouraging, premium, trustworthy corporate brand tone (comparable to Apple Genius Bar or Samsung Premium care).`,
        temperature: 0.7
      },
      history: formattedHistory
    });

    const response = await chatInstance.sendMessage({ message: currentPrompt });
    res.json({ response: response.text, modelUsed: 'gemini-3.5-flash' });
  } catch (error: any) {
    console.error('Gemini API execution error:', error);
    res.status(500).json({ error: 'AI processing failed. Please try again later.' });
  }
});

// Configure Vite middleware in development or express static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Immortal Full-Stack] Server booting on port ${PORT}`);
    console.log(`Database seeded and active at: ${DB_FILE}`);
  });
}

startServer();
