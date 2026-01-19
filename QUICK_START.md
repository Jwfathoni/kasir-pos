# ⚡ Quick Start - Upload ke GitHub & Deploy Railway

Panduan cepat untuk upload project ke GitHub dan deploy ke Railway.

---

## 🎯 Langkah Cepat (5 Menit)

### 1️⃣ Install Git (Jika Belum Ada)

**Windows PowerShell (Admin):**
```powershell
winget install --id Git.Git -e --source winget
```

**Atau download:** https://git-scm.com/download/win

**Restart PowerShell setelah install, lalu cek:**
```powershell
git --version
```

---

### 2️⃣ Buat Repository di GitHub

1. Buka: https://github.com/new
2. **Repository name:** `kasir`
3. **Visibility:** Public atau Private
4. **JANGAN** centang "Initialize with README"
5. Klik **"Create repository"**

---

### 3️⃣ Upload ke GitHub

**Buka PowerShell di folder project (`D:\kasir`):**

```powershell
# Inisialisasi Git
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit - Sistem Kasir POS"

# Tambahkan remote (GANTI USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/kasir.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Jika diminta login:**
- Username: username GitHub Anda
- Password: **Personal Access Token** (bukan password)
  - Buat di: https://github.com/settings/tokens
  - Klik "Generate new token (classic)"
  - Centang `repo` permission
  - Copy token dan gunakan sebagai password

---

### 4️⃣ Deploy ke Railway

1. **Buka:** https://railway.app
2. **Login** dengan GitHub
3. **Klik "New Project"** → **"Deploy from GitHub repo"**
4. **Pilih repository** `kasir`
5. **Tunggu deploy** selesai (2-5 menit)

---

### 5️⃣ Setup Secret Key

1. Di Railway dashboard, klik project Anda
2. Klik tab **"Variables"**
3. **Tambah variable:**
   - Name: `SECRET_KEY`
   - Value: Generate dengan PowerShell:
     ```powershell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
     ```
   - Klik **"Add"**
4. Railway akan **auto-redeploy**

---

### 6️⃣ Dapatkan URL

1. Klik tab **"Settings"**
2. Scroll ke **"Domains"**
3. Copy URL yang diberikan (contoh: `https://kasir-production.up.railway.app`)

---

## ✅ Selesai!

**Login Default:**
- Username: `admin` / Password: `admin123`
- Username: `demo` / Password: `demo123`

**Share URL ke client untuk demo!**

---

## 📝 Update Aplikasi

Setelah update code:

```powershell
git add .
git commit -m "Update aplikasi"
git push
```

Railway akan otomatis deploy ulang!

---

## 🐛 Troubleshooting

**Git tidak ditemukan?**
- Install Git dulu (langkah 1)
- Restart PowerShell

**Push ke GitHub gagal?**
- Pastikan Personal Access Token benar
- Cek koneksi internet

**Deploy di Railway gagal?**
- Cek file `requirements.txt` lengkap
- Pastikan `Procfile` ada
- Lihat logs di Railway dashboard

---

**Lihat `PANDUAN_DEPLOY_RAILWAY.md` untuk panduan lengkap!**
