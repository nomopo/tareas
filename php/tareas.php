<?php
// Incluir el archivo de configuración
include 'conf.php';

// Preparar la consulta SQL
$statement = $pdo->prepare('SELECT * FROM tareas WHERE eliminada = 0 ORDER BY id_tarea DESC');

// Ejecutar la consulta
$statement->execute();

// Obtener los resultados
$resultados = $statement->fetchAll(PDO::FETCH_ASSOC);

// Convertir los resultados a formato JSON
echo json_encode($resultados);
?>