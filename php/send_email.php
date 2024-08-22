<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Mpdf\Mpdf;

require '../vendor/autoload.php';

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $assignments = json_decode($_POST['assignments'], true);

    // Transformar los datos al formato esperado
    $transformedAssignments = [];
    foreach ($assignments as $name => $data) {
        $transformedAssignments[] = [
            'name' => trim($name),
            'email' => trim(strstr($data['email'], ')', true)),
            'tasks' => $data['tasks']
        ];
    }

    // Crear la tabla HTML con todos los participantes y sus tareas
    $tableRows = '';
    foreach ($transformedAssignments as $data) {
        $participant = $data['name'];
        $email = $data['email'];

        if (!isValidEmail($email)) {
            echo "Dirección de correo inválida: $email<br>";
            continue;
        }

        $tasksHtml = '';
        foreach ($data['tasks'] as $task) {
            $tasksHtml .= "<div><input type='checkbox' disabled> {$task}</div>";
        }

        $tableRows .= "
            <tr>
                <td>{$participant}</td>
                <td>{$tasksHtml}</td>
            </tr>
        ";
    }

    $htmlTable = "
        <table border='1' cellpadding='10' cellspacing='0' style='border-collapse: collapse; width: 100%;'>
            <thead>
                <tr>
                    <th style='background-color: #007bff; color: white;'>Participante</th>
                    <th style='background-color: #007bff; color: white;'>Tareas</th>
                </tr>
            </thead>
            <tbody>
                {$tableRows}
            </tbody>
        </table>
    ";

    // Generar el PDF
    $mpdf = new Mpdf();
    $mpdf->WriteHTML("
        <h1>Asignación de Tareas</h1>
        <p>A continuación se muestra la asignación de tareas para todos los participantes:</p>
        {$htmlTable}
    ");
    $pdfContent = $mpdf->Output('', 'S'); // Guardar el PDF en una variable

    // Enviar el correo a cada participante
    foreach ($transformedAssignments as $data) {
        $participant = $data['name'];
        $email = $data['email'];

        if (!isValidEmail($email)) {
            echo "Dirección de correo inválida: $email<br>";
            continue;
        }

        $mail = new PHPMailer(true);

        try {
            // Configuración del servidor SMTP
            $mail->isSMTP();
            $mail->Host = 'tareas.nredes.dev';
            $mail->SMTPAuth = true;
            $mail->Username = 'info@tareas.nredes.dev';
            $mail->Password = 'E=2q@cmnB*%=4wdEvw;#';
            $mail->SMTPSecure = 'ssl';
            $mail->Port = 465;

            // Configurar la codificación a UTF-8
            $mail->CharSet = 'UTF-8';

            // Habilitar el registro de depuración
            // $mail->SMTPDebug = 2; // 0 = off (producción), 1 = mensajes del cliente, 2 = mensajes del cliente y servidor
            // $mail->Debugoutput = 'html'; // Mostrar el resultado en formato HTML

            // Remitente y destinatario
            $mail->setFrom('info@tareas.nredes.dev', 'Asignación de Tareas');
            $mail->addAddress($email, $participant);

            // Contenido del correo
            $mail->isHTML(true);
            $mail->Subject = 'Asignación de Tareas';
            $mail->Body    = "
                <h1>Asignación de Tareas</h1>
                <p>Estimado " . htmlspecialchars($participant) . ", se le ha asignado las siguientes tareas. Por favor, consulte el archivo adjunto para más detalles.</p>
            ";

            // Adjuntar el PDF
            $mail->addStringAttachment($pdfContent, 'Asignacion_de_Tareas.pdf');

            $mail->send();
            echo "Correo enviado a $email<br>";
        } catch (Exception $e) {
            echo "Error al enviar el correo a $email: {$mail->ErrorInfo}<br>";
        }
    }
}
?>