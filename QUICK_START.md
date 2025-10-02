# Quick Start: Publishing @kareem-3del/aramex-sdk to npm

## Initial Setup (One-Time)

### 1. Create npm Token
```bash
# Login to npmjs.com → Access Tokens → Generate New Token (Automation)
# Copy the token
```

### 2. Add to GitHub Secrets
```bash
# Go to: GitHub repo → Settings → Secrets and variables → Actions
# Add new secret: NPM_TOKEN = <your-token>
```

### 3. Update Repository URLs
Edit `package.json` and replace `your-username` with your actual GitHub username:
- repository.url
- bugs.url
- homepage

## Publishing a New Version

### Using the Release Script (Recommended)
```bash
cd aramex-sdk

# For bug fixes (1.0.0 → 1.0.1)
./scripts/release.sh patch

# For new features (1.0.0 → 1.1.0)
./scripts/release.sh minor

# For breaking changes (1.0.0 → 2.0.0)
./scripts/release.sh major
```

### Manual Release
```bash
cd aramex-sdk

# Update version
npm version patch  # or minor, major

# Push with tags
git push origin master --tags
```

## What Happens Automatically

1. Tests run on Node 18, 20, and 22
2. Package is built
3. Published to npm with public access
4. Available at: https://www.npmjs.com/package/@kareem-3del/aramex-sdk

## Testing Locally Before Publishing

```bash
# Run tests
npm test

# Build package
npm run build

# Create package tarball
npm pack

# Install in test project
cd /path/to/test-project
npm install ../aramex-sdk/aramex-sdk-1.0.0.tgz
```

## Workflows

### Automatic Publishing
- **Trigger**: Push tag (v*) or create GitHub release
- **File**: `.github/workflows/publish.yml`
- **Steps**: Test → Build → Publish to npm

### Continuous Testing
- **Trigger**: Push to master/main/develop or PR
- **File**: `.github/workflows/test.yml`
- **Steps**: Test on multiple Node versions → Upload coverage

## Files Created

- `.github/workflows/publish.yml` - Auto-publish workflow
- `.github/workflows/test.yml` - CI testing workflow
- `.gitignore` - Git ignore rules
- `.npmignore` - npm publish exclusions
- `.npmrc.example` - npm configuration example
- `scripts/release.sh` - Automated release script
- `NPM_PUBLISH_SETUP.md` - Detailed setup guide
- `QUICK_START.md` - This file

## package.json Updates

Added fields:
- `files` - Specifies what to include in npm package
- `repository` - GitHub repository info
- `bugs` - Issue tracker URL
- `homepage` - Package homepage

## Common Commands

```bash
# Check what will be published
npm pack --dry-run

# View package info
npm view @kareem-3del/aramex-sdk

# Check latest version
npm view @kareem-3del/aramex-sdk version

# Install published package
npm install @kareem-3del/aramex-sdk
```

## Troubleshooting

**Publishing fails?**
- Check NPM_TOKEN is set in GitHub Secrets
- Verify npm account has publish rights for @aramex scope
- Check workflow logs: GitHub → Actions tab

**Wrong files in package?**
- Review `files` field in package.json
- Check .npmignore exclusions
- Run `npm pack` locally to inspect

**Tests fail in CI?**
- Ensure all dependencies are in package.json
- Check Node version compatibility
- Review workflow logs for details

For detailed documentation, see `NPM_PUBLISH_SETUP.md`
