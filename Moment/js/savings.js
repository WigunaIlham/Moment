// Load savings section
function loadSavings() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
        <div id="tabungan">
            <div class="form-container">
                <h2 class="form-title">Atur Tabungan</h2>
                <form id="savingForm">
                    <div class="form-group">
                        <label for="savingName">Nama Tabungan</label>
                        <input type="text" id="savingName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="savingTarget">Target Jumlah (Rp)</label>
                        <input type="number" id="savingTarget" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="savingCurrent">Jumlah Saat Ini (Rp)</label>
                        <input type="number" id="savingCurrent" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="savingDeadline">Target Tanggal</label>
                        <input type="date" id="savingDeadline" required>
                    </div>
                    
                    <button type="submit" class="btn">Simpan Tabungan</button>
                    <button type="button" class="btn btn-secondary" style="margin-top: 10px;" data-section="dashboard">Kembali</button>
                </form>
                
                <div class="savings-list" style="margin-top: 30px;">
                    <h3>Daftar Tabungan</h3>
                    <div id="savings-container" style="margin-top: 15px;"></div>
                </div>
            </div>
        </div>
    `;

  // Set current date
  setCurrentDate();

  // Form submit
  document
    .getElementById("savingForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("savingName").value;
      const target = document.getElementById("savingTarget").value;
      const current = document.getElementById("savingCurrent").value;
      const deadline = document.getElementById("savingDeadline").value;

      if (!name || !target || !current || !deadline) {
        showNotification("Harap isi semua kolom yang wajib diisi", "error");
        return;
      }

      const response = await fetchAPI("savings.php", "POST", {
        name,
        target_amount: parseFloat(target),
        current_amount: parseFloat(current),
        deadline,
      });

      if (response && response.success) {
        showNotification("Tabungan berhasil ditambahkan!");
        document.getElementById("savingForm").reset();
        loadSavingsList();
      } else {
        showNotification("Gagal menambahkan tabungan", "error");
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

  // Load savings list
  loadSavingsList();
}

// Load savings list from API
async function loadSavingsList() {
  const container = document.getElementById("savings-container");
  container.innerHTML = "<p>Memuat tabungan...</p>";

  try {
    const savings = await fetchAPI("savings.php");

    if (savings && savings.length > 0) {
      container.innerHTML = "";

      savings.forEach((saving) => {
        const percent = (saving.current_amount / saving.target_amount) * 100;
        const progressColor =
          percent > 70
            ? "var(--success)"
            : percent > 40
            ? "var(--warning)"
            : "var(--danger)";

        const savingEl = document.createElement("div");
        savingEl.className = "saving-item";
        savingEl.innerHTML = `
                    <div class="saving-header">
                        <h4>${saving.name}</h4>
                        <div class="saving-actions">
                            <button class="btn-edit" data-id="${
                              saving.id
                            }">✏️</button>
                            <button class="btn-delete" data-id="${
                              saving.id
                            }">🗑️</button>
                        </div>
                    </div>
                    <p>Target: Rp ${parseFloat(
                      saving.target_amount
                    ).toLocaleString("id-ID")} - ${saving.deadline}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(
                          100,
                          percent
                        )}%; background: ${progressColor};"></div>
                    </div>
                    <div class="saving-info">
                        <span>Rp ${parseFloat(
                          saving.current_amount
                        ).toLocaleString("id-ID")}</span>
                        <span>${Math.round(percent)}%</span>
                    </div>
                `;

        container.appendChild(savingEl);
      });

      // Add event listeners for edit and delete buttons
      document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          editSaving(id);
        });
      });

      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          deleteSaving(id);
        });
      });
    } else {
      container.innerHTML = "<p>Belum ada tabungan</p>";
    }
  } catch (error) {
    console.error("Error loading savings:", error);
    container.innerHTML = "<p>Gagal memuat tabungan</p>";
  }
}

// Edit saving
async function editSaving(id) {
  const newAmount = prompt("Masukkan jumlah baru:");
  if (newAmount === null || isNaN(parseFloat(newAmount))) return;

  const response = await fetchAPI("savings.php", "PUT", {
    id: parseInt(id),
    current_amount: parseFloat(newAmount),
  });

  if (response && response.success) {
    showNotification("Tabungan berhasil diperbarui!");
    loadSavingsList();
  } else {
    showNotification("Gagal memperbarui tabungan", "error");
  }
}

// Delete saving
async function deleteSaving(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus tabungan ini?")) return;

  const response = await fetchAPI(`savings.php?id=${id}`, "DELETE");

  if (response && response.success) {
    showNotification("Tabungan berhasil dihapus!");
    loadSavingsList();
  } else {
    showNotification("Gagal menghapus tabungan", "error");
  }
}
