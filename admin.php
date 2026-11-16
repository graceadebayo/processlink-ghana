<?php
require 'db.php';
need_login();

$user = $_SESSION['user'];
$role = $user['role'];
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($role === 'investor' && isset($_POST['fund_project'])) {
        $projectId = (int)($_POST['project_id'] ?? 0);
        $amount = (float)($_POST['amount'] ?? 0);

        if ($projectId > 0 && $amount > 0) {
            $stmt = $pdo->prepare('SELECT id, title, target_amount, raised_amount, status FROM projects WHERE id = ?');
            $stmt->execute([$projectId]);
            $project = $stmt->fetch();

            if ($project && $project['status'] !== 'closed') {
                $pdo->beginTransaction();
                $insert = $pdo->prepare('INSERT INTO investments (project_id, investor_id, amount) VALUES (?, ?, ?)');
                $insert->execute([$projectId, $user['id'], $amount]);

                $update = $pdo->prepare('UPDATE projects SET raised_amount = raised_amount + ? WHERE id = ?');
                $update->execute([$amount, $projectId]);
                $pdo->commit();

                $message = 'Investment recorded for ' . $project['title'] . '.';
            } else {
                $message = 'That project is no longer open for funding.';
            }
        } else {
            $message = 'Enter a valid amount to fund the project.';
        }
    }

    if ($role === 'customer' && isset($_POST['request_job'])) {
        $projectId = (int)($_POST['project_id'] ?? 0);
        $description = trim($_POST['description'] ?? '');

        if ($projectId > 0 && $description !== '') {
            $stmt = $pdo->prepare('SELECT id FROM projects WHERE id = ? AND status IN ("approved", "funded")');
            $stmt->execute([$projectId]);
            if ($stmt->fetch()) {
                $insert = $pdo->prepare('INSERT INTO jobs (project_id, customer_id, description, status) VALUES (?, ?, ?, "requested")');
                $insert->execute([$projectId, $user['id'], $description]);
                $message = 'Your processing request has been submitted.';
            } else {
                $message = 'Select an approved project before submitting a request.';
            }
        } else {
            $message = 'Add a short description for the job request.';
        }
    }
}

$projects = $pdo->query('SELECT p.*, COALESCE(SUM(i.amount), 0) AS total_raised FROM projects p LEFT JOIN investments i ON i.project_id = p.id GROUP BY p.id ORDER BY p.created_at DESC')->fetchAll();
$jobs = $pdo->query('SELECT j.*, p.title AS project_title FROM jobs j JOIN projects p ON p.id = j.project_id WHERE j.customer_id = ' . (int)$user['id'] . ' ORDER BY j.created_at DESC')->fetchAll();

$summary = [
    'investor' => 'You can review active projects and fund them with simulated money.',
    'operator' => 'You can see processing jobs and manage assigned work.',
    'customer' => 'You can request processing work for approved farms and equipment.',
];

$heading = 'Hello, ' . $user['name'];
$sub = 'Logged in as ' . $role;
include 'header.php';
?>
<?php if ($message): ?><p class="ok"><?= e($message) ?></p><?php endif; ?>
<div class="grid">
  <div class="card"><h3>Your role</h3><p><?= e($summary[$role] ?? 'Your workspace is ready.') ?></p></div>
  <div class="card soft"><h3>Workspace</h3><p>Use the tools below to work on real project activity.</p></div>
</div>

<?php if ($role === 'investor'): ?>
  <section class="card">
    <h3>Open projects</h3>
    <?php foreach ($projects as $project): ?>
      <?php if ($project['status'] === 'closed') continue; ?>
      <div class="card soft" style="margin-top: 16px;">
        <h4><?= e($project['title']) ?></h4>
        <p><?= e($project['description']) ?></p>
        <p><strong>Category:</strong> <?= e($project['category']) ?> | <strong>Target:</strong> GHS <?= number_format((float)$project['target_amount'], 2) ?> | <strong>Raised:</strong> GHS <?= number_format((float)$project['total_raised'], 2) ?></p>
        <form method="post" style="display:flex; gap:10px; align-items:flex-end;">
          <input type="hidden" name="project_id" value="<?= (int)$project['id'] ?>">
          <label style="margin:0; flex:1;">Amount
            <input type="number" name="amount" min="50" step="50" value="500" required>
          </label>
          <button class="pill" name="fund_project" value="1">Fund project</button>
        </form>
      </div>
    <?php endforeach; ?>
  </section>
<?php elseif ($role === 'customer'): ?>
  <section class="card">
    <h3>Request a job</h3>
    <form method="post">
      <label>Project
        <select name="project_id" required>
          <option value="">Choose a project</option>
          <?php foreach ($projects as $project): ?>
            <?php if ($project['status'] === 'approved' || $project['status'] === 'funded'): ?>
              <option value="<?= (int)$project['id'] ?>"><?= e($project['title']) ?></option>
            <?php endif; ?>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Job request description
        <textarea name="description" rows="4" required placeholder="Describe the processing work you need."></textarea>
      </label>
      <button class="pill" name="request_job" value="1">Submit request</button>
    </form>
  </section>

  <section class="card" style="margin-top: 24px;">
    <h3>Your job requests</h3>
    <?php if (count($jobs) === 0): ?>
      <p>No processing jobs yet.</p>
    <?php else: ?>
      <?php foreach ($jobs as $job): ?>
        <div class="card soft" style="margin-top: 12px;">
          <h4><?= e($job['project_title']) ?></h4>
          <p><?= e($job['description']) ?></p>
          <p><strong>Status:</strong> <?= e($job['status']) ?></p>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </section>
<?php elseif ($role === 'operator'): ?>
  <section class="card">
    <h3>Job queue</h3>
    <?php $openJobs = $pdo->query('SELECT j.*, p.title AS project_title, c.name AS customer_name FROM jobs j JOIN projects p ON p.id = j.project_id JOIN users c ON c.id = j.customer_id WHERE j.status IN ("requested", "assigned") ORDER BY j.created_at DESC')->fetchAll(); ?>
    <?php if (count($openJobs) === 0): ?>
      <p>No job requests yet.</p>
    <?php else: ?>
      <?php foreach ($openJobs as $job): ?>
        <div class="card soft" style="margin-top: 12px;">
          <h4><?= e($job['project_title']) ?></h4>
          <p><strong>Customer:</strong> <?= e($job['customer_name']) ?></p>
          <p><?= e($job['description']) ?></p>
          <p><strong>Status:</strong> <?= e($job['status']) ?></p>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </section>
<?php endif; ?>
<?php include 'footer.php'; ?>
