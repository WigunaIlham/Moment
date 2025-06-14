// Chart instances
let expenseChart, incomeExpenseChart, investmentChart;

// Inisialisasi grafik pengeluaran berdasarkan kategori
function initExpenseChart(data) {
  // Pastikan elemen canvas ada
  const canvas = document.getElementById("expenseChart");
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  // Hancurkan chart sebelumnya jika ada
  if (expenseChart) {
    expenseChart.destroy();
  }

  const ctx = canvas.getContext("2d");

  // Format data untuk chart
  const labels = Object.keys(data).map(
    (key) => key.charAt(0).toUpperCase() + key.slice(1)
  );
  const values = Object.values(data);

  // Jika semua nilai 0, tambahkan pesan
  if (values.every((v) => v === 0)) {
    canvas.style.display = "none";
    const noDataMsg = document.createElement("div");
    noDataMsg.textContent = "Tidak ada data pengeluaran bulan ini";
    noDataMsg.style.textAlign = "center";
    noDataMsg.style.padding = "20px";
    canvas.parentNode.appendChild(noDataMsg);
    return;
  } else {
    canvas.style.display = "block";
    // Hapus pesan tidak ada data jika ada
    const existingMsg = canvas.parentNode.querySelector("div");
    if (existingMsg) existingMsg.remove();
  }

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#8AC24A",
            "#FF5722",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            boxWidth: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: Rp${value.toLocaleString(
                "id-ID"
              )} (${percentage}%)`;
            },
          },
        },
      },
      // Animasi dan rotation
      animation: {
        animateScale: true,
        animateRotate: true,
      },
      // Potong bagian yang 0%
      cutout: "65%",
    },
  });
}

// Inisialisasi grafik pemasukan vs pengeluaran
function initIncomeExpenseChart(data) {
  const ctx = document.getElementById("incomeExpenseChart").getContext("2d");
  incomeExpenseChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Pemasukan",
          data: data.income,
          backgroundColor: "#4BC0C0",
          barPercentage: 0.5, // Lebar bar lebih kecil agar muat 12 bulan
        },
        {
          label: "Pengeluaran",
          data: data.expense,
          backgroundColor: "#FF6384",
          barPercentage: 0.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false, // Hilangkan grid vertikal
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              if (value >= 1000000000) {
                return "Rp" + (value / 1000000000).toFixed(1) + "M";
              } else if (value >= 1000000) {
                return "Rp" + (value / 1000000).toFixed(1) + "jt";
              }
              return "Rp" + value;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: Rp${context.raw.toLocaleString(
                "id-ID"
              )}`;
            },
          },
        },
        legend: {
          position: "top", // Pindah legend ke atas
        },
      },
    },
  });
}

// Inisialisasi grafik investasi
function initInvestmentChart(data) {
  const ctx = document.getElementById("investmentChart").getContext("2d");

  // Hapus chart lama jika ada
  if (investmentChart) {
    investmentChart.destroy();
  }

  investmentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((r) => `Tahun ${r.year}`),
      datasets: [
        {
          label: "Nilai Investasi",
          data: data.map((r) => r.value),
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: function (value) {
              if (value >= 1000000000) {
                return "Rp" + (value / 1000000000).toFixed(1) + "M";
              } else if (value >= 1000000) {
                return "Rp" + (value / 1000000).toFixed(1) + "jt";
              }
              return "Rp" + value;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Rp${context.raw.toLocaleString("id-ID")}`;
            },
          },
        },
      },
    },
  });
}

// Update charts based on filters
function updateCharts(month, year) {
  // Simulasi pembaruan data berdasarkan filter
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const filteredLabels = [];
  const filteredIncome = [];
  const filteredExpense = [];

  // Buat data acak untuk simulasi
  for (let i = 0; i < 6; i++) {
    filteredLabels.push(monthNames[Math.floor(Math.random() * 6)]);
    filteredIncome.push(Math.floor(Math.random() * 5000000) + 10000000);
    filteredExpense.push(Math.floor(Math.random() * 3000000) + 5000000);
  }

  // Perbarui grafik
  incomeExpenseChart.data.labels = filteredLabels;
  incomeExpenseChart.data.datasets[0].data = filteredIncome;
  incomeExpenseChart.data.datasets[1].data = filteredExpense;
  incomeExpenseChart.update();

  // Perbarui saldo
  const newBalance = Math.floor(Math.random() * 10000000) + 10000000;
  document.getElementById("current-balance").textContent =
    newBalance.toLocaleString("id-ID");
}
