let cart = [];

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    body.classList.add('light-mode');
    if (themeToggle) themeToggle.textContent = '🌞';
  } else {
    if (themeToggle) themeToggle.textContent = '🌙';
  }
  
  // Toggle theme
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      const isLight = body.classList.contains('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      themeToggle.textContent = isLight ? '🌞' : '🌙';
    });
  }
});

// ========== MODAL SYSTEM ==========
// Fungsi untuk menampilkan alert custom
function showAlert(message, title = "Pemberitahuan", type = "info") {
  return new Promise((resolve) => {
    const modal = document.getElementById("generic-modal");
    const modalTitle = document.getElementById("generic-modal-title");
    const modalMessage = document.getElementById("generic-modal-message");
    const modalActions = document.getElementById("generic-modal-actions");
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Set icon berdasarkan type
    let icon = "ℹ️";
    if (type === "error" || type === "danger") icon = "❌";
    else if (type === "warning") icon = "⚠️";
    else if (type === "success") icon = "✅";
    
    modalTitle.textContent = `${icon} ${title}`;
    
    // Buat tombol OK
    modalActions.innerHTML = '<button class="btn" id="generic-modal-ok">OK</button>';
    
    // Tampilkan modal
    modal.style.display = "flex";
    
    // Event listener untuk tombol OK
    const okBtn = document.getElementById("generic-modal-ok");
    okBtn.onclick = () => {
      modal.style.display = "none";
      resolve(true);
    };
    
    // Tutup modal jika klik di luar
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        resolve(false);
      }
    };
  });
}

// Fungsi untuk menampilkan confirm custom
function showConfirm(message, title = "Konfirmasi") {
  return new Promise((resolve) => {
    const modal = document.getElementById("generic-modal");
    const modalTitle = document.getElementById("generic-modal-title");
    const modalMessage = document.getElementById("generic-modal-message");
    const modalActions = document.getElementById("generic-modal-actions");
    
    modalTitle.textContent = `❓ ${title}`;
    modalMessage.textContent = message;
    
    // Buat tombol Ya dan Tidak
    modalActions.innerHTML = `
      <button class="btn" id="generic-modal-cancel">Tidak</button>
      <button class="btn success" id="generic-modal-confirm">Ya</button>
    `;
    
    // Tampilkan modal
    modal.style.display = "flex";
    
    // Event listener untuk tombol
    const cancelBtn = document.getElementById("generic-modal-cancel");
    const confirmBtn = document.getElementById("generic-modal-confirm");
    
    cancelBtn.onclick = () => {
      modal.style.display = "none";
      resolve(false);
    };
    
    confirmBtn.onclick = () => {
      modal.style.display = "none";
      resolve(true);
    };
    
    // Tutup modal jika klik di luar (cancel)
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        resolve(false);
      }
    };
  });
}

function addToCart(code, name, price) {
  const found = cart.find(x => x.code === code);
  if (found) found.qty += 1;
  else cart.push({code, name, price, qty: 1});
  renderCart();
}

function changeQty(code, delta) {
  const it = cart.find(x => x.code === code);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) cart = cart.filter(x => x.code !== code);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function totalCart() {
  return cart.reduce((a, b) => a + (b.price * b.qty), 0);
}

