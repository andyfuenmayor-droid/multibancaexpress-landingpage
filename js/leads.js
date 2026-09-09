/**
 * LEADS.JS - Gestión de Registro, Formulario Directo, Supabase Sync y WhatsApp
 * Version: 3.0 (Zero-Cache Compatible)
 */

const WHATSAPP_PHONE_DEFAULT = "19542259188"; // Número comercial (+1 954 225-9188)

// Función para navegar y seleccionar plan en el formulario de la página
window.goToRegisterForm = (planName) => {
  const inpagePlan = document.getElementById('inpage-lead-plan');
  if (inpagePlan && planName) {
    for (let opt of inpagePlan.options) {
      if (opt.value.toLowerCase().includes(planName.toLowerCase()) || planName.toLowerCase().includes(opt.value.toLowerCase())) {
        inpagePlan.value = opt.value;
        break;
      }
    }
  }

  const regSection = document.getElementById('registro');
  if (regSection) {
    regSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const card = regSection.querySelector('.glass-card');
    if (card) {
      card.style.transition = 'all 0.5s ease';
      card.style.boxShadow = '0 0 45px rgba(2, 171, 33, 0.7)';
      card.style.borderColor = '#4ade80';
      setTimeout(() => {
        card.style.boxShadow = '0 15px 40px rgba(0,0,0,0.5)';
        card.style.borderColor = 'rgba(2, 171, 33, 0.35)';
      }, 2500);
    }
    const nameInput = document.getElementById('inpage-lead-name');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 600);
    }
  }
};

// Abrir Modal de Demostración o Registro
window.openDemoModal = (preselectedPlan = 'Demostración General', isRegistration = false) => {
  const modal = document.getElementById('lead-modal-overlay');
  const planInput = document.getElementById('lead-plan');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (planInput && preselectedPlan) {
    let planFound = false;
    for (let opt of planInput.options) {
      if (opt.value.toLowerCase().includes(preselectedPlan.toLowerCase()) || preselectedPlan.toLowerCase().includes(opt.value.toLowerCase())) {
        planInput.value = opt.value;
        planFound = true;
        break;
      }
    }
    if (!planFound && preselectedPlan) {
      planInput.value = preselectedPlan;
    }
  }

  if (modalTitle && modalSubtitle && submitBtn) {
    if (isRegistration || (preselectedPlan && preselectedPlan !== 'Demostración General')) {
      const planText = preselectedPlan.startsWith('Plan') ? preselectedPlan : `Plan ${preselectedPlan}`;
      modalTitle.innerHTML = `📝 Registrarse - <span style="color: #4ade80;">${planText}</span>`;
      modalSubtitle.innerText = 'Completa tus datos para crear tu expediente y activar tu acceso en Multibanca Express.';
      submitBtn.innerHTML = '🚀 Completar Registro y Activar en WhatsApp';
    } else {
      modalTitle.innerText = 'Agenda una Demo en Vivo';
      modalSubtitle.innerText = 'Un especialista te mostrará el sistema funcionando con los datos de tu negocio.';
      submitBtn.innerHTML = '🚀 Confirmar y Abrir WhatsApp Directo';
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

// Cerrar Modal
window.closeDemoModal = () => {
  const modal = document.getElementById('lead-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Toast Notification
window.showToast = (message, icon = '✅') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
};

// Direct WhatsApp Contact
window.contactWhatsAppDirect = (customMsg = null) => {
  const defaultText = encodeURIComponent("¡Hola! Me interesa conocer más sobre la plataforma Multibanca Express para Operadoras y Taquillas. ¿Podrían brindarme información y una demostración?");
  const msg = customMsg ? encodeURIComponent(customMsg) : defaultText;
  const url = `https://wa.me/${WHATSAPP_PHONE_DEFAULT}?text=${msg}`;
  window.open(url, '_blank');
};

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('lead-modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalForm = document.getElementById('lead-capture-form');
  const inpageForm = document.getElementById('inpage-register-form');

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeDemoModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeDemoModal);
  }

  // Función genérica para procesar registro (modal o inpage)
  const processRegistration = async ({ name, business, phone, email, pointsRaw, plan, state, address, submitBtn, isModal = false }) => {
    if (!name || !phone || !business) {
      window.showToast('Por favor completa todos los campos requeridos (*)', '⚠️');
      return;
    }

    let numericPoints = 5;
    const parsedPoints = parseInt(pointsRaw);
    if (!isNaN(parsedPoints)) {
      numericPoints = parsedPoints;
    } else if (pointsRaw.includes('16') || pointsRaw.includes('30')) {
      numericPoints = 20;
    } else if (pointsRaw.includes('6') || pointsRaw.includes('15')) {
      numericPoints = 10;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Guardando expediente...';

    // 1. Guardar en LocalStorage
    try {
      const savedLeads = JSON.parse(localStorage.getItem('saas_leads') || '[]');
      savedLeads.push({ name, business, phone, email, points: numericPoints, plan, state, address, createdAt: new Date().toISOString() });
      localStorage.setItem('saas_leads', JSON.stringify(savedLeads));
    } catch (e) {}

    // 2. Enviar a Supabase vía Proxy Endpoint Nginx
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banca: business,
          representante: name,
          telefono: phone,
          email: email || null,
          puntos_venta: numericPoints,
          estado: state || 'N/A',
          direccion: address || `Plan: ${plan}`
        })
      });
      if (response.ok) {
        window.showToast('¡Registro guardado con éxito en el sistema CRM!', '🎉');
      } else {
        console.warn('Respuesta de API:', await response.text());
      }
    } catch (dbErr) {
      console.error('Error enviando lead a Supabase:', dbErr);
    }

    // 3. WhatsApp Message
    const waMessage = 
