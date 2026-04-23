FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python-is-python3 \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
COPY --chown=node:node scripts ./scripts

RUN mkdir -p tmp && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "server.js"]