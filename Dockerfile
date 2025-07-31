# Dockerfile
FROM node:18

# Set Fish as the default shell
RUN apt-get update && \
    apt-get install -y fish && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

RUN chsh -s /usr/bin/fish root

WORKDIR /app

# Dependencies
COPY app/package*.json ./
RUN npm install

COPY app/ ./

# Exposes the default port for Next.js
EXPOSE 3000

# Default command when running the container
CMD ["npm", "run", "dev"]
