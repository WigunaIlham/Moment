<?php
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId();

switch ($method) {
    case 'POST':
        // Tambah transaksi investasi
        $data = json_decode(file_get_contents("php://input"), true);
        $investmentId = intval($data['investment_id']);
        
        // Verifikasi kepemilikan investasi
        $sql = "SELECT id FROM investments WHERE id = $investmentId AND user_id = $user_id";
        $result = $conn->query($sql);
        
        if ($result->num_rows === 0) {
            echo json_encode(["success" => false, "message" => "Akses ditolak"]);
            exit;
        }
        
        $date = $conn->real_escape_string($data['date']);
        $amount = floatval($data['amount']);
        $type = $conn->real_escape_string($data['type']);
        $description = $conn->real_escape_string($data['description']);
        
        $sql = "INSERT INTO investment_transactions (investment_id, transaction_date, amount, type, description)
                VALUES ($investmentId, '$date', $amount, '$type', '$description')";
        
        if ($conn->query($sql)) {
            // Update jumlah investasi jika pembelian/penjualan
            if ($type === 'buy') {
                $sql = "UPDATE investments SET amount = amount + $amount WHERE id = $investmentId";
            } elseif ($type === 'sell') {
                $sql = "UPDATE investments SET amount = amount - $amount WHERE id = $investmentId";
            }
            
            if (isset($sql)) $conn->query($sql);
            
            echo json_encode(["success" => true, "message" => "Transaksi berhasil ditambahkan"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
        
    case 'DELETE':
        // Hapus transaksi investasi
        $id = intval($_GET['id']);
        
        // Dapatkan detail transaksi
        $sql = "SELECT * FROM investment_transactions WHERE id = $id";
        $result = $conn->query($sql);
        
        if ($result->num_rows > 0) {
            $transaction = $result->fetch_assoc();
            $investmentId = $transaction['investment_id'];
            
            // Verifikasi kepemilikan
            $sql = "SELECT id FROM investments WHERE id = $investmentId AND user_id = $user_id";
            $result = $conn->query($sql);
            
            if ($result->num_rows === 0) {
                echo json_encode(["success" => false, "message" => "Akses ditolak"]);
                exit;
            }
            
            // Hapus transaksi
            $sql = "DELETE FROM investment_transactions WHERE id = $id";
            if ($conn->query($sql)) {
                // Update jumlah investasi jika pembelian/penjualan
                if ($transaction['type'] === 'buy') {
                    $sql = "UPDATE investments SET amount = amount - {$transaction['amount']} WHERE id = $investmentId";
                } elseif ($transaction['type'] === 'sell') {
                    $sql = "UPDATE investments SET amount = amount + {$transaction['amount']} WHERE id = $investmentId";
                }
                
                if (isset($sql)) $conn->query($sql);
                
                echo json_encode(["success" => true, "message" => "Transaksi berhasil dihapus"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Transaksi tidak ditemukan"]);
        }
        break;
}

$conn->close();
?>