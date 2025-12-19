-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    current_balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (current_balance >= 0),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('CREDIT', 'DEBIT')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

-- 2. Create Triggers (Auto Balance Update)
CREATE OR REPLACE FUNCTION update_balance_logic() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'CREDIT' THEN
        UPDATE accounts SET current_balance = current_balance + NEW.amount WHERE account_id = NEW.account_id;
    ELSIF NEW.transaction_type = 'DEBIT' THEN
        UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE account_id = NEW.account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_update_balance ON transactions;
CREATE TRIGGER auto_update_balance AFTER INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION update_balance_logic();

-- 3. Prevent Update/Delete on Transactions
CREATE OR REPLACE RULE prevent_update AS ON UPDATE TO transactions DO INSTEAD NOTHING;
CREATE OR REPLACE RULE prevent_delete AS ON DELETE TO transactions DO INSTEAD NOTHING;

-- 4. Dummy Data Insert (Users & Accounts)
INSERT INTO users (username, password) VALUES 
('ishaq', '123'), ('admin', '123'), ('student', '123')
ON CONFLICT (username) DO NOTHING;

INSERT INTO accounts (user_id, account_number, current_balance) VALUES 
(1, 'ACC-1001', 5000.00), (2, 'ACC-ADMIN', 100000.00)
ON CONFLICT (user_id) DO NOTHING;