/**
 * APP.JS - Lógica principal interactiva de la Landing Page
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

    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
        mobileMenuBtn.innerHTML = '☰';
      });
    });
  }

  // 3. Tab Switcher de Módulos
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
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // 5. Toggle de Facturación Mensual / Anual en Planes
  const billingToggle = document.getElementById('billing-toggle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelAnnual = document.getElementById('label-annual');

  const priceBasico = document.getElementById('price-basico');
  const pricePro = document.getElementById('price-pro');
  const priceElite = document.getElementById('price-elite');

  let isAnnual = false;

  const updatePricingCards = () => {
    if (isAnnual) {
      billingToggle.classList.add('annual');
      labelAnnual.classList.add('active');
      labelMonthly.classList.remove('active');
      
      if (priceBasico) priceBasico.innerHTML = '$127<span>/mes</span>';
      if (pricePro) pricePro.innerHTML = '$212<span>/mes</span>';
      if (priceElite) priceElite.innerHTML = '$425<span>/mes</span>';
    } else {
      billingToggle.classList.remove('annual');
      labelMonthly.classList.add('active');
      labelAnnual.classList.remove('active');

      if (priceBasico) priceBasico.innerHTML = '$150<span>/mes</span>';
      if (pricePro) pricePro.innerHTML = '$250<span>/mes</span>';
      if (priceElite) priceElite.innerHTML = '$500<span>/mes</span>';
    }

    if (window.setCalculatorAnnual) {
      window.setCalculatorAnnual(isAnnual);
    }
  };

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      updatePricingCards();
    });
  }

  if (labelMonthly) {
    labelMonthly.addEventListener('click', () => {
      isAnnual = false;
      updatePricingCards();
    });
  }

  if (labelAnnual) {
    labelAnnual.addEventListener('click', () => {
      isAnnual = true;
      updatePricingCards();
    });
  }

  // 6. Rotación dinámica del Feed en Vivo del Mockup
  const simulatedFeed = [
    { type: 'pago-movil', icon: '📱', title: 'Pago Móvil Conciliado', sub: 'Ref: #849201 • Banesco • Agencia Central 01', badge: '+Bs 4,850.00' },
    { type: 'zelle', icon: '💎', title: 'Zelle Confirmado', sub: 'Ref: ZL-4491 • Caja Maestra USD', badge: '+$350.00' },
    { type: 'qr-cobrador', icon: '⚡', title: 'Liquidación QR Exitosa', sub: 'Cobrador: Carlos R. • Ruta Norte', badge: 'Liquidado OK' },
    { type: 'pago-movil', icon: '📱', title: 'Transferencia Aprobada', sub: 'Ref: #199432 • Mercantil • Agencia 07', badge: '+Bs 12,400.00' },
    { type: 'zelle', icon: '💎', title: 'Cierre Operadora Automático', sub: 'Proveedor Lotería Activa • Ciclo Semanal', badge: 'Cerrado 100%' }
  ];

  const feedContainer = document.getElementById('mockup-live-feed');
  let feedIndex = 0;

  if (feedContainer) {
    setInterval(() => {
      feedIndex = (feedIndex + 1) % simulatedFeed.length;
      const item = simulatedFeed[feedIndex];

      const newItem = document.createElement('div');
      newItem.className = 'feed-item';
      newItem.innerHTML = `
        <div class="feed-item-left">
          <div class="feed-icon ${item.type}">${item.icon}</div>
          <div>
            <span class="feed-title">${item.title}</span>
            <span class="feed-sub">${item.sub}</span>
          </div>
        </div>
        <div class="feed-badge-success">${item.badge}</div>
      `;

      feedContainer.insertBefore(newItem, feedContainer.firstChild);
      if (feedContainer.children.length > 3) {
        feedContainer.removeChild(feedContainer.lastChild);
      }
    }, 3800);
  }
});
