FROM rust:1.70-alpine

WORKDIR /usr/src/app

# Install dependencies
RUN apk add --no-cache musl-dev

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

EXPOSE 8080

CMD ["cargo", "run", "--release"]
