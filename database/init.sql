CREATE DATABASE IF NOT EXISTS computer_shop;
USE computer_shop;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  price DOUBLE NOT NULL,
  stock_quantity INT DEFAULT 0,
  image_url VARCHAR(255),
  category_id INT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_amount DOUBLE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  price DOUBLE NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT
);

INSERT INTO categories (name, description) VALUES
('Laptops', 'Portable computing devices'),
('Desktops', 'Powerful desktop systems'),
('Processors', 'CPU options for building systems'),
('Graphics Cards', 'Gaming and workstation GPUs'),
('Storage', 'SSDs and hard drives'),
('Accessories', 'Peripherals and accessories')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (name, slug, description, price, stock_quantity, image_url, category_id, is_featured, is_active) VALUES
('Gaming Laptop Pro', 'gaming-laptop-pro', 'High-performance gaming laptop with RGB keyboard.', 1399000, 12, '/images/img1.jpg', 1, TRUE, TRUE),
('Creator Desktop', 'creator-desktop', 'Powerful workstation desktop for creators.', 1245000, 8, '/images/img2.jpg', 2, TRUE, TRUE),
('RTX 4070 GPU', 'rtx-4070-gpu', 'Next-gen graphics card for ultra settings.', 749000, 15, '/images/img3.jpg', 4, TRUE, TRUE),
('1TB NVMe SSD', '1tb-nvme-ssd', 'Fast storage solution for gaming and work.', 179000, 30, '/images/img4.jpg', 5, FALSE, TRUE),
('Mechanical Keyboard', 'mechanical-keyboard', 'RGB mechanical keyboard for pro setup.', 89000, 20, '/images/img5.jpg', 6, FALSE, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO site_settings (key_name, value) VALUES
('shop_name', 'Nova Computer Hub'),
('whatsapp_number', '+94740620137'),
('hero_title', 'Premium PC Hardware & Gaming Gear'),
('hero_subtitle', 'Discover high-performance computers and components crafted for creators, gamers, and professionals.'),
('footer_text', 'Trusted computer parts and custom builds in Sri Lanka.')
ON DUPLICATE KEY UPDATE value=VALUES(value);