function formatCurrency(amount) {
  return "Rp " + new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function renderCart() {
  const el = document.getElementById("cart");
  const totalEl = document.getElementById("total");
  if (!el || !totalEl) return;

  if (cart.length === 0) {
    el.innerHTML = '<div style="text-align: center; padding: 40px; color: #888; font-style: italic;">Keranjang kosong</div>';
    totalEl.textContent = "Rp 0";
    return;
  }

  el.innerHTML = cart.map(it => `
    <div class="row">
      <div>
        <b>${it.name}</b><br><small>${it.code} • ${formatCurrency(it.price)}</small>
      </div>
      <div class="qty">
        <button type="button" onclick="changeQty('${it.code}',-1)">−</button>
        <span>${it.qty}</span>
        <button type="button" onclick="changeQty('${it.code}',1)">+</button>
      </div>
    </div>
  `).join("");

  totalEl.textContent = formatCurrency(totalCart());
}

async function submitCheckout(event) {
  if (event) {
    event.preventDefault();
  }
  
  if (cart.length === 0) {
    await showAlert("Keranjang kosong!", "Peringatan", "warning");
    return false;
  }
  
  // Unformat input paid sebelum validasi dan submit
  const paidInput = document.getElementById("paid");
  // Hapus semua karakter non-digit (titik, koma, spasi, dll)
  const paidValue = paidInput.value.replace(/[^\d]/g, '');
  const paid = parseFloat(paidValue) || 0;
  
  // Set nilai unformatted ke input sebelum submit
  // Pastikan hanya angka yang dikirim ke server
  paidInput.value = paidValue;
  paidInput.setAttribute('value', paidValue);
  
  const total = totalCart();
  if (paid < total) {
    await showAlert(`Jumlah bayar kurang!\nTotal: ${formatCurrency(total)}\nBayar: ${formatCurrency(paid)}`, "Peringatan", "warning");
    return false;
  }
  document.getElementById("cart_json").value = JSON.stringify(cart);
  
  // Submit form manual jika valid
  // Nilai paidInput sudah di-set di atas, jadi langsung submit
  if (event && event.target) {
    event.target.submit();
  }
  return true;
}

function filterProducts() {
  const q = (document.getElementById("search").value || "").toLowerCase();
  const list = document.getElementById("productList");
  if (!list) return;
  [...list.children].forEach(btn => {
    const text = btn.innerText.toLowerCase();
    btn.style.display = text.includes(q) ? "" : "none";
  });
}

// Reports page logic
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reports-page')) {
    loadReports();
  }
});

