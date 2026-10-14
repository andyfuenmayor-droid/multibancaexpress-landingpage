/**
 * APP.JS - Lógica interactiva de la Landing Page Multibanca Express
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar on Scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('nav-active');
      const isOpen = navLinks.classList.contains('nav-active');
      mobileMenuBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
        if (mobileMenuBtn) mobileMenuBtn.innerHTML = '☰';
      });
    });
  }

  // 3. Tab Switcher de Módulos (23 Módulos con Vistas UI)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  // 4. Acordeón FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open') || item.classList.contains('active');
        faqItems.forEach(f => {
          f.classList.remove('open');
          f.classList.remove('active');
        });
        if (!isOpen) {
          item.classList.add('open');
          item.classList.add('active');
        }
      });
    }
  });

  // 5. Smooth scroll para enlaces ancla
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 6. Interactive Hero Real Screens Switcher
  const screenTabBtns = document.querySelectorAll('.hero-screen-tab-btn');
  const screenViewItems = document.querySelectorAll('.screen-view-item');

  screenTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const screenId = btn.getAttribute('data-screen');
      screenTabBtns.forEach(b => b.classList.remove('active'));
      screenViewItems.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const targetView = document.getElementById(`screen-view-${screenId}`);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });

  // 7. Lightbox Modal for Real Production Screens
  const lightbox = document.getElementById('screen-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');

  window.openScreenLightbox = function(src, title, desc) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxTitle) lightboxTitle.textContent = title || 'Captura de Sistema en Producción';
    if (lightboxDesc) lightboxDesc.textContent = desc || 'Multibanca Express - Operatividad en Vivo';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeScreenLightbox = function() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', window.closeScreenLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        window.closeScreenLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      window.closeScreenLightbox();
    }
  });
});

