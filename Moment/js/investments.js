// Load investments section
function loadInvestments() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
        <div id="investasi">
            <div class="tabs">
                <button class="tab-btn active" data-tab="list">Daftar Investasi</button>
                <button class="tab-btn" data-tab="simulation">Simulasi Baru</button>
                <button class="tab-btn" data-tab="performance">Kinerja</button>
            </div>
            
            <div class="tab-content active" id="list-tab">
                <div class="investments-container" style="margin-top: 20px;"></div>
            </div>
            
            <div class="tab-content" id="simulation-tab">
                <div class="form-container">
                    <h3>Simulasi Investasi Baru</h3>
                    <form id="investmentForm">
                        <div class="form-group">
                            <label for="investmentName">Nama Investasi</label>
                            <input type="text" id="investmentName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="investmentType">Jenis Investasi</label>
                            <select id="investmentType" required>
                                <option value="">Pilih Jenis</option>
                                <option value="saham">Saham</option>
                                <option value="reksadana">Reksadana</option>
                                <option value="obligasi">Obligasi</option>
                                <option value="emas">Emas</option>
                                <option value="crypto">Crypto</option>
                                <option value="properti">Properti</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="investmentAmount">Jumlah Investasi (Rp)</label>
                            <input type="number" id="investmentAmount" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="investmentPeriod">Periode (tahun)</label>
                            <input type="number" id="investmentPeriod" min="1" max="30" value="5" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="investmentReturn">Perkiraan Return Tahunan (%)</label>
                            <input type="number" id="investmentReturn" step="0.1" value="7" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="investmentDate">Tanggal Mulai</label>
                            <input type="date" id="investmentDate" required>
                        </div>
                        
                        <button type="submit" class="btn">Simpan Investasi</button>
                    </form>
                    
                    <div id="investmentResult" class="hidden" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <h3>Hasil Simulasi</h3>
                        <div id="resultDetails" style="margin-top: 15px;"></div>
                        <div class="chart-container" style="height: 200px;">
                            <canvas id="investmentChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="performance-tab">
                <div class="form-container">
                    <h3>Kinerja Investasi</h3>
                    <div class="performance-chart">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>
            </div>
            
            <button type="button" class="btn btn-secondary" style="margin-top: 10px;" data-section="dashboard">Kembali ke Dashboard</button>
        </div>
    `;

  // Set current date
  setCurrentDate();

  // Setup tab navigation
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tab = this.getAttribute("data-tab");

      // Update active tab button
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Show active tab content
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      document.getElementById(`${tab}-tab`).classList.add("active");
    });
  });

  // Form submit
  document
    .getElementById("investmentForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      await simulateInvestment(true);
    });

  // Back button
  document
    .querySelector(".btn-secondary")
    .addEventListener("click", function () {
      const section = this.getAttribute("data-section");
      if (section) {
        loadSection(section);
      }
    });

  // Load investments list
  loadInvestmentsList();
}

// Simulate investment
async function simulateInvestment(save = false) {
  const name = document.getElementById("investmentName").value;
  const type = document.getElementById("investmentType").value;
  const amount = document.getElementById("investmentAmount").value;
  const period = document.getElementById("investmentPeriod").value;
  const returnRate = document.getElementById("investmentReturn").value;
  const startDate = document.getElementById("investmentDate").value;

  if (!name || !type || !amount || !period || !returnRate || !startDate) {
    showNotification("Harap isi semua kolom yang wajib diisi", "error");
    return;
  }

  // Hitung hasil investasi
  let results = [];
  let currentAmount = parseFloat(amount);
  const returnRateDecimal = parseFloat(returnRate) / 100;

  for (let i = 1; i <= period; i++) {
    currentAmount = currentAmount * (1 + returnRateDecimal);
    results.push({
      year: i,
      value: Math.round(currentAmount),
    });
  }

  // Tampilkan hasil
  const resultDiv = document.getElementById("resultDetails");
  resultDiv.innerHTML = `
        <p><strong>Nama Investasi:</strong> ${name}</p>
        <p><strong>Jenis Investasi:</strong> ${type}</p>
        <p><strong>Jumlah Awal:</strong> Rp${parseFloat(amount).toLocaleString(
          "id-ID"
        )}</p>
        <p><strong>Periode:</strong> ${period} tahun</p>
        <p><strong>Return Tahunan:</strong> ${returnRate}%</p>
        <p><strong>Nilai Akhir:</strong> Rp${Math.round(
          currentAmount
        ).toLocaleString("id-ID")}</p>
    `;

  // Tampilkan grafik
  initInvestmentChart(results);

  // Tampilkan hasil
  document.getElementById("investmentResult").classList.remove("hidden");

  // Jika save true, simpan ke database
  if (save) {
    const response = await fetchAPI("investments.php", "POST", {
      name,
      type,
      amount: parseFloat(amount),
      period: parseInt(period),
      return_rate: parseFloat(returnRate),
      start_date: startDate,
    });

    if (response && response.success) {
      showNotification("Investasi berhasil disimpan!");
      document.getElementById("investmentForm").reset();
      document.getElementById("investmentResult").classList.add("hidden");
      loadInvestmentsList();
    } else {
      showNotification("Gagal menyimpan investasi", "error");
    }
  }
}

// Load investments list from API
async function loadInvestmentsList() {
  const container = document.querySelector(".investments-container");
  if (!container) return;

  container.innerHTML = "<p>Memuat investasi...</p>";

  try {
    const investments = await fetchAPI("investments.php");

    if (investments && investments.length > 0) {
      container.innerHTML = `
                <div class="investments-grid">
                    ${investments
                      .map(
                        (investment) => `
                        <div class="investment-card" data-id="${investment.id}">
                            <div class="investment-header">
                                <h4>${investment.name}</h4>
                                <span class="investment-type">${
                                  investment.type
                                }</span>
                            </div>
                            <div class="investment-body">
                                <div class="investment-info">
                                    <div>
                                        <label>Nilai Awal</label>
                                        <p>Rp ${parseFloat(
                                          investment.amount
                                        ).toLocaleString("id-ID")}</p>
                                    </div>
                                    <div>
                                        <label>Periode</label>
                                        <p>${investment.period} tahun</p>
                                    </div>
                                    <div>
                                        <label>Return</label>
                                        <p>${investment.return_rate}%</p>
                                    </div>
                                    <div>
                                        <label>Mulai</label>
                                        <p>${new Date(
                                          investment.start_date
                                        ).toLocaleDateString("id-ID")}</p>
                                    </div>
                                </div>
                                <div class="investment-actions">
                                    <button class="btn-view" data-id="${
                                      investment.id
                                    }">Lihat Detail</button>
                                    <button class="btn-delete" data-id="${
                                      investment.id
                                    }">Hapus</button>
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;

      // Add event listeners for view buttons
      document.querySelectorAll(".btn-view").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          viewInvestmentDetails(id);
        });
      });

      // Add event listeners for delete buttons
      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          deleteInvestment(id);
        });
      });
    } else {
      container.innerHTML = "<p>Belum ada investasi</p>";
    }
  } catch (error) {
    console.error("Error loading investments:", error);
    container.innerHTML = "<p>Gagal memuat investasi</p>";
  }
}

// View investment details
async function viewInvestmentDetails(id) {
  try {
    const investment = await fetchAPI(`investments.php?id=${id}`);

    if (investment) {
      // Hitung nilai proyeksi
      let projection = [];
      let currentAmount = parseFloat(investment.amount);
      const returnRate = parseFloat(investment.return_rate) / 100;

      for (let i = 1; i <= investment.period; i++) {
        currentAmount = currentAmount * (1 + returnRate);
        projection.push({
          year: i,
          value: Math.round(currentAmount),
        });
      }

      // Tampilkan modal detail
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h2>${investment.name}</h2>
                    
                    <div class="investment-details">
                        <div class="detail-item">
                            <label>Jenis</label>
                            <p>${investment.type}</p>
                        </div>
                        <div class="detail-item">
                            <label>Nilai Saat Ini</label>
                            <p>Rp ${parseFloat(
                              investment.amount
                            ).toLocaleString("id-ID")}</p>
                        </div>
                        <div class="detail-item">
                            <label>Periode</label>
                            <p>${investment.period} tahun</p>
                        </div>
                        <div class="detail-item">
                            <label>Return Tahunan</label>
                            <p>${investment.return_rate}%</p>
                        </div>
                        <div class="detail-item">
                            <label>Tanggal Mulai</label>
                            <p>${new Date(
                              investment.start_date
                            ).toLocaleDateString("id-ID")}</p>
                        </div>
                    </div>
                    
                    <div class="tabs">
                        <button class="tab-btn active" data-tab="projection">Proyeksi</button>
                        <button class="tab-btn" data-tab="transactions">Transaksi</button>
                        <button class="tab-btn" data-tab="add-transaction">Tambah Transaksi</button>
                    </div>
                    
                    <div class="tab-content active" id="projection-tab">
                        <div class="chart-container" style="height: 300px;">
                            <canvas id="investmentProjectionChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="transactions-tab">
                        <h3>Riwayat Transaksi</h3>
                        <table class="transaction-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Tipe</th>
                                    <th>Jumlah</th>
                                    <th>Deskripsi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="transaction-list">
                                <!-- Transactions will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="tab-content" id="add-transaction-tab">
                        <h3>Tambah Transaksi</h3>
                        <form id="addTransactionForm">
                            <input type="hidden" name="investment_id" value="${
                              investment.id
                            }">
                            
                            <div class="form-group">
                                <label for="transactionDate">Tanggal</label>
                                <input type="date" name="date" id="transactionDate" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="transactionType">Tipe Transaksi</label>
                                <select name="type" id="transactionType" required>
                                    <option value="buy">Beli</option>
                                    <option value="sell">Jual</option>
                                    <option value="dividend">Dividen/Bunga</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="transactionAmount">Jumlah (Rp)</label>
                                <input type="number" name="amount" id="transactionAmount" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="transactionDesc">Deskripsi</label>
                                <textarea name="description" id="transactionDesc"></textarea>
                            </div>
                            
                            <button type="submit" class="btn">Simpan Transaksi</button>
                        </form>
                    </div>
                </div>
            `;

      document.body.appendChild(modal);

      // Initialize projection chart
      const ctx = document
        .getElementById("investmentProjectionChart")
        .getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: projection.map((p) => `Tahun ${p.year}`),
          datasets: [
            {
              label: "Nilai Proyeksi",
              data: projection.map((p) => p.value),
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
                  return "Rp" + (value / 1000000).toFixed(1) + "jt";
                },
              },
            },
          },
        },
      });

      // Load transactions
      loadInvestmentTransactions(investment.id);

      // Setup tab navigation in modal
      modal.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const tab = this.getAttribute("data-tab");

          // Update active tab button
          modal
            .querySelectorAll(".tab-btn")
            .forEach((b) => b.classList.remove("active"));
          this.classList.add("active");

          // Show active tab content
          modal
            .querySelectorAll(".tab-content")
            .forEach((c) => c.classList.remove("active"));
          modal.querySelector(`#${tab}-tab`).classList.add("active");
        });
      });

      // Form submit for adding transaction
      modal
        .querySelector("#addTransactionForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          const formData = new FormData(this);
          const data = Object.fromEntries(formData.entries());

          const response = await fetchAPI(
            "investment_transactions.php",
            "POST",
            {
              investment_id: data.investment_id,
              date: data.date,
              type: data.type,
              amount: parseFloat(data.amount),
              description: data.description,
            }
          );

          if (response && response.success) {
            showNotification("Transaksi berhasil ditambahkan!");
            loadInvestmentTransactions(investment.id);
            this.reset();

            // Refresh investments list
            loadInvestmentsList();
          } else {
            showNotification("Gagal menambahkan transaksi", "error");
          }
        });

      // Close modal
      modal.querySelector(".close-btn").addEventListener("click", function () {
        modal.remove();
      });
    }
  } catch (error) {
    console.error("Error loading investment details:", error);
    showNotification("Gagal memuat detail investasi", "error");
  }
}

