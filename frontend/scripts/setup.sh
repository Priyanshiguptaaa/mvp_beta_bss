#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Create environment file
echo "Creating environment file..."
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000/auth
EOL

# Build the project
echo "Building the project..."
npm run build

echo "Setup complete! You should now be able to run the project with 'npm run dev'" 