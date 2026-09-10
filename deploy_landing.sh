#!/bin/bash

# ==============================================================================
# Script de Despliegue Automatizado - Multibanca Express Landing Page
# Dominio: multibancaexpress.com
# Repositorio: https://github.com/andyfuenmayor-droid/multibancaexpress-landingpage.git
# Servidor: DigitalOcean (Ubuntu/Debian con Nginx)
# ==============================================================================

set -e

DOMAIN="multibancaexpress.com"
WEB_ROOT="/var/www/$DOMAIN"
REPO_URL="https://github.com/andyfuenmayor-droid/multibancaexpress-landingpage.git"
TEMP_DIR="/tmp/multibancaexpress-landingpage-deploy"

echo "🚀 Iniciando despliegue de Multibanca Express Landing en DigitalOcean..."

# 1. Instalar dependencias si no existen
echo "📦 Verificando Nginx y Certbot..."
apt-get update -qq || true
apt-get install -y nginx certbot python3-certbot-nginx git -qq || true

# 2. Asegurar que Nginx está corriendo
systemctl enable --now nginx || true

# 3. Descargar/Actualizar los archivos más recientes de la Landing
echo "📥 Descargando archivos de la landing desde GitHub..."
rm -rf "$TEMP_DIR"
git clone --depth 1 "$REPO_URL" "$TEMP_DIR"

# 4. Crear carpeta de producción y copiar archivos
echo "📁 Copiando archivos a $WEB_ROOT..."
mkdir -p "$WEB_ROOT"
rm -rf "$WEB_ROOT"/*
cp -r "$TEMP_DIR"/* "$WEB_ROOT/"
rm -rf "$TEMP_DIR"

# 5. Permisos de lectura
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# 6. Configurar Nginx para multibancaexpress.com
echo "⚙️ Configurando Nginx para $DOMAIN..."
if [ -f "$WEB_ROOT/nginx_landing.conf" ]; then
    cp "$WEB_ROOT/nginx_landing.conf" "/etc/nginx/sites-available/$DOMAIN"
    ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
fi

# 7. Validar y recargar Nginx
nginx -t
systemctl reload nginx

# 8. Certificado SSL con Let's Encrypt
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || echo "⚠️ Certbot finalizado o ya existente."

nginx -t
systemctl reload nginx

echo "=========================================================================="
echo "✅ ¡DESPLIEGUE EXITOSO!"
echo "🌐 Landing Page en vivo en: https://$DOMAIN"
echo "=========================================================================="\n