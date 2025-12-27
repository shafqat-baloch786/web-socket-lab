# --- STEP 1: BASE IMAGE ---
# Using the 'alpine' version of Node 20 because it's tiny (~100MB vs ~900MB). 
# This makes our builds faster and more secure.
FROM node:20-alpine

# --- STEP 2: PROJECT DIRECTORY ---
# This is our internal app folder. All subsequent commands (COPY, RUN) 
# will run inside this specific path.
WORKDIR /usr/src/app

# --- STEP 3: CACHING DEPENDENCIES ---
# We copy package files first. If these don't change, Docker skips 'npm install' 
# on the next build. This is the "Layer Caching" trick to save time.
COPY package*.json ./

# --- STEP 4: INSTALLATION ---
# Running a clean install of our MERN stack libraries.
RUN npm install

# --- STEP 5: SOURCE CODE ---
# Now we copy the actual logic (index.js, routes, etc.).
# Note: node_modules is ignored because we used a .dockerignore file.
COPY . .

# --- STEP 6: NETWORKING ---
# Documenting that this container listens on port 4000. 
# Matches the PORT in our .env file.
EXPOSE 4000

# --- STEP 7: EXECUTION ---
# Using 'npm run dev' so nodemon can watch for file changes on our ThinkPad
# and restart the server automatically inside the container.
CMD ["npm", "run", "dev"]