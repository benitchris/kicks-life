-- Insert sample products
INSERT OR IGNORE INTO products (id, name, description, price, image_url, category, brand, sizes, colors, stock_quantity, featured) VALUES
(1, 'Air Jordan 1 Retro High', 'Classic basketball sneaker with premium leather construction and iconic design.', 170.00, '/air-jordan-1-basketball-sneaker.jpg', 'Basketball', 'Jordan', '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]', '["Black/Red", "White/Black", "Royal Blue"]', 25, TRUE),
(2, 'Nike Air Max 90', 'Iconic running shoe with visible Air cushioning and retro styling.', 120.00, '/nike-air-max-90-running-shoe.jpg', 'Running', 'Nike', '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]', '["White/Grey", "Black/White", "Navy/White"]', 30, TRUE),
(3, 'Adidas Stan Smith', 'Minimalist tennis shoe with clean white leather upper and green accents.', 80.00, '/adidas-stan-smith-white-tennis-shoe.jpg', 'Lifestyle', 'Adidas', '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]', '["White/Green", "White/Navy", "All White"]', 40, FALSE),
(4, 'Travis Scott x Air Jordan 1', 'Limited edition collaboration with reverse swoosh and premium materials.', 450.00, '/travis-scott-air-jordan-1-brown-sneaker.jpg', 'Basketball', 'Jordan', '["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]', '["Brown/Black", "Mocha"]', 5, TRUE),
(5, 'Nike Dunk Low', 'Classic basketball silhouette reimagined for everyday wear.', 100.00, '/placeholder.svg?height=400&width=400', 'Lifestyle', 'Nike', '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]', '["White/Black", "Black/White", "University Blue"]', 20, FALSE),
(6, 'Yeezy Boost 350 V2', 'Innovative knit upper with Boost cushioning technology.', 220.00, '/placeholder.svg?height=400&width=400', 'Lifestyle', 'Adidas', '["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"]', '["Zebra", "Cream White", "Black Red"]', 15, TRUE);

-- Insert sample promo codes
INSERT OR IGNORE INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, active, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 50.00, 100, TRUE, '2024-12-31 23:59:59'),
('SAVE20', 'fixed', 20.00, 100.00, 50, TRUE, '2024-12-31 23:59:59'),
('NEWCUSTOMER', 'percentage', 15.00, 75.00, 200, TRUE, '2024-12-31 23:59:59');
