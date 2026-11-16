# Every line explained

How to read this: the code is shown in small pieces, with a plain explanation under each piece. Read the files in this order: `database.sql`, `db.php`, `register.php`, `login.php`, `portal.php`, `admin.php`.

Words used:
- **PHP** runs on the server and builds the page before it reaches the browser.
- **MySQL** is the database that keeps the data.
- **PDO** is PHP's tool for talking to MySQL.
- **Session** is the server's memory of who is logged in.
- **Hash** is a scrambled version of a password that cannot be turned back.

---

## 1. database.sql (the table)

```sql
CREATE DATABASE IF NOT EXISTS processlink;
USE processlink;
```
Create a database called `processlink` if it is not there yet, then use it.

```sql
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('investor','operator','customer','admin') NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
Create a table called `users`. Each column is one piece of information about a person.
- `id`: a number MySQL gives each person automatically.
- `name`: text up to 100 characters.
- `email`: `UNIQUE` means MySQL refuses duplicate emails.
- `password_hash`: the scrambled password.
- `role`: can only be one of the four listed values.
- `created_at`: MySQL fills in the date and time of sign up.

```sql
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (...)
```
Add the starting admin account. `IGNORE` means "skip if it already exists".

---

## 2. db.php (connection and guards)

```php
session_start();
```
Turn on sessions. This must run before anything is printed.

```php
$pdo = new PDO('mysql:host=localhost;dbname=processlink;charset=utf8mb4', 'root', '', [...]);
```
Open the connection to MySQL.

```php
function e($text) { return htmlspecialchars($text ?? ''); }
```
A helper that makes text safe before printing.

```php
function need_login() {
    if (!isset($_SESSION['user'])) { header('Location: login.php'); exit; }
}
```
A guard: only logged-in users may enter.

```php
function need_admin() {
    need_login();
    if ($_SESSION['user']['role'] !== 'admin') { http_response_code(403); die('Access denied. Admin only.'); }
}
```
Only the admin may access the admin page.

---

## 3. register.php (sign up)

```php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
```
Only do the next part when a form was submitted.

```php
$name  = trim($_POST['name'] ?? '');
$email = strtolower(trim($_POST['email'] ?? ''));
$role  = $_POST['role'] ?? '';
$pass  = $_POST['password'] ?? '';
```
Read values from the form.

```php
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || !in_array($role, ['investor', 'operator', 'customer']) || strlen($pass) < 8) {
```
Validate the entered data.

```php
$check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$check->execute([$email]);
```
Check whether the email already exists.

```php
$save = $pdo->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
$save->execute([$name, $email, password_hash($pass, PASSWORD_DEFAULT), $role]);
```
Save the new user into the database.

```php
header('Location: login.php?registered=1');
exit;
```
Redirect to the login page after successful registration.

---

## 4. login.php (log in)

```php
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([strtolower(trim($_POST['email'] ?? ''))]);
$user = $stmt->fetch();
```
Find the matching user by email.

```php
if ($user && password_verify($_POST['password'] ?? '', $user['password_hash'])) {
```
Check whether the entered password matches the stored hash.

```php
session_regenerate_id(true);
$_SESSION['user'] = ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']];
```
Create the session and remember the logged-in user.

```php
header('Location: ' . ($user['role'] === 'admin' ? 'admin.php' : 'portal.php'));
```
Send the user to the correct page after login.

---

## 5. logout.php

```php
session_start();
session_destroy();
header('Location: login.php');
```
Delete the session and send the user back to the login page.

---

## 6. portal.php

```php
need_login();
```
Only logged-in users may access this page.

```php
$role = $_SESSION['user']['role'];
```
Read the current user's role from the session.

---

## 7. admin.php

```php
need_admin();
```
Only the admin can access this page.

```php
$users = $pdo->query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC')->fetchAll();
```
Read all accounts from the database and show them on the admin page.

---

## The full journey

Sign up: browser form -> `register.php` validates it -> `password_hash` scrambles the password -> `INSERT` saves the user.

Log in: browser form -> `login.php` checks the email and password -> session stores the user -> redirect to the right page.

Protected pages: each page starts with a guard that reads the session and allows access only to the correct role.
