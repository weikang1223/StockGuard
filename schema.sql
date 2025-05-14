CREATE DATABASE IF NOT EXISTS StockGuard;
USE StockGuard;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categories_name VARCHAR(100) NOT NULL,
    
    UNIQUE KEY categories_name_UNIQUE (categories_name)
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    
    UNIQUE KEY company_name_UNIQUE (company_name),
    UNIQUE KEY contact_name_UNIQUE (contact_name),
    UNIQUE KEY email_UNIQUE (email),
    UNIQUE KEY phone_UNIQUE (phone)
);


-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
	UNIQUE KEY store_name_UNIQUE (store_name),
    UNIQUE KEY location_UNIQUE (location)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL UNIQUE PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('manager', 'store admin') NOT NULL,
    store_id INT DEFAULT NULL,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
    
    UNIQUE KEY username_unique(username)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    store_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price>=0),
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
    CONSTRAINT unique_product_per_store UNIQUE (product_name, store_id)
);

-- Create product_transactions table
CREATE TABLE IF NOT EXISTS product_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	transaction_type ENUM('in', 'out') NOT NULL,
    created_by INT,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);


-- Insert sample data for users
-- This is the manager role password 
-- Username is manager and password is 122397
-- Please don change the default password 
-- Insert sample data for users
INSERT INTO users (id, username, password, role, store_id) VALUES
(1, 'manager', 'scrypt:32768:8:1$XZtikzfXc3mZuABd$ee77ac2a0e2cec313498eb9183deb687d094dc216d31db4981bc425bc0ab7171315009d872cbe8ff8c71159dbdbba624e73fc42cb736e3b7fb72c47c97a80821', 'manager', NULL);



-- Insert sample data for categories
INSERT INTO categories (id, categories_name) VALUES
(1, 'Electronics'),
(2, 'Clothing'),
(3, 'Food & Beverages'),
(4, 'Home & Kitchen'),
(5, 'Books');

-- Insert sample data for suppliers
INSERT INTO suppliers (id, company_name, contact_name, email, phone, address) VALUES
(1, 'Tech Supplies Pte Ltd.', 'John Smith', 'john@techsupplies.com', '8564 3456', '100 beach road #03-28, Singapore'),
(2, 'Fashion Forward', 'Sarah', 'sarah@fashionforward.com', '8856 1123', '35 tuas south avenue 2 ,SIngapore'),
(3, 'Fresh Foods Co.', 'Michael ', 'michael@freshfoods.com', '9168 1888', ' 4 Rochdale Road, Singapore'),
(4, 'Home Essentials', 'Emily ', 'emily@homeessentials.com', '8888 2688', ' 391A Orchard Road #B2-21 Ngee Ann City, Singapore'),
(5, 'Popular','David','david@popular.com','8288 1688', '123 Somerset Road, Singapore');

-- Insert sample data for stores
INSERT INTO stores (store_id, store_name, location) VALUES
(1, 'Downtown Branch', '23 Tanjong Kling Road'),
(2, 'Mall Branch', 'Ngee Ann City'),
(3, 'Airport Branch', '789 Airport Road'),
(4, 'Suburban Branch', '456 Clementi Ave 3'),
(5, 'Harbourfront Branch', '12 Harbourfront Walk'),
(6, 'Bukit Timah Branch', '18 Bukit Timah Road');

-- for store admin 
INSERT INTO users (id, username, password, role, store_id) VALUES
(2, 'storeadmin', 'scrypt:32768:8:1$uEYPdgqIIuVLUzDx$2ae1ee5ceb2d66fa89aba10b5376b8ef8ff0ece5a6cb8f18b7ecb767cb136a3f60659a31e44c9d934dd92b54b5c1de94462aefd65440357208339a86c50b93b8', 'store admin', 3),
(3, 'weikang', 'scrypt:32768:8:1$mvsm0ZFP9Qv6WhgE$25bbb0a9a81aefbb980c71e579789ebe438380f8c4ff3aabbf27499391a9ac5bf4fe7e1b8adc6e132f93d1e37a2d7497362916f79e4a7c302ffded27848ae0fe','store admin',1);



