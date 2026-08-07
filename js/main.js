/* Asad Projects — Shared JS */

(function () {
  'use strict';

  /* --- Navbar scroll state --- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile hamburger --- */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* --- Mobile services sub-menu toggle --- */
  const mobileServicesToggle = document.getElementById('mobile-services-toggle');
  const mobileSub = document.getElementById('mobile-sub');
  if (mobileServicesToggle && mobileSub) {
    mobileServicesToggle.addEventListener('click', () => {
      mobileSub.classList.toggle('open');
    });
  }

  /* --- Contact form (AJAX submit to contact.php) --- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const errorEl   = document.getElementById('form-error');
    const successEl = document.getElementById('form-success');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Prefill "Service Interested In" when arriving via a Bidwell pod's
    // Enquire button (/contact?pod=pod-1) or a service's Get a Quote
    // button (/contact?service=bespoke-steelwork). Links use plain slugs
    // to keep the URL clean; this maps them back to a readable label.
    const slugLabels = {
      'pod-1': 'Pod 1',
      'pod-2': 'Pod 2',
      'pod-3': 'Pod 3',
      'pod-4': 'Pod 4',
      'pod-5': 'Pod 5',
      'pod-6': 'Pod 6',
      'concrete-roof-pod': 'Concrete Roof Pod',
      'insulated-cement-panel': 'Insulated Cement Panel',
      'entertainment-pod': 'Entertainment Pod',
      'office-storage-pod': 'Office / Storage Pod',
      'guard-house': 'Guard House',
      'coffee-shop-pod': 'Coffee Shop Pod',
      'bespoke-steelwork': 'Bespoke Steelwork',
      'custom-glazed-steelwork': 'Custom Glazed Steelwork',
      'construction-renovation': 'Construction & Renovation',
      'carpentry-kitchens': 'Carpentry & Kitchens',
      'pergolas-decking': 'Pergolas & Decking',
    };
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('pod') || params.get('service');
    const serviceField = document.getElementById('service');
    if (slug && serviceField) {
      serviceField.value = slugLabels[slug] || slug;
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
      const waLink = e.target.closest('.btn-wa');
      if (waLink) {
        gtag('event', 'contact_whatsapp', { link_url: waLink.href });
        return;
      }
      const enquireLink = e.target.closest('.pod-card-btn');
      if (enquireLink) {
        const podName = enquireLink.closest('.pod-card')?.querySelector('h3')?.textContent || '';
        gtag('event', 'enquire_click', { pod_name: podName });
      }
    });
  }

  /* --- Hero bg loaded animation --- */
  const heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    const bgUrl = heroBg.style.backgroundImage.replace(/url\(['"]?|['"]?\)/g, '');
    if (bgUrl) {
      const img = new Image();
      img.onload = () => heroBg.classList.add('loaded');
      img.src = bgUrl;
    }
  }

  /* ----------------------------------------------------------------
     LIGHTBOX
     Works on:
       • Gallery page  → .masonry-item (div wrapping an img)
       • Services page → .service-img-grid img (direct img elements)
     Mobile back-button: pushState on open, popstate closes lightbox
     so pressing Back returns the user to their exact scroll position.
  ---------------------------------------------------------------- */
  (function () {
    // Collect all triggers and their full-res src
    const masonryItems  = [...document.querySelectorAll('.masonry-item')];
    const serviceImages = [...document.querySelectorAll('.service-img-grid img')];

    if (!masonryItems.length && !serviceImages.length) return;

    // Build unified list: { clickTarget, src }
    const entries = [
      ...masonryItems.map(el => ({ clickTarget: el, src: el.querySelector('img').src })),
      ...serviceImages.map(img => ({ clickTarget: img, src: img.src }))
    ];

    let current = 0;
    let isOpen  = false;

    // Create lightbox DOM if not already in the HTML (gallery.html has it; services doesn't)
    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.innerHTML =
        '<div class="lb-inner"><img id="lb-img" src="" alt="Project image"></div>' +
        '<button id="lb-prev" class="lb-btn">&#8249;</button>' +
        '<button id="lb-next" class="lb-btn">&#8250;</button>' +
        '<button id="lb-close" class="lb-btn">&times;</button>';
      document.body.appendChild(lb);
    }

    const lbImg  = document.getElementById('lb-img');
    const lbPrev = document.getElementById('lb-prev');
    const lbNext = document.getElementById('lb-next');
    const lbClose = document.getElementById('lb-close');

    function show(idx) {
      lbImg.src = entries[idx].src;
    }

    function open(idx) {
      current = idx;
      show(current);
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
      isOpen = true;
      // Push a history entry so mobile back-button closes the lightbox
      // instead of leaving the page
      history.pushState({ asadLightbox: true }, '');
    }

    // closeViaHistory = false when called from the popstate handler
    // (history already moved back; no need to call history.back() again)
    function close(closeViaHistory) {
      if (!isOpen) return;
      lb.classList.remove('active');
      document.body.style.overflow = '';
      isOpen = false;
      if (closeViaHistory !== false) {
        history.back();
      }
    }

    function prev() {
      current = (current - 1 + entries.length) % entries.length;
      show(current);
    }

    function next() {
      current = (current + 1) % entries.length;
      show(current);
    }

    // Register click handlers on each trigger
    entries.forEach(({ clickTarget }, idx) => {
      clickTarget.addEventListener('click', () => open(idx));
    });

    lbClose.addEventListener('click', () => close());
    lbPrev.addEventListener('click', prev);
    lbNext.addEventListener('click', next);

    // Click backdrop to close
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

    // Mobile back-button support
    window.addEventListener('popstate', () => {
      if (isOpen) close(false);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    lb.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    }, { passive: true });
  })();

})();
