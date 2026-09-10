/**
 * LEADS.JS - Captura y Gestión de Solicitudes en Tiempo Real
 * Conexión segura con Supabase y WhatsApp estructurado
 */

const WHATSAPP_PHONE_DEFAULT = '584126848984'; // Número oficial de soporte comercial

// Abrir Modal de Registro con datos precargados
window.openRegistrationModal = (preselectedPlan = 'Profesional', preselectedPoints = 5) => {
  const modal = document.getElementById('lead-modal-overlay');
  const planInput = document.getElementById('lead-plan');
  const pointsInput = document.getElementById('lead-points');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (planInput && preselectedPlan) {
    for (let opt of planInput.options) {
      if (opt.text.toLowerCase().includes(preselectedPlan.toLowerCase()) || opt.value.toLowerCase().includes(preselectedPlan.toLowerCase())) {
        planInput.value = opt.value;
        break;
      }
    }
  }

  if (pointsInput && preselectedPoints) {
    pointsInput.value = preselectedPoints;
  }

  if (modalTitle && modalSubtitle && submitBtn) {
    modalTitle.innerHTML = `📝 Registrarse - <span style="color: #10b981;">${preselectedPlan}</span>`;
    modalSubtitle.innerText = 'Completa tus datos para registrar tu negocio y activar tu acceso de inmediato.';
    submitBtn.innerHTML = '🚀 Completar Registro y Activar en WhatsApp';
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.openDemoModal = (plan = 'Demostración General') => {
  window.openRegistrationModal(plan, 5);
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
  toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <span>${message}</span>`;
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

  // Función genérica para procesar registro
  const processRegistration = async ({ name, business, phone, email, pointsRaw, plan, state, address, submitBtn, isModal = false }) => {
    if (!name || !phone || !business) {
      window.showToast('Por favor completa todos los campos requeridos (*)', '⚠️');
      return;
    }

    let numericPoints = 5;
    const parsedPoints = parseInt(pointsRaw);
    if (!isNaN(parsedPoints)) {
      numericPoints = parsedPoints;
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

    // 2. Enviar a Supabase vía Proxy Endpoint Nginx /api/leads
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
        window.showToast('¡Registro guardado con éxito en el sistema!', '🎉');
      }
    } catch (dbErr) {
      console.error('Error enviando lead a Supabase:', dbErr);
    }

    // 3. Mensaje Estructurado para WhatsApp
    const waMessage = 
`👋 *SOLICITUD DE REGISTRO / PLAN - MULTIBANCA EXPRESS*
----------------------------------
👤 *Representante:* ${name}
🏢 *Banca / Operadora:* ${business}
📱 *WhatsApp:* ${phone}
📧 *Email:* ${email || 'No especificado'}
📍 *N° de Agencias/Puntos:* ${numericPoints}
💎 *Plan Seleccionado:* ${plan}
📍 *Ubicación:* ${state || 'No especificada'}
📫 *Dirección:* ${address || 'No especificada'}
----------------------------------
_Registro oficial generado desde webapp.multibancaexpress.com_`;

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
    }, 800);
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
