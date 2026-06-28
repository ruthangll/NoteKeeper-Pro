# NoteKeeper Pro

## Deskripsi Aplikasi

NoteKeeper Pro merupakan aplikasi pencatatan berbasis **React Native** menggunakan **Expo** dengan penyimpanan lokal menggunakan **AsyncStorage**. Aplikasi ini memungkinkan pengguna untuk membuat, melihat, mengedit, menghapus, mencari, dan memfilter catatan berdasarkan kategori. Seluruh data tetap tersimpan meskipun aplikasi ditutup dan dibuka kembali sehingga pengguna tidak kehilangan data.

---

## Fitur Aplikasi

### Level 1 (Core Features)

- Create (Tambah Catatan)
- Read (Menampilkan Catatan)
- Update (Edit Catatan)
- Delete (Hapus Catatan)
- Persistensi Data menggunakan AsyncStorage
- FlatList
- Empty State

### Level 2 (Fitur Tambahan)

- Dark Mode
- Search Catatan
- Filter Berdasarkan Kategori
- Statistik Catatan
- Cache API

---

## Screenshot Aplikasi

### 1. Daftar Item

![Home](assets/images/screenshots/home.jpeg)

Halaman utama aplikasi yang menampilkan daftar catatan beserta statistik.

---

### 2. Search

![Search](assets/images/screenshots/search.jpeg)

Fitur pencarian catatan berdasarkan kata kunci.

---

### 3. Filter

![Filter](assets/images/screenshots/filter.jpeg)

Filter catatan berdasarkan kategori.

---

### 4. Dark Mode

![Dark Mode](assets/images/screenshots/darkmode.jpeg)

Tampilan aplikasi ketika Dark Mode diaktifkan.

---

### 5. Edit Catatan

![Edit](assets/images/screenshots/edit.jpeg)

Pengguna dapat memperbarui isi catatan yang telah dibuat.

---

### 6. Cache API

![Cache API](assets/images/screenshots/cacheAPI.jpeg)

Data API disimpan menggunakan AsyncStorage sehingga dapat digunakan kembali tanpa melakukan proses fetch ulang.

---

### 7. Bukti Persistensi (Sebelum Aplikasi Ditutup)

![Before Close](assets/images/screenshots/beforeClose.jpeg)

---

### 8. Bukti Persistensi (Setelah Aplikasi Dibuka Kembali)

![After Open](assets/images/screenshots/afterOpen.jpeg)

Data tetap tersedia setelah aplikasi ditutup dan dibuka kembali. Hal ini membuktikan bahwa mekanisme persistensi menggunakan AsyncStorage berjalan dengan baik.

---

## Cara Menjalankan Aplikasi

### Clone repository

```bash
git clone https://github.com/ruthangll/NoteKeeper-Pro.git
```

### Masuk ke folder project

```bash
cd NoteKeeper-Pro
```

### Install dependency

```bash
npm install
```

### Jalankan aplikasi

```bash
npx expo start
```

Kemudian scan QR Code menggunakan aplikasi **Expo Go** pada perangkat Android maupun iOS.

---

## Tech Stack

- React Native
- Expo
- TypeScript
- AsyncStorage
- Expo SecureStore

---

## Expo Snack

Tambahkan link Expo Snack apabila diperlukan.

---

## GitHub Repository

https://github.com/ruthangll/NoteKeeper-Pro
