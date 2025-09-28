// SQLite database connection and utilities
import Database from "better-sqlite3"
import { readFileSync } from "fs"
import { join } from "path"

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    // Use file-based SQLite for persistence
    db = new Database("database.sqlite")

    // Initialize database with schema and seed data if first run
    initializeDatabase()
  }
  return db
}

function initializeDatabase() {
  if (!db) return

  try {
    // Read and execute schema
    const schemaPath = join(process.cwd(), "scripts", "01-create-tables.sql")
    const schema = readFileSync(schemaPath, "utf8")
    db.exec(schema)

    // Read and execute seed data
    const seedPath = join(process.cwd(), "scripts", "02-seed-data.sql")
    const seedData = readFileSync(seedPath, "utf8")
    db.exec(seedData)

    console.log("[v0] Database initialized successfully")
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    // Fallback: create tables directly if file reading fails
    createTablesDirectly()
  }
}

function createTablesDirectly() {
  if (!db) return

  // Create tables directly in code as fallback
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image_url TEXT,
      category TEXT,
      brand TEXT,
      sizes TEXT,
      colors TEXT,
      stock_quantity INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      promo_code TEXT,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      size TEXT,
      color TEXT,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL,
      min_order_amount DECIMAL(10,2) DEFAULT 0,
      max_uses INTEGER,
      current_uses INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Insert sample data
  const insertProducts = db.prepare(`
    INSERT OR IGNORE INTO products (id, name, description, price, image_url, category, brand, sizes, colors, stock_quantity, featured) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const products = [
    [
      1,
      "Air Jordan 1 Retro High",
      "Classic basketball sneaker with premium leather construction and iconic design.",
      170.0,
      "/air-jordan-1-basketball-sneaker.jpg",
      "Basketball",
      "Jordan",
      '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]',
      '["Black/Red", "White/Black", "Royal Blue"]',
      25,
      1,
    ],
    [
      2,
      "Nike Air Max 90",
      "Iconic running shoe with visible Air cushioning and retro styling.",
      120.0,
      "/nike-air-max-90-running-shoe.jpg",
      "Running",
      "Nike",
      '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]',
      '["White/Grey", "Black/White", "Navy/White"]',
      30,
      1,
    ],
    [
      3,
      "Adidas Stan Smith",
      "Minimalist tennis shoe with clean white leather upper and green accents.",
      80.0,
      "/adidas-stan-smith-white-tennis-shoe.jpg",
      "Lifestyle",
      "Adidas",
      '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]',
      '["White/Green", "White/Navy", "All White"]',
      40,
      0,
    ],
    [
      4,
      "Travis Scott x Air Jordan 1",
      "Limited edition collaboration with reverse swoosh and premium materials.",
      450.0,
      "/travis-scott-air-jordan-1-brown-sneaker.jpg",
      "Basketball",
      "Jordan",
      '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]',
      '["Brown/Black", "Mocha"]',
      5,
      1,
    ],
    [
      5,
      "Nike Dunk Low",
      "Classic basketball silhouette reimagined for everyday wear.",
      100.0,
      "/nike-dunk-low-sneaker.jpg",
      "Lifestyle",
      "Nike",
      '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]',
      '["White/Black", "Black/White", "University Blue"]',
      20,
      0,
    ],
    [
      6,
      "Yeezy Boost 350 V2",
      "Innovative knit upper with Boost cushioning technology.",
      220.0,
      "/yeezy-boost-350-v2-sneaker.jpg",
      "Lifestyle",
      "Adidas",
      '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]',
      '["Zebra", "Cream White", "Black Red"]',
      15,
      1,
    ],
  ]

  products.forEach((product) => insertProducts.run(...product))

  // Insert promo codes
  const insertPromo = db.prepare(`
    INSERT OR IGNORE INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, active, expires_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const promoCodes = [
    ["WELCOME10", "percentage", 10.0, 50.0, 100, 1, "2024-12-31 23:59:59"],
    ["SAVE20", "fixed", 20.0, 100.0, 50, 1, "2024-12-31 23:59:59"],
    ["NEWCUSTOMER", "percentage", 15.0, 75.0, 200, 1, "2024-12-31 23:59:59"],
  ]

  promoCodes.forEach((promo) => insertPromo.run(...promo))

  console.log("[v0] Database seeded with sample data")
}

// Database query helpers
export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  brand: string
  sizes: string
  colors: string
  stock_quantity: number
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  total_amount: number
  status: string
  promo_code?: string
  discount_amount: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  size?: string
  color?: string
  price: number
}

export interface PromoCode {
  id: number
  code: string
  discount_type: string
  discount_value: number
  min_order_amount: number
  max_uses?: number
  current_uses: number
  active: boolean
  expires_at?: string
  created_at: string
}