-- Insert sample data for products
INSERT INTO products (product_name, category_id, supplier_id, store_id, price, quantity) VALUES
-- Electronics
('Laptop', 1, 1, 1, 999.99, 10),
('Smartphone', 1, 1, 1, 699.99, 15),
('Tablet', 1, 1, 2, 499.99, 20),
('Headphones', 1, 1, 2, 149.99, 30),
('Smartwatch', 1, 1, 3, 299.99, 25),

-- Clothing
('T-Shirt', 2, 2, 2, 19.99, 50),
('Jeans', 2, 2, 2, 49.99, 30),
('Hoodie', 2, 2, 3, 59.99, 25),
('Socks', 2, 2, 3, 9.99, 100),
('Hat', 2, 2, 4, 14.99, 40),

-- Food & Beverages
('Coffee', 3, 3, 3, 9.99, 100),
('Tea', 3, 3, 3, 7.99, 80),
('Snacks', 3, 3, 4, 5.99, 150),
('Juice', 3, 3, 4, 3.99, 200),
('Water', 3, 3, 5, 1.99, 300),

-- Home & Kitchen
('Blender', 4, 4, 4, 79.99, 20),
('Toaster', 4, 4, 4, 29.99, 25),
('Microwave', 4, 4, 5, 89.99, 15),
('Coffee Maker', 4, 4, 5, 49.99, 30),
('Kettle', 4, 4, 6, 24.99, 40),

-- Books
('Novel', 5, 5, 1, 14.99, 40),
('Textbook', 5, 5, 2, 49.99, 15),
('Comic Book', 5, 5, 2, 9.99, 50),
('Magazine', 5, 5, 3, 5.99, 100),
('Notebook', 5, 5, 3, 3.99, 200);


-- Insert sample data for store_transactions
INSERT INTO product_transactions (product_id, quantity, transaction_date, transaction_type, created_by)
VALUES 
(1, 10, '2025-04-01 09:00:00', 'in', 1),
(2, 15, '2025-04-01 10:00:00', 'in', 1),
(3, 20, '2025-04-01 11:00:00', 'in', 1),
(4, 30, '2025-04-01 12:00:00', 'in', 1),
(5, 30, '2025-04-01 13:00:00', 'in', 1),
(6, 25, '2025-04-01 14:00:00', 'in', 1),
(7, 50, '2025-04-01 15:00:00', 'in', 1),
(8, 30, '2025-04-01 16:00:00', 'in', 1),
(9, 25, '2025-04-01 17:00:00', 'in', 1),
(10, 100, '2025-04-01 18:00:00', 'in', 1),
(11, 40, '2025-04-02 09:00:00', 'in', 1),
(12, 100, '2025-04-02 10:00:00', 'in', 1),
(13, 80, '2025-04-02 11:00:00', 'in', 1),
(14, 150, '2025-04-02 12:00:00', 'in', 1),
(15, 200, '2025-04-02 13:00:00', 'in', 1),
(16, 300, '2025-04-02 14:00:00', 'in', 1),
(17, 20, '2025-04-02 15:00:00', 'in', 1),
(18, 25, '2025-04-02 16:00:00', 'in', 1),
(19, 15, '2025-04-02 17:00:00', 'in', 1),
(20, 30, '2025-04-02 18:00:00', 'in', 1),
(21, 40, '2025-04-03 09:00:00', 'in', 1),
(22, 40, '2025-04-03 10:00:00', 'in', 1),
(23, 50, '2025-04-03 11:00:00', 'in', 1),
(24, 100, '2025-04-03 12:00:00', 'in', 1),
(25, 200, '2025-04-03 13:00:00', 'in', 1);

-- show all the tables
show tables;

select * from categories;
select * from suppliers;
select * from products;
select * from stores;
select * from product_transactions;
select * from users;


drop table product_transactions;
drop table products;
drop table users;
drop table stores;
drop table categories;
drop table suppliers;

DESCRIBE suppliers;
DESCRIBE CATEGORIES;
DESCRIBE SUPPLIERS;
DESCRIBE stores;
DESCRIBE USERS;