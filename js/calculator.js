/**
 * CALCULATOR.JS - Calculadora dinámica de ROI y Cotizador en tiempo real
 * Sincronizado en vivo con el catálogo oficial de Multibanca Express (Supabase / saas-administrador-web)
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
  const billingToggle = document.getElementById('billing-toggle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelAnnual = document.getElementById('label-annual');

  // Configuración de conexión con Supabase
  const SUPABASE_REST_URL = 'https://envojryuxdmcamlolkgp.supabase.co/rest/v1/config_sistema?parametro=eq.planes_saas_catalogo&select=valor';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm9qcnl1eGRtY2FtbG9sa2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzY1NzMsImV4cCI6MjA4NzY1MjU3M30.0zGpypHi09GInBksu-zNAKi1k-cTHIBM39YrsEaamRc';

  // Planes oficiales por defecto
  const PLAN_RATES = {
    'basico': {
      name: 'Básico (SaaS)',
      base: 150,
      perPoint: 5,
      pointLimit: 15,
      modules: '16 / 23 módulos',
      desc: 'Gestión operativa completa de agencias hasta Caja Maestra.',
      rawModules: []
    },
    'profesional': {
      name: 'Profesional',
      base: 250,
      perPoint: 0,
      pointLimit: 50,
      modules: '21 / 23 módulos',
      desc: 'Gestión integral de Agencias, Operadoras y Proveedores.',
      rawModules: []
    },
    'elite': {
      name: 'Elite Enterprise',
      base: 500,
      perPoint: 12,
      pointLimit: 0,
      modules: '23 / 23 módulos (Control Total)',
      desc: 'Control total sin límites: Incluye Auditoría Híbrida y Gastos Administrativos.',
      rawModules: []
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
    const effectivePointCost = planInfo.perPoint !== undefined && planInfo.perPoint !== null ? Number(planInfo.perPoint) : 0;
    const effectiveBase = Number(planInfo.base) || 150;

    let subtotal = effectiveBase + (agencias * effectivePointCost);
    let finalTotal = isAnnual ? subtotal * 0.85 : subtotal;

    if (totalPrice) {
      totalPrice.innerHTML = `$${Math.round(finalTotal)}<span>/mes</span>`;
    }

    if (formulaBreakdown) {
      const ptoText = effectivePointCost === 0
        ? `(${agencias} agencias sin costo extra)`
        : `(${agencias} agencias × $${effectivePointCost})`;
      const limitText = (planInfo.pointLimit && Number(planInfo.pointLimit) > 0)
        ? ` • Límite plan: máx ${planInfo.pointLimit} ag.`
        : ' • Sin límite de agencias';
      formulaBreakdown.innerHTML = `Base $${effectiveBase} + ${ptoText} = <b>$${subtotal} USD/mes</b>${limitText}${isAnnual ? ' <i>(15% Desc. Anual aplicado)</i>' : ''}`;
    }

    // Métricas de Ahorro y ROI
    const hoursSaved = Math.round(agencias * 9.5);
    if (savedHours) savedHours.textContent = `${hoursSaved}h`;

    const leakage = Math.round(agencias * 28 + 45);
    if (leakageSaved) leakageSaved.textContent = `$${leakage.toLocaleString('es-ES')}`;

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

  // Función para actualizar precios en las tarjetas según Facturación Mensual / Anual
  const updateCardPrices = () => {
    const priceBasico = document.getElementById('price-basico');
    const pricePro = document.getElementById('price-pro');
    const priceElite = document.getElementById('price-elite');

    const basicoBase = isAnnual ? Math.round(PLAN_RATES.basico.base * 0.85) : PLAN_RATES.basico.base;
    const proBase = isAnnual ? Math.round(PLAN_RATES.profesional.base * 0.85) : PLAN_RATES.profesional.base;
    const eliteBase = isAnnual ? Math.round(PLAN_RATES.elite.base * 0.85) : PLAN_RATES.elite.base;

    if (priceBasico) priceBasico.innerHTML = `$${basicoBase}<span>/mes</span>`;
    if (pricePro) pricePro.innerHTML = `$${proBase}<span>/mes</span>`;
    if (priceElite) priceElite.innerHTML = `$${eliteBase}<span>/mes</span>`;
  };

  // Función para sincronizar datos del catálogo con la UI
  const applyCatalogToUI = (catalog) => {
    if (!catalog || typeof catalog !== 'object') return;

    // Localizar planes en el catálogo dinámico
    for (const [name, data] of Object.entries(catalog)) {
      const norm = name.toLowerCase().trim();
      let targetKey = null;
      if (norm.includes('basic') || norm.includes('básic')) targetKey = 'basico';
      else if (norm.includes('profesional') || norm.includes('pro')) targetKey = 'profesional';
      else if (norm.includes('elite') || norm.includes('élit') || norm.includes('enterprise')) targetKey = 'elite';

      if (targetKey && PLAN_RATES[targetKey]) {
        if (data.costo_base !== undefined && data.costo_base !== null) {
          PLAN_RATES[targetKey].base = Number(data.costo_base);
        }
        if (data.costo_por_punto !== undefined && data.costo_por_punto !== null) {
          PLAN_RATES[targetKey].perPoint = Number(data.costo_por_punto);
        }
        if (data.limite_puntos !== undefined && data.limite_puntos !== null) {
          PLAN_RATES[targetKey].pointLimit = Number(data.limite_puntos);
        }
        if (data.descripcion) {
          PLAN_RATES[targetKey].desc = data.descripcion;
        }
        if (Array.isArray(data.modulos)) {
          PLAN_RATES[targetKey].rawModules = data.modulos;
          PLAN_RATES[targetKey].modules = `${data.modulos.length} / 23 módulos`;
        }
      }
    }

    // 1. Actualizar precios de tarjetas
    updateCardPrices();

    // 2. Actualizar etiquetas de Costo / Punto en tarjetas
    const pointTagBasico = document.getElementById('point-cost-basico');
    const pointTagPro = document.getElementById('point-cost-pro');
    const pointTagElite = document.getElementById('point-cost-elite');

    const formatPointText = (val) => {
      const n = Number(val);
      if (n === 0) return '+ $0.00 USD por punto / agencia';
      return `+ $${n.toFixed(2)} USD por punto / agencia`;
    };

    if (pointTagBasico) pointTagBasico.textContent = formatPointText(PLAN_RATES.basico.perPoint);
    if (pointTagPro) pointTagPro.textContent = formatPointText(PLAN_RATES.profesional.perPoint);
    if (pointTagElite) pointTagElite.textContent = formatPointText(PLAN_RATES.elite.perPoint);

    // 2.1 Actualizar badges de límite de agencias en tarjetas
    const formatLimitBadge = (lim) => {
      const n = Number(lim !== undefined && lim !== null ? lim : 0);
      if (n === 0) return 'Agencias Ilimitadas';
      return `Hasta ${n} agencias`;
    };

    const limitValBasico = document.getElementById('point-limit-val-basico');
    const limitValPro = document.getElementById('point-limit-val-pro');
    const limitValElite = document.getElementById('point-limit-val-elite');
    if (limitValBasico) limitValBasico.textContent = formatLimitBadge(PLAN_RATES.basico.pointLimit);
    if (limitValPro) limitValPro.textContent = formatLimitBadge(PLAN_RATES.profesional.pointLimit);
    if (limitValElite) limitValElite.textContent = formatLimitBadge(PLAN_RATES.elite.pointLimit);

    // 2.2 Actualizar fila de límite en la matriz comparativa
    const mLimitBasico = document.getElementById('matrix-limit-basico');
    const mLimitPro = document.getElementById('matrix-limit-pro');
    const mLimitElite = document.getElementById('matrix-limit-elite');
    if (mLimitBasico) mLimitBasico.textContent = formatLimitBadge(PLAN_RATES.basico.pointLimit);
    if (mLimitPro) mLimitPro.textContent = formatLimitBadge(PLAN_RATES.profesional.pointLimit);
    if (mLimitElite) mLimitElite.textContent = formatLimitBadge(PLAN_RATES.elite.pointLimit);

    // 3. Actualizar descripciones de planes
    const descBasico = document.getElementById('plan-desc-basico');
    const descPro = document.getElementById('plan-desc-pro');
    const descElite = document.getElementById('plan-desc-elite');
    if (descBasico && PLAN_RATES.basico.desc) descBasico.textContent = PLAN_RATES.basico.desc;
    if (descPro && PLAN_RATES.profesional.desc) descPro.textContent = PLAN_RATES.profesional.desc;
    if (descElite && PLAN_RATES.elite.desc) descElite.textContent = PLAN_RATES.elite.desc;

    // 4. Actualizar contadores de módulos en tarjetas
    const modCountBasico = document.getElementById('modules-count-basico');
    const modCountPro = document.getElementById('modules-count-pro');
    const modCountElite = document.getElementById('modules-count-elite');
    if (modCountBasico) modCountBasico.textContent = `${PLAN_RATES.basico.rawModules.length || 16} / 23 módulos activos`;
    if (modCountPro) modCountPro.textContent = `${PLAN_RATES.profesional.rawModules.length || 21} / 23 módulos activos`;
    if (modCountElite) modCountElite.textContent = `${PLAN_RATES.elite.rawModules.length || 23} / 23 módulos activos (100% del Sistema)`;

    // 5. Actualizar pastillas de la calculadora
    const pillBasico = document.getElementById('calc-pill-price-basico');
    const pillPro = document.getElementById('calc-pill-price-pro');
    const pillElite = document.getElementById('calc-pill-price-elite');

    const formatPillPrice = (rate) => {
      const p = Number(rate.perPoint);
      const lim = rate.pointLimit && Number(rate.pointLimit) > 0 ? ` (hasta ${rate.pointLimit} ag.)` : '';
      return `$${rate.base} base + $${p}/pto${lim}`;
    };

    if (pillBasico) pillBasico.textContent = formatPillPrice(PLAN_RATES.basico);
    if (pillPro) pillPro.textContent = formatPillPrice(PLAN_RATES.profesional);
    if (pillElite) pillElite.textContent = formatPillPrice(PLAN_RATES.elite);

    // 6. Actualizar encabezados de la Matriz Comparativa
    const mHeadBasico = document.getElementById('matrix-header-basico');
    const mHeadPro = document.getElementById('matrix-header-pro');
    const mHeadElite = document.getElementById('matrix-header-elite');
    if (mHeadBasico) mHeadBasico.textContent = `Básico ($${PLAN_RATES.basico.base})`;
    if (mHeadPro) mHeadPro.textContent = `Profesional ($${PLAN_RATES.profesional.base})`;
    if (mHeadElite) mHeadElite.textContent = `Elite ($${PLAN_RATES.elite.base})`;

    // 7. Actualizar opciones en los formularios de registro
    const updateSelectOptions = (selectId) => {
      const select = document.getElementById(selectId);
      if (!select) return;
      for (let opt of select.options) {
        const val = opt.value.toLowerCase();
        if (val.includes('basic') || val.includes('básic')) {
          const lim = PLAN_RATES.basico.pointLimit && PLAN_RATES.basico.pointLimit > 0 ? ` - hasta ${PLAN_RATES.basico.pointLimit} ag.` : ' - ilimitado';
          opt.textContent = `Plan Básico ($${PLAN_RATES.basico.base} / $${PLAN_RATES.basico.perPoint} por punto${lim})`;
        } else if (val.includes('profesional') || val.includes('pro')) {
          const lim = PLAN_RATES.profesional.pointLimit && PLAN_RATES.profesional.pointLimit > 0 ? ` - hasta ${PLAN_RATES.profesional.pointLimit} ag.` : ' - ilimitado';
          opt.textContent = `Plan Profesional ($${PLAN_RATES.profesional.base} / $${PLAN_RATES.profesional.perPoint} por punto${lim}) ⭐`;
        } else if (val.includes('elite')) {
          const lim = PLAN_RATES.elite.pointLimit && PLAN_RATES.elite.pointLimit > 0 ? ` - hasta ${PLAN_RATES.elite.pointLimit} ag.` : ' - ilimitado';
          opt.textContent = `Plan Elite Enterprise ($${PLAN_RATES.elite.base} / $${PLAN_RATES.elite.perPoint} por punto${lim}) 🏆`;
        }
      }
    };
    updateSelectOptions('inpage-lead-plan');
    updateSelectOptions('lead-plan');

    // 8. Recalcular cotizador en tiempo real
    calculateROI();
  };

  // Función para obtener catálogo en vivo desde Supabase
  const fetchLiveCatalog = async () => {
    try {
      // 1. Intentar endpoint Nginx /api/planes
      let res = await fetch('/api/planes', {
        headers: { 'Cache-Control': 'no-cache' }
      }).catch(() => null);

      // 2. Si /api/planes no está disponible (ej. local o dev), llamar a Supabase REST directamente
      if (!res || !res.ok) {
        res = await fetch(SUPABASE_REST_URL, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Cache-Control': 'no-cache'
          }
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].valor) {
          const parsed = typeof data[0].valor === 'string' ? JSON.parse(data[0].valor) : data[0].valor;
          applyCatalogToUI(parsed);
        }
      }
    } catch (err) {
      console.warn('Multibanca Express: Usando catálogo predeterminado:', err);
    }
  };

  // Event Listeners
  if (agenciasRange) {
    agenciasRange.addEventListener('input', calculateROI);
  }

  planRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPlanKey = e.target.value;
      document.querySelectorAll('.calc-plan-pill').forEach(p => p.classList.remove('active'));
      const parentPill = radio.closest('.calc-plan-pill');
      if (parentPill) parentPill.classList.add('active');
      calculateROI();
    });
  });

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      billingToggle.classList.toggle('annual', isAnnual);
      if (labelMonthly) labelMonthly.classList.toggle('active', !isAnnual);
      if (labelAnnual) labelAnnual.classList.toggle('active', isAnnual);

      updateCardPrices();
      calculateROI();
    });
  }

  window.setCalculatorPlan = (planKey) => {
    if (PLAN_RATES[planKey]) {
      selectedPlanKey = planKey;
      const targetRadio = document.querySelector(`input[name="calc-plan-choice"][value="${planKey}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
        document.querySelectorAll('.calc-plan-pill').forEach(p => p.classList.remove('active'));
        const parentPill = targetRadio.closest('.calc-plan-pill');
        if (parentPill) parentPill.classList.add('active');
      }
      calculateROI();
    }
  };

  // Inicialización inmediata
  calculateROI();

  // Sincronización en vivo con la base de datos
  fetchLiveCatalog();

  // Re-sincronizar al volver a enfocar la pestaña o cada 30 segundos
  window.addEventListener('focus', fetchLiveCatalog);
  setInterval(fetchLiveCatalog, 30000);
});
