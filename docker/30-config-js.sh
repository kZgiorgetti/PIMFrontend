#!/bin/sh
# Gera config.js com a URL da API a partir da variável de ambiente API_URL.
set -e
echo "window.PIM_CONFIG = { apiUrl: \"${API_URL}\" };" > /usr/share/nginx/html/config.js
