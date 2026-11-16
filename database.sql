-- Run this once in phpMyAdmin (Import tab).
CREATE DATABASE IF NOT EXISTS processlink;
USE processlink;

-- One row per person who signs up.
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('investor','operator','customer','admin') NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(150) NOT NULL,
  description   TEXT NOT NULL,
  category      VARCHAR(50) NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  raised_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status        ENUM('pending','approved','funded','closed') NOT NULL DEFAULT 'pending',
  created_by    INT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  project_id    INT NOT NULL,
  investor_id   INT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  project_id    INT NOT NULL,
  customer_id   INT NOT NULL,
  operator_id   INT NULL,
  description   TEXT NOT NULL,
  status        ENUM('requested','assigned','completed') NOT NULL DEFAULT 'requested',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Starting admin. Email: admin@processlink.gh   Password: Admin@12345
INSERT IGNORE INTO users (name, email, password_hash, role)
VALUES ('System Admin', 'admin@processlink.gh', '$2y$10$rwO171La5KPAZiRjYZG4guv/Qo.eZb0EdTSSPbs8quXKw9SUI7DOK', 'admin');

INSERT INTO projects (title, description, category, target_amount, raised_amount, status, created_by)
SELECT 'Cassava Grinding Hub', 'A community cassava processing unit for flour and gari production.', 'Processing', 18000.00, 5400.00, 'approved', id
FROM users WHERE email = 'admin@processlink.gh'
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO projects (title, description, category, target_amount, raised_amount, status, created_by)
SELECT 'Palm Oil Press Expansion', 'Investment for a palm oil press and storage upgrade for local farmers.', 'Oil Extraction', 25000.00, 6500.00, 'approved', id
FROM users WHERE email = 'admin@processlink.gh'
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO projects (title, description, category, target_amount, raised_amount, status, created_by)
SELECT 'Maize Mill Modernisation', 'Modern maize mill to reduce post-harvest losses and speed output.', 'Milling', 32000.00, 0.00, 'pending', id
FROM users WHERE email = 'admin@processlink.gh'
ON DUPLICATE KEY UPDATE title = VALUES(title);
