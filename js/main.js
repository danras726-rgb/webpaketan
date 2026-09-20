/* ==========================================================================
   Skrip bersama: ikon, navigasi aktif, injeksi harga, dan animasi
   ========================================================================== */

(function () {
    'use strict';

    const renderIcons = () => {
        if (window.lucide) window.lucide.createIcons();
    };

    /* Harga, telepon, dan tahun selalu dari data.js */
    const injectData = () => {
        document.querySelectorAll('[data-price]').forEach((el) => {
            const pkg = findPackage(el.dataset.price);
            if (pkg) el.textContent = priceLabel(pkg);
        });

        const boxPrice = formatRupiah(CAKSABAR.kotakan.pricePerBox);
        document.querySelectorAll('[data-kotakan-price]').forEach((el) => {
            el.textContent = boxPrice;
        });

        document.querySelectorAll('[data-phone]').forEach((el) => {
            el.textContent = CAKSABAR.phoneDisplay;
        });

        document.querySelectorAll('[data-phone-link]').forEach((el) => {
            el.href = 'https://wa.me/' + CAKSABAR.phone;
        });

        document.querySelectorAll('[data-hours]').forEach((el) => {
            el.textContent = CAKSABAR.hours;
        });

        document.querySelectorAll('[data-address]').forEach((el) => {
            el.textContent = CAKSABAR.addressShort || CAKSABAR.address;
        });

        document.querySelectorAll('[data-year]').forEach((el) => {
            el.textContent = new Date().getFullYear();
        });

        document.querySelectorAll('[data-instagram]').forEach((el) => {
            if (CAKSABAR.instagram) el.href = CAKSABAR.instagram;
        });

        document.querySelectorAll('[data-tiktok]').forEach((el) => {
            if (CAKSABAR.tiktok) el.href = CAKSABAR.tiktok;
        });
    };

    const markActiveNav = () => {
        const page = document.body.dataset.page;
        if (!page) return;
        document.querySelectorAll('[data-nav="' + page + '"]').forEach((el) => {
            el.classList.add('is-active');
            el.classList.remove('text-white/70');
        });
    };

    const stickyHeader = () => {
        const header = document.getElementById('site-header');
        if (!header) return;
        const onScroll = () => {
            header.classList.toggle('shadow-2xl', window.scrollY > 24);
            header.classList.toggle('py-1', window.scrollY > 24);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    };

    const scrollReveal = () => {
        const items = document.querySelectorAll('.reveal');
        if (!items.length) return;

        const show = (el) => {
            const delay = Number(el.dataset.delay || 0);
            setTimeout(() => el.classList.add('is-visible'), delay);
        };

        const inView = (el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
        };

        if (!('IntersectionObserver' in window)) {
            items.forEach(show);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    show(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
        );

        items.forEach((el) => {
            if (inView(el)) {
                show(el);
            } else {
                observer.observe(el);
            }
        });
    };

    const countUp = () => {
        const nodes = document.querySelectorAll('[data-count]');
        if (!nodes.length) return;

        if (!('IntersectionObserver' in window)) {
            nodes.forEach((el) => (el.textContent = el.dataset.count));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const target = Number(el.dataset.count) || 0;
                    const duration = 1400;
                    const start = performance.now();

                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.round(target * eased).toLocaleString('id-ID');
                        if (progress < 1) requestAnimationFrame(tick);
                    };

                    requestAnimationFrame(tick);
                    observer.unobserve(el);
                });
            },
            { threshold: 0.5 }
        );

        nodes.forEach((el) => observer.observe(el));
    };

    const buildSteam = () => {
        document.querySelectorAll('[data-steam]').forEach((host) => {
            const total = Number(host.dataset.steam) || 4;
            for (let i = 0; i < total; i += 1) {
                const puff = document.createElement('span');
                const size = 26 + Math.random() * 26;
                puff.className = 'steam';
                puff.style.width = size + 'px';
                puff.style.height = size + 'px';
                puff.style.left = 22 + Math.random() * 56 + '%';
                puff.style.bottom = '62%';
                puff.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
                host.appendChild(puff);
            }
        });
    };

    const spiceFlakes = () => {
        document.querySelectorAll('[data-spice]').forEach((host) => {
            const colors = ['#F3A318', '#F1AE67', '#773401', '#523523', '#A18476'];
            const total = Number(host.dataset.spice) || 10;
            for (let i = 0; i < total; i += 1) {
                const flake = document.createElement('span');
                const size = 5 + Math.random() * 8;
                flake.className = 'spice-flake';
                flake.style.width = size + 'px';
                flake.style.height = size + 'px';
                flake.style.background = colors[i % colors.length];
                flake.style.left = Math.random() * 100 + '%';
                flake.style.top = Math.random() * 100 + '%';
                flake.style.animationDelay = (Math.random() * 8).toFixed(2) + 's';
                flake.style.animationDuration = 10 + Math.random() * 10 + 's';
                host.appendChild(flake);
            }
        });
    };

    const protectContent = () => {
        const isField = (target) => {
            if (!target) return false;
            const el = target.nodeType === 3 ? target.parentElement : target;
            return Boolean(el && el.closest && el.closest('input, textarea, select, .bank-row, #rekening-panel'));
        };

        const block = (event) => {
            if (document.body.dataset.allowCopy === '1') return;
            if (isField(event.target)) return;
            event.preventDefault();
        };

        document.addEventListener('copy', block);
        document.addEventListener('cut', block);
        document.addEventListener('selectstart', block);
        document.addEventListener('contextmenu', block);
        document.addEventListener('dragstart', block);
    };

    const init = () => {
        injectData();
        markActiveNav();
        stickyHeader();
        scrollReveal();
        countUp();
        protectContent();
        renderIcons();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CaksabarUI = { renderIcons, injectData, scrollReveal };
})();
