/**
 * CALCULATOR.JS - Calculadora dinámica de ROI y Cotizador en tiempo real
 * Sincronizado con el catálogo oficial de Multibanca Express
 */

document.addEventListener('DOMContentLoaded', () => {
  const agenciasRange = document.getElementById('calc-agencias');
  const agenciasDisplay = document.getElementById('calc-agencias-val');
  
  const planRadios = document.querySelectorAll('input[name="calc-plan-choice"]');
  const recPlanName = document.getElementById('rec-plan-name');
  const planBadgeDesc = document.getElementById('calc-plan-desc');
  const savedHours = document.getElementById('calc-saved-hours');
  const leakageSaved = document.getElementById('calc-leakage-saved');
  const totalPrice = document.getElementById('calc-total-price');
  const formulaBreakdown = document.getElementById('calc-formula-breakdown');
  const hireBtn = document.getElementById('calc-hire-btn');

  // Planes oficiales
  const PLAN_RATES = {
    'basico': {
      name: 'Básico (SaaS)',
      base: 150,
      perPoint: 5,
      modules: '16 / 23 módulos',
      desc: 'Gestión operativa completa de agencias hasta Caja Maestra.'
    },
    'profesional': {
      name: 'Profesional',
      base: 250,
      perPoint: 8,
      modules: '21 / 23 módulos',
      desc: 'Gestión integral de Agencias, Operadoras y Proveedores.'
    },
    'elite': {
      name: 'Elite Enterprise',
      base: 500,
      perPoint: 12,
      modules: '23 / 23 módulos (Control Total)',
      desc: 'Control total sin límites: Incluye Auditoría Híbrida y Gastos Administrativos.'
    }
  };

  let selectedPlanKey = 'profesional';
  let isAnnual = false;

  const calculateROI = () => {
    const agencias = parseInt(agenciasRange ? agenciasRange.value : '10', 10);
    if (agenciasDisplay) agenciasDisplay.textContent = agencias;

    // Obtener plan seleccionado
    const planInfo = PLAN_RATES[selectedPlanKey] || PLAN_RATES['profesional'];

    if (recPlanName) recPlanName.textContent = planInfo.name;
    if (planBadgeDesc) planBadgeDesc.textContent = `${planInfo.modules} • ${planInfo.desc}`;

    // Cálculo matemático exacto
    let subtotal = planInfo.base + (agencias * planInfo.perPoint);
    let finalTotal = isAnnual ? subtotal * 0.85 : subtotal;

    if (totalPrice) {
      totalPrice.textContent = `$${Math.round(finalTotal)}`;
    }

    if (formulaBreakdown) {
      formulaBreakdown.innerHTML = `Base $${planInfo.base} + (${agencias} agencias × $${planInfo.perPoint}) = <b>$${subtotal} USD/mes</b>${isAnnual ? ' <i>(15% Desc. Anual aplicado)</i>' : ''}`;
    }

    // Métricas de Ahorro y ROI
    // Cuadre manual estimado: ~2.5 horas semanales por agencia (10h al mes)
    const hoursSaved = Math.round(agencias * 9.5);
    if (savedHours) savedHours.textContent = `${hoursSaved}h / mes`;

    // Fugas prevenidas (comprobantes bancarios falsos, dobles cobros, descuadres de tasa): ~$28/agencia/mes
    const leakage = Math.round(agencias * 28 + 45);
    if (leakageSaved) leakageSaved.textContent = `$${leakage.toLocaleString('es-ES')} USD`;

    // Configurar botón de contratación directa
    if (hireBtn) {
      hireBtn.onclick = () => {
        if (typeof window.openRegistrationModal === 'function') {
          window.openRegistrationModal(planInfo.name, agencias);
        } else if (typeof window.openDemoModal === 'function') {
          window.openDemoModal(planInfo.name);
        }
      };
    }
  };

  // Event Listeners
  if (agenciasRange) {
    agenciasRange.addEventListener('input', calculateROI);
  }

  planRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPlanKey = e.target.value;
      calculateROI();
    });
  });

  window.setCalculatorPlan = (planKey) => {
    if (PLAN_RATES[planKey]) {
      selectedPlanKey = planKey;
      const targetRadio = document.querySelector(`input[name="calc-plan-choice"][value="${planKey}"]`);
      if (targetRadio) targetRadio.checked = true;
      calculateROI();
    }
  };

  window.setCalculatorAnnual = (annual) => {
    isAnnual = annual;
    calculateROI();
  };

  calculateROI(); // Iniciar
});
