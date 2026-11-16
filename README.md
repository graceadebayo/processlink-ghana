<?php
require 'db.php';
need_admin();

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['approve_project'])) {
    $projectId = (int)($_POST['project_id'] ?? 0);
    if ($projectId > 0) {
        $stmt = $pdo->prepare('UPDATE projects SET status = "approved" WHERE id = ? AND status = "pending"');
        $stmt->execute([$projectId]);
        $message = 'Project approved successfully.';
    }
}

$users = $pdo->query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC')->fetchAll();
$projectRows = $pdo->query('SELECT p.*, u.name AS owner_name FROM projects p JOIN users u ON u.id = p.created_by ORDER BY p.created_at DESC')->fetchAll();
$counts = $pdo->query('SELECT role, COUNT(*) FROM users GROUP BY role')->fetchAll(PDO::FETCH_KEY_PAIR);
$heading = 'Admin';
$sub = 'Review users and approve project activity';
include 'header.php';
?>
<?php if ($message): ?><p class="ok"><?= e($message) ?></p><?php endif; ?>
<div class="grid">
  <?php foreach (['investor', 'operator', 'customer', 'admin'] as $r): ?>
    <div class="card soft stat"><b><?= $counts[$r] ?? 0 ?></b><p><?= e($r) ?>s</p></div>
  <?php endforeach; ?>
</div>

<section class="card">
  <h3>Approve projects</h3>
  <?php foreach ($projectRows as $project): ?>
    <div class="card soft" style="margin-top: 12px;">
      <h4><?= e($project['title']) ?></h4>
      <p><?= e($project['description']) ?></p>
      <p><strong>Owner:</strong> <?= e($project['owner_name']) ?> | <strong>Category:</strong> <?= e($project['category']) ?> | <strong>Status:</strong> <?= e($project['status']) ?></p>
      <?php if ($project['status'] === 'pending'): ?>
        <form method="post">
          <input type="hidden" name="project_id" value="<?= (int)$project['id'] ?>">
          <button class="pill" name="approve_project" value="1">Approve project</button>
        </form>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
</section>

<section class="card" style="margin-top: 24px;">
  <h3>All registered users</h3>
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
</section>
<?php include 'footer.php'; ?>
