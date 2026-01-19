"""
Script migration untuk menambahkan kolom cost_price ke tabel products dan transaction_items
Jalankan script ini sekali untuk update database yang sudah ada
"""
import sys
import os

# Tambahkan path current directory ke sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from db import DB_URL

def migrate():
    try:
        engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
        
        with engine.begin() as conn:  # Gunakan begin() untuk auto-commit
            # Cek apakah kolom cost_price sudah ada di tabel products
            try:
                result = conn.execute(text("PRAGMA table_info(products)"))
                columns = [row[1] for row in result]
                
                if 'cost_price' not in columns:
                    print("Menambahkan kolom cost_price ke tabel products...")
                    conn.execute(text("ALTER TABLE products ADD COLUMN cost_price FLOAT NOT NULL DEFAULT 0"))
                    print("[OK] Kolom cost_price berhasil ditambahkan ke tabel products")
                else:
                    print("[OK] Kolom cost_price sudah ada di tabel products")
            except Exception as e:
                print(f"Error saat menambahkan kolom ke products: {e}")
            
            # Cek apakah kolom cost_price sudah ada di tabel transaction_items
            try:
                result = conn.execute(text("PRAGMA table_info(transaction_items)"))
                columns = [row[1] for row in result]
                
                if 'cost_price' not in columns:
                    print("Menambahkan kolom cost_price ke tabel transaction_items...")
                    conn.execute(text("ALTER TABLE transaction_items ADD COLUMN cost_price FLOAT NOT NULL DEFAULT 0"))
                    print("[OK] Kolom cost_price berhasil ditambahkan ke tabel transaction_items")
                else:
                    print("[OK] Kolom cost_price sudah ada di tabel transaction_items")
            except Exception as e:
                print(f"Error saat menambahkan kolom ke transaction_items: {e}")
            
            print("\nMigration selesai!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()
