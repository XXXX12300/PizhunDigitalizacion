document.addEventListener('DOMContentLoaded', () => {
    // PRELOADER & ASSET LOADING
    document.body.classList.add('loading');
    const preloader = document.getElementById('preloader');
    const cube = document.querySelector('.cube');
    const cubeFaces = document.querySelectorAll('.cube div');

    const assetsToLoad = [];
    // Only wait for images
    document.querySelectorAll('img').forEach(img => assetsToLoad.push({ type: 'img', url: img.src }));
    
    // Asynchronously preload videos in background (don't block the site load)
    document.querySelectorAll('video').forEach(video => {
        const source = video.querySelector('source');
        if (source) {
            const bgVideo = document.createElement('video');
            bgVideo.preload = 'metadata'; // Load metadata, optionally 'auto'
            bgVideo.src = source.src;
        }
    });

    let loadedCount = 0;
    const totalAssets = assetsToLoad.length;
    let appStarted = false;

    // Fallback: Max 2 seconds for images
    const loadingTimeout = setTimeout(() => {
        startApp();
    }, 2000);

    function startApp() {
        if (appStarted) return;
        appStarted = true;
        clearTimeout(loadingTimeout);

        // Simpler exit animation for the GIF preloader
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline({
                onComplete: () => {
                    document.body.classList.remove('loading');
                    document.body.style.opacity = "1"; // Actively show the body
                    preloader.style.display = 'none';
                    initCursor();

                    // Show hero elements immediately after preloader finishes
                    const heroItems = document.querySelectorAll('.hero .stagger-reveal');
                    heroItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 200);
                    });
                }
            });

            tl.to(preloader, {
                duration: 1.2,
                xPercent: 100,
                opacity: 0,
                ease: "power4.inOut"
            });
        } else {
            // Fallback if GSAP fails to load
            document.body.classList.remove('loading');
            document.body.style.opacity = "1"; // Actively show the body
            preloader.style.display = 'none';
            initCursor();
            const heroItems = document.querySelectorAll('.hero .stagger-reveal');
            heroItems.forEach(item => item.classList.add('visible'));
        }
    }

    // Fast-path if no images to load
    if (totalAssets === 0) {
        startApp();
    } else {
        function assetLoaded() {
            loadedCount++;
            if (loadedCount >= totalAssets) {
                startApp();
            }
        }

        assetsToLoad.forEach(asset => {
            const img = new Image();
            img.onload = assetLoaded;
            img.onerror = assetLoaded; // Continue even if an image fails
            img.src = asset.url;
        });
    }

    // CUSTOM CURSOR LOGIC
    function initCursor() {
        const cursor = document.querySelector('.cursor');
        cursor.style.display = 'block';

        const cursorX = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3.out" });
        const cursorY = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3.out" });

        window.addEventListener('mousemove', (e) => {
            cursorX(e.clientX);
            cursorY(e.clientY);
        });

        // Hover behavior
        const interactiveElements = document.querySelectorAll('a, button, .product-card, summary, .gallery-dot, .size-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (el.classList.contains('product-card')) {
                    // Small circle on products
                    gsap.to(cursor, { scale: 0.5, duration: 0.3 });
                } else {
                    // Larger on other links
                    gsap.to(cursor, { scale: 2.5, duration: 0.3 });
                }
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, duration: 0.3 });
            });
        });

        // Dynamic Backlight Logic (Fluid Magnetic Focus)
        const spotlightElements = document.querySelectorAll('.product-card, .feature-card, .highlight-card, .download-card, .review-card, .newsletter-container, .modal-content, .btn-hero, .btn-add-cart, .btn-view-3d, .btn-explore, .btn-download-android, .btn-subscribe, .nav-item, .logo-container, .links-column a, .btn-confirm-download, .btn-cancel-download');
        spotlightElements.forEach(el => el.classList.add('spotlight-border'));

        window.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            // Fluid Backlight Focus (Targeted only to current element)
            const activeEl = document.querySelector('.spotlight-border:hover');

            if (activeEl) {
                const rect = activeEl.getBoundingClientRect();
                const targetX = x - rect.left;
                const targetY = y - rect.top;

                // Sluggish, premium follow effect
                gsap.to(activeEl, {
                    '--mouse-x': `${targetX}px`,
                    '--mouse-y': `${targetY}px`,
                    duration: 1.2,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }
        });

        // View Router Logic
        window.switchView = function (viewId) {
            const views = document.querySelectorAll('.view-section');
            const navItems = document.querySelectorAll('.nav-item');

            views.forEach(v => v.classList.remove('active'));
            navItems.forEach(n => n.classList.remove('active'));

            const targetView = document.getElementById(viewId);
            if (targetView) {
                targetView.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // Highlight nav item
            const activeNav = document.querySelector(`[onclick="switchView('${viewId}')"]`);
            if (activeNav) activeNav.classList.add('active');
        };
    }

    // Rest of the existing logic (Intersections, Modals, etc.)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('products-grid')) {
                    const items = entry.target.querySelectorAll('.product-card');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 150);
                    });
                } else if (entry.target.classList.contains('app-container')) {
                    entry.target.classList.add('visible');
                    const reveals = entry.target.querySelectorAll('.stagger-reveal');
                    reveals.forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('visible');
                        }, index * 200);
                    });
                } else {
                    entry.target.classList.add('visible');
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll, .products-grid, .app-container, .brand-ethos, .features-grid-section, .newsletter-section').forEach(el => {
        observer.observe(el);
    });

    // Custom smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Parallax effect on hero title
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            heroTitle.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroTitle.style.opacity = 1 - (scrolled / 700);
        }
    });

    // Product Data
    const productData = {
        'cap': {
            name: 'PZH-01 CORE CAP',
            category: 'ACCESSORIES',
            price: '34.99€',
            desc: 'The foundation of the PIZHUN headwear line. Crafted from high-density 400GSM twill with precision-embroidered logo. Engineered for a perfect structural fit.',
            image: 'img/cap.png',
            images: [
                'img/cap.png',
                'img/robot cap gif to image.gif'
            ],
            specs: [
                '100% Cotton Twill',
                'Adjustable Metal Buckle',
                '6-Panel Construction',
                'Reinforced Peak'
            ],
            hasSizes: false
        },
        'jacket': {
            name: 'TX-SHELL TECH JACKET',
            category: 'OUTERWEAR',
            price: '124.00€',
            desc: 'A fusion of futuristic aesthetics and utilitarian function. Featuring water-repellent membrane technology and integrated tactical utility pockets.',
            image: 'img/jacket.png',
            images: [
                'img/jacket.png',
                'https://i.ibb.co/mrnNT1KK/49f52c11-6844-46a7-a358-85b242c89bda.png',
                'https://i.ibb.co/bj96T5Bx/0e4043d2-3ae0-422b-84c3-17742a3dc4f1.png'
            ],
            specs: [
                'Poly-Membrane Shell',
                'Internal Mesh Lined',
                'YKK Waterproof Zips',
                'Laser-cut Details'
            ],
            hasSizes: true
        },
        'figure': {
            name: 'MK-I ART TOY',
            category: 'COLLECTIBLES',
            price: '45.00€',
            desc: 'The official mascot of the PIZHUN core. MK-I is a limited edition designer figure, blending minimalist geometry with high-gloss metallic accents.',
            image: 'img/figure.png',
            images: [
                'img/figure.png'
            ],
            specs: [
                'High-grade Vinyl',
                'Metallic Finish',
                'Serialized Base',
                'Hand-polished surface'
            ],
            hasSizes: false
        },
        'tshirt': {
            name: 'LOGO-Q PREMIUM TEE',
            category: 'ESSENTIALS',
            price: '39.00€',
            desc: 'Heavyweight organic cotton jersey with a structured oversized drape. Features a localized high-density print of the PIZHUN emblem.',
            image: 'img/tshirt.png',
            images: [
                'img/tshirt.png',
                'img/tshirt2.png'
            ],
            specs: [
                '280GSM Heavy Cotton',
                'Dropped Shoulder Fit',
                'Garment Washed',
                'Ribbed Crewneck'
            ],
            hasSizes: true
        }
    };

    // Modal Logic
    const modal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close-modal');

    function openProductModal(productId) {
        const data = productData[productId];
        if (data) {
            const modalImg = document.getElementById('modal-img');
            modalImg.src = data.image;
            document.getElementById('modal-category').textContent = data.category;
            document.getElementById('modal-name').textContent = data.name;
            document.getElementById('modal-desc').textContent = data.desc;
            document.getElementById('modal-price').textContent = data.price;

            // Initialize Gallery
            initModalGallery(data.images);

            // Conditionally show/hide sizing
            const sizeSelectorList = document.querySelector('.size-selector-container');
            if (sizeSelectorList) {
                if (data.hasSizes) {
                    sizeSelectorList.style.display = 'block';
                } else {
                    sizeSelectorList.style.display = 'none';
                }
            }

            // Update Specs
            const specsContainer = document.querySelector('.detail-content ul');
            if (specsContainer && data.specs) {
                specsContainer.innerHTML = '';
                data.specs.forEach(spec => {
                    const li = document.createElement('li');
                    li.textContent = spec;
                    specsContainer.appendChild(li);
                });
            }

            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?p=' + productId;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    }
    window.openProductModal = openProductModal; // expose globally for chatbot

    function initModalGallery(images) {
        const dotsContainer = document.querySelector('.gallery-dots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        if (images.length <= 1) {
            dotsContainer.style.display = 'none';
            return;
        }

        dotsContainer.style.display = 'flex';
        images.forEach((imgUrl, index) => {
            const dot = document.createElement('span');
            dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;

            // Add cursor hover effect
            dot.addEventListener('mouseenter', () => {
                const cursor = document.querySelector('.cursor');
                if (cursor) gsap.to(cursor, { scale: 2.5, duration: 0.3 });
            });
            dot.addEventListener('mouseleave', () => {
                const cursor = document.querySelector('.cursor');
                if (cursor) gsap.to(cursor, { scale: 1, duration: 0.3 });
            });

            dot.addEventListener('click', () => {
                document.getElementById('modal-img').src = imgUrl;
                document.querySelectorAll('.gallery-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
            dotsContainer.appendChild(dot);
        });
    }

    function hideModal() {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
        const clearUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: clearUrl }, '', clearUrl);
    }

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = card.getAttribute('data-product');
            openProductModal(productId);
        });
    });

    if (closeModal) closeModal.addEventListener('click', hideModal);
    window.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    // Download Modal Logic
    const downloadModal = document.getElementById('download-modal');
    const downloadBtn = document.getElementById('download-apk-btn');
    const cancelDownloadBtn = document.getElementById('cancel-download');
    const closeDownloadModalBtn = document.querySelector('.close-download-modal');

    function openDownloadModal() {
        if (downloadModal) {
            downloadModal.style.display = 'flex';
            setTimeout(() => downloadModal.classList.add('active'), 10);
        }
    }

    function hideDownloadModal() {
        if (downloadModal) {
            downloadModal.classList.remove('active');
            setTimeout(() => { downloadModal.style.display = 'none'; }, 400);
        }
    }

    if (downloadBtn) downloadBtn.addEventListener('click', (e) => { e.preventDefault(); openDownloadModal(); });
    if (cancelDownloadBtn) cancelDownloadBtn.addEventListener('click', hideDownloadModal);
    if (closeDownloadModalBtn) closeDownloadModalBtn.addEventListener('click', hideDownloadModal);
    if (downloadModal) downloadModal.addEventListener('click', (e) => { if (e.target === downloadModal) hideDownloadModal(); });

    // Generate QR for APK download dynamically (so it points to correct origin)
    const qrImg = document.getElementById('download-qr');
    if (qrImg) {
        try {
            const apkPath = '/app/pizhun-app.apk';
            const fullUrl = window.location.origin + apkPath;
            const qrApi = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(fullUrl);
            qrImg.src = qrApi;
        } catch (e) {
            // fallback: hide QR if something fails
            qrImg.style.display = 'none';
        }
    }

    // Video Hover Logic
    document.querySelectorAll('.product-card').forEach(card => {
        const video = card.querySelector('.product-video');
        if (video) {
            card.addEventListener('mouseenter', () => {
                video.currentTime = 0;
                video.play().catch(e => console.log('Video play failed:', e));
            });
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });

    const viewIn3DBtn = document.getElementById('btn-view-3d');
    if (viewIn3DBtn) {
        viewIn3DBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal();
            setTimeout(() => { openDownloadModal(); }, 500);
        });
    }

    // Copy Link Logic
    const copyLinkBtn = document.getElementById('btn-copy-link');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const urlToCopy = window.location.href;
            
            navigator.clipboard.writeText(urlToCopy).then(() => {
                const originalHTML = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>';
                copyLinkBtn.style.transform = "scale(1.2)";
                
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalHTML;
                    copyLinkBtn.style.transform = "";
                }, 1500);
            }).catch(err => {
                console.error('Error al copiar: ', err);
            });
        });
    }

    // Size Selector Logic
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Mobile Nav Active State
    const navItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Handle persistent product links on load
    const urlParams = new URLSearchParams(window.location.search);
    const productIdParam = urlParams.get('p');
    if (productIdParam && productData[productIdParam]) {
        // Automatically switch to the shop view
        if (window.switchView) {
            window.switchView('view-shop');
        }
        // Open the corresponding product modal
        openProductModal(productIdParam);
    }
});
