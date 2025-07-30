# Dockerfile
FROM node:18

RUN apt-get update && apt-get install -y fish

# Cria diretório da aplicação
WORKDIR /app

# Instala as dependências
COPY app/package*.json ./
RUN npm install

COPY app/ ./

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando padrão ao rodar o container
CMD ["npm", "run", "dev"]
