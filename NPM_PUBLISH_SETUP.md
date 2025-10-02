# NPM Publishing Setup Guide

This document provides instructions for setting up automated npm publishing for the @kareem-3del/aramex-sdk package.

## Prerequisites

1. **npm account**: You must have an npm account with publishing rights
2. **GitHub repository**: The package must be in a GitHub repository with Actions enabled
3. **npm access token**: You need to create an npm automation token

## Setup Instructions

### 1. Create NPM Access Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click on your profile icon (top right) → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" token type (recommended for CI/CD)
5. Copy the generated token (it will only be shown once)

### 2. Add NPM_TOKEN to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste the npm token from step 1
6. Click "Add secret"

### 3. Update Repository URLs in package.json

Before publishing, update the repository URLs in `package.json`:

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/Kareem-3del/aramex-sdk.git",
  "directory": "aramex-sdk"
},
"bugs": {
  "url": "https://github.com/Kareem-3del/aramex-sdk/issues"
},
"homepage": "https://github.com/Kareem-3del/aramex-sdk/tree/master/aramex-sdk#readme"
```

Replace `YOUR-USERNAME` with your actual GitHub username or organization name.

## Publishing Workflow

### Method 1: Using Version Tags (Recommended)

1. Update the version in `package.json`:
   ```bash
   cd aramex-sdk
   npm version patch  # or minor, major
   ```

2. Push the tag to GitHub:
   ```bash
   git push origin master --tags
   ```

3. The GitHub Action will automatically:
   - Run tests
   - Build the package
   - Publish to npm

### Method 2: Using GitHub Releases

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Create a new tag (e.g., `v1.0.1`)
4. Fill in release title and description
5. Click "Publish release"

The GitHub Action will automatically trigger and publish to npm.

## Version Bumping Guide

Use npm's version command to properly update versions:

```bash
# Patch release (1.0.0 → 1.0.1) - bug fixes
npm version patch

# Minor release (1.0.0 → 1.1.0) - new features, backward compatible
npm version minor

# Major release (1.0.0 → 2.0.0) - breaking changes
npm version major

# Pre-release versions
npm version prerelease --preid=beta  # 1.0.0 → 1.0.1-beta.0
```

## Workflow Details

The GitHub Actions workflow (`.github/workflows/publish.yml`) performs the following:

### Test Job
- Checks out the code
- Sets up Node.js 20
- Installs dependencies
- Runs tests
- Builds the package

### Publish Job (runs after tests pass)
- Checks out the code
- Sets up Node.js 20 with npm registry
- Installs dependencies
- Builds the package
- Publishes to npm with public access

## Files Included in npm Package

The following files will be included in the published package (defined in `package.json` "files" field):

- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Package documentation
- `LICENSE` - License file

The following files are excluded (via `.npmignore`):
- Source files (`src/`)
- Tests (`tests/`)
- Development dependencies
- Configuration files

## Testing Before Publishing

To test the package locally before publishing:

```bash
# Build the package
npm run build

# Pack the package (creates a .tgz file)
npm pack

# Test install the package in another project
cd /path/to/test-project
npm install /path/to/aramex-sdk/aramex-sdk-1.0.0.tgz
```

## Troubleshooting

### Publishing Fails with "403 Forbidden"
- Verify the NPM_TOKEN secret is correctly set in GitHub
- Check that your npm account has publishing rights for the @aramex scope
- Ensure the token type is "Automation" not "Publish"

### Tests Fail in CI but Pass Locally
- Check Node.js version consistency
- Verify all dependencies are listed in package.json
- Review test environment variables

### Package Published but Missing Files
- Check the `files` field in package.json
- Review .npmignore exclusions
- Run `npm pack` locally and inspect the .tgz contents

## Manual Publishing (Fallback)

If automated publishing fails, you can publish manually:

```bash
cd aramex-sdk
npm login
npm run build
npm publish --access public
```

## Best Practices

1. **Always test locally** before pushing tags
2. **Use semantic versioning** (MAJOR.MINOR.PATCH)
3. **Update CHANGELOG** before releasing
4. **Review package contents** with `npm pack` before publishing
5. **Never commit .env files** or sensitive data
6. **Keep dependencies updated** for security

## Support

For issues or questions:
- GitHub Issues: https://github.com/Kareem-3del/aramex-sdk/issues
- npm Package: https://www.npmjs.com/package/@kareem-3del/aramex-sdk
