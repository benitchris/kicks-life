-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Basketball', 'High-performance basketball sneakers'),
  ('Running', 'Lightweight running shoes for all terrains'),
  ('Lifestyle', 'Casual sneakers for everyday wear'),
  ('Limited Edition', 'Exclusive and rare sneaker releases')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, sizes, colors, brand) 
SELECT 
  'Air Jordan 1 Retro High',
  'Classic basketball sneaker with premium leather construction',
  180.00,
  '/placeholder.svg?height=400&width=400',
  c.id,
  25,
  '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]'::jsonb,
  '["Black/Red", "White/Black", "Royal Blue"]'::jsonb,
  'Nike'
FROM categories c WHERE c.name = 'Basketball'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, sizes, colors, brand) 
SELECT 
  'Nike Air Max 90',
  'Iconic running shoe with visible Air cushioning',
  120.00,
  '/placeholder.svg?height=400&width=400',
  c.id,
  30,
  '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]'::jsonb,
  '["White/Grey", "Black/White", "Red/White"]'::jsonb,
  'Nike'
FROM categories c WHERE c.name = 'Running'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, sizes, colors, brand) 
SELECT 
  'Adidas Stan Smith',
  'Timeless white leather tennis shoe',
  85.00,
  '/placeholder.svg?height=400&width=400',
  c.id,
  40,
  '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]'::jsonb,
  '["White/Green", "White/Navy", "All White"]'::jsonb,
  'Adidas'
FROM categories c WHERE c.name = 'Lifestyle'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, sizes, colors, brand) 
SELECT 
  'Travis Scott x Air Jordan 1',
  'Limited collaboration with reverse swoosh design',
  1500.00,
  '/placeholder.svg?height=400&width=400',
  c.id,
  5,
  '["8", "8.5", "9", "9.5", "10", "10.5", "11"]'::jsonb,
  '["Brown/Black"]'::jsonb,
  'Nike'
FROM categories c WHERE c.name = 'Limited Edition'
ON CONFLICT DO NOTHING;

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) VALUES
  ('WELCOME10', 'percentage', 10.00, 50.00, 100, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'fixed', 20.00, 100.00, 50, NOW() + INTERVAL '14 days'),
  ('NEWCUSTOMER', 'percentage', 15.00, 75.00, 200, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;
