/* ==========================================================================
   SUMBER DATA TUNGGAL (single source of truth)
   Semua harga di halaman menu, formulir pemesanan, dan pesan WhatsApp
   dibaca dari berkas ini. Ubah angka di sini -> seluruh situs ikut berubah.
   ========================================================================== */

const CAKSABAR = {
    phone: '6285231413408',
    phoneDisplay: '0852-3141-3408',
    address: 'Jl. Brigjen Katamso No.88-81, Tompokersan, Lumajang, Jawa Timur',
    addressShort: 'Jl. Brigjen Katamso No.88-81',
    addressCity: 'Tompokersan, Lumajang, Jawa Timur',
    mapsUrl: 'https://maps.google.com/?q=Sate+Caksabar+Jl.+Brigjen+Katamso+Lumajang',
    hours: '11.00 - 21.00 WIB',
    hoursNote: 'Warung dapat tutup jika pesanan padat. Simpan nomor kami untuk info terkini.',

    /* Layanan tambahan per kotak. Dipakai di kartu menu, label formulir,
       kalkulasi total, dan rincian pesan WhatsApp. */
    kotakan: {
        label: 'Layanan Kotakan',
        pricePerBox: 12000,
        includes: ['Nasi Putih', 'Sate', 'Gule (Wadah Cepuk)', 'Acar', 'Kerupuk']
    },

    /* Daftar paket. `price: null` berarti harga menyesuaikan konsultasi. */
    packages: [
        {
            id: 'hemat',
            name: 'Paket Hemat',
            group: 'ekoran',
            price: 2250000,
            tagline: 'Pas untuk syukuran keluarga',
            cta: 'Pesan Paket Ini',
            features: ['1 Ekor Kambing', 'Minimal 400 Tusuk Sate', '1 Panci Gule', 'Acar, Sambal & Bumbu']
        },
        {
            id: 'sedang',
            name: 'Paket Sedang',
            group: 'ekoran',
            price: 2500000,
            tagline: 'Favorit untuk aqiqah & tasyakuran',
            popular: true,
            cta: 'Pesan Sekarang',
            features: ['1 Ekor Kambing', 'Minimal 500 Tusuk Sate', '1 Panci Gule', 'Acar, Sambal & Bumbu']
        },
        {
            id: 'besar',
            name: 'Paket Besar',
            group: 'ekoran',
            price: 3000000,
            tagline: 'Untuk hajatan dan acara besar',
            cta: 'Pesan Paket Ini',
            features: ['1 Ekor Kambing', 'Minimal 700 Tusuk Sate', '1 Panci Jumbo / 1.5 Gule', 'Acar, Sambal & Bumbu']
        },
        {
            id: 'jasa-masak',
            name: 'Paket Jasa Masak',
            group: 'ekoran',
            price: 850000,
            tagline: 'Kambing dari Anda, dapur dari kami',
            cta: 'Tanya Jasa Masak',
            features: ['Kambing Bawa Sendiri', 'Porsi Tergantung Kambing', 'Acar, Sambal & Bumbu'],
            note: 'Ada biaya tambahan jika jadi lebih dari 700 tusuk sate'
        },
        {
            id: 'guling-jasa',
            name: 'Jasa Masak Kambing Guling',
            group: 'guling',
            price: 1200000,
            tagline: 'Kambing Sendiri',
            cta: 'Tanya Detail',
            description:
                'Kambing dari Anda kami bakar matang dari dapur, lalu dibawa utuh ke lokasi. Tim kami melayani pengirisan di acara. Termasuk kecap khusus, acar, dan sambal.'
        },
        {
            id: 'guling-kami',
            name: 'Kambing Guling (Dari Kami)',
            group: 'guling',
            price: 2500000,
            tagline: 'Kambing Dari Kami',
            cta: 'Pesan Sekarang',
            description:
                'Kambing pilihan dari kami yang dibakar matang dari dapur, lalu dibawa utuh ke lokasi. Tim kami melayani pengirisan di acara. Termasuk kecap khusus, acar, dan sambal.'
        },
        {
            id: 'konsultasi',
            name: 'Konsultasi Lainnya',
            group: 'lainnya',
            price: null,
            cta: 'Konsultasi Gratis'
        }
    ]
};

/* --------------------------------------------------------------------------
   Helper bersama — format, cari paket, dan hitung kuotasi
   -------------------------------------------------------------------------- */

const formatRupiah = (value) =>
    'Rp ' + Math.round(Number(value) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const findPackage = (nameOrId) =>
    CAKSABAR.packages.find((item) => item.id === nameOrId || item.name === nameOrId) || null;

const priceLabel = (pkg) => (pkg && pkg.price ? formatRupiah(pkg.price) : 'Hubungi Kami');

/**
 * Satu fungsi hitung untuk kartu harga, ringkasan live, dan teks WhatsApp.
 * boxCount hanya dihitung jika layanan kotakan aktif.
 */
const calculateQuote = ({ packageId, kotakanEnabled, boxCount } = {}) => {
    const pkg = findPackage(packageId);
    const basePrice = pkg && pkg.price ? pkg.price : 0;
    const perBox = CAKSABAR.kotakan.pricePerBox;
    const qty = kotakanEnabled ? Math.max(0, parseInt(boxCount, 10) || 0) : 0;
    const kotakanTotal = qty * perBox;

    return {
        pkg,
        packageName: pkg ? pkg.name : '',
        basePrice,
        baseLabel: pkg ? priceLabel(pkg) : '—',
        perBox,
        perBoxLabel: formatRupiah(perBox),
        qty,
        kotakanEnabled: Boolean(kotakanEnabled),
        kotakanTotal,
        kotakanLabel: formatRupiah(kotakanTotal),
        total: basePrice + kotakanTotal,
        totalLabel: formatRupiah(basePrice + kotakanTotal),
        hasFixedPrice: Boolean(pkg && pkg.price)
    };
};
