-- =============================================
-- Database Schema for VaultCore Banking System
-- Database: PostgreSQL
-- =============================================

-- 1. Cleanup: Remove existing tables if they exist (Order matters due to Foreign Keys)
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Users Table
-- Stores authentication and profile details
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Stores BCrypt hash
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Accounts Table
-- Links a user to their financial balance
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    current_balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (current_balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table
-- Records all fund transfers and stock purchases
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    sender_account_id INTEGER REFERENCES accounts(id),
    receiver_account_id INTEGER REFERENCES accounts(id), -- Nullable for Stock Buys
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(255) -- Increased length to accommodate descriptive status messages
);

-- 5. Holdings Table
-- Stores stock market portfolio for the user
CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL, -- e.g., "VAULT", "AAPL"
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    avg_buy_price DECIMAL(15, 2) NOT NULL
);

-- =============================================
-- Seed Data (Optional - For Testing)
-- =============================================

-- Insert Demo Users
INSERT INTO users (username, password, email) VALUES 
('ishaq', '$2a$10$wW/wP7gD.A2gM2.j3y5WZO.2.X3y.X3y.X3y.X3y.X3y.X3y', 'ishaq@gmail.com'), -- Password should be hashed
('heena', '$2a$10$wW/wP7gD.A2gM2.j3y5WZO.2.X3y.X3y.X3y.X3y.X3y.X3y', 'heena@gmail.com');

-- Insert Demo Accounts (Linking by Subquery)
INSERT INTO accounts (user_id, account_number, current_balance) VALUES 
((SELECT id FROM users WHERE username='ishaq'), 'ACC-ISHAQ-786', 50000.00),
((SELECT id FROM users WHERE username='heena'), 'ACC-HEENA-01', 1000.00);

-- Insert Demo Transaction
INSERT INTO transactions (sender_account_id, receiver_account_id, amount, status) VALUES
(
    (SELECT id FROM accounts WHERE account_number='ACC-ISHAQ-786'),
    (SELECT id FROM accounts WHERE account_number='ACC-HEENA-01'),
    500.00,
    'TRANSFER_SUCCESS'
);