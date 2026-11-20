# KasirKita — Sistem Kasir Digital UMKM

KasirKita adalah starter project aplikasi kasir berbasis HTML, CSS, dan JavaScript.

## Fitur
- Dashboard ringkasan penjualan.
- Kelola produk (tambah, edit, hapus).
- Keranjang dan transaksi kasir.
- Perhitungan pembayaran dan kembalian.
- Pengurangan stok otomatis setelah transaksi.
- Riwayat transaksi.
- Laporan omzet dan ekspor CSV.
- Penyimpanan data menggunakan LocalStorage.
- Tampilan responsif untuk desktop dan ponsel.

## Cara menjalankan
1. Ekstrak folder `KasirKita`.
2. Buka folder menggunakan Visual Studio Code.
3. Buka `index.html` di browser, atau jalankan dengan ekstensi Live Server.
4. Data contoh akan tersedia otomatis pada penggunaan pertama.

## Catatan penting
- Data disimpan di LocalStorage browser/perangkat yang digunakan.
- Menghapus data browser dapat menghapus data aplikasi. Buat backup sebelum membersihkan data browser.
- Belum ada login, database online, sinkronisasi antarperangkat, atau multi-user.
- Ini merupakan starter/MVP dan perlu diuji serta disesuaikan sebelum digunakan untuk transaksi bisnis sungguhan.

## Struktur folder
```text
KasirKita/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
└── README.md
```

## Pengembangan berikutnya
- Fitur backup dan restore data.
- Cetak struk.
- Pengaturan nama toko.
- Kategori produk.
- Grafik penjualan lebih lengkap.
- Backend dan database untuk versi multi-perangkat.

## Lisensi
Starter project ini disediakan untuk dipelajari dan dikembangkan. Tentukan dan sertakan lisensi distribusi yang sesuai sebelum menjual ulang atau mendistribusikannya.
