FROM node:22-bookworm-slim AS frontend
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM rust:1.91-bookworm AS relay
WORKDIR /build
COPY Cargo.toml Cargo.lock ./
COPY src/ src/
RUN cargo build --release --locked

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=frontend /build/out frontend/out
COPY --from=relay /build/target/release/backend /usr/local/bin/relay
USER 65534:65534
ENV PORT=8000
EXPOSE 8000
CMD ["relay"]