async function loadReports() {
  // Load Summary Report
  fetch('/api/reports/summary')
    .then(response => response.json())
    .then(data => {
      document.getElementById('total-products').textContent = data.total_products;
      document.getElementById('active-products').textContent = data.active_products;
      document.getElementById('products-sold-this-month').textContent = data.products_sold_this_month;
    })
    .catch(error => console.error('Error loading summary report:', error));

  // Load Top Products Report
  fetch('/api/reports/top_products')
    .then(response => response.json())
    .then(data => {
      const topSellingEl = document.getElementById('top-selling-products');
      topSellingEl.innerHTML = data.top_selling_products.map(p => `<li>${p.name} (${p.total_qty_sold} unit)</li>`).join('');

      const highestRevenueEl = document.getElementById('highest-revenue-products');
      highestRevenueEl.innerHTML = data.highest_revenue_products.map(p => `<li>${p.name} (${formatCurrency(p.total_revenue)})</li>`).join('');
    })
    .catch(error => console.error('Error loading top products report:', error));

  // Load Problem Products Report
  fetch('/api/reports/problem_products')
    .then(response => response.json())
    .then(data => {
      const rarelySoldEl = document.getElementById('rarely-sold-products');
      rarelySoldEl.innerHTML = data.rarely_sold_products.map(p => `<li>${p.name} (${p.total_qty_sold} unit)</li>`).join('');

      const neverSoldEl = document.getElementById('never-sold-products');
      neverSoldEl.innerHTML = data.never_sold_products.map(p => `<li>${p.name}</li>`).join('');
    })
    .catch(error => console.error('Error loading problem products report:', error));

  // Load Stock Report
  fetch('/api/reports/stock')
    .then(response => response.json())
    .then(data => {
      const lowStockEl = document.getElementById('low-stock-products');
      lowStockEl.innerHTML = data.low_stock_products.map(p => `<li>${p.name} (Stok: ${p.stock})</li>`).join('');

      const overstockEl = document.getElementById('overstock-products');
      overstockEl.innerHTML = data.overstock_products.map(p => `<li>${p.name} (Stok: ${p.stock})</li>`).join('');
    })
    .catch(error => console.error('Error loading stock report:', error));

  // Load Sales Trend Report
  fetch('/api/reports/sales_trend')
    .then(response => response.json())
    .then(data => {
      const salesTrendEl = document.getElementById('sales-trend-raw');
      if (data.sales_trend.length > 0) {
        salesTrendEl.textContent = data.sales_trend.map(s => `${s.month}: ${formatCurrency(s.total_sales)}`).join('\n');
      } else {
        salesTrendEl.textContent = 'Tidak ada data tren penjualan.';
      }
    })
    .catch(error => console.error('Error loading sales trend report:', error));

  // Export to Excel button logic
  const exportExcelBtn = document.getElementById('export-excel-btn');
  const exportExcelModal = document.getElementById('export-excel-modal');
  const cancelExportBtn = document.getElementById('cancel-export');
  const confirmExportBtn = document.getElementById('confirm-export');
  const exportModalTitle = document.getElementById('export-modal-title');
  const exportModalMessage = document.getElementById('export-modal-message');

  let currentExportMode = 'daily'; // To store the mode when the modal is opened

  if (exportExcelBtn && exportExcelModal && cancelExportBtn && confirmExportBtn) {
    exportExcelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentExportMode = document.querySelector('.tabs .tab.active').dataset.mode || 'daily';
      let reportTypeName = '';
      if (currentExportMode === 'daily') reportTypeName = 'Harian';
      else if (currentExportMode === 'monthly') reportTypeName = 'Bulanan';
      else if (currentExportMode === 'yearly') reportTypeName = 'Tahunan';

      exportModalTitle.textContent = `Konfirmasi Unduh Laporan ${reportTypeName}`;
      exportModalMessage.textContent = `Apakah Anda yakin ingin mengunduh Laporan ${reportTypeName}?`;
      exportExcelModal.style.display = 'flex'; // Show the modal
    });

    cancelExportBtn.addEventListener('click', () => {
      exportExcelModal.style.display = 'none'; // Hide the modal
    });

    confirmExportBtn.addEventListener('click', () => {
      exportExcelModal.style.display = 'none'; // Hide the modal
      window.location.href = `/api/reports/export_excel?mode=${currentExportMode}`;
    });

    // Hide modal if clicked outside of modal content
    window.addEventListener('click', (event) => {
      if (event.target === exportExcelModal) {
        exportExcelModal.style.display = 'none';
      }
    });
  }
}

function formatInputRupiah(input) {
  let value = input.value.replace(/[^\d]/g, ''); // Hapus semua kecuali angka
  if (value) {
    value = parseInt(value, 10).toLocaleString('id-ID'); // Format sebagai ribuan
  }
  input.value = value;
}

function unformatInputRupiah(input) {
  input.value = input.value.replace(/[^\d]/g, ''); // Hapus semua kecuali angka
}

// Attach submit event listeners to forms containing price inputs
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[action^="/products"]');
  forms.forEach(form => {
    form.addEventListener('submit', () => {
      const priceInputs = form.querySelectorAll('input[name="price"], input[name="cost_price"]');
      priceInputs.forEach(input => {
        input.value = input.value.replace(/[^\d]/g, ''); // Hapus format sebelum submit
      });
    });
  });

  // Note: Format removal untuk checkout form sudah dihandle di submitCheckout()
  // Event listener ini sebagai backup jika ada submit langsung tanpa melalui submitCheckout()
  const checkoutForm = document.querySelector('form[action="/checkout"]');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      const paidInput = document.getElementById('paid');
      if (paidInput) {
        // Hapus format sebelum submit
        paidInput.value = paidInput.value.replace(/[^\d]/g, '');
      }
    });
  }
});

// Logout Modal Logic
document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout-link');
  const logoutModal = document.getElementById('logout-modal');
  const cancelLogoutBtn = document.getElementById('cancel-logout');

  if (logoutLink && logoutModal && cancelLogoutBtn) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logoutModal.style.display = 'flex'; // Show the modal
    });

    cancelLogoutBtn.addEventListener('click', () => {
      logoutModal.style.display = 'none'; // Hide the modal
    });

    // Hide modal if clicked outside of modal content
    window.addEventListener('click', (event) => {
      if (event.target === logoutModal) {
        logoutModal.style.display = 'none';
      }
    });
  }
});

