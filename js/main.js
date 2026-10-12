document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  const year = document.getElementById('year');
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const phone = document.getElementById('phone');

  if (year) year.textContent = new Date().getFullYear();

  const setHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  if (phone) {
    phone.addEventListener('input', () => {
      phone.value = phone.value.replace(/[^0-9+()\-\s]/g, '').slice(0, 18);
    });
  }

  if (form && phone && status) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const number = phone.value.trim();
      if (!/^\+?[0-9\s()\-]{10,18}$/.test(number)) {
        status.textContent = 'Проверьте номер телефона.';
        phone.focus();
        return;
      }

      const submit = form.querySelector('button[type="submit"]');
      const initialLabel = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'Отправляем…';
      status.textContent = '';

      try {
        const response = await fetch('/api/send-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('name').value.trim(),
            phone: number,
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
          })
        });
        if (!response.ok) throw new Error('Lead request failed');
        form.reset();
        status.textContent = 'Заявка отправлена. Скоро свяжемся с вами.';
      } catch (error) {
        status.textContent = 'Не удалось отправить заявку. Позвоните нам — поможем записаться.';
      } finally {
        submit.disabled = false;
        submit.textContent = initialLabel;
      }
    });
  }
});
