document.addEventListener('DOMContentLoaded', () => {

    // 1. Установка года в футере
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 2. Эффект скролла шапки
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Мобильное бургер-меню
    const burger = document.getElementById('burger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (burger && navMenu) {
        burger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // 4. Переключение залов на карте
    const locationCards = document.querySelectorAll('.location-card');
    const mapIframe = document.getElementById('map-iframe');

    locationCards.forEach(card => {
        card.addEventListener('click', () => {
            locationCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const coords = card.getAttribute('data-coords').split(',');
            const lat = coords[0];
            const lon = coords[1];
            mapIframe.src = `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=16&pt=${lon},${lat},pm2rdm`;
        });
    });

    // 5. Фильтрация галереи
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hide');
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // 6. Просмотр фото (Lightbox Modal) с поддержкой стрелок и Escape
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItemsList = Array.from(document.querySelectorAll('.gallery-item'));
    let currentIndex = 0;

    galleryItemsList.forEach((item, index) => {
        item.addEventListener('click', () => {
            const img = item.querySelector('.gallery-img');
            const title = item.querySelector('.gallery-title').textContent;
            currentIndex = index;
            lightboxImg.src = img.src;
            lightboxCaption.textContent = title;
            lightbox.classList.add('active');
        });
    });

    function updateLightbox(index) {
        const item = galleryItemsList[index];
        if (!item) return;
        const img = item.querySelector('.gallery-img');
        const title = item.querySelector('.gallery-title').textContent;
        lightboxImg.src = img.src;
        lightboxCaption.textContent = title;
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            return;
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % galleryItemsList.length;
            updateLightbox(currentIndex);
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + galleryItemsList.length) % galleryItemsList.length;
            updateLightbox(currentIndex);
        }
    });

    // 7. Скролл-анимации и счетчики
    const observerOptions = { root: null, threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const counters = entry.target.querySelectorAll('.stat-number');
                if (counters.length > 0) {
                    counters.forEach(counter => runCounter(counter));
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    function runCounter(counterEl) {
        const target = +counterEl.getAttribute('data-target');
        const duration = 2000;
        const stepTime = 30;
        const steps = duration / stepTime;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counterEl.textContent = target + '+';
                clearInterval(timer);
            } else {
                counterEl.textContent = Math.floor(current) + '+';
            }
        }, stepTime);
    }

    // 8. Форма обратной связи
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const closeSuccess = document.getElementById('closeSuccess');
    const phoneInput = document.getElementById('phone');

    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9+\-()\s]/g, '');
            if (this.value.length > 18) {
                this.value = this.value.slice(0, 18);
            }
        });
    }

    let autoCloseTimer;

    function hideSuccess() {
        if (formSuccess) formSuccess.style.display = 'none';
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
    }

    if (contactForm && phoneInput) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phonePattern = /^\+?[0-9\s\-()]{10,18}$/;
            const phone = phoneInput.value.trim();

            if (!phonePattern.test(phone)) {
                alert('Введите корректный номер телефона. Допустимы цифры, +, -, пробелы и скобки.');
                phoneInput.focus();
                return;
            }

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка…';

            const payload = {
                name: document.getElementById('name').value.trim(),
                phone,
                email: document.getElementById('email').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            try {
                const response = await fetch('/api/send-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Request failed');

                formSuccess.style.display = 'flex';
                contactForm.reset();
                autoCloseTimer = setTimeout(hideSuccess, 5000);
            } catch (error) {
                console.error('Ошибка отправки заявки:', error);
                alert('Не удалось отправить заявку. Попробуйте ещё раз.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    if (closeSuccess) {
        closeSuccess.addEventListener('click', hideSuccess);
    }
});
