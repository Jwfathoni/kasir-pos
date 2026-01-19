# 🚀 Panduan Deploy ke Railway untuk Demo Client

Panduan lengkap step-by-step untuk upload ke GitHub dan deploy ke Railway.

---

## 📋 Persiapan

### 1. Pastikan File Ini Ada di Project:

✅ File yang harus ada:
- `app.py` (main application)
- `requirements.txt` (dependencies)
- `Procfile` (untuk Railway)
- `railway.json` (konfigurasi Railway)
- Folder `templates/` (HTML templates)
- Folder `static/` (CSS, JS, images)
- File lainnya: `db.py`, `models.py`, `auth.py`, dll

✅ File yang TIDAK perlu di-upload (ada di .gitignore):
- `.venv/` (virtual environment)
- `pos.db` (database akan dibuat otomatis)
- `__pycache__/` (Python cache)

---

## 🔧 Langkah 1: Install Git (Jika Belum Ada)

### Windows:

**Opsi A - Via Winget (PowerShell sebagai Admin):**
```powershell
winget install --id Git.Git -e --source winget
```

**Opsi B - Download Manual:**
1. Kunjungi: https://git-scm.com/download/win
2. Download dan install Git for Windows
3. Restart PowerShell setelah install

**Verifikasi:**
```powershell
git --version
```

---

## 📤 Langkah 2: Upload ke GitHub

### 2.1. Buat Repository di GitHub

1. Buka: https://github.com
2. Login ke akun GitHub Anda
3. Klik tombol **"+"** di kanan atas → **"New repository"**
4. Isi:
   - **Repository name:** `kasir` (atau nama lain)
   - **Description:** `Sistem Kasir POS`
   - **Visibility:** Public atau Private (terserah)
   - **JANGAN** centang "Initialize with README"
5. Klik **"Create repository"**

### 2.2. Inisialisasi Git di Project

Buka PowerShell di folder project (`D:\kasir`):

```powershell
# Inisialisasi Git
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit - Sistem Kasir POS"

# Tambahkan remote repository (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/kasir.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Jika diminta login:**
- Username: username GitHub Anda
- Password: Gunakan **Personal Access Token** (bukan password GitHub)
  - Buat token: https://github.com/settings/tokens
  - Klik "Generate new token (classic)"
  - Centang `repo` permission
  - Copy token dan gunakan sebagai password

---

## 🚂 Langkah 3: Deploy ke Railway

### 3.1. Daftar di Railway

1. Buka: https://railway.app
2. Klik **"Login"** atau **"Start a New Project"**
3. Pilih **"Login with GitHub"**
4. Authorize Railway untuk akses GitHub Anda

### 3.2. Buat Project Baru

1. Setelah login, klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository `kasir` yang baru saja Anda buat
4. Railway akan otomatis detect Python dan mulai deploy

### 3.3. Konfigurasi Environment Variable

1. Setelah project dibuat, klik project Anda
2. Klik tab **"Variables"**
3. Tambahkan variable baru:
   - **Name:** `SECRET_KEY`
   - **Value:** Generate random string (lihat di bawah)
   - Klik **"Add"**

**Generate Secret Key:**

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Atau gunakan online generator:**
- https://randomkeygen.com/
- Copy salah satu "CodeIgniter Encryption Keys"

**Contoh Secret Key:**
```
aB3xY9mN2pQ7wE5rT8uI0oP6aS4dF1gH
```

### 3.4. Tunggu Deploy Selesai

1. Railway akan otomatis:
   - Install dependencies dari `requirements.txt`
   - Build aplikasi
   - Deploy aplikasi
2. Tunggu sampai status **"Deployed"** (biasanya 2-5 menit)
3. Klik tab **"Settings"**
4. Scroll ke bawah ke bagian **"Domains"**
5. Railway akan memberikan URL seperti:
   - `https://kasir-production.up.railway.app`
   - Atau custom domain jika Anda set

---

## 🎯 Langkah 4: Setup Database & User Demo

### 4.1. Akses Aplikasi

