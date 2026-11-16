<?php
require 'db.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name  = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $role  = $_POST['role'] ?? '';
    $pass  = $_POST['password'] ?? '';

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)
        || !in_array($role, ['investor', 'operator', 'customer']) || strlen($pass) < 8) {
        $error = 'Fill every field, use a real email and a password of 8 or more characters.';
    } else {
        $check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $check->execute([$email]);
        if ($check->fetch()) {
            $error = 'That email is already registered.';
        } else {
            $save = $pdo->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
            $save->execute([$name, $email, password_hash($pass, PASSWORD_DEFAULT), $role]);
            header('Location: login.php?registered=1');
            exit;
        }
    }
}
$mode = 'auth';
$heading = 'Create your account';
$sub = 'Join as an investor, operator or customer.';
include 'header.php';
?>
<?php if ($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?>
<form method="post">
  <label>Full name <input name="name" required></label>
  <label>Email <input type="email" name="email" required></label>
  <label>I am joining as
    <select name="role" required>
      <option value="">Choose a role</option>
      <option value="investor">Investor</option>
      <option value="operator">Operator</option>
      <option value="customer">Customer</option>
    </select>
  </label>
  <label>Password (8 or more characters) <input type="password" name="password" required></label>
  <button class="pill">Sign up</button>
</form>
<p>Already have an account? <a href="login.php">Log in</a></p>
<?php include 'footer.php'; ?>
