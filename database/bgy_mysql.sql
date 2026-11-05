CREATE DATABASE IF NOT EXISTS `bgy` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `bgy`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `address` JSON DEFAULT NULL,
  `wishlist` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `tagline` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_price` DECIMAL(10,2) DEFAULT 0.00,
  `other_province_delivery_price` DECIMAL(10,2) DEFAULT 0.00,
  `discount_price` DECIMAL(10,2) DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'Sneakers',
  `gender` ENUM('men', 'women', 'unisex') NOT NULL DEFAULT 'unisex',
  `sizes` JSON DEFAULT NULL,
  `colors` JSON DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `rating` DECIMAL(3,1) DEFAULT 0.0,
  `num_reviews` INT DEFAULT 0,
  `reviews` JSON DEFAULT NULL,
  `featured` TINYINT(1) DEFAULT 0,
  `new_arrival` TINYINT(1) DEFAULT 0,
  `specs` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(100) NOT NULL UNIQUE,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(100) NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `products` JSON NOT NULL,
  `shipping_address` JSON NOT NULL,
  `shipping_method` VARCHAR(255) DEFAULT NULL,
  `payment_method` VARCHAR(255) DEFAULT NULL,
  `subtotal` DECIMAL(10,2) DEFAULT 0.00,
  `shipping_cost` DECIMAL(10,2) DEFAULT 0.00,
  `discount` DECIMAL(10,2) DEFAULT 0.00,
  `total` DECIMAL(10,2) DEFAULT 0.00,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `payment_status` VARCHAR(30) NOT NULL DEFAULT 'Unpaid',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `message_id` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `site_content` (
  `singleton_id` TINYINT PRIMARY KEY,
  `content` JSON NOT NULL,
  `updated_by` VARCHAR(100) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `admin_audit_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `admin_user_id` VARCHAR(100) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(100) NOT NULL,
  `details` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin_audit_created_at` (`created_at`)
);

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `phone`, `role`, `address`, `wishlist`)
VALUES (
  'usr_admin_1',
  'BGY Director',
  'admin@bgy.com',
  '$2a$10$J9LaIu4/0zVgWkVxQf1dn.G1Yyap6V3WjF7mYqHBl5vbXGzP4mRHa',
  '+250788123456',
  'admin',
  JSON_OBJECT('street', 'KN 7 Rd, Kicukiro', 'city', 'Kigali', 'state', 'Kigali City', 'zip', '00100', 'country', 'Rwanda'),
  JSON_ARRAY('prod_bgy_aero_1')
)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO `products` (`product_id`, `name`, `tagline`, `description`, `price`, `discount_price`, `images`, `category`, `gender`, `sizes`, `colors`, `stock`, `rating`, `num_reviews`, `reviews`, `featured`, `new_arrival`, `specs`, `delivery_price`, `other_province_delivery_price`)
VALUES (
  'prod_bgy_aero_1',
  'BGY Aero-1 Proto',
  'A bold everyday sneaker selected for comfort and confident movement',
  'The Aero-1 Proto brings a clean athletic profile, breathable materials, and responsive cushioning together for everyday movement.',
  240.00,
  210.00,
  JSON_ARRAY('https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'),
  'Sneakers',
  'men',
  JSON_ARRAY(35,36,37,38,39,40,41,42,43,44,45),
  JSON_ARRAY(JSON_OBJECT('name', 'Onyx / Crimson', 'hex', '#111111'), JSON_OBJECT('name', 'Pure White', 'hex', '#F9FAFB')),
  24,
  4.9,
  38,
  JSON_ARRAY(),
  1,
  1,
  JSON_OBJECT('upperMaterial', 'Engineered Technical Ripstop & Full-Grain Trim', 'midsole', 'Nitrogen-Infused Hyper-Foam', 'outsole', 'High-Abrasion Carbon Grip Compound', 'weight', '285g (Men 9US)', 'drop', '8mm'),
  3000.00,
  5000.00
)
ON DUPLICATE KEY UPDATE name = name;

SELECT 'BGY MySQL database ready.' AS status;
