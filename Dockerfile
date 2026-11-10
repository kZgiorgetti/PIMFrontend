FROM nginx:1.27-alpine
ENV API_URL=http://localhost:5000
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/30-config-js.sh /docker-entrypoint.d/30-config-js.sh
RUN chmod +x /docker-entrypoint.d/30-config-js.sh
COPY index.html styles.css config.js /usr/share/nginx/html/
COPY pages /usr/share/nginx/html/pages
COPY js /usr/share/nginx/html/js
EXPOSE 80
