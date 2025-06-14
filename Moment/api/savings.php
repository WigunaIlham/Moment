<?php
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId();

switch ($method) {
    case 'GET':
        // Ambil semua tabungan user
        $sql = "SELECT * FROM savings WHERE user_id = $user_id";
        $result = $conn->query($sql);
        
        $savings = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $savings[] = $row;
            }
        }
        
        echo json_encode($savings);
        break;
        
    case 'POST':
        // Tambah tabungan baru
        $data = json_decode(file_get_contents("php://input"), true);
        
        $name = $conn->real_escape_string($data['name']);
        $target_amount = floatval($data['target_amount']);
        $current_amount = floatval($data['current_amount']);
        $deadline = $conn->real_escape_string($data['deadline']);
        
        $sql = "INSERT INTO savings (user_id, name, target_amount, current_amount, deadline)
                VALUES ($user_id, '$name', $target_amount, $current_amount, '$deadline')";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Tabungan berhasil ditambahkan"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
        
    case 'PUT':
        // Update tabungan
        $data = json_decode(file_get_contents("php://input"), true);
        $id = intval($data['id']);
        $current_amount = floatval($data['current_amount']);
        
        $sql = "UPDATE savings SET current_amount = $current_amount 
                WHERE id = $id AND user_id = $user_id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Tabungan berhasil diupdate"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
        
    case 'DELETE':
        // Hapus tabungan
        $id = intval($_GET['id']);
        $sql = "DELETE FROM savings WHERE id = $id AND user_id = $user_id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Tabungan berhasil dihapus"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
}

$conn->close();
?>