<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ProcessLink Ghana</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top">
  <a class="brand" href="index.php">ProcessLink <span>Ghana</span></a>
  <nav>
    <?php if (isset($_SESSION['user'])): ?>
      <span><?= e($_SESSION['user']['name']) ?> (<?= e($_SESSION['user']['role']) ?>)</span>
      <a href="<?= $_SESSION['user']['role'] === 'admin' ? 'admin.php' : 'portal.php' ?>">Home</a>
      <a class="btn" href="logout.php">Log out</a>
    <?php else: ?>
      <a href="login.php">Log in</a>
      <a class="btn" href="register.php">Sign up</a>
    <?php endif; ?>
  </nav>
</header>
<?php if (($mode ?? '') === 'auth'): ?>
  <div class="split">
    <aside class="panel"><h2><?= e($heading) ?></h2><p><?= e($sub) ?></p></aside>
    <main class="formside">
<?php elseif (($mode ?? '') === 'landing'): ?>
  <main>
<?php else: ?>
  <div class="pagehead"><div class="wrap"><h1><?= e($heading) ?></h1><p><?= e($sub) ?></p></div></div>
  <main class="wrap">
<?php endif; ?>