1. Buka URL yang diberikan Railway
2. Anda akan melihat halaman login

### 4.2. Buat User Admin (Via Railway Console)

1. Di Railway dashboard, klik project → **"View Logs"**
2. Klik tab **"Deployments"** → **"View Logs"**
3. Atau gunakan **Railway CLI** (opsional):

**Install Railway CLI:**
```powershell
# Windows
iwr https://railway.app/install.ps1 | iex
```

**Login:**
```powershell
railway login
```

**Connect ke project:**
```powershell
railway link
```

**Buka shell:**
```powershell
railway shell
```

**Atau gunakan cara manual:**

### 4.3. Buat User via Python Script

Buat file `create_demo_user.py`:

```python
from db import engine, SessionLocal
from models import User
from auth import hash_password

db = SessionLocal()

# Buat user demo
demo_user = User(
    username="demo",
    password_hash=hash_password("demo123"),
    role="admin",
    display_name="Demo User"
)

# Cek apakah user sudah ada
existing = db.query(User).filter(User.username == "demo").first()
if not existing:
    db.add(demo_user)
    db.commit()
    print("✅ User demo berhasil dibuat!")
    print("Username: demo")
    print("Password: demo123")
else:
    print("⚠️ User demo sudah ada")

db.close()
```

**Upload script ini ke Railway:**

1. Tambahkan file `create_demo_user.py` ke repository
2. Push ke GitHub:
   ```powershell
   git add create_demo_user.py
   git commit -m "Add script to create demo user"
   git push
   ```
3. Tunggu Railway auto-deploy
4. Jalankan script via Railway shell atau tambahkan ke startup

**Atau gunakan cara lebih mudah:**

### 4.4. Setup via Seed Script (Recommended)

Tambahkan ke `app.py` untuk auto-create user jika belum ada:

```python
# Di bagian setelah run_migrations()
def create_default_user(db: Session):
    """Buat user default jika belum ada"""
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            password_hash=hash_password("admin123"),
            role="admin",
            display_name="Administrator"
        )
        db.add(admin)
        db.commit()
        print("[OK] User admin default berhasil dibuat")

# Panggil saat startup
with SessionLocal() as db:
    create_default_user(db)
```

**Login Default:**
- Username: `admin`
- Password: `admin123`

---

## ✅ Checklist Sebelum Share ke Client

- [ ] Repository sudah di-upload ke GitHub
- [ ] Deploy ke Railway berhasil
- [ ] URL bisa diakses
- [ ] Login berfungsi
- [ ] Semua fitur utama bekerja:
  - [ ] Tambah produk
  - [ ] Kasir
  - [ ] Laporan
  - [ ] Export Excel
- [ ] User demo sudah dibuat
- [ ] Test di browser lain/device lain

---

## 🔗 Share URL ke Client

Setelah semua selesai, share URL Railway ke client:

```
URL Demo: https://kasir-production.up.railway.app

Login:
- Username: demo
- Password: demo123
```

**Atau buat akun khusus untuk client:**
- Username: `client_demo`
- Password: `client123`

---

## 🐛 Troubleshooting

### ❌ Build Failed di Railway?

**Cek:**
1. Semua dependencies ada di `requirements.txt`
2. File `Procfile` ada dan benar
3. Python version compatible (3.9+)

### ❌ Database Error?

- Database SQLite akan dibuat otomatis saat pertama kali deploy
- Pastikan folder `static/` dan `templates/` ada

### ❌ Static Files Tidak Load?

- Pastikan folder `static/` ada di root project
- Cek di Railway logs untuk error

### ❌ Port Error?

- Railway otomatis set `$PORT`
- Pastikan `Procfile` menggunakan `$PORT`

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

## 💰 Biaya

- **Railway:** Gratis $5 credit/bulan (cukup untuk demo)
- Setelah credit habis, bisa upgrade atau pindah ke platform lain

---

## 🎉 Selesai!

Setelah semua langkah selesai, client Anda bisa:
1. Akses URL Railway
2. Login dengan akun demo
3. Mencoba semua fitur sistem

**Selamat Deploy! 🚀**