function filterProductTable() {
  const query = (document.getElementById("productSearch").value || "").toLowerCase();
  const tableBody = document.querySelector(".table tbody");
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll("tr");
  let visibleCount = 0;
  
  rows.forEach(row => {
    const textContent = row.textContent.toLowerCase();
    if (textContent.includes(query)) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });
  
  // Update counter
  const countEl = document.getElementById("product-count");
  if (countEl) {
    const totalCount = rows.length;
    if (query) {
      countEl.textContent = `Menampilkan ${visibleCount} dari ${totalCount} produk`;
    } else {
      countEl.textContent = `Menampilkan semua ${totalCount} produk`;
    }
  }
}

// Handle delete product dengan confirm modal
async function handleDeleteProduct(event, productId) {
  event.preventDefault();
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus produk ini?', 'Konfirmasi Hapus');
  if (confirmed) {
    // Submit form jika user konfirmasi
    event.target.submit();
  }
  return false;
}

// Handle delete button click untuk layout baru
async function handleDeleteProductClick(event, productId) {
  event.preventDefault();
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus produk ini?', 'Konfirmasi Hapus');
  if (confirmed) {
    // Submit form delete yang tersembunyi
    const deleteForm = document.getElementById(`delete-form-${productId}`);
    if (deleteForm) {
      deleteForm.submit();
    }
  }
  return false;
}

// Handle update product dengan konfirmasi
async function handleUpdateProduct(event, productId) {
  event.preventDefault();
  const form = event.target;
  
  // Cek apakah ada perubahan
  const costPriceInput = form.querySelector('input[name="cost_price"]');
  const priceInput = form.querySelector('input[name="price"]');
  const stockAddInput = form.querySelector('input[name="stock_add"]');
  
  const stockAdd = parseInt(stockAddInput.value) || 0;
  
  // Jika tidak ada perubahan, tidak perlu konfirmasi
  if (stockAdd === 0) {
    // Cek apakah harga berubah (bandingkan dengan nilai original dari data-attribute)
    const currentCostPrice = parseFloat(costPriceInput.getAttribute('data-original-cost-price'));
    const currentPrice = parseFloat(priceInput.getAttribute('data-original-price'));
    const newCostPrice = parseFloat(costPriceInput.value.replace(/[^\d]/g, ''));
    const newPrice = parseFloat(priceInput.value.replace(/[^\d]/g, ''));
    
    if (!isNaN(currentCostPrice) && !isNaN(currentPrice) &&
        currentCostPrice === newCostPrice && currentPrice === newPrice) {
      await showAlert('Tidak ada perubahan yang perlu disimpan.', 'Informasi', 'info');
      return false;
    }
  }
  
  const confirmed = await showConfirm(
    stockAdd > 0 
      ? `Apakah Anda yakin ingin mengupdate produk ini?\n\n- Update harga\n- Tambah stok: +${stockAdd}`
      : 'Apakah Anda yakin ingin mengupdate harga produk ini?',
    'Konfirmasi Update Produk'
  );
  
  if (confirmed) {
    form.submit();
  }
  
  return false;
}

// ========== INLINE EDIT PRODUCT NAME ==========
function editProductName(element) {
  const productId = element.getAttribute('data-product-id');
  const productName = element.getAttribute('data-product-name');
  
  // Hide display span
  element.style.display = 'none';
  
  // Show and focus input
  const editInput = element.nextElementSibling;
  if (editInput && editInput.classList.contains('product-name-edit')) {
    editInput.style.display = 'block';
    editInput.value = productName;
    editInput.focus();
    editInput.select();
  }
}

