# CI/CD Pipeline Overview

Complete security and automation setup for @kareem-3del/aramex-sdk package.

## What Was Implemented

### 1. Security Scanning (security.yml)
**Purpose**: Comprehensive security analysis on every code change

**Features**:
- NPM vulnerability scanning (moderate+ severity blocking)
- CodeQL semantic code analysis for security issues
- Dependency review on pull requests
- Weekly automated security scans

**Runs on**: Push, PR, Weekly schedule
**Duration**: ~3 minutes

### 2. Dependabot Configuration (dependabot.yml)
**Purpose**: Automated dependency management

**Features**:
- Weekly NPM dependency checks (Monday 9 AM)
- Weekly GitHub Actions updates
- Grouped updates (production/dev/major)
- Auto-ignore major versions (manual review required)
- Smart versioning strategy

**Creates PRs for**: Dependencies and GitHub Actions updates
**Max PRs**: 5 for NPM, 3 for Actions

### 3. Auto-Merge Workflow (auto-merge.yml)
**Purpose**: Automated PR approval and merging

**Features**:
- Auto-approve Dependabot patch/minor updates
- Auto-merge when all checks pass
- Safety checks (tests, approvals, clean merge state)
- Comments on major updates for manual review

**Conditions**: All checks passed + approved + clean state
**Safety**: Never merges failing PRs

### 4. Auto-Publish Workflow (auto-publish.yml)
**Purpose**: Automated npm publishing on version changes

**Features**:
- Detects version changes in package.json
- Runs security audit before publish
- Publishes to npm registry
- Creates Git tag and GitHub release
- Notifications on success/failure

**Trigger**: Push to master with version change
**Duration**: ~2 minutes

### 5. PR Checks Workflow (pr-checks.yml)
**Purpose**: Validate PRs and auto-label

**Features**:
- Full test suite execution
- Build validation
- Security scanning
- Package size checking
- Auto-labeling based on file changes

**Runs on**: Every PR
**Duration**: ~5 minutes

### 6. Enhanced Test Workflow (test.yml)
**Purpose**: Multi-version testing

**Features**:
- Tests across Node.js 18, 20, 22
- Code coverage reporting
- Build verification
- Artifact uploads

**Runs on**: Push and PR
**Duration**: ~5 minutes

## Complete Pipeline Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                       │
└──────────────────────────────────────────────────────────────┘

Developer Creates PR
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTOMATED PR CHECKS                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Test Suite  │  │   Security   │  │  PR Checks   │      │
│  │  (3 Node.js) │  │   Scanning   │  │  + Labels    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                        │                                     │
│                   All Pass? ────────────┐                    │
│                        │                │                    │
│                       Yes               No                   │
│                        │                │                    │
│                        ▼                ▼                    │
│                  ┌──────────┐    ┌──────────┐               │
│                  │ Approve  │    │  Block   │               │
│                  │ Ready    │    │  Merge   │               │
│                  └──────────┘    └──────────┘               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTO-MERGE (if Dependabot or has "auto-merge" label)       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Check: Tests ✓ Approved ✓ Clean State ✓             │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│                  Merge to Master                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  VERSION CHECK                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Compare package.json version with previous commit     │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                    │
│    Version Changed? ──────────┐                             │
│         │                      │                             │
│        Yes                     No                            │
│         │                      │                             │
│         ▼                      ▼                             │
│  ┌──────────┐          ┌──────────┐                        │
│  │ Proceed  │          │   Stop   │                        │
│  └──────────┘          └──────────┘                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  SECURITY CHECK BEFORE PUBLISH                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  NPM Audit   │  │  Test Suite  │  │    Build     │      │
│  │  (High+)     │  │   (Full)     │  │  Validation  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                        │                                     │
│                   All Pass?                                  │
│                        │                                     │
│                       Yes ────────────────── No (Abort)      │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PUBLISH TO NPM                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Build package                                      │  │
│  │ 2. Publish to npm registry                            │  │
│  │ 3. Create Git tag (v1.0.0)                           │  │
│  │ 4. Create GitHub release                              │  │
│  │ 5. Notify success/failure                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────┐
    │ Complete │
    └──────────┘
```

## Dependabot Workflow

```
Monday 9:00 AM
         │
         ▼
Dependabot Checks for Updates
         │
         ▼
Updates Found? ────────┐
         │             │
        Yes            No
         │             │
         ▼             ▼
Create PR           Nothing
(Group by type)
         │
         ▼
┌────────────────────────┐
│ PR Created             │
│ - Type: Dependencies   │
│ - Label: automated     │
│ - Assign: Kareem-3del  │
└────────────────────────┘
         │
         ▼
Run PR Checks
(Test + Security + Build)
         │
         ▼
    All Pass? ──────────┐
         │              │
        Yes             No
         │              │
         ▼              ▼
Update Type?       Block Merge
    │    │
Patch  Minor  Major
    │    │      │
    └────┘      │
         │      ▼
         │   Comment:
         │   "Manual Review
         │    Required"
         │      │
         ▼      │
    Auto-Approve│
         │      │
         ▼      ▼
    Auto-Merge  Wait
         │
         ▼
  Version Changed?
    │         │
   Yes        No
    │         │
    ▼         ▼
 Publish    Done
```

## Security Features

### 1. Multi-Layer Scanning
```
Code Push
    │
    ├─→ NPM Audit (dependency vulnerabilities)
    ├─→ CodeQL (code security issues)
    ├─→ Dependency Review (new dependency risks)
    └─→ Weekly Deep Scan
