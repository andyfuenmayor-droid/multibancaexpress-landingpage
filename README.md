# 🌐 Multibanca Express - Landing Page Comercial & Portal de Registro

Sitio web comercial oficial y portal de captación de suscriptores para la plataforma **Multibanca Express**.

- **Dominio en producción:** [https://multibancaexpress.com](https://multibancaexpress.com)
- **CRM Operativo:** [https://crm.multibancaexpress.com](https://crm.multibancaexpress.com)
- **Consola SaaS Administrador:** [https://sus.multibancaexpress.com](https://sus.multibancaexpress.com)
- **WebApp Operadora CMS (Streamlit):** [https://webapp.multibancaexpress.com](https://webapp.multibancaexpress.com)

---

## 🚀 Características Principales

1. **Catálogo de Planes Comerciales:**
   - **Básico (SaaS)**: $150 / mes (+ $5 por agencia)
   - **Profesional ⭐**: $250 / mes (+ $8 por agencia)
   - **Elite Enterprise**: $500 / mes (+ $12 por agencia)
2. **Formulario Físico de Registro (`#registro`)**:
   - Captura inmediata de expedientes de operadoras y bancas.
   - Sincronización en tiempo real con Supabase (`suscriptores_leads`) vía endpoint seguro Nginx `/api/leads`.
   - Generación de mensaje estructurado de WhatsApp comercial.
3. **Acceso al CRM**:
   - Botón directo en Navbar, Hero, Menú móvil y Footer apuntando a `https://crm.multibancaexpress.com`.
4. **Calculadora Interactiva de ROI**:
   - Estimación de ahorro de tiempo y fugas por referencias bancarias duplicadas.
5. **Arquitectura Zero-Cache**:
   - Cabeceras `Cache-Control: no-store, no-cache, must-revalidate` y versionado de assets (`?v=3.0`).

---

## 🛠️ Estructura del Proyecto

```
multibancaexpress-landingpage/
├── assets/                  # Logotipos vectoriales, iconos e imágenes
├── css/
│   ├── variables.css        # Paleta de colores, degradados y tipografías
│   ├── styles.css           # Estilos principales de componentes y glassmorphism
│   └── responsive.css       # Adaptaciones responsive (móviles, tablets, escritorio)
├── js/
│   ├── app.js               # Menú móvil, sticky navbar, tabs de módulos, FAQ
│   ├── calculator.js        # Calculadora dinámica de ROI
│   └── leads.js             # Lógica de registro, envío a Supabase y WhatsApp
├── deploy_landing.sh        # Script automatizado de despliegue en servidor Ubuntu/Nginx
├── index.html               # Página web principal con formulario in-page y modal
└── nginx_webapp.conf        # Configuración Nginx con proxy a Supabase y SSL
```

---

## 🚢 Despliegue en DigitalOcean

Para desplegar o actualizar en el servidor:

```bash
chmod +x deploy_landing.sh
./deploy_landing.sh
```
