# Frontend Dockerfile for Flutter Web
# Build date: 2026-08-21
FROM debian:latest AS build-env

# Install Flutter dependencies (minimal set for web build)
RUN apt-get update && \
    apt-get install -y curl git wget unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Clone Flutter repository
RUN git clone https://github.com/flutter/flutter.git /usr/local/flutter

# Set Flutter path
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

# Run Flutter doctor
RUN flutter doctor -v
RUN flutter channel stable
RUN flutter upgrade

# Copy files to container and build
RUN mkdir /app/
COPY . /app/
WORKDIR /app/
RUN flutter pub get
RUN flutter build web

# Stage 2 - Create the runtime image
FROM nginx:stable-alpine

# Copy built web app to nginx
COPY --from=build-env /app/build/web /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
