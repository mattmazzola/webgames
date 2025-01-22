#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="gsd-prod-432011"
BUCKET_NAME="convergence-webgames"
REGION="us-central1"

echo "🚀 Starting deployment process..."

# Build the project
echo "📦 Building the project..."
pnpm build

# Set the GCP project
echo "🔧 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Create the bucket if it doesn't exist
echo "🪣 Creating/checking bucket..."
gsutil mb -l $REGION gs://$BUCKET_NAME || true

# Set website configuration
echo "🌐 Configuring website hosting..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# Make bucket public
echo "🔓 Setting public access..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Clean existing files
echo "🧹 Cleaning existing files..."
gsutil -m rm -r gs://$BUCKET_NAME/** || true

# Upload the built files (preserving directory structure)
echo "📤 Uploading files..."
cd dist && gsutil -h "Cache-Control:no-cache" cp -r . gs://$BUCKET_NAME/ && cd ..

# Set CORS configuration
echo "🔒 Setting CORS configuration..."
cat > cors.json << EOL
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOL
gsutil cors set cors.json gs://$BUCKET_NAME
rm cors.json

echo "✨ Deployment complete!"
echo "🌎 Your website should be available at: https://storage.googleapis.com/$BUCKET_NAME/index.html" 