
window.GameData = {
  items: [
    {id:"soap",name:"Sabun",icon:"🧼",price:12000,qty:1,desc:"Kebersihan diri"},
    {id:"toothpaste",name:"Pasta gigi",icon:"🪥",price:10000,qty:1,desc:"Perlengkapan mandi"},
    {id:"notebook",name:"Buku tulis",icon:"📓",price:8000,qty:2,desc:"Catatan pelajaran"},
    {id:"detergent",name:"Deterjen",icon:"🫧",price:10000,qty:1,desc:"Mencuci pakaian"}
  ],

  missions: [
    {id:"save",title:"Penabung Disiplin",desc:"Sisihkan minimal Rp10.000 minggu ini.",kind:"saving",target:10000,reward:35},
    {id:"snack",title:"Tahan Godaan Kantin",desc:"Batasi jajan maksimal Rp10.000.",kind:"snack",target:10000,reward:35},
    {id:"balance",title:"Budget Terkendali",desc:"Gunakan total anggaran maksimal Rp60.000.",kind:"total",target:60000,reward:35},
    {id:"needs",title:"Santri Siap Tempur",desc:"Pastikan kebutuhan penting tetap lengkap.",kind:"needs",target:3,reward:35}
  ],

  tips: [
    "Pisahkan uang kebutuhan sebelum mulai jajan.",
    "Tidak semua ajakan harus diikuti.",
    "Membeli kebutuhan sebelum mendesak bisa mencegah pengeluaran dadakan.",
    "Sisihkan tabungan di awal minggu.",
    "Cari pilihan hemat yang tetap menjaga kebutuhan dasar."
  ],

  events: [
    {
      id:"friend",
      type:"SOSIAL",
      icon:"🧑‍🤝‍🧑",
      title:"Teman Mengajak ke Kantin",
      description:"Beberapa teman mengajak jajan setelah kegiatan. Kamu juga ingin ikut, tetapi masih ada beberapa hari sebelum minggu berganti.",
      choices:[
        {label:"Ikut jajan sederhana",detail:"Nikmati waktu bersama teman.",cost:10000,effect:{mood:2,reputation:1},result:"Kamu ikut berkumpul tanpa menghabiskan terlalu banyak uang."},
        {label:"Tolak dengan sopan",detail:"Simpan uang untuk kebutuhan lain.",cost:0,effect:{discipline:2},result:"Kamu memilih menahan diri. Saldo tetap aman."},
        {label:"Ajak berbagi camilan",detail:"Beli satu camilan untuk dibagi.",cost:5000,effect:{mood:1,reputation:2},result:"Kalian berbagi camilan. Pengeluaran tetap terkendali."}
      ]
    },
    {
      id:"book",
      type:"PENDIDIKAN",
      icon:"📚",
      title:"Ada Tugas Mendadak",
      description:"Ustaz memberikan tugas tambahan. Kamu perlu mencetak beberapa lembar materi.",
      choices:[
        {label:"Cetak semua materi",detail:"Tugas selesai dengan nyaman.",cost:12000,effect:{needs:1,discipline:1},result:"Materi siap dan tugasmu lebih mudah dikerjakan."},
        {label:"Pinjam materi teman",detail:"Hemat uang, tetapi harus bergantian.",cost:0,effect:{reputation:1},result:"Kamu meminjam materi teman."}
      ]
    },
    {
      id:"soap",
      type:"KEBUTUHAN",
      icon:"🧴",
      title:"Perlengkapan Mandi Menipis",
      description:"Kamu sadar perlengkapan mandi hampir habis.",
      choices:[
        {label:"Beli perlengkapan sekarang",detail:"Kebutuhan aman.",cost:12000,effect:{needs:2},result:"Perlengkapan mandi kembali tersedia."},
        {label:"Tunda satu minggu",detail:"Saldo tetap tersimpan, kebutuhan berkurang.",cost:0,effect:{needs:-1},result:"Kamu menunda pembelian. Kebutuhan pribadimu jadi kurang terjaga."}
      ]
    },
    {
      id:"laundry",
      type:"KEGIATAN",
      icon:"🧺",
      title:"Jadwal Laundry Padat",
      description:"Pakaian menumpuk sementara jadwal kegiatan sedang padat.",
      choices:[
        {label:"Gunakan jasa laundry",detail:"Hemat waktu.",cost:15000,effect:{mood:1},result:"Pakaian selesai dicuci."},
        {label:"Cuci sendiri",detail:"Hemat uang, butuh tenaga.",cost:0,effect:{discipline:1},result:"Kamu mencuci sendiri dan berhasil menghemat uang."}
      ]
    },
    {
      id:"reward",
      type:"KESEMPATAN",
      icon:"🎁",
      title:"Apresiasi dari Pengurus",
      description:"Kamu membantu merapikan ruang bersama. Pengurus memberi apresiasi kecil.",
      choices:[
        {label:"Terima hadiah",detail:"Tambahan uang saku Rp15.000.",cost:0,gain:15000,effect:{reputation:2,mood:1},result:"Kamu mendapat tambahan uang saku."},
        {label:"Minta dicatat sebagai poin",detail:"Reputasi meningkat.",cost:0,effect:{reputation:3,discipline:1},result:"Poin kedisiplinanmu bertambah."}
      ]
    },
    {
      id:"lost",
      type:"TANTANGAN",
      icon:"🧩",
      title:"Ada Pengeluaran Tak Terduga",
      description:"Sebuah perlengkapan kecil rusak dan perlu diganti.",
      choices:[
        {label:"Beli pengganti baru",detail:"Masalah langsung selesai.",cost:18000,effect:{needs:1},result:"Perlengkapan pengganti tersedia."},
        {label:"Perbaiki yang lama",detail:"Lebih hemat.",cost:5000,effect:{discipline:1},result:"Kamu berhasil memperbaikinya."}
      ]
    },
    {
      id:"family",
      type:"KELUARGA",
      icon:"📦",
      title:"Kiriman dari Rumah",
      description:"Keluarga mengirim sedikit uang tambahan.",
      choices:[
        {label:"Terima dan simpan",detail:"Tambahan uang Rp20.000.",cost:0,gain:20000,effect:{mood:1},result:"Kiriman diterima. Saldo bertambah."},
        {label:"Gunakan untuk kebutuhan",detail:"Beli kebutuhan Rp10.000 dan simpan sisanya.",cost:10000,gain:20000,effect:{needs:1,mood:1},result:"Kebutuhan kecil terpenuhi dan masih ada uang tambahan."}
      ]
    },
    {
      id:"competition",
      type:"KESEMPATAN",
      icon:"🏅",
      title:"Kesempatan Ikut Lomba",
      description:"Ada lomba antarkelas. Kamu tertarik ikut, tetapi perlu biaya persiapan.",
      choices:[
        {label:"Ikut lomba",detail:"Biaya Rp10.000 dan mendapat pengalaman.",cost:10000,effect:{reputation:2,xp:10},result:"Kamu mendapat pengalaman baru."},
        {label:"Lewatkan dulu",detail:"Fokus pada kebutuhan minggu ini.",cost:0,effect:{discipline:1},result:"Kamu memilih fokus pada prioritas."}
      ]
    }
  ]
};