function saveProductName(inputElement) {
  const productId = inputElement.getAttribute('data-product-id');
  const newName = inputElement.value.trim();
  const displaySpan = inputElement.previousElementSibling;
  const originalName = displaySpan.getAttribute('data-product-name');
  
  // Hide input
  inputElement.style.display = 'none';
  
  // If name unchanged, just show display again
  if (newName === originalName || newName === '') {
    displaySpan.style.display = 'inline';
    inputElement.value = originalName;
    return;
  }
  
  // Update via AJAX
  const formData = new FormData();
  formData.append('pid', productId);
  formData.append('name', newName);
  
  // Show loading state
  displaySpan.textContent = 'Menyimpan...';
  displaySpan.style.display = 'inline';
  displaySpan.style.opacity = '0.6';
  
  fetch('/products/update_name', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update display text and data attribute
      displaySpan.textContent = newName;
      displaySpan.setAttribute('data-product-name', newName);
      
      // Update hidden input in action form
      const hiddenNameInput = document.getElementById(`hidden-name-${productId}`);
      if (hiddenNameInput) {
        hiddenNameInput.value = newName;
      }
      
      // Show success feedback
      displaySpan.style.opacity = '1';
      displaySpan.style.color = 'var(--accent-color)';
      setTimeout(() => {
        displaySpan.style.color = '';
      }, 1000);
    } else {
      // Revert on error
      displaySpan.textContent = originalName;
      displaySpan.setAttribute('data-product-name', originalName);
      inputElement.value = originalName;
      showAlert(data.message || 'Gagal mengupdate nama produk', 'Error', 'error');
    }
    displaySpan.style.opacity = '1';
  })
  .catch(error => {
    console.error('Error updating product name:', error);
    // Revert on error
    displaySpan.textContent = originalName;
    displaySpan.setAttribute('data-product-name', originalName);
    inputElement.value = originalName;
    displaySpan.style.opacity = '1';
    showAlert('Terjadi kesalahan saat mengupdate nama produk', 'Error', 'error');
  });
}

function handleProductNameKeydown(event, inputElement) {
  if (event.key === 'Enter') {
    event.preventDefault();
    inputElement.blur(); // Trigger save
  } else if (event.key === 'Escape') {
    event.preventDefault();
    const productId = inputElement.getAttribute('data-product-id');
    const displaySpan = inputElement.previousElementSibling;
    const originalName = displaySpan.getAttribute('data-product-name');
    
    // Cancel edit - revert to original
    inputElement.value = originalName;
    inputElement.style.display = 'none';
    displaySpan.style.display = 'inline';
  }
}

// Handle update settings dengan konfirmasi
async function handleUpdateSettings(event) {
  event.preventDefault();
  const confirmed = await showConfirm('Apakah Anda yakin ingin menyimpan pengaturan toko?', 'Konfirmasi Simpan Pengaturan');
  if (confirmed) {
    event.target.submit();
  }
  return false;
}

// Handle update display name dengan konfirmasi
async function handleUpdateDisplayName(event) {
  event.preventDefault();
  const confirmed = await showConfirm('Apakah Anda yakin ingin mengupdate nama kasir?', 'Konfirmasi Update Nama Kasir');
  if (confirmed) {
    event.target.submit();
  }
  return false;
}

// Handle clear database dengan konfirmasi ganda
async function handleClearDatabase(event) {
  event.preventDefault();
  
  // Konfirmasi pertama dengan alert warning
  await showAlert(
    '⚠️ PERINGATAN! ⚠️\n\n' +
    'Tindakan ini akan menghapus SEMUA data dari database:\n' +
    '• Semua produk\n' +
    '• Semua transaksi\n' +
    '• Semua update stok\n' +
    '• Semua item transaksi\n\n' +
    'Data yang dihapus TIDAK DAPAT dikembalikan!',
    'PERINGATAN: Hapus Semua Data',
    'warning'
  );
  
  // Tunggu sebentar agar user membaca warning
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Konfirmasi pertama
  const confirmed1 = await showConfirm(
    'Apakah Anda benar-benar yakin ingin menghapus SEMUA data dari database?',
    'Konfirmasi Hapus Database'
  );
  
  if (!confirmed1) {
    return false;
  }
  
  // Konfirmasi kedua untuk keamanan ekstra
  const confirmed2 = await showConfirm(
    'Konfirmasi akhir:\n\n' +
    'Anda akan menghapus SEMUA data dari database.\n' +
    'Tindakan ini TIDAK DAPAT DIBATALKAN!\n\n' +
    'Apakah Anda yakin?',
    'Konfirmasi Akhir - Hapus Database'
  );
  
  if (confirmed2) {
    event.target.submit();
  }
  
  return false;
}

