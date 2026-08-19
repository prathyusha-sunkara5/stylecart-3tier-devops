INSERT INTO products (name, category, price, description, image_url) VALUES
('Classic Denim Jacket', 'Jackets', 2499.00, 'Everyday blue denim jacket with a relaxed fit.', 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80'),
('Minimal White Shirt', 'Shirts', 1299.00, 'Clean cotton shirt for office and casual looks.', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'),
('Streetwear Hoodie', 'Hoodies', 1799.00, 'Soft fleece hoodie with a modern streetwear silhouette.', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'),
('Everyday Sneakers', 'Footwear', 2999.00, 'Lightweight sneakers designed for daily wear.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'),
('Black Tote Bag', 'Accessories', 999.00, 'Simple structured tote for work and travel.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'),
('Relaxed Joggers', 'Bottomwear', 1499.00, 'Comfortable joggers with an adjustable waist.', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE name = VALUES(name);
