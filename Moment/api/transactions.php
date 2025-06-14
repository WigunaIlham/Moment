<?php
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId();

switch ($method) {
    case 'GET':
        // Ambil transaksi berdasarkan bulan dan tahun
        $month = isset($_GET['month']) ? intval($_GET['month']) : date('n');
        $year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
        
        $sql = "SELECT * FROM transactions 
                WHERE user_id = $user_id 
                AND MONTH(date) = $month 
                AND YEAR(date) = $year 
                ORDER BY date DESC";
        
        $result = $conn->query($sql);
        
        $transactions = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $transactions[] = $row;
            }
        }
        
        echo json_encode($transactions);
        break;
        
    case 'POST':
        // Tambah transaksi baru
        $data = json_decode(file_get_contents("php://input"), true);
        
        $type = $conn->real_escape_string($data['type']);
        $amount = floatval($data['amount']);
        $category = $conn->real_escape_string($data['category']);
        $date = $conn->real_escape_string($data['date']);
        $description = $conn->real_escape_string($data['description']);
        
        $sql = "INSERT INTO transactions (user_id, type, amount, category, date, description)
                VALUES ($user_id, '$type', $amount, '$category', '$date', '$description')";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Transaksi berhasil ditambahkan"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
        
    case 'DELETE':
        // Hapus transaksi
        $id = intval($_GET['id']);
        $sql = "DELETE FROM transactions WHERE id = $id AND user_id = $user_id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Transaksi berhasil dihapus"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
}

$conn->close();
?>