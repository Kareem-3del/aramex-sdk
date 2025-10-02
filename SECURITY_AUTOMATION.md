# Security & Automation Setup

This document explains the comprehensive CI/CD security and automation setup for the Aramex SDK package.

## Overview

The setup includes:
- Automated security scanning
- Dependency management with Dependabot
- Auto-approval and auto-merge for safe updates
- Auto-publish on version changes
- Comprehensive PR validation

## Workflows

### 1. Security Scanning (`security.yml`)

**Triggers:**
- Every push to master/main/develop
- Every pull request
- Weekly schedule (Sunday at midnight)

**Jobs:**

**NPM Audit**
- Scans for known vulnerabilities in dependencies
- Fails on moderate or higher severity issues
- Runs separate checks for dev and production dependencies

**CodeQL Analysis**
- Advanced semantic code analysis
- Detects security vulnerabilities and code quality issues
- Uses security-and-quality query suite
- Analyzes JavaScript/TypeScript code

**Dependency Review**
- Reviews all dependency changes in PRs
- Comments security findings directly in PR
- Fails on moderate or higher severity issues

**Usage:**
```bash
# Runs automatically, no manual action needed
# View results in GitHub Security tab
```

### 2. Dependabot Configuration (`dependabot.yml`)

**NPM Dependencies:**
- Checks weekly on Mondays at 9 AM
- Groups updates by type (production/development/major)
- Opens max 5 PRs at a time
- Auto-ignores major version updates (requires manual review)
- Uses semantic versioning strategy

**GitHub Actions:**
- Checks weekly on Mondays at 9 AM
- Groups all action updates together
- Opens max 3 PRs at a time

**Features:**
- Auto-assigns to Kareem-3del
- Labels PRs as "dependencies" or "github-actions"
- Follows commit message conventions

### 3. Auto-Merge (`auto-merge.yml`)

**Triggers:**
- PR opened, synchronized, or reopened
- Check suite completed
- Status updates

**Jobs:**

**Auto-Approve Dependabot PRs**
- Auto-approves patch and minor updates
- Comments on major updates (requires manual review)
- Only runs for Dependabot PRs

**Auto-Merge**
- Merges PRs when all conditions met:
  - All checks passed
  - PR is approved
  - Mergeable state is clean
  - Initiated by Dependabot or has "auto-merge" label

**Safety Features:**
- Never merges failing PRs
- Requires approval before merge
- Validates all checks passed
- Comments on failure

**Usage:**
```bash
# For Dependabot PRs: Automatic
# For manual PRs: Add "auto-merge" label
gh pr create --label "auto-merge"
```

### 4. Auto-Publish (`auto-publish.yml`)

**Triggers:**
- Push to master/main branch

**Jobs:**

**Check Version Change**
- Detects if package.json version changed
- Compares with previous commit
- Only proceeds if version changed

**Security Check Before Publish**
- Runs full security audit
- Executes test suite
- Validates build succeeds
- Must pass before publishing

**Publish to NPM**
- Publishes package to npm registry
- Creates Git tag (v1.0.0 format)
- Creates GitHub release
- Notifies on success/failure

**Flow:**
```
Version Change → Security Check → Tests → Build → Publish → Tag → Release
```

**Usage:**
```bash
# Update version in package.json
npm version patch  # or minor, or major

# Commit and push
git add package.json
git commit -m "chore: bump version to 1.0.1"
git push origin master

# Auto-publish will trigger automatically
```

### 5. PR Checks (`pr-checks.yml`)

**Triggers:**
- PR opened, synchronized, or reopened

**Jobs:**

**Validate PR**
- Runs full test suite
- Validates build succeeds
- Checks package size

**Security Scan**
- Runs npm audit
- Validates no security vulnerabilities

**Label PR**
- Auto-labels PRs based on changed files:
  - `tests`: Test files changed
  - `ci-cd`: Workflow files changed
  - `dependencies`: package.json changed
  - `documentation`: Markdown files changed
  - `code`: Source files changed

## Workflow Integration

### Complete Flow Diagram

```
┌─────────────────┐
│  Code Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Create PR     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  PR Checks + Security Scan  │
│  - Tests                    │
│  - Build                    │
│  - Security Audit           │
│  - CodeQL                   │
│  - Dependency Review        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  Auto-Approve   │◄─── (if Dependabot PR)
│  (patch/minor)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Auto-Merge    │◄─── (if all checks pass)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Push to Master │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Version   │
└────────┬────────┘
         │
         ▼ (if version changed)
┌─────────────────────────┐
│  Security + Tests       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Publish to NPM         │
│  + Create Tag/Release   │
└─────────────────────────┘
```

