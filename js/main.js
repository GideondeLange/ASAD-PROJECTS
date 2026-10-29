/* ASAD Living Pods — shared JS */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* --- Navbar scroll state --- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile menu --- */
  const toggle = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  if (toggle && mobileMenu) {
    const setOpen = (open) => {
      mobileMenu.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('open')));
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* --- Reveal on scroll --- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('in'));
    }
  }

  /* --- Filter bars (pods index, gallery): button[data-cat] shows items with a matching data-cat --- */
  document.querySelectorAll('.filter-bar[data-target]').forEach((bar) => {
    const items = document.querySelectorAll(`${bar.dataset.target} [data-cat]`);
    const apply = (cat) => {
      bar.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.cat === cat));
      items.forEach((el) => el.classList.toggle('hidden', cat !== 'all' && el.dataset.cat !== cat));
    };
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      apply(btn.dataset.cat);
      history.replaceState(null, '', btn.dataset.cat === 'all' ? location.pathname : '#' + btn.dataset.cat);
    });
    const initial = location.hash.slice(1);
    if (initial && bar.querySelector(`button[data-cat="${initial}"]`)) apply(initial);
  });

  /* --- Contact form (AJAX submit to contact.php) --- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const errorEl   = document.getElementById('form-error');
    const successEl = document.getElementById('form-success');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const serviceField = document.getElementById('service');

    // Prefill the pod field when arriving via an Enquire button (/contact?pod=pod-1).
    // The list of slugs is read from the datalist so it never goes out of date.
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('pod') || params.get('service');
    if (slug && serviceField) {
      const opt = document.querySelector(`#pod-options option[data-slug="${CSS.escape(slug)}"]`);
      serviceField.value = opt ? opt.value : slug;
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          contactForm.hidden = true;
          if (successEl) {
            successEl.hidden = false;
            successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (typeof gtag === 'function') {
            // contact_form_submit matches the Key Event configured in GA4;
            // generate_lead is GA4's own recommended event name.
            gtag('event', 'contact_form_submit', {
              form_name: 'contact_form',
              service_interested_in: serviceField ? serviceField.value : '',
            });
            gtag('event', 'generate_lead', {
              form_name: 'contact_form',
              service_interested_in: serviceField ? serviceField.value : '',
            });
          }
          return;
        }
        throw new Error('send failed');
      } catch (err) {
        if (errorEl) errorEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  /* --- GA4 conversion tracking: WhatsApp and Enquire clicks --- */
  if (typeof gtag === 'function') {
    document.addEventListener('click', (e) => {
      const waLink = e.target.closest('[data-wa]');
      if (waLink) {
        gtag('event', 'contact_whatsapp', { link_url: waLink.href });
        return;
      }
      const enquireLink = e.target.closest('[data-enquire]');
      if (enquireLink) {
        gtag('event', 'enquire_click', { pod_name: enquireLink.dataset.enquire });
      }
    });
  }

  /* ----------------------------------------------------------------
     LIGHTBOX — gallery page (.masonry-item) and finishes page (.lb-trigger).
     Mobile back-button: pushState on open, popstate closes the lightbox so
     pressing Back returns the visitor to their exact scroll position.
  ---------------------------------------------------------------- */
  (function () {
    const triggers = [...document.querySelectorAll('.masonry-item, .lb-trigger')];
    if (!triggers.length) return;

    const all = triggers.map((el) => ({ el, src: (el.querySelector('img') || el).src, alt: (el.querySelector('img') || el).alt || '' }));
    // only the images currently shown (a gallery section may be filtered), refreshed on every open
    let entries = all;
    let current = 0;
    let isOpen = false;

    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.innerHTML =
        '<div class="lb-inner"><img id="lb-img" src="" alt=""></div>' +
        '<button id="lb-prev" class="lb-btn" aria-label="Previous">&#8249;</button>' +
        '<button id="lb-next" class="lb-btn" aria-label="Next">&#8250;</button>' +
        '<button id="lb-close" class="lb-btn" aria-label="Close">&times;</button>';
      document.body.appendChild(lb);
    }
    const lbImg = document.getElementById('lb-img');

    const show = (i) => { lbImg.src = entries[i].src; lbImg.alt = entries[i].alt; };
    const open = (i) => {
      current = i; show(i);
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
      isOpen = true;
      history.pushState({ asadLightbox: true }, '');
    };
    // viaHistory is false when called from popstate (history already moved back)
    const close = (viaHistory) => {
      if (!isOpen) return;
      lb.classList.remove('active');
      document.body.style.overflow = '';
      isOpen = false;
      if (viaHistory !== false) history.back();
    };
    const prev = () => { current = (current - 1 + entries.length) % entries.length; show(current); };
    const next = () => { current = (current + 1) % entries.length; show(current); };

    all.forEach((entry) => entry.el.addEventListener('click', () => {
      entries = all.filter((x) => !x.el.classList.contains('hidden'));
      open(entries.indexOf(entry));
    }));
    document.getElementById('lb-close').addEventListener('click', () => close());
    document.getElementById('lb-prev').addEventListener('click', prev);
    document.getElementById('lb-next').addEventListener('click', next);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    window.addEventListener('popstate', () => { if (isOpen) close(false); });
    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
    let touchStartX = 0;
    lb.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    }, { passive: true });
  })();

})();
