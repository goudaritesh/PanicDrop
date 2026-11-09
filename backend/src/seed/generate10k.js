import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Realistic Flipkart Catalog Data Templates
const CATEGORIES_DATA = [
  {
    category: 'Mobiles & Accessories',
    subcategories: [
      {
        name: 'Smartphones',
        brands: ['Apple', 'Samsung', 'OnePlus', 'Realme', 'Xiaomi', 'Vivo', 'OPPO', 'Motorola', 'Google Pixel', 'POCO', 'Nothing', 'Infinix'],
        models: ['Pro 5G', 'Max 5G', 'Ultra 5G', 'Plus', 'Lite', 'Prime', 'Neo', 'Turbo', 'Edge', 'Nord', 'Master Edition', 'Special Edition'],
        basePriceMin: 8999,
        basePriceMax: 139999,
        discountMin: 8,
        discountMax: 35,
        images: [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: (brand, model, price) => ({
          'Display': '6.7-inch 120Hz FHD+ AMOLED HDR10+',
          'Processor': brand === 'Apple' ? 'Apple A17 / A16 Bionic' : 'Snapdragon / Dimensity 5G Octa-Core',
          'RAM / Storage': price > 40000 ? '12 GB / 256 GB' : '8 GB / 128 GB',
          'Battery': '5000 mAh with Super Fast Charging',
          'Warranty': '1 Year Manufacturer Warranty for Device',
        }),
      },
      {
        name: 'Mobile Accessories',
        brands: ['boAt', 'Portronics', 'Spigen', 'Ambrane', 'Mi', 'Stuffcool', 'Anker', 'Realme'],
        models: ['10000mAh Power Bank', '20000mAh 22.5W Fast Charger', '65W GaN Fast Wall Adapter', 'Braided Type-C Fast Cable', 'Shockproof Armor Case', 'Tempered Glass Guard'],
        basePriceMin: 299,
        basePriceMax: 3499,
        discountMin: 25,
        discountMax: 70,
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Compatibility': 'Universal Android & iOS Support',
          'Safety Protection': 'Over-voltage and Short-circuit Protection',
          'BIS Certified': 'Yes (Indian Standards Certified)',
        }),
      },
    ],
  },
  {
    category: 'Electronics & Audio',
    subcategories: [
      {
        name: 'Laptops',
        brands: ['ASUS', 'HP', 'Dell', 'Lenovo', 'Apple', 'Acer', 'MSI', 'Samsung'],
        models: ['Intel Core i5 16GB Thin & Light', 'Intel Core i7 RTX 4060 Gaming', 'Ryzen 7 16GB Metal Body', 'MacBook Air M2', 'OLED 2.8K Creator Laptop'],
        basePriceMin: 32990,
        basePriceMax: 189990,
        discountMin: 12,
        discountMax: 38,
        images: [
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: (brand, model, price) => ({
          'Processor': model.includes('i7') ? 'Intel Core i7 13th Gen' : 'Intel Core i5 / AMD Ryzen 5',
          'RAM & Storage': '16 GB DDR5 RAM / 512 GB PCIe NVMe SSD',
          'Display': '15.6 inch Full HD Anti-Glare 144Hz',
          'OS': 'Windows 11 Home + MS Office Genuine',
          'Warranty': '1 Year Onsite Domestic Warranty',
        }),
      },
      {
        name: 'Headphones & Earbuds',
        brands: ['boAt', 'Sony', 'JBL', 'Noise', 'Boult Audio', 'OnePlus', 'Realme', 'Sennheiser', 'Skullcandy'],
        models: ['ANC Truly Wireless Earbuds', 'Wireless Over-Ear Extra Bass Headphones', 'Bluetooth Neckband 40H Playtime', 'Gaming Headset 7.1 Mic'],
        basePriceMin: 799,
        basePriceMax: 29990,
        discountMin: 20,
        discountMax: 75,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Battery Playtime': 'Up to 48 Hours with Charging Case',
          'Noise Cancellation': 'Active Noise Cancellation with Quad Mics',
          'Water Resistance': 'IPX5 Sweat & Splash Proof',
        }),
      },
      {
        name: 'Monitors & PC Accessories',
        brands: ['Zebronics', 'LG', 'Samsung', 'BenQ', 'Logitech', 'Redragon', 'Cosmic Byte', 'HP'],
        models: ['24-inch 100Hz IPS Borderless Monitor', '27-inch Curved 165Hz 2K Gaming Monitor', 'RGB Mechanical Gaming Keyboard', 'Wireless Optical Silent Mouse', '4K USB Webcam'],
        basePriceMin: 499,
        basePriceMax: 28999,
        discountMin: 20,
        discountMax: 60,
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Connectivity': 'HDMI, DisplayPort, USB Type-C',
          'Warranty': '3 Years Brand Replacement Warranty',
        }),
      },
    ],
  },
  {
    category: 'Smart Wearables & Watches',
    subcategories: [
      {
        name: 'Smartwatches',
        brands: ['Noise', 'Fire-Boltt', 'boAt', 'Fastrack', 'Titan', 'Samsung Galaxy', 'Amazfit', 'Fossil'],
        models: ['1.96-inch AMOLED Bluetooth Calling', 'Stainless Steel Luxury Smartwatch', 'Rugged Military Outdoor GPS Watch', 'Ultra Slim Round Dial Smartwatch'],
        basePriceMin: 1499,
        basePriceMax: 32999,
        discountMin: 30,
        discountMax: 80,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Display': 'AMOLED High Definition Touch Display',
          'Health Suite': 'Heart Rate, SpO2, Sleep & Stress Monitor',
          'Battery': 'Up to 7 Days Battery Life',
          'Water Resistance': 'IP68 Water & Dust Resistant',
        }),
      },
    ],
  },
  {
    category: 'Fashion & Lifestyle',
    subcategories: [
      {
        name: "Men's Clothing & Footwear",
        brands: ['Puma', 'Nike', 'Adidas', 'Peter England', 'Roadster', 'HRX', 'US Polo Assn', 'Levi’s', 'Allen Solly', 'Red Tape', 'Campus'],
        models: ['Pure Cotton Slim Fit Casual Shirt', 'Graphic Printed Oversized T-Shirt', 'Stretchable Denim Jeans', 'Air Cushion Running Shoes', 'Casual Loafers & Sneakers'],
        basePriceMin: 499,
        basePriceMax: 5999,
        discountMin: 30,
        discountMax: 70,
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Fabric / Material': '100% Breathable Premium Cotton',
          'Fit': 'Regular / Slim Comfort Fit',
          'Care Instructions': 'Machine Wash as per tag',
        }),
      },
      {
        name: "Women's Fashion & Ethnic Wear",
        brands: ['Biba', 'W for Woman', 'Aurelia', 'Libas', 'Lavie', 'Caprese', 'Zaveri Pearls'],
        models: ['Embroidered Anarkali Kurta Set', 'Pure Silk Kanjeevaram Saree', 'Printed Rayon Straight Kurti', 'Floral Casual Maxi Dress', 'Vegan Leather Shoulder Handbag'],
        basePriceMin: 599,
        basePriceMax: 7999,
        discountMin: 35,
        discountMax: 75,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Material': 'Art Silk / Pure Rayon / Georgette',
          'Occasion': 'Festive, Party & Casual Wear',
        }),
      },
    ],
  },
  {
    category: 'Home, Kitchen & Appliances',
    subcategories: [
      {
        name: 'Kitchen Appliances',
        brands: ['Philips', 'Prestige', 'Bajaj', 'Havells', 'Pigeon', 'Wonderchef', 'Xiaomi', 'Butterfly', 'Kent'],
        models: ['750W Mixer Grinder with 3 Jars', 'Electric Induction Cooktop 2000W', 'Digital Air Fryer 4.5L', 'Electric Kettle 1.8L Stainless Steel', 'RO Water Purifier TDS Controller'],
        basePriceMin: 899,
        basePriceMax: 16999,
        discountMin: 25,
        discountMax: 65,
        images: [
          'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Power': '750W - 2000W Copper Motor',
          'Warranty': '2 Years Comprehensive Product Warranty',
          'BIS Standard': 'ISI Certified Appliance',
        }),
      },
      {
        name: 'Home Living & Furniture',
        brands: ['Wakefit', 'Sleepwell', 'Solimo', 'Spaces', 'Nilkamal', 'Home Centre', 'Bombay Dyeing'],
        models: ['Orthopedic Memory Foam Mattress', '100% Cotton King Size Double Bedsheet', 'Ergonomic High Back Mesh Office Chair', 'Solid Sheesham Wood Coffee Table'],
        basePriceMin: 699,
        basePriceMax: 24999,
        discountMin: 20,
        discountMax: 60,
        images: [
          'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Material': 'High Resilience Foam / Pure Cotton / Engineered Wood',
          'Warranty': '5 to 10 Years Warranty',
        }),
      },
    ],
  },
  {
    category: 'Beauty, Toys & Sports',
    subcategories: [
      {
        name: 'Personal Care & Grooming',
        brands: ['Philips', 'Bombay Shaving Company', 'Nivea', 'The Man Company', 'Mamaearth', 'L’Oreal Paris', 'Beardo'],
        models: ['All-in-One Cordless Beard Trimmer', 'Keratin Hair Straightener Ceramic', 'Charcoal Face Wash & Sunscreen Kit', 'Eau De Parfum Long Lasting Perfume 100ml'],
        basePriceMin: 399,
        basePriceMax: 4999,
        discountMin: 20,
        discountMax: 60,
        images: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1608248597359-00508544a42b?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Skin Type': 'All Skin Types / Dermatologically Tested',
          'Country of Origin': 'India',
        }),
      },
      {
        name: 'Fitness & Sports',
        brands: ['Yonex', 'Nivia', 'Cosco', 'Boldfit', 'Kobo', 'Strauss', 'Vector X'],
        models: ['Carbon Graphite Badminton Racket (Strung)', 'Match Pro Football Size 5', 'Anti-Skid Extra Thick 6mm Yoga Mat', 'Adjustable PVC Dumbbells 20kg Set'],
        basePriceMin: 499,
        basePriceMax: 8999,
        discountMin: 25,
        discountMax: 65,
        images: [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        ],
        specsTemplate: () => ({
          'Quality Level': 'Tournament & Training Grade',
          'Warranty': '6 Months Brand Warranty',
        }),
      },
    ],
  },
];

const BADGES = ['FLIPKART ASSURED', 'TOP SELLER', 'BEST VALUE', 'DEAL OF THE DAY', 'TRENDING', 'HOT DROP', 'F-ASSURED'];
const COLORS = ['Midnight Black', 'Space Grey', 'Electric Blue', 'Mint Green', 'Pearl White', 'Crimson Red', 'Titanium Silver', 'Rose Gold', 'Matte Charcoal'];

export const generate10kProducts = async (targetCount = 10000) => {
  console.log(`[10K Generator] Starting high-speed generation of ${targetCount} products...`);
  
  const products = [];
  const totalCategories = CATEGORIES_DATA.length;
  
  let idCounter = 1;
  const startTime = Date.now();

  while (products.length < targetCount) {
    for (const catObj of CATEGORIES_DATA) {
      if (products.length >= targetCount) break;

      for (const subcat of catObj.subcategories) {
        if (products.length >= targetCount) break;

        for (const brand of subcat.brands) {
          if (products.length >= targetCount) break;

          for (const model of subcat.models) {
            if (products.length >= targetCount) break;

            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const variantNumber = Math.floor(Math.random() * 900) + 100;
            
            // Name format like Flipkart
            const name = `${brand} ${model} (${color}, Edition ${variantNumber})`;
            
            // Pricing logic with realistic discounts
            const rawBase = Math.floor(Math.random() * (subcat.basePriceMax - subcat.basePriceMin)) + subcat.basePriceMin;
            const discountPercent = Math.floor(Math.random() * (subcat.discountMax - subcat.discountMin)) + subcat.discountMin;
            const originalPrice = Math.round(rawBase / 10) * 10;
            const price = Math.round((originalPrice * (1 - discountPercent / 100)) / 10) * 10;

            const rating = +(3.8 + Math.random() * 1.1).toFixed(1);
            const numReviews = Math.floor(Math.random() * 8500) + 25;
            const stock = Math.floor(Math.random() * 120) + 5;
            const badge = Math.random() > 0.3 ? BADGES[Math.floor(Math.random() * BADGES.length)] : '';
            const featured = products.length < 50;

            const image = subcat.images[Math.floor(Math.random() * subcat.images.length)];
            const secondImage = subcat.images[(Math.floor(Math.random() * subcat.images.length) + 1) % subcat.images.length];

            const description = `${brand} ${model} delivers premium performance, exceptional build quality, and verified authenticity. Backed by 100% Flipkart Assured inspection and standard Indian brand warranty. Includes doorstep delivery and easy 7-day replacement.`;

            products.push({
              name,
              slug: `${brand.toLowerCase()}-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${idCounter}`,
              description,
              price,
              originalPrice,
              category: catObj.category,
              subcategory: subcat.name,
              brand,
              stock,
              rating,
              numReviews,
              badge,
              featured,
              images: [image, secondImage],
              tags: [brand.toLowerCase(), subcat.name.toLowerCase(), catObj.category.toLowerCase(), 'flipkart', 'india'],
              specs: subcat.specsTemplate(brand, model, price),
              isActive: true,
            });

            idCounter++;
          }
        }
      }
    }
  }

  console.log(`[10K Generator] Generated ${products.length} product objects in ${Date.now() - startTime}ms. Inserting into MongoDB...`);

  // Batch insert in chunks of 2,000 for high speed and memory efficiency
  const CHUNK_SIZE = 2000;
  for (let i = 0; i < products.length; i += CHUNK_SIZE) {
    const chunk = products.slice(i, i + CHUNK_SIZE);
    await Product.insertMany(chunk, { ordered: false });
    console.log(`[10K Generator] Inserted batch ${Math.floor(i / CHUNK_SIZE) + 1} (${i + chunk.length}/${products.length})`);
  }

  // Create fast indexes on Product collection for instant search & filtering
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const rawCollection = Product.collection;
      if (rawCollection && rawCollection.createIndex) {
        await rawCollection.createIndex({ category: 1, price: 1, rating: -1 });
        await rawCollection.createIndex({ brand: 1 });
        await rawCollection.createIndex({ name: 'text', description: 'text', brand: 'text' });
        console.log('[10K Generator] MongoDB high-performance indexes created successfully.');
      }
    } else {
      console.log('[10K Generator] In-memory mode active; skipped MongoDB index creation.');
    }
  } catch (idxErr) {
    console.warn('[10K Generator] Index note:', idxErr.message);
  }

  console.log(`[10K Generator] Successfully populated ${products.length} Flipkart products into database in ${((Date.now() - startTime) / 1000).toFixed(2)}s!`);
  return products.length;
};
