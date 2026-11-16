<?php
require 'db.php';
$mode = 'landing';
include 'header.php';
?>
<section class="hero">
  <h1>Fund the machine.<br>Process the harvest.</h1>
  <p>ProcessLink Ghana connects people who fund agricultural processing equipment, operators who run it, and customers who need produce processed.</p>
  <a class="pill outline" href="register.php">Get started</a>
  <a class="pill ghost" href="login.php">Log in</a>
</section>
<section class="wrap">
  <h2 class="center">Four roles, one platform</h2>
  <div class="grid">
    <div class="card"><h3>Investor</h3><p>Funds a machine toward a target, alone or as a group.</p></div>
    <div class="card"><h3>Operator</h3><p>Runs the machine, completes jobs and records expenses.</p></div>
    <div class="card"><h3>Customer</h3><p>Requests processing and pays for the job.</p></div>
    <div class="card"><h3>Admin</h3><p>Approves users and projects and oversees the system.</p></div>
  </div>
</section>
<?php include 'footer.php'; ?>
