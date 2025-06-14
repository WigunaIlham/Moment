// Load transactions section
function loadTransactions() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
        <div id="transaksi">
            <div class="form-container">
                <h2 class="form-title">Tambah Transaksi</h2>
                <form id="transactionForm">
                    <div class="form-group">
                        <label for="transactionType">Jenis Transaksi</label>
                        <select id="transactionType" required>
                            <option value="">Pilih Jenis</option>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="transactionAmount">Jumlah (Rp)</label>
                        <input type="number" id="transactionAmount" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="transactionDate">Tanggal</label>
                        <input type="date" id="transactionDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Kategori</label>
                        <div class="category-list">
                            <div class="category-item" data-category="makanan">Makanan</div>
                            <div class="category-item" data-category="transportasi">Transportasi</div>
                            <div class="category-item" data-category="hiburan">Hiburan</div>
                            <div class="category-item" data-category="gaji">Gaji</div>
                            <div class="category-item" data-category="bonus">Bonus</div>
                            <div class="category-item" data-category="lainnya">Lainnya</div>
                        </div>
                        <input type="hidden" id="transactionCategory" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="transactionDesc">Deskripsi</label>
                        <textarea id="transactionDesc"></textarea>
                    </div>
                    
                    <button type="submit" class="btn">Simpan Transaksi</button>
                    <button type="button" class="btn btn-secondary" style="margin-top: 10px;" data-section="dashboard">Kembali</button>
                </form>
            </div>
        </div>
    `;

  // Set current date
  setCurrentDate();

  // Kategori selection
  document.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".category-item")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
      document.getElementById("transactionCategory").value =
        this.dataset.category;
    });
  });

  // Form submit
  document
    .getElementById("transactionForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const type = document.getElementById("transactionType").value;
      const amount = document.getElementById("transactionAmount").value;
      const date = document.getElementById("transactionDate").value;
      const category = document.getElementById("transactionCategory").value;
      const desc = document.getElementById("transactionDesc").value;

      if (!type || !amount || !date || !category) {
        showNotification("Harap isi semua kolom yang wajib diisi", "error");
        return;
      }

      const response = await fetchAPI("transactions.php", "POST", {
        type,
        amount: parseFloat(amount),
        category,
        date,
        description: desc,
      });

      if (response && response.success) {
        showNotification("Transaksi berhasil ditambahkan!");
        setTimeout(() => {
          loadSection("dashboard");
        }, 1500);
      } else {
        showNotification("Gagal menambahkan transaksi", "error");
      }
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
}
