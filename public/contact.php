<?php
/*
  ASAD Projects — contact form mail handler
  Sends enquiries to info@asad.co.za via Hostinger's mail server.
  Posted to by contact.html (fetch/AJAX). Returns JSON.
*/

header('Content-Type: application/json; charset=utf-8');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot — bots fill hidden fields; humans never see it. Silently "succeed".
if (!empty($_POST['company'])) {
    echo json_encode(['ok' => true]);
    exit;
}

// Collect + trim
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$phone   = trim($_POST['phone']   ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');

// Validate required fields
$errors = [];
if ($name === '')                                     $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))       $errors[] = 'email';
if ($message === '')                                  $errors[] = 'message';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Invalid fields', 'fields' => $errors]);
    exit;
}

// Strip CR/LF from single-line fields to prevent header injection
$oneLine = function ($v) { return str_replace(["\r", "\n"], ' ', $v); };
$name    = $oneLine($name);
$email   = $oneLine($email);
$phone   = $oneLine($phone);
$service = $oneLine($service);

$to      = 'info@asad.co.za';
$subject = 'New website enquiry — ' . $name;

$body  = "You have a new enquiry from the ASAD Projects website:\n\n";
$body .= "Name:    $name\n";
$body .= "Email:   $email\n";
$body .= "Phone:   " . ($phone   !== '' ? $phone   : '—') . "\n";
$body .= "Service: " . ($service !== '' ? $service : '—') . "\n\n";
$body .= "Message:\n$message\n";

// From MUST be a mailbox on this domain or Hostinger will reject / spam-file it.
$headers  = "From: ASAD Projects <info@asad.co.za>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail failed']);
}
