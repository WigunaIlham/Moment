// Fungsi untuk melakukan request API
async function fetchAPI(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`api/${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    showNotification("Terjadi kesalahan saat menghubungi server", "error");
    return null;
  }
}

// Inisialisasi aplikasi
document.addEventListener("DOMContentLoaded", function () {
  // Load dashboard sebagai halaman default
  loadSection("dashboard");

  // Setup event listeners
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const section = this.getAttribute("data-section");
      if (section) {
        loadSection(section);
      }
    });
  });

  // Logout button
  document.getElementById("logout-btn").addEventListener("click", function (e) {
    e.preventDefault();
    logout();
  });
}

// Load section based on name
function loadSection(sectionName) {
  // Update active navigation
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.remove("active");
  });
  document
    .querySelector(`.nav-links a[data-section="${sectionName}"]`)
    .classList.add("active");

  // Update header title
  document.querySelector(".header h1").textContent =
    sectionName.charAt(0).toUpperCase() + sectionName.slice(1);

  // Load section content
  fetchSectionContent(sectionName);
}

// Modifikasi fungsi loadSection
function fetchSectionContent(sectionName) {
  const contentArea = document.getElementById("content-area");
  contentArea.innerHTML = '<div class="loader">Memuat...</div>';

  // Load based on section
  switch (sectionName) {
    case "dashboard":
      loadDashboard();
      break;
    case "transaksi":
      loadTransactions();
      break;
    case "tabungan":
      loadSavings();
      break;
    case "investasi":
      loadInvestments();
      break;
    case "laporan":
      loadReports();
      break;
    case "profil":
      loadProfile();
      break;
    default:
      contentArea.innerHTML = "<p>Section not found</p>";
  }
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Logout function
function logout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    showNotification("Anda berhasil logout");
    setTimeout(() => {
      document.body.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column;">
                    <h1>Anda telah logout</h1>
                    <p>Silakan login kembali untuk mengakses Seranda</p>
                    <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:#4a6fa5; color:white; border:none; border-radius:5px; cursor:pointer;">
                        Login Kembali
                    </button>
                </div>
            `;
    }, 500);
  }
}

// Set current date in forms
function setCurrentDate() {
  const today = new Date().toISOString().split("T")[0];
  if (document.getElementById("transactionDate")) {
    document.getElementById("transactionDate").value = today;
  }
  if (document.getElementById("investmentDate")) {
    document.getElementById("investmentDate").value = today;
  }

  // Set deadline default 1 tahun dari sekarang
  if (document.getElementById("savingDeadline")) {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    document.getElementById("savingDeadline").value = nextYear
      .toISOString()
      .split("T")[0];
  }
}
