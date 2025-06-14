<?php
include 'config.php';

$user_id = getUserId();
$month = isset($_GET['month']) ? intval($_GET['month']) : date('n');
$year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

// Data pengeluaran per kategori
$sql = "SELECT category, SUM(amount) as total 
        FROM transactions 
        WHERE user_id = $user_id 
        AND type = 'expense'
        AND MONTH(date) = $month 
        AND YEAR(date) = $year 
        GROUP BY category";
        
$result = $conn->query($sql);
$expenseData = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $expenseData[$row['category']] = floatval($row['total']);
    }
}

// Data pemasukan dan pengeluaran 6 bulan terakhir
$incomeExpenseData = [
    'labels' => [],
    'income' => [],
    'expense' => []
];

$months = [];
for ($i = 5; $i >= 0; $i--) {
    $date = date('Y-m', strtotime("-$i months"));
    $months[] = $date;
    $incomeExpenseData['labels'][] = date('M', strtotime($date));
}

foreach ($months as $monthStr) {
    list($year, $month) = explode('-', $monthStr);
    
    // Pemasukan
    $sql = "SELECT SUM(amount) as total 
            FROM transactions 
            WHERE user_id = $user_id 
            AND type = 'income'
            AND MONTH(date) = $month 
            AND YEAR(date) = $year";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $incomeExpenseData['income'][] = $row['total'] ? floatval($row['total']) : 0;
    
    // Pengeluaran
    $sql = "SELECT SUM(amount) as total 
            FROM transactions 
            WHERE user_id = $user_id 
            AND type = 'expense'
            AND MONTH(date) = $month 
            AND YEAR(date) = $year";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $incomeExpenseData['expense'][] = $row['total'] ? floatval($row['total']) : 0;
}

// Saldo bulan ini
$sql = "SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM transactions 
         WHERE user_id = $user_id AND type = 'income' 
         AND MONTH(date) = $month AND YEAR(date) = $year) as income,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions 
         WHERE user_id = $user_id AND type = 'expense' 
         AND MONTH(date) = $month AND YEAR(date) = $year) as expense";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$balance = $row['income'] - $row['expense'];

// Total tabungan
$sql = "SELECT SUM(target_amount) as target, SUM(current_amount) as current 
        FROM savings 
        WHERE user_id = $user_id";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$savings = [
    'target' => $row['target'] ? floatval($row['target']) : 0,
    'current' => $row['current'] ? floatval($row['current']) : 0
];

$response = [
    'balance' => $balance,
    'expenseData' => $expenseData,
    'incomeExpenseData' => $incomeExpenseData,
    'savings' => $savings
];

echo json_encode($response);

$conn->close();
?>