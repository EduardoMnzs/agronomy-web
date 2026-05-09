# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

COPY . .

# VITE_API_URL é baked no bundle em build time.
# Sobrescreve .env.production para garantir URL correta independente do arquivo local.
ARG VITE_API_URL=https://agronomy-api.gaek.com.br
RUN printf "VITE_API_URL=%s\n" "$VITE_API_URL" > .env.production

RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
