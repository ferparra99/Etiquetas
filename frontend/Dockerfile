FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
# La imagen de nginx reemplaza ${VARIABLES} de /etc/nginx/templates/*.template al arrancar.
ENV BACKEND_HOSTPORT=backend:8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
