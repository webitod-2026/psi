(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preloader
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('is-hidden'), 500);
  });

  // Nav scroll + active section
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('[data-nav]');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');

  const toggleMenu = (open) => {
    if (!mobileMenu || !burger) return;
    mobileMenu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };

  burger?.addEventListener('click', () => {
    toggleMenu(!mobileMenu.classList.contains('is-open'));
  });

  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const id = el.getAttribute('data-scroll');
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      toggleMenu(false);
    });
  });

  const sectionIds = ['about', 'work', 'workflow', 'process', 'reviews', 'contacts', 'faq', 'booking'];
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);

    let current = 'hero';
    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= 140) current = id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('data-nav') === current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // FAQ accordion
  document.querySelectorAll('.faq__item').forEach((item) => {
    const btn = item.querySelector('.faq__question');
    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq__item.is-open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('is-open');
      });
      item.classList.toggle('is-open', !isOpen);
    });
  });

  // Form validation + submit
  const form = document.getElementById('booking-form');
  const successBox = document.getElementById('form-success');
  const modal = document.getElementById('success-modal');

  const showError = (name, message) => {
    const el = document.querySelector(`[data-error="${name}"]`);
    if (el) el.textContent = message;
  };

  const clearErrors = () => {
    document.querySelectorAll('[data-error]').forEach((el) => (el.textContent = ''));
  };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const honeypot = form.querySelector('[name="botcheck"]');
    if (honeypot?.value) return;

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const contact = String(data.get('contact') || '').trim();

    let valid = true;
    if (!name) { showError('name', 'Будь ласка, введіть ім\'я'); valid = false; }
    if (!phone) { showError('phone', 'Будь ласка, введіть телефон'); valid = false; }
    if (!contact) { showError('contact', 'Вкажіть email або Telegram'); valid = false; }
    const consent = form.querySelector('[name="consent"]');
    if (!consent?.checked) { showError('consent', 'Потрібна згода на обробку даних та умови угоди'); valid = false; }
    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Надсилаємо...';

    const accessKey = String(data.get('access_key') || '');
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_KEY') {
      showError('contact', 'Форма ще не підключена. Напишіть у Telegram або Instagram.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Надіслати — я відповім особисто';
      return;
    }

    try {
      const res = await fetch(form.action, { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('submit failed');
    } catch {
      showError('contact', 'Не вдалося надіслати. Спробуйте Telegram або Instagram.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Надіслати — я відповім особисто';
      return;
    }

    form.reset();
    successBox?.classList.add('is-visible');
    modal?.classList.add('is-open');
    document.body.classList.add('modal-open');

    submitBtn.disabled = false;
    submitBtn.textContent = 'Надіслати — я відповім особисто';
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      modal?.classList.remove('is-open');
      document.body.classList.remove('modal-open');
    });
  });

  // Мягкая подсветка полей формы при фокусе
  document.querySelectorAll('.form-field input, .form-field textarea, .form-field select').forEach((field) => {
    field.addEventListener('focus', () => field.closest('.form-field')?.classList.add('is-focused'));
    field.addEventListener('blur', () => field.closest('.form-field')?.classList.remove('is-focused'));
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();