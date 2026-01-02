FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Supprimer package-lock.json s'il existe pour éviter les problèmes
RUN rm -f package-lock.json

# Installer avec force pour les dépendances optionnelles
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install --verbose --legacy-peer-deps --force

# Copier le reste
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
