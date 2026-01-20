from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_name = Column(String, nullable=True) # Nama tampilan kasir untuk transaksi/laporan
    role = Column(String, default="kasir")  # admin/kasir

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False, default=0)  # Harga jual
    cost_price = Column(Float, nullable=False, default=0)  # Harga asli/harga beli
    stock = Column(Integer, nullable=False, default=0)
    status = Column(String, default="active")  # active/inactive

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True)
    trx_no = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    cashier = Column(String, nullable=False)
    payment_method = Column(String, default="cash")  # cash/qris/transfer
    total = Column(Float, nullable=False, default=0)
    paid = Column(Float, nullable=False, default=0)
    change = Column(Float, nullable=False, default=0)

    items = relationship("TransactionItem", back_populates="trx", cascade="all, delete-orphan")

class TransactionItem(Base):
    __tablename__ = "transaction_items"
    id = Column(Integer, primary_key=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    product_code = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    price = Column(Float, nullable=False, default=0)  # Harga jual
    cost_price = Column(Float, nullable=False, default=0)  # Harga asli/harga beli
    qty = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False, default=0)

    trx = relationship("Transaction", back_populates="items")

class StockUpdate(Base):
    __tablename__ = "stock_updates"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_code = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    old_stock = Column(Integer, nullable=False, default=0)
    new_stock = Column(Integer, nullable=False, default=0)
    stock_added = Column(Integer, nullable=False, default=0)  # Jumlah stok yang ditambahkan
    cost_price = Column(Float, nullable=False, default=0)  # Harga asli saat update
    total_pengeluaran = Column(Float, nullable=False, default=0)  # cost_price * stock_added
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_by = Column(String, nullable=True)  # User yang melakukan update

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True)
    store_name = Column(String, default="Nama Toko Anda")
    store_address = Column(String, default="Alamat Toko Anda")
    store_phone = Column(String, default="")
    timezone = Column(String, default="WIB")  # WIB (UTC+7), WITA (UTC+8), WIT (UTC+9)
