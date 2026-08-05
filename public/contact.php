<?php
/*
  ASAD Projects — contact form mail handler

  Sends enquiries to info@asad.co.za via AFRIHOST SMTP (mail.asad.co.za).

  Why SMTP and not PHP mail():
    The website is hosted on Hostinger, but the mailbox lives on Afrihost.
    Hostinger's local mail() treats asad.co.za as one of its own domains and
    delivers to a non-existent local mailbox, so the message is silently
    dropped and never reaches Afrihost. Authenticating directly against
    Afrihost's SMTP server bypasses that entirely and is properly
    SPF/DKIM-aligned.

  Credentials live in mail-config.php, which is generated at deploy time from
  GitHub Secrets and is NEVER committed to the repository.
*/

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

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

$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$phone   = trim($_POST['phone']   ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');

$errors = [];
if ($name === '')                               $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($message === '')                            $errors[] = 'message';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Invalid fields', 'fields' => $errors]);
    exit;
}

// Strip CR/LF from single-line fields (header-injection protection)
$oneLine = fn($v) => str_replace(["\r", "\n"], ' ', $v);
$name    = $oneLine($name);
$email   = $oneLine($email);
$phone   = $oneLine($phone);
$service = $oneLine($service);

// ---- Credentials -----------------------------------------------------------
$configFile = __DIR__ . '/mail-config.php';
if (!file_exists($configFile)) {
    error_log('ASAD contact form: mail-config.php missing');
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail not configured']);
    exit;
}
require $configFile;   // defines SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';
    $mail->Timeout    = 20;

    // 465 = implicit SSL, 587/25 = STARTTLS
    $mail->SMTPSecure = (SMTP_PORT == 465)
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;

    // Envelope sender must be the authenticated mailbox
    $mail->setFrom(SMTP_USER, 'ASAD Projects Website');
    $mail->addAddress(MAIL_TO);
    $mail->addReplyTo($email, $name);   // hit Reply -> goes to the customer

    $mail->Subject = 'New website enquiry — ' . $name;

    $body  = "You have a new enquiry from the ASAD Projects website:\n\n";
    $body .= "Name:    $name\n";
    $body .= "Email:   $email\n";
    $body .= "Phone:   " . ($phone   !== '' ? $phone   : '—') . "\n";
    $body .= "Service: " . ($service !== '' ? $service : '—') . "\n\n";
    $body .= "Message:\n$message\n";
    $mail->Body = $body;

    $mail->send();
    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    // Log the detail server-side; never leak SMTP internals to the browser
    error_log('ASAD contact form SMTP error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail failed']);
}
