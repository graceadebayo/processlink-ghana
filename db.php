<?php
session_start();

$pdo = new PDO('mysql:host=localhost;dbname=processlink;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

function e($text) {
    return htmlspecialchars($text ?? '');
}

function need_login() {
    if (!isset($_SESSION['user'])) {
        header('Location: login.php');
        exit;
    }
}

function need_admin() {
    need_login();
    if ($_SESSION['user']['role'] !== 'admin') {
        http_response_code(403);
        die('Access denied. Admin only.');
    }
}