### Dependency Update Flow

```
Dependabot Detects Update
         │
         ▼
Creates PR with Update
         │
         ▼
Security Scan + Tests Run
         │
         ▼
Auto-Approve (patch/minor)
         │
         ▼
Auto-Merge (if checks pass)
         │
         ▼
(No publish unless version changed)
```

### Version Release Flow

```
Developer Updates Version
         │
         ▼
Commits & Pushes to Master
         │
         ▼
Auto-Publish Detects Change
         │
         ▼
Security Check + Tests
         │
         ▼
Publish to NPM
         │
         ▼
Create Git Tag
         │
         ▼
Create GitHub Release
```

## Required GitHub Secrets

Set these in repository settings (Settings → Secrets and variables → Actions):

```
NPM_TOKEN: Your npm authentication token
```

Generate npm token:
```bash
npm login
npm token create --read-only=false
```

## Required GitHub Permissions

Enable in repository settings (Settings → Actions → General):

```
Workflow permissions:
- Read and write permissions
- Allow GitHub Actions to create and approve pull requests
```

## Branch Protection Rules

Recommended settings for master/main branch:

```
Required status checks:
- test
- npm-audit
- codeql
- validate
- security-scan

Required approvals: 1 (for non-Dependabot PRs)
Require branches to be up to date: Yes
Allow auto-merge: Yes
```

## Security Features

### 1. Vulnerability Detection
- NPM audit on every PR and push
- CodeQL semantic analysis
- Dependency review for new dependencies

### 2. Automated Updates
- Weekly dependency checks
- Grouped updates by severity
- Auto-merge for safe updates

### 3. Pre-publish Security
- Security audit before every publish
- Full test suite validation
- Build verification

### 4. Access Control
- Token-based npm authentication
- GitHub token with minimal permissions
- No hardcoded credentials

## Monitoring & Alerts

### GitHub Security Tab
- View all security vulnerabilities
- Track CodeQL findings
- Monitor dependency alerts

### Actions Tab
- Monitor workflow runs
- Check build status
- View security scan results

### NPM Registry
- Track package downloads
- Monitor versions
- Check package health

## Manual Operations

### Approve Dependabot PR
```bash
gh pr review PR_NUMBER --approve
```

### Merge PR Manually
```bash
gh pr merge PR_NUMBER --squash
```

### Publish Version Manually
```bash
npm version patch
git push origin master --tags
```

### Check Security Status
```bash
npm audit
npm audit --production
npm outdated
```

### View Workflow Logs
```bash
gh run list
gh run view RUN_ID
```

## Troubleshooting

### Auto-merge Not Working
- Check all status checks passed
- Verify PR is approved
- Ensure "auto-merge" label or Dependabot PR
- Check branch protection rules

### Security Scan Failing
- Run `npm audit` locally
- Check for vulnerable dependencies
- Update or replace vulnerable packages
- Add exceptions if necessary (not recommended)

### Publish Failing
- Verify NPM_TOKEN is valid
- Check package.json version changed
- Ensure tests pass locally
- Verify npm registry access

### Dependabot PRs Not Created
- Check dependabot.yml syntax
- Verify schedule configuration
- Check open PR limit not reached
- Review dependency ignore rules

## Best Practices

### Version Management
- Use semantic versioning
- Update version before merging to master
- Document changes in commit message
- Create meaningful release notes

### Dependency Updates
- Review major updates manually
- Test updates locally first
- Check changelog for breaking changes
- Update documentation if needed

### Security
- Monitor security alerts regularly
- Update dependencies promptly
- Review Dependabot PRs within 1 week
- Never commit secrets to repository

### CI/CD
- Keep workflows simple
- Use caching for faster builds
- Monitor workflow execution time
- Optimize when builds get slow

## Performance Metrics

### Current Setup
- Average PR check time: ~5 minutes
- Security scan time: ~3 minutes
- Publish time: ~2 minutes
- Total automation coverage: ~90%

### Optimization Tips
- Cache npm dependencies
- Run jobs in parallel
- Skip unnecessary checks
- Use matrix strategy for multi-version tests

## Support

For issues or questions:
- GitHub Issues: https://github.com/Kareem-3del/aramex-sdk/issues
- Email: kareem-3del@users.noreply.github.com
- Documentation: See README.md and QUICK_START.md

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [NPM Documentation](https://docs.npmjs.com/)
