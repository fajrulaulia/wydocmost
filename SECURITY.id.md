# Kebijakan Keamanan

Kebijakan keamanan ini tersedia dalam 10 bahasa. Bahasa Inggris adalah versi acuan; terjemahan disediakan untuk kemudahan. Jika terdapat perbedaan antara terjemahan dan teks Bahasa Inggris, versi Bahasa Inggris yang berlaku.

[English](SECURITY.md) | Bahasa Indonesia | [简体中文](SECURITY.zh-CN.md) | [हिन्दी](SECURITY.hi.md) | [Español](SECURITY.es.md) | [Français](SECURITY.fr.md) | [العربية](SECURITY.ar.md) | [বাংলা](SECURITY.bn.md) | [Português](SECURITY.pt-BR.md) | [Русский](SECURITY.ru.md)

## Versi yang didukung

Hanya versi `wydocmost` terbaru yang dipublikasikan yang menerima perbaikan keamanan. Versi lama tidak lagi didukung; perbarui ke rilis terbaru sebelum melaporkan masalah keamanan.

CLI memerlukan Node.js 20 atau yang lebih baru. CLI terhubung ke instance Docmost menggunakan HTTP API instance tersebut. Kompatibilitas dengan versi Docmost dapat berbeda; sertakan versi Docmost dan detail deployment saat membuat laporan, tetapi jangan sertakan kredensial atau token sesi.

## Melaporkan kerentanan

Laporkan dugaan kerentanan secara privat kepada pemelihara project. Jika project ini di-host di GitHub dan pelaporan kerentanan privat diaktifkan, gunakan fitur **Report a vulnerability** pada repositori. Jika tidak, gunakan kanal kontak privat yang dicantumkan pemelihara. Jangan memublikasikan detail eksploit, kredensial, atau token dalam issue atau diskusi publik.

Sertakan versi paket yang terdampak, versi Node.js, versi Docmost, dampak, dan langkah reproduksi. Samarkan nama host atau informasi identitas lain jika sensitif. Pemelihara akan mengonfirmasi laporan dan berkoordinasi dengan pelapor mengenai perbaikan dan jadwal pengungkapan.

## Kredensial lokal

`wydocmost login` menawarkan keychain sistem operasi atau file JSON untuk menyimpan token sesi Docmost. Penyimpanan keychain dipilih secara default. Jika penyimpanan kredensial sistem tidak dapat menyimpan token, CLI akan memberi peringatan dan beralih ke JSON. File JSON bernama `credentials.json` di dalam direktori kredensial yang dikonfigurasi. Lokasi default-nya adalah `~/.config/wydocmost/credentials.json`; `XDG_CONFIG_HOME`, `--config-dir`, atau `WYDOCMOST_CONFIG_DIR` dapat digunakan untuk memilih lokasi lain. CLI meminta izin file `0600` dan membuat direktori kredensial baru dengan izin `0700` jika didukung sistem operasi. Dengan penyimpanan keychain, file JSON hanya berisi metadata untuk menemukan entri keychain, bukan token. Jaga direktori kredensial tetap privat, terutama jika memilih lokasi kustom. Kata sandi tidak disimpan.

Jika token mungkin telah terekspos, cabut sesi dari Docmost jika tersedia, hapus file kredensial lokal, lalu jalankan `wydocmost login` untuk menyimpan sesi baru.

Jangan commit `credentials.json`, file environment, atau rahasia lainnya. Repositori mengabaikan nama file kredensial dan environment yang umum. Paket npm menyertakan README, lisensi, dokumen kebijakan keamanan, manifest paket, dan file CLI hasil kompilasi; kredensial lokal tidak disertakan.

## Pelindungan data pribadi di Indonesia (UU PDP)

Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (**UU PDP**) berstatus berlaku. Lihat [catatan peraturan resmi](https://peraturan.go.id/id/uu-no-27-tahun-2022) atau [naskah undang-undang](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022).

`wydocmost` menyimpan kredensial sesi Docmost secara lokal dan mengirim permintaan terautentikasi ke instance Docmost yang dipilih pengguna. Jaga direktori kredensial tetap privat dan jangan membagikan token sesi. Organisasi dan individu yang menggunakan CLI perlu menilai kegiatan pemrosesan data serta tanggung jawab mereka sendiri berdasarkan UU PDP dan ketentuan lain yang berlaku. Bagian ini hanya memberikan rujukan; ini bukan pernyataan bahwa deployment atau penggunaan CLI tertentu telah mematuhi hukum.

## Lisensi

Project ini didistribusikan berdasarkan [Lisensi MIT](LICENSE).