```

### 2. Pre-Publish Security Gate
```
Before Every Publish:
    ├─→ Security Audit (high+ severity check)
    ├─→ Full Test Suite
    └─→ Build Validation

All Must Pass to Publish
```

### 3. Automated Updates with Safety
```
Dependabot Update
    │
    ├─→ Patch/Minor: Auto-approved & merged
    ├─→ Major: Requires manual review
    └─→ All: Must pass security checks
```

## File Structure

```
aramex-sdk/
├── .github/
│   ├── workflows/
│   │   ├── test.yml              # Multi-version testing
│   │   ├── security.yml          # Security scanning
│   │   ├── pr-checks.yml         # PR validation
│   │   ├── auto-merge.yml        # Automated merging
│   │   ├── auto-publish.yml      # Version-based publish
│   │   └── publish.yml           # Manual tag publish
│   ├── dependabot.yml            # Dependency automation
│   ├── SECURITY.md               # Security policy
│   └── WORKFLOWS.md              # Quick reference
├── SECURITY_AUTOMATION.md        # Complete documentation
├── SETUP_CHECKLIST.md            # Setup guide
└── CI_CD_OVERVIEW.md             # This file
```

## Quick Commands

### For Developers

**Create PR with auto-merge**:
```bash
gh pr create --label "auto-merge" --title "feat: new feature"
```

**Publish new version**:
```bash
npm version patch  # or minor, or major
git push origin master
# Auto-publish triggers automatically
```

**Check security status**:
```bash
npm audit
npm audit --production
```

**View workflow runs**:
```bash
gh run list
gh run watch
```

### For Maintainers

**Review Dependabot PRs**:
```bash
gh pr list --author app/dependabot
gh pr view PR_NUMBER
gh pr merge PR_NUMBER --squash
```

**Check security alerts**:
```bash
gh api /repos/:owner/:repo/vulnerability-alerts
```

**Manual publish**:
```bash
npm version patch
git tag v1.0.1
git push origin v1.0.1
```

## Configuration Requirements

### GitHub Secrets
```
NPM_TOKEN: npm authentication token (required)
GITHUB_TOKEN: automatically provided
```

### Branch Protection Rules
```
master/main branch:
├── Require status checks: test, npm-audit, codeql, validate, security-scan
├── Require approvals: 1
├── Require branch up to date: Yes
└── Allow auto-merge: Yes
```

### Repository Settings
```
Actions permissions:
├── Read and write permissions
└── Allow Actions to create/approve PRs
```

## Performance Metrics

### Workflow Duration
- Test Suite: ~5 minutes
- Security Scan: ~3 minutes
- PR Checks: ~5 minutes
- Auto-Publish: ~2 minutes
- Total PR to Publish: ~15 minutes

### Automation Coverage
- Dependency Updates: 100% automated
- Security Scanning: 100% automated
- Testing: 100% automated
- Publishing: 95% automated (version bump manual)
- Merging: 90% automated (major updates manual)

## Best Practices

### Version Management
```bash
# Patch (1.0.0 → 1.0.1): Bug fixes
npm version patch

# Minor (1.0.0 → 1.1.0): New features
npm version minor

# Major (1.0.0 → 2.0.0): Breaking changes
npm version major
```

### Commit Messages
```
feat: add new feature
fix: resolve bug
chore: update dependencies
docs: update documentation
ci: update workflows
test: add tests
```

### PR Labels
- `auto-merge`: Enable auto-merge for PR
- `dependencies`: Dependency updates
- `automated`: Dependabot PRs
- `tests`: Test changes
- `ci-cd`: Workflow changes

## Monitoring

### GitHub Tabs
- **Actions**: Workflow runs and logs
- **Security**: Vulnerabilities and alerts
- **Insights**: Dependency graph

### NPM Registry
- **Package**: https://www.npmjs.com/package/@kareem-3del/aramex-sdk
- **Health**: Package health score
- **Stats**: Download statistics

### Notifications
- Failed workflows
- Security alerts
- Dependabot PRs

## Troubleshooting

### Workflow Failures
```bash
# View failed runs
gh run list --status failure

# View logs
gh run view RUN_ID --log-failed

# Rerun failed workflow
gh run rerun RUN_ID
```

### Security Issues
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may break)
npm audit fix --force
```

### Publish Issues
```bash
# Verify token
npm whoami

# Check version
npm view @kareem-3del/aramex-sdk version

# Manual publish
npm publish --access public
```

## Documentation Links

1. **SECURITY_AUTOMATION.md**: Complete technical documentation
2. **SETUP_CHECKLIST.md**: Step-by-step setup guide
3. **.github/WORKFLOWS.md**: Quick workflow reference
4. **.github/SECURITY.md**: Security policy and reporting

## Support

- **Repository**: https://github.com/Kareem-3del/aramex-sdk
- **Issues**: https://github.com/Kareem-3del/aramex-sdk/issues
- **NPM**: https://www.npmjs.com/package/@kareem-3del/aramex-sdk
- **Author**: kareem-3del

## Summary

This setup provides:
- Comprehensive security scanning
- Automated dependency management
- Safe auto-merge capabilities
- Version-based auto-publishing
- Complete PR validation
- Weekly security audits
- Automated labeling and notifications

All workflows are production-ready and follow GitHub Actions best practices.
