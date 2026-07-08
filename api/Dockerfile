# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código-fonte
COPY src ./src

# Gerar Prisma (Postinstall já cuida, mas caso precise forçar)
RUN npx prisma generate

# Fazer o Build (TypeScript para JavaScript)
RUN npm run build

# Otimizar dependências de produção (remover devDependencies)
RUN npm prune --production

# --- Stage 2: Production ---
FROM node:20-alpine

WORKDIR /app

# Instalar dependências extras do sistema (útil para Prisma em Alpine e Fastify)
RUN apk add --no-cache openssl

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder /app/prisma ./prisma

# Criar a pasta do baileys com as permissões corretas
RUN mkdir -p /app/auth_info_baileys && chown -R node:node /app/auth_info_baileys

# Utilizar um usuário não-root por segurança
USER node

# Expor a porta usada pela API
EXPOSE 3333

# Inicializar o servidor compilado
CMD ["npm", "start"]
