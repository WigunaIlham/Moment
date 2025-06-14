<?php
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Ambil detail investasi spesifik
            $id = intval($_GET['id']);
            $sql = "SELECT * FROM investments WHERE id = $id AND user_id = $user_id";
            $result = $conn->query($sql);
            
            if ($result->num_rows > 0) {
                $investment = $result->fetch_assoc();
                
                // Ambil transaksi investasi
                $sql = "SELECT * FROM investment_transactions 
                        WHERE investment_id = $id 
                        ORDER BY transaction_date DESC";
                $result = $conn->query($sql);
                
                $transactions = [];
                if ($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        $transactions[] = $row;
                    }
                }
                
                $investment['transactions'] = $transactions;
                echo json_encode($investment);
            } else {
                echo json_encode(["success" => false, "message" => "Investasi tidak ditemukan"]);
            }
        } else {
            // Ambil semua investasi user
            $sql = "SELECT * FROM investments WHERE user_id = $user_id";
            $result = $conn->query($sql);
            
            $investments = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $investments[] = $row;
                }
            }
            
            echo json_encode($investments);
        }
        break;
        
    case 'POST':
        // Tambah investasi baru
        $data = json_decode(file_get_contents("php://input"), true);
        
        $name = $conn->real_escape_string($data['name']);
        $type = $conn->real_escape_string($data['type']);
        $amount = floatval($data['amount']);
        $period = intval($data['period']);
        $returnRate = floatval($data['return_rate']);
        $startDate = $conn->real_escape_string($data['start_date']);
        
        $sql = "INSERT INTO investments (user_id, name, type, amount, period, return_rate, start_date)
                VALUES ($user_id, '$name', '$type', $amount, $period, $returnRate, '$startDate')";
        
        if ($conn->query($sql)) {
            $investmentId = $conn->insert_id;
            
            // Tambahkan transaksi pembelian awal
            $sql = "INSERT INTO investment_transactions (investment_id, transaction_date, amount, type, description)
                    VALUES ($investmentId, '$startDate', $amount, 'buy', 'Pembelian awal')";
            $conn->query($sql);
            
            echo json_encode(["success" => true, "message" => "Investasi berhasil ditambahkan"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
        
    case 'PUT':
        // Update investasi
        $data = json_decode(file_get_contents("php://input"), true);
        $id = intval($data['id']);
        
        $sql = "UPDATE investments SET 
                name = '{$conn->real_escape_string($data['name'])}',
                type = '{$conn->real_escape_string($data['type'])}',
                amount = {$data['amount']},
                period = {$data['period']},
                return_rate = {$data['return_rate']}
                WHERE id = $id AND user_id = $user_id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Investasi berhasil diperbarui"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
        
    case 'DELETE':
        // Hapus investasi
        $id = intval($_GET['id']);
        
        // Hapus transaksi terkait terlebih dahulu
        $sql = "DELETE FROM investment_transactions WHERE investment_id = $id";
        $conn->query($sql);
        
        $sql = "DELETE FROM investments WHERE id = $id AND user_id = $user_id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Investasi berhasil dihapus"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
        break;
}

$conn->close();
?>