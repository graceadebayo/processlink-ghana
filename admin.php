<?php
require 'db.php';
need_admin();

$users = $pdo->query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC')->fetchAll();
$counts = $pdo->query('SELECT role, COUNT(*) FROM users GROUP BY role')->fetchAll(PDO::FETCH_KEY_PAIR);
$heading = 'Admin';
$sub = 'Everyone who signs up is saved in the users table';
include 'header.php';
?>
<div class="grid">
  <?php foreach (['investor', 'operator', 'customer', 'admin'] as $r): ?>
    <div class="card soft stat"><b><?= $counts[$r] ?? 0 ?></b><p><?= e($r) ?>s</p></div>
  <?php endforeach; ?>
</div>
<div class="scroll">
<table>
  <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
  <?php foreach ($users as $u): ?>
    <tr>
      <td><?= $u['id'] ?></td>
      <td><?= e($u['name']) ?></td>
      <td><?= e($u['email']) ?></td>
      <td><?= e($u['role']) ?></td>
      <td><?= e($u['created_at']) ?></td>
    </tr>
  <?php endforeach; ?>
</table>
</div>
<?php include 'footer.php'; ?>