// Load investment transactions
async function loadInvestmentTransactions(investmentId) {
  const container = document.getElementById("transaction-list");
  if (!container) return;

  container.innerHTML = '<tr><td colspan="5">Memuat transaksi...</td></tr>';

  try {
    const investment = await fetchAPI(`investments.php?id=${investmentId}`);

    if (investment && investment.transactions) {
      container.innerHTML = investment.transactions
        .map(
          (transaction) => `
                <tr>
                    <td>${new Date(
                      transaction.transaction_date
                    ).toLocaleDateString("id-ID")}</td>
                    <td>${getTransactionTypeLabel(transaction.type)}</td>
                    <td>Rp ${parseFloat(transaction.amount).toLocaleString(
                      "id-ID"
                    )}</td>
                    <td>${transaction.description || "-"}</td>
                    <td>
                        <button class="btn-delete-transaction" data-id="${
                          transaction.id
                        }">Hapus</button>
                    </td>
                </tr>
            `
        )
        .join("");

      // Add event listeners for delete buttons
      document.querySelectorAll(".btn-delete-transaction").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          deleteInvestmentTransaction(id, investmentId);
        });
      });
    } else {
      container.innerHTML = '<tr><td colspan="5">Belum ada transaksi</td></tr>';
    }
  } catch (error) {
    console.error("Error loading transactions:", error);
    container.innerHTML =
      '<tr><td colspan="5">Gagal memuat transaksi</td></tr>';
  }
}

// Get transaction type label
function getTransactionTypeLabel(type) {
  const labels = {
    buy: "Beli",
    sell: "Jual",
    dividend: "Dividen/Bunga",
  };
  return labels[type] || type;
}

// Delete investment transaction
async function deleteInvestmentTransaction(transactionId, investmentId) {
  if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

  const response = await fetchAPI(
    `investment_transactions.php?id=${transactionId}`,
    "DELETE"
  );

  if (response && response.success) {
    showNotification("Transaksi berhasil dihapus!");
    loadInvestmentTransactions(investmentId);
    loadInvestmentsList();
  } else {
    showNotification("Gagal menghapus transaksi", "error");
  }
}

// Delete investment
async function deleteInvestment(id) {
  if (
    !confirm(
      "Apakah Anda yakin ingin menghapus investasi ini? Semua transaksi terkait juga akan dihapus."
    )
  )
    return;

  const response = await fetchAPI(`investments.php?id=${id}`, "DELETE");

  if (response && response.success) {
    showNotification("Investasi berhasil dihapus!");
    loadInvestmentsList();
  } else {
    showNotification("Gagal menghapus investasi", "error");
  }
}
