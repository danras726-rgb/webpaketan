/* ==========================================================================
   Formulir pemesanan — kalkulasi live & pesan WhatsApp
   Semua angka diambil dari calculateQuote() di data.js
   ========================================================================== */

(function () {
    'use strict';

    const form = document.getElementById('orderForm');
    if (!form) return;

    const select = document.getElementById('form-paket');
    const kotakanCheck = document.getElementById('form-kotakan-check');
    const kotakanDetails = document.getElementById('kotakan-details');
    const jumlahKotak = document.getElementById('form-jumlah-kotak');
    const tusukPerKotak = document.getElementById('form-tusuk-per-kotak');
    const estimateBox = document.getElementById('live-estimate');

    const fillPackages = () => {
        if (!select) return;
        const current = select.value;
        select.innerHTML = '';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = '-- Pilih Paket --';
        select.appendChild(placeholder);

        CAKSABAR.packages.forEach((pkg) => {
            const option = document.createElement('option');
            option.value = pkg.id;
            option.textContent = pkg.price
                ? pkg.name + ' — ' + formatRupiah(pkg.price)
                : pkg.name;
            select.appendChild(option);
        });

        if (current && findPackage(current)) select.value = current;
    };

    const readQuote = () =>
        calculateQuote({
            packageId: select.value,
            kotakanEnabled: kotakanCheck.checked,
            boxCount: jumlahKotak.value
        });

    const toggleKotakan = () => {
        kotakanDetails.classList.toggle('hidden', !kotakanCheck.checked);
        if (kotakanCheck.checked) {
            kotakanDetails.classList.add('fade-up');
        }
        updateEstimate();
    };

    const bump = (el) => {
        if (!el) return;
        el.classList.remove('animate-bump');
        void el.offsetWidth;
        el.classList.add('animate-bump');
    };

    const updateEstimate = () => {
        if (!estimateBox) return;
        const quote = readQuote();
        const rows = estimateBox.querySelector('[data-estimate-rows]');
        const totalEl = estimateBox.querySelector('[data-estimate-total]');
        const noteEl = estimateBox.querySelector('[data-estimate-note]');

        let html = '';
        html +=
            '<div class="flex justify-between gap-4"><span>Paket</span><span class="font-semibold text-clay">' +
            (quote.packageName || 'Belum dipilih') +
            '</span></div>';
        html +=
            '<div class="flex justify-between gap-4"><span>Harga paket</span><span>' +
            quote.baseLabel +
            '</span></div>';

        if (quote.kotakanEnabled) {
            html +=
                '<div class="flex justify-between gap-4"><span>Kotakan (' +
                quote.qty +
                ' × ' +
                quote.perBoxLabel +
                ')</span><span>' +
                quote.kotakanLabel +
                '</span></div>';
        }

        rows.innerHTML = html;

        const nextTotal = quote.hasFixedPrice
            ? quote.totalLabel
            : 'Menunggu konfirmasi';
        if (totalEl.textContent !== nextTotal) {
            totalEl.textContent = nextTotal;
            bump(totalEl);
        }

        noteEl.textContent = quote.hasFixedPrice
            ? 'Total ini yang akan dikirim ke WhatsApp.'
            : 'Harga akhir dikonfirmasi admin di WhatsApp.';
    };

    const applyQuery = () => {
        const params = new URLSearchParams(window.location.search);
        const paket = params.get('paket');
        const kotakan = params.get('kotakan');

        if (paket && findPackage(paket)) {
            select.value = paket;
        }

        if (kotakan === '1' || kotakan === 'true' || paket === 'kotakan') {
            kotakanCheck.checked = true;
            if (!select.value) select.value = 'konsultasi';
        }
    };

    const buildWhatsAppText = (quote) => {
        const nama = document.getElementById('form-nama').value.trim();
        const pesan = document.getElementById('form-pesan').value.trim();
        const tusuk = tusukPerKotak.value.trim();

        let text =
            'Halo CAKSABAR, saya ingin memesan paket sate/gule:\n\n' +
            '*Nama:* ' +
            (nama || '-') +
            '\n' +
            '*Paket:* ' +
            (quote.packageName || '-') +
            '\n' +
            '*Harga Paket:* ' +
            quote.baseLabel +
            '\n';

        if (quote.kotakanEnabled) {
            text += '*Tambahan Layanan:* Kotakan\n';
            text += '*Kebutuhan:* ' + quote.qty + ' Kotak\n';
            text += '*Isi:* ' + (tusuk || '-') + ' tusuk/kotak\n';
            text +=
                '*Biaya Kotakan:* ' +
                quote.kotakanLabel +
                ' (' +
                quote.qty +
                ' x ' +
                quote.perBoxLabel +
                ')\n';
        }

        if (quote.hasFixedPrice) {
            text += '\n*--------------------------------*\n';
            text += '*TOTAL ESTIMASI: ' + quote.totalLabel + '*\n';
            text += '*--------------------------------*\n';
        } else {
            text += '\n*TOTAL ESTIMASI:* Menunggu Konfirmasi Admin\n';
        }

        text += '\n*Catatan:* ' + (pesan || '-') + '\n\nTerima kasih.';
        return text;
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const quote = readQuote();
        if (!quote.pkg) {
            select.focus();
            return;
        }
        if (quote.kotakanEnabled && quote.qty < 1) {
            jumlahKotak.focus();
            return;
        }

        const url =
            'https://wa.me/' +
            CAKSABAR.phone +
            '?text=' +
            encodeURIComponent(buildWhatsAppText(quote));
        window.open(url, '_blank');
    });

    fillPackages();
    applyQuery();
    toggleKotakan();

    select.addEventListener('change', updateEstimate);
    kotakanCheck.addEventListener('change', toggleKotakan);
    jumlahKotak.addEventListener('input', updateEstimate);
    tusukPerKotak.addEventListener('input', updateEstimate);
})();
