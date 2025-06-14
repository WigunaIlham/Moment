// Load dashboard section
function loadDashboard() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
        <div id="dashboard">
            <div class="filter-section">
                <select id="filter-month">
                    <option value="1">Januari</option>
                    <option value="2">Februari</option>
                    <option value="3">Maret</option>
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option>
                    <option value="7">Juli</option>
                    <option value="8">Agustus</option>
                    <option value="9">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                </select>
                <select id="filter-year">
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                </select>
                <button id="apply-filters">Terapkan</button>
            </div>
            
            <div class="dashboard-grid">
                <div class="card balance-card">
                    <div class="card-header">
                        <div class="card-title">Saldo Bulan Ini</div>
                    </div>
                    <div class="balance-amount">Rp <span id="current-balance">0</span></div>
                    <div style="text-align: center; opacity: 0.8;" id="balance-comparison"></div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Target Tabungan</div>
                    </div>
                    <div class="savings-progress">
                        <div class="progress-bar">
                            <div class="progress" id="savings-progress"></div>
                        </div>
                        <div class="savings-info">
                            <span id="savings-current">Rp 0</span> 
                            <span>dari</span> 
                            <span id="savings-target">Rp 0</span>
                        </div>
                    </div>
                    <div class="quick-actions">
                        <div class="action-btn" data-section="transaksi">
                            <i>➕</i>
                            <div>Tambah Transaksi</div>
                        </div>
                        <div class="action-btn" data-section="tabungan">
                            <i>🎯</i>
                            <div>Atur Tabungan</div>
                        </div>
                        <div class="action-btn" data-section="investasi">
                            <i>📈</i>
                            <div>Simulasi Investasi</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Pengeluaran Berdasarkan Kategori</div>
                    </div>
                    <div class="chart-container">
                        <canvas id="expenseChart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Pemasukan vs Pengeluaran</div>
                    </div>
                    <div class="chart-container">
                        <canvas id="incomeExpenseChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Ambil data dashboard dari API
  fetchDashboardData();

  // Event listeners
  document
    .getElementById("apply-filters")
    .addEventListener("click", function () {
      const month = document.getElementById("filter-month").value;
      const year = document.getElementById("filter-year").value;
      fetchDashboardData(month, year);
    });

  // Quick action buttons
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const section = this.getAttribute("data-section");
      if (section) {
        loadSection(section);
      }
    });
  });
}

// Ambil data dashboard dari API
async function fetchDashboardData(month = 6, year = 2024) {
  try {
    const data = await fetchAPI(`dashboard.php?month=${month}&year=${year}`);

    if (data) {
      // Update saldo
      document.getElementById("current-balance").textContent =
        data.balance.toLocaleString("id-ID");

      // Update progress tabungan
      const savingsTarget = data.savings.target;
      const savingsCurrent = data.savings.current;
      const savingsPercent =
        savingsTarget > 0
          ? Math.min(100, (savingsCurrent / savingsTarget) * 100)
          : 0;

      document.getElementById(
        "savings-progress"
      ).style.width = `${savingsPercent}%`;
      document.getElementById(
        "savings-current"
      ).textContent = `Rp ${savingsCurrent.toLocaleString("id-ID")}`;
      document.getElementById(
        "savings-target"
      ).textContent = `Rp ${savingsTarget.toLocaleString("id-ID")}`;

      // Update chart pengeluaran
      initExpenseChart(data.expenseData);

      // Update chart pemasukan vs pengeluaran
      initIncomeExpenseChart(data.incomeExpenseData);
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    showNotification("Gagal memuat data dashboard", "error");
  }
}
