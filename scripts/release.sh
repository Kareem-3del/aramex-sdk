#!/bin/bash

# Release script for @kareem-3del/aramex-sdk
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version type is provided
VERSION_TYPE=${1:-patch}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major|prerelease)$ ]]; then
  echo -e "${RED}Error: Invalid version type. Use: patch, minor, major, or prerelease${NC}"
  exit 1
fi

echo -e "${YELLOW}Starting release process...${NC}"

# Ensure we're on master/main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "master" && "$CURRENT_BRANCH" != "main" ]]; then
  echo -e "${RED}Error: Please switch to master or main branch before releasing${NC}"
  exit 1
fi

# Ensure working directory is clean
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}Error: Working directory is not clean. Commit or stash changes first.${NC}"
  exit 1
fi

# Pull latest changes
echo -e "${GREEN}Pulling latest changes...${NC}"
git pull origin $CURRENT_BRANCH

# Run tests
echo -e "${GREEN}Running tests...${NC}"
npm test

# Run build
echo -e "${GREEN}Building package...${NC}"
npm run build

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: $CURRENT_VERSION${NC}"

# Bump version
echo -e "${GREEN}Bumping version ($VERSION_TYPE)...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}New version: $NEW_VERSION${NC}"

# Commit version bump
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes and tags
echo -e "${YELLOW}Pushing to remote...${NC}"
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"

echo -e "${GREEN}Release v$NEW_VERSION completed successfully!${NC}"
echo -e "${YELLOW}GitHub Actions will automatically publish to npm.${NC}"
echo -e "${YELLOW}Monitor the workflow at: https://github.com/Kareem-3del/aramex-sdk/actions${NC}"
