#!/bin/bash

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "Error: Commit message is required. Usage: ./deploy.sh -m 'Your commit message'"
  exit 1
fi

# Ensure the -m flag is used
if [ "$1" != "-m" ]; then
  echo "Error: The -m flag is mandatory. Usage: ./deploy.sh -m 'Your commit message'"
  exit 1
fi

# Extract commit message
COMMIT_MESSAGE="$2"

# Step 1: Add CNAME file to dist
echo "Adding CNAME file to dist..."
echo "sckaff.io" > dist/CNAME

# Step 2: Rename dist to docs
echo "Renaming dist to docs..."
mv dist docs

# Step 3: Commit changes with the provided message
echo "Committing changes..."
git add .
git commit -m "$COMMIT_MESSAGE"

echo "Changes committed with message: '$COMMIT_MESSAGE'"

# Step 4: Pushing code to main branch
echo "Pushing code to 'main' branch"
git push origin main

echo "Done! Code pushed to GitHub!"