# Dockerfile
FROM node:18

# Cria diretório da aplicação
WORKDIR /app

# Instala as dependências
RUN npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando padrão ao rodar o container
CMD ["npm", "run", "dev"]
