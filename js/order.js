/* ==========================================================================
   Formulir pemesanan — kalkulasi live & pesan WhatsApp
   Semua angka diambil dari calculateQuote() di data.js
   ========================================================================== */

(function () {
    'use strict';

    const form = document.getElementById('orderForm');
    if (!form) return;

    const select = document.getElementById('form-paket');
    const paketTrigger = document.getElementById('btn-pilih-paket');
    const paketTriggerText = document.getElementById('paket-trigger-text');
    const paketModal = document.getElementById('paket-modal');
    const paketTableBody = document.getElementById('paket-table-body');
    const ekorWrap = document.getElementById('ekor-wrap');
    const jumlahEkor = document.getElementById('form-jumlah-ekor');
    const ekorMinus = document.getElementById('ekor-minus');
    const ekorPlus = document.getElementById('ekor-plus');
    const kotakanCheck = document.getElementById('form-kotakan-check');
    const kotakanDetails = document.getElementById('kotakan-details');
    const jumlahKotak = document.getElementById('form-jumlah-kotak');
    const tusukPerKotak = document.getElementById('form-tusuk-per-kotak');
    const aqiqahCheck = document.getElementById('form-aqiqah-check');
    const aqiqahDetails = document.getElementById('aqiqah-details');
    const namaAqiqah = document.getElementById('form-nama-aqiqah');
    const estimateBox = document.getElementById('live-estimate');

    const syncPaketTrigger = () => {
        if (!paketTriggerText) return;
        const pkg = findPackage(select.value);
        paketTriggerText.textContent = pkg
            ? pkg.name + (pkg.price ? ' — ' + formatRupiah(pkg.price) : '')
            : 'Pilih paket';
        if (paketTableBody) {
            paketTableBody.querySelectorAll('tr').forEach((row) => {
                row.classList.toggle('is-selected', row.dataset.id === select.value);
            });
        }
    };

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

        if (paketTableBody) paketTableBody.innerHTML = '';

        CAKSABAR.packages.forEach((pkg) => {
            const option = document.createElement('option');
            option.value = pkg.id;
            option.textContent = pkg.price
                ? pkg.name + ' — ' + formatRupiah(pkg.price)
                : pkg.name;
            select.appendChild(option);

            if (!paketTableBody) return;
            const note = pkg.tagline || pkg.note || pkg.description || 'Konsultasi kebutuhan acara';
            const row = document.createElement('tr');
            row.dataset.id = pkg.id;
            row.innerHTML =
                '<td><span class="pkg-name">' +
                pkg.name +
                (pkg.popular ? ' · unggulan' : '') +
                '</span><span class="pkg-note-mobile">' +
                note +
                '</span></td>' +
                '<td class="pkg-price">' +
                priceLabel(pkg) +
                '</td>' +
                '<td class="pkg-note">' +
                note +
                '</td>';
            row.addEventListener('click', () => {
                select.value = pkg.id;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                closePaketModal();
            });
            paketTableBody.appendChild(row);
        });

        if (current && findPackage(current)) select.value = current;
        syncPaketTrigger();
    };

    const openPaketModal = () => {
        if (!paketModal) return;
        paketModal.hidden = false;
        if (paketTrigger) paketTrigger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        syncPaketTrigger();
    };

    const closePaketModal = () => {
        if (!paketModal) return;
        paketModal.hidden = true;
        if (paketTrigger) paketTrigger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    const setEkor = (next) => {
        if (!jumlahEkor) return;
        const value = Math.max(1, parseInt(next, 10) || 1);
        jumlahEkor.value = String(value);
        updateEstimate();
    };

    const readQuote = () =>
        calculateQuote({
            packageId: select.value,
            kotakanEnabled: kotakanCheck.checked,
            boxCount: jumlahKotak.value,
            ekorCount: jumlahEkor ? jumlahEkor.value : 1
        });

    const toggleEkor = () => {
        if (!ekorWrap) return;
        const pkg = findPackage(select.value);
        const show = Boolean(pkg && pkg.price);
        ekorWrap.classList.toggle('hidden', !show);
        if (show && jumlahEkor && (!jumlahEkor.value || Number(jumlahEkor.value) < 1)) {
            jumlahEkor.value = '1';
        }
    };

    const toggleKotakan = () => {
        kotakanDetails.classList.toggle('hidden', !kotakanCheck.checked);
        if (kotakanCheck.checked) {
            kotakanDetails.classList.add('fade-up');
        }
        updateEstimate();
    };

    const toggleAqiqah = () => {
        if (!aqiqahCheck || !aqiqahDetails) return;
        aqiqahDetails.classList.toggle('hidden', !aqiqahCheck.checked);
        if (aqiqahCheck.checked) {
            aqiqahDetails.classList.add('fade-up');
        }
    };

    const bump = (el) => {
        if (!el) return;
        el.classList.remove('animate-bump');
        void el.offsetWidth;
        el.classList.add('animate-bump');
    };

    const updateEstimate = () => {
        if (!estimateBox) return;
        toggleEkor();
        const quote = readQuote();
        const rows = estimateBox.querySelector('[data-estimate-rows]');
        const totalEl = estimateBox.querySelector('[data-estimate-total]');
        const noteEl = estimateBox.querySelector('[data-estimate-note]');

        let html = '';
        html +=
            '<div class="flex justify-between gap-4"><span>Paket</span><span class="font-semibold text-clay">' +
            (quote.packageName || 'Belum dipilih') +
            '</span></div>';

        if (quote.hasFixedPrice) {
            html +=
                '<div class="flex justify-between gap-4"><span>Harga per ekor</span><span>' +
                quote.baseLabel +
                '</span></div>';
            html +=
                '<div class="flex justify-between gap-4"><span>Paket × ' +
                quote.ekor +
                ' ekor</span><span>' +
                quote.packageTotalLabel +
                '</span></div>';
        } else {
            html +=
                '<div class="flex justify-between gap-4"><span>Harga paket</span><span>' +
                quote.baseLabel +
                '</span></div>';
        }

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

    const formatTanggalId = (value) => {
        if (!value) return '';
        const parts = value.split('-');
        if (parts.length !== 3) return value;
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    };

    const buildWhatsAppText = (quote) => {
        const nama = document.getElementById('form-nama').value.trim();
        const pesan = document.getElementById('form-pesan').value.trim();
        const tanggalEl = document.getElementById('form-tanggal');
        const jamEl = document.getElementById('form-jam');
        const tanggal = tanggalEl ? formatTanggalId(tanggalEl.value.trim()) : '';
        const jam = jamEl ? jamEl.value.trim() : '';
        const tusuk = tusukPerKotak.value.trim();
        const aqiqahNama = namaAqiqah ? namaAqiqah.value.trim() : '';

        let text =
            'Halo CAKSABAR, saya ingin memesan paket sate/gule:\n\n' +
            '*Nama:* ' +
            (nama || '-') +
            '\n' +
            '*Paket:* ' +
            (quote.packageName || '-') +
            '\n';

        if (quote.hasFixedPrice) {
            text += '*Jumlah:* ' + quote.ekor + ' ekor\n';
            text += '*Harga per ekor:* ' + quote.baseLabel + '\n';
            text += '*Subtotal paket:* ' + quote.packageTotalLabel + '\n';
        } else {
            text += '*Harga Paket:* ' + quote.baseLabel + '\n';
        }

        if (aqiqahCheck && aqiqahCheck.checked) {
            text += '*Acara:* Aqiqah\n';
            text += '*Nama yang diaqiqah:* ' + (aqiqahNama || '-') + '\n';
        }

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

        text += '\n';
        if (tanggal) text += '*Tanggal dikirim:* ' + tanggal + '\n';
        if (jam) text += '*Jam pengiriman:* ' + jam + '\n';
        text += '*Catatan:* ' + (pesan || '-') + '\n\nTerima kasih.';
        return text;
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const quote = readQuote();
        if (!quote.pkg) {
            select.focus();
            return;
        }
        if (quote.hasFixedPrice && quote.ekor < 1) {
            jumlahEkor.focus();
            return;
        }
        if (quote.kotakanEnabled && quote.qty < 1) {
            jumlahKotak.focus();
            return;
        }
        if (aqiqahCheck && aqiqahCheck.checked && namaAqiqah && !namaAqiqah.value.trim()) {
            namaAqiqah.focus();
            return;
        }

        const url =
            'https://wa.me/' +
            CAKSABAR.phone +
            '?text=' +
            encodeURIComponent(buildWhatsAppText(quote));
        window.open(url, '_blank');
    });

    const rekeningPanel = document.getElementById('rekening-panel');
    const rekeningList = document.getElementById('rekening-list');

    const copyText = (value) => {
        document.body.dataset.allowCopy = '1';
        const done = (ok, err) => {
            delete document.body.dataset.allowCopy;
            if (ok) return Promise.resolve();
            return Promise.reject(err || new Error('copy failed'));
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(value).then(
                () => done(true),
                () => {
                    try {
                        const input = document.createElement('textarea');
                        input.value = value;
                        input.setAttribute('readonly', '');
                        input.style.position = 'fixed';
                        input.style.left = '-9999px';
                        document.body.appendChild(input);
                        input.select();
                        const copied = document.execCommand('copy');
                        document.body.removeChild(input);
                        return copied ? done(true) : done(false);
                    } catch (err) {
                        return done(false, err);
                    }
                }
            );
        }
        return new Promise((resolve, reject) => {
            const input = document.createElement('textarea');
            input.value = value;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.left = '-9999px';
            document.body.appendChild(input);
            input.select();
            try {
                const copied = document.execCommand('copy');
                document.body.removeChild(input);
                if (copied) resolve();
                else reject(new Error('copy failed'));
            } catch (err) {
                document.body.removeChild(input);
                reject(err);
            } finally {
                delete document.body.dataset.allowCopy;
            }
        });
    };

    const bankLogo = (bank) => {
        if (bank.id === 'bca') {
            return '<span class="bank-logo bank-logo--bca" aria-hidden="true">BCA</span>';
        }
        if (bank.id === 'bsi') {
            return '<span class="bank-logo bank-logo--bsi" aria-hidden="true">BSI</span>';
        }
        return '<span class="bank-logo" aria-hidden="true">' + bank.name + '</span>';
    };

    const renderBanks = () => {
        if (!rekeningList || !CAKSABAR.banks) return;
        rekeningList.innerHTML = '';
        CAKSABAR.banks.forEach((bank) => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'bank-row';
            row.dataset.number = bank.number;
            row.setAttribute('aria-label', 'Salin rekening ' + bank.name + ' ' + bank.number);
            row.innerHTML =
                bankLogo(bank) +
                '<span class="bank-row-meta">' +
                '<span class="bank-row-name">' +
                bank.name +
                '</span>' +
                '<span class="bank-row-number block">' +
                bank.number +
                '</span>' +
                (bank.holder
                    ? '<span class="bank-row-holder block">Atas nama: ' + bank.holder + '</span>'
                    : '') +
                '<span class="bank-row-hint">Klik untuk salin</span>' +
                '</span>';
            row.onclick = function () {
                copyText(bank.number)
                    .then(() => {
                        rekeningList.querySelectorAll('.bank-row').forEach((el) => {
                            el.classList.remove('is-copied');
                            const hint = el.querySelector('.bank-row-hint');
                            if (hint) hint.textContent = 'Klik untuk salin';
                        });
                        row.classList.add('is-copied');
                        const hint = row.querySelector('.bank-row-hint');
                        if (hint) hint.textContent = 'Disalin';
                    })
                    .catch(() => {
                        const hint = row.querySelector('.bank-row-hint');
                        if (hint) hint.textContent = 'Gagal disalin, salin manual';
                    });
            };
            rekeningList.appendChild(row);
        });
    };

    const openRekening = () => {
        if (!rekeningPanel) return;
        rekeningPanel.classList.remove('hidden');
        rekeningPanel.removeAttribute('hidden');
        rekeningPanel.classList.add('is-open');
        rekeningPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const closeRekening = () => {
        if (!rekeningPanel) return;
        rekeningPanel.classList.add('hidden');
        rekeningPanel.setAttribute('hidden', '');
        rekeningPanel.classList.remove('is-open');
        if (!rekeningList) return;
        rekeningList.querySelectorAll('.bank-row').forEach((el) => {
            el.classList.remove('is-copied');
            const hint = el.querySelector('.bank-row-hint');
            if (hint) hint.textContent = 'Klik untuk salin';
        });
    };

    renderBanks();
    window.CaksabarOrder = {
        openRekening: openRekening,
        closeRekening: closeRekening,
        openPaket: openPaketModal,
        closePaket: closePaketModal
    };
    document.body.setAttribute('data-transfer-ready', '1');

    fillPackages();
    applyQuery();
    syncPaketTrigger();
    toggleKotakan();
    toggleAqiqah();
    updateEstimate();

    select.addEventListener('change', () => {
        syncPaketTrigger();
        updateEstimate();
    });
    if (jumlahEkor) {
        jumlahEkor.addEventListener('input', () => setEkor(jumlahEkor.value));
        jumlahEkor.addEventListener('blur', () => setEkor(jumlahEkor.value));
    }
    if (ekorMinus) {
        ekorMinus.addEventListener('click', () =>
            setEkor((parseInt(jumlahEkor.value, 10) || 1) - 1)
        );
    }
    if (ekorPlus) {
        ekorPlus.addEventListener('click', () =>
            setEkor((parseInt(jumlahEkor.value, 10) || 1) + 1)
        );
    }
    if (paketTrigger) paketTrigger.addEventListener('click', openPaketModal);
    if (paketModal) {
        paketModal.querySelectorAll('[data-close-paket]').forEach((el) => {
            el.addEventListener('click', closePaketModal);
        });
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && paketModal && !paketModal.hidden) {
            closePaketModal();
        }
    });
    kotakanCheck.addEventListener('change', toggleKotakan);
    jumlahKotak.addEventListener('input', updateEstimate);
    tusukPerKotak.addEventListener('input', updateEstimate);
    if (aqiqahCheck) aqiqahCheck.addEventListener('change', toggleAqiqah);
})();