`👋 *SOLICITUD DE REGISTRO / PLAN - MULTIBANCA EXPRESS*
----------------------------------
👤 *Representante:* ${name}
🏢 *Banca / Operadora:* ${business}
📱 *WhatsApp:* ${phone}
📧 *Email:* ${email || 'No especificado'}
🏪 *N° de Agencias/Puntos:* ${numericPoints}
💎 *Plan Seleccionado:* ${plan}
📍 *Ubicación:* ${state || 'No especificada'}
📫 *Dirección:* ${address || 'No especificada'}
----------------------------------
_Registro generado desde la web oficial de Multibanca Express._`;

    submitBtn.disabled = false;
    submitBtn.innerHTML = '✅ ¡Registro Completado!';

    if (isModal) {
      window.closeDemoModal();
      if (modalForm) modalForm.reset();
    } else {
      if (inpageForm) inpageForm.reset();
    }

    setTimeout(() => {
      submitBtn.innerHTML = originalBtnText;
      const url = `https://wa.me/${WHATSAPP_PHONE_DEFAULT}?text=${encodeURIComponent(waMessage)}`;
      window.open(url, '_blank');
    }, 900);
  };

  // Manejar envío formulario In-Page
  if (inpageForm) {
    inpageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      processRegistration({
        name: document.getElementById('inpage-lead-name').value.trim(),
        business: document.getElementById('inpage-lead-business').value.trim(),
        phone: document.getElementById('inpage-lead-phone').value.trim(),
        email: document.getElementById('inpage-lead-email').value.trim(),
        pointsRaw: document.getElementById('inpage-lead-points').value,
        plan: document.getElementById('inpage-lead-plan').value,
        state: document.getElementById('inpage-lead-state').value.trim(),
        address: document.getElementById('inpage-lead-address').value.trim(),
        submitBtn: document.getElementById('inpage-submit-btn'),
        isModal: false
      });
    });
  }

  // Manejar envío formulario Modal
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      processRegistration({
        name: document.getElementById('lead-name').value.trim(),
        business: document.getElementById('lead-business').value.trim(),
        phone: document.getElementById('lead-phone').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        pointsRaw: document.getElementById('lead-points').value,
        plan: document.getElementById('lead-plan').value,
        state: document.getElementById('lead-state') ? document.getElementById('lead-state').value.trim() : '',
        address: document.getElementById('lead-address') ? document.getElementById('lead-address').value.trim() : '',
        submitBtn: document.getElementById('modal-submit-btn'),
        isModal: true
      });
    });
  }
});
