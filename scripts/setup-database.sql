-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  brand TEXT,
  category TEXT NOT NULL,
  sizes TEXT NOT NULL, -- JSON array as string
  colors TEXT NOT NULL, -- JSON array as string
  stock_quantity INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value REAL NOT NULL,
  min_order_amount REAL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  promo_code_id INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample products
INSERT OR REPLACE INTO products (id, name, description, price, image_url, brand, category, sizes, colors, stock_quantity, featured) VALUES
(1, 'Air Jordan 1 Retro High OG', 'The iconic Air Jordan 1 that started it all. Premium leather construction with classic colorways.', 170.00, '/air-jordan-1-basketball-sneaker.jpg', 'Nike', 'Basketball', '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]', '["Bred", "Chicago", "Royal", "Shadow"]', 25, TRUE),

(2, 'Nike Air Max 90', 'Classic Air Max comfort with visible air cushioning. Perfect for everyday wear and light running.', 120.00, '/nike-air-max-90-running-shoe.jpg', 'Nike', 'Running', '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]', '["White/Grey", "Black/Red", "Navy/White", "Triple White"]', 40, TRUE),

(3, 'Adidas Stan Smith', 'Timeless tennis-inspired lifestyle sneaker. Clean white leather with green accents.', 80.00, '/adidas-stan-smith-white-tennis-shoe.jpg', 'Adidas', 'Lifestyle', '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]', '["White/Green", "White/Navy", "All White", "White/Black"]', 60, FALSE),

(4, 'Travis Scott x Air Jordan 1', 'Exclusive collaboration with reversed swoosh design. Limited edition release.', 450.00, '/travis-scott-air-jordan-1-brown-sneaker.jpg', 'Nike', 'Basketball', '["8", "8.5", "9", "9.5", "10", "10.5", "11"]', '["Mocha", "Fragment"]', 5, TRUE),

(5, 'Nike Air Force 1', 'The classic basketball shoe that became a lifestyle icon. Durable leather construction.', 90.00, '/placeholder.svg?height=300&width=300', 'Nike', 'Lifestyle', '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"]', '["Triple White", "Black/White", "White/Black", "All Black"]', 80, FALSE),

(6, 'Adidas Ultraboost 22', 'Premium running shoe with responsive Boost cushioning and Primeknit upper.', 180.00, '/placeholder.svg?height=300&width=300', 'Adidas', 'Running', '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]', '["Core Black", "Cloud White", "Solar Red", "Navy/White"]', 30, TRUE);

-- Insert sample promo codes
INSERT OR REPLACE INTO promo_codes (id, code, discount_type, discount_value, min_order_amount, max_uses, current_uses, active) VALUES
(1, 'WELCOME10', 'percentage', 10, 0, 100, 0, TRUE),
(2, 'SAVE20', 'fixed', 20, 100, 50, 0, TRUE),
(3, 'NEWUSER15', 'percentage', 15, 50, NULL, 0, TRUE);
