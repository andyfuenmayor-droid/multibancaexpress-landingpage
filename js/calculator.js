/**
 * CALCULATOR.JS - Calculadora dinámica de ROI y Cotizador en tiempo real
 */

document.addEventListener('DOMContentLoaded', () => {
  const agenciasRange = document.getElementById('calc-agencias');
  const agenciasDisplay = document.getElementById('calc-agencias-val');
  
  const txRange = document.getElementById('calc-tx');
  const txDisplay = document.getElementById('calc-tx-val');

  const recPlanName = document.getElementById('rec-plan-name');
  const savedHours = document.getElementById('calc-saved-hours');
  const leakageSaved = document.getElementById('calc-leakage-saved');
  const totalPrice = document.getElementById('calc-total-price');

  // Billing cycle state
  let isAnnual = false;

  const calculateROI = () => {
    const agencias = parseInt(agenciasRange.value, 10);
    const tx = parseInt(txRange.value, 10);

    agenciasDisplay.textContent = agencias;
    txDisplay.textContent = tx.toLocaleString('es-ES');

    // 1. Determinar Plan Recomendado
    let plan = 'Básico (SaaS)';
    let basePrice = 150;
    let costPerPoint = 5;

    if (agencias > 15 || tx > 1200) {
      plan = 'Elite Enterprise';
      basePrice = 500;
      costPerPoint = 12;
    } else if (agencias > 5 || tx > 500) {
      plan = 'Profesional';
      basePrice = 250;
      costPerPoint = 8;
    }

    recPlanName.textContent = plan;

    // 2. Calcular Inversión Mensual
    let total = basePrice + (agencias * costPerPoint);
    if (isAnnual) {
      total = total * 0.85; // 15% de descuento anual
    }

    totalPrice.textContent = `$${Math.round(total)}`;

    // 3. Métricas de Ahorro y ROI
    // Estimación: Cada agencia requiere ~2.5 horas semanales de cuadre manual (10 horas al mes)
    // Con SaaS se reduce a menos de 20 min al mes por agencia.
    const hoursSavedMonth = Math.round(agencias * 9.5);
    savedHours.textContent = `${hoursSavedMonth}h`;

    // Estimación de prevención de fugas/comprobantes duplicados: ~$15-$30 por agencia/mes
    const leakageMonth = Math.round(agencias * 28 + (tx * 0.05));
    leakageSaved.textContent = `$${leakageMonth.toLocaleString('es-ES')}`;
  };

  if (agenciasRange && txRange) {
    agenciasRange.addEventListener('input', calculateROI);
    txRange.addEventListener('input', calculateROI);
    calculateROI(); // Inicializar
  }

  // Escuchar cambio en el toggle de facturación si existe
  window.setCalculatorAnnual = (annual) => {
    isAnnual = annual;
    calculateROI();
  };
});