// Handle import database (backup restore) dengan konfirmasi
async function handleImportDatabase(event) {
  event.preventDefault();

  const fileInput = event.target.querySelector('input[type="file"]');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    await showAlert('Pilih file database terlebih dahulu.', 'Tidak ada file', 'warning');
    return false;
  }

  const confirmed = await showConfirm(
    'Import database akan MENGGANTI seluruh data saat ini dengan isi file yang diupload.\n\n' +
    'Pastikan Anda menggunakan file backup yang benar.\n\n' +
    'Lanjutkan?',
    'Konfirmasi Import Database'
  );

  if (confirmed) {
    event.target.submit();
  }

  return false;
}

// Excel Import Logic
document.addEventListener('DOMContentLoaded', () => {
  const importExcelForm = document.getElementById('import-excel-form');
  const excelFileInput = document.getElementById('excel-file');
  const uploadExcelBtn = document.getElementById('upload-excel-btn');

  if (importExcelForm && excelFileInput && uploadExcelBtn) {
    importExcelForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (excelFileInput.files.length === 0) {
        await showAlert('Pilih file Excel terlebih dahulu!', 'Peringatan', 'warning');
        return;
      }

      const file = excelFileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      uploadExcelBtn.disabled = true;
      uploadExcelBtn.textContent = 'Uploading...';

      try {
        const response = await fetch('/products/import_excel', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          await showAlert(result.message, 'Berhasil', 'success');
          // Reload the page to show updated product list
          window.location.reload();
        } else {
          await showAlert(result.detail || 'Terjadi kesalahan saat mengimpor produk.', 'Error', 'error');
        }
      } catch (error) {
        console.error('Error importing Excel:', error);
        await showAlert('Terjadi kesalahan jaringan atau server.', 'Error', 'error');
      } finally {
        uploadExcelBtn.disabled = false;
        uploadExcelBtn.textContent = '⬆️ Upload & Import';
      }
    });
  }

  // Stock Update Import Logic
  const importStockForm = document.getElementById('import-stock-form');
  const stockExcelFileInput = document.getElementById('stock-excel-file');
  const uploadStockBtn = document.getElementById('upload-stock-btn');

  if (importStockForm && stockExcelFileInput && uploadStockBtn) {
    importStockForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (stockExcelFileInput.files.length === 0) {
        await showAlert('Pilih file Excel terlebih dahulu!', 'Peringatan', 'warning');
        return;
      }

      const file = stockExcelFileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      uploadStockBtn.disabled = true;
      uploadStockBtn.textContent = 'Uploading...';

      try {
        const response = await fetch('/products/import_stock_update', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          let message = result.message;
          if (result.total_pengeluaran > 0) {
            message += `\n\nTotal Pengeluaran: ${formatCurrency(result.total_pengeluaran)}`;
          }
          await showAlert(message, 'Berhasil', 'success');
          // Reload the page to show updated product list
          window.location.reload();
        } else {
          let errorMsg = result.detail || 'Terjadi kesalahan saat mengupdate stok.';
          if (result.total_pengeluaran > 0) {
            errorMsg += `\n\nTotal Pengeluaran: ${formatCurrency(result.total_pengeluaran)}`;
          }
          await showAlert(errorMsg, 'Error', 'error');
        }
      } catch (error) {
        console.error('Error importing stock update:', error);
        await showAlert('Terjadi kesalahan jaringan atau server.', 'Error', 'error');
      } finally {
        uploadStockBtn.disabled = false;
        uploadStockBtn.textContent = '⬆️ Upload & Update Stok';
      }
    });
  }
});