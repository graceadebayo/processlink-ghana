<?php
require 'db.php';
need_login();

$about = [
    'investor' => 'You will fund equipment projects here, alone or as a group.',
    'operator' => 'You will run machines, accept jobs and record expenses here.',
    'customer' => 'You will request processing and pay for jobs here.',
];
$role = $_SESSION['user']['role'];
$heading = 'Hello, ' . $_SESSION['user']['name'];
$sub = 'Logged in as ' . $role;
include 'header.php';
?>
<div class="grid">
  <div class="card"><h3>Your role</h3><p><?= e($about[$role] ?? '') ?></p></div>
  <div class="card soft"><h3>Coming next</h3><p>Projects, funding, jobs and payments.</p></div>
</div>
<?php include 'footer.php'; ?>
