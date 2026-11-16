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

-- Starting admin. Email: admin@processlink.gh   Password: Admin@12345
INSERT IGNORE INTO users (name, email, password_hash, role)
VALUES ('System Admin', 'admin@processlink.gh', '$2y$10$rwO171La5KPAZiRjYZG4guv/Qo.eZb0EdTSSPbs8quXKw9SUI7DOK', 'admin');
