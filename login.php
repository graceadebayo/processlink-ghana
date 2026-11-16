<?php
require 'db.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([strtolower(trim($_POST['email'] ?? ''))]);
    $user = $stmt->fetch();

    if ($user && password_verify($_POST['password'] ?? '', $user['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user'] = ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']];
        header('Location: ' . ($user['role'] === 'admin' ? 'admin.php' : 'portal.php'));
        exit;
    }
    $error = 'Incorrect email or password.';
}
$mode = 'auth';
$heading = 'Welcome back';
$sub = 'Log in to continue to your workspace.';
include 'header.php';
?>
<?php if (isset($_GET['registered'])): ?><p class="ok">Account created. You can log in now.</p><?php endif; ?>
<?php if ($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?>
<form method="post">
  <label>Email <input type="email" name="email" required></label>
  <label>Password <input type="password" name="password" required></label>
  <button class="pill">Log in</button>
</form>
<p>New here? <a href="register.php">Create an account</a></p>
<?php include 'footer.php'; ?>
