# Workflows Quick Reference

## Active Workflows

### 1. `test.yml` - Test Suite
- **Trigger**: Push/PR to master, main, develop
- **Purpose**: Run tests across Node 18, 20, 22
- **Duration**: ~5 minutes
- **Outputs**: Test results, coverage report

### 2. `security.yml` - Security Scanning
- **Trigger**: Push/PR, Weekly (Sunday)
- **Purpose**: NPM audit, CodeQL, dependency review
- **Duration**: ~3 minutes
- **Checks**: Vulnerabilities, code security, dependency risks

### 3. `pr-checks.yml` - PR Validation
- **Trigger**: PR opened/updated
- **Purpose**: Validate PRs, auto-label
- **Duration**: ~5 minutes
- **Actions**: Test, build, security scan, auto-label

### 4. `auto-merge.yml` - Auto Merge
- **Trigger**: PR events, check completion
- **Purpose**: Auto-approve & merge safe PRs
- **Conditions**: All checks pass, approved, Dependabot or labeled
- **Safety**: Requires clean merge state

### 5. `auto-publish.yml` - Auto Publish
- **Trigger**: Push to master/main
- **Purpose**: Auto-publish when version changes
- **Flow**: Version check → Security → Publish → Tag → Release
- **Duration**: ~2 minutes

### 6. `publish.yml` - Manual Publish
- **Trigger**: Tag push (v*) or GitHub release
- **Purpose**: Manual publish to npm
- **Duration**: ~2 minutes

## Quick Commands

### Create PR with Auto-merge
```bash
gh pr create --label "auto-merge" --title "feat: new feature"
```

### Publish New Version
```bash
npm version patch  # 1.0.0 → 1.0.1
git push origin master
# Auto-publish triggers automatically
```

### Manual Publish
```bash
git tag v1.0.1
git push origin v1.0.1
# publish.yml triggers automatically
```

### Check Security Status
```bash
npm audit
npm audit --production
```

### View Workflow Status
```bash
gh run list
gh run watch
```

## Dependabot

### Update Schedule
- **NPM**: Mondays 9 AM
- **GitHub Actions**: Mondays 9 AM

### Auto-merge Conditions
- Patch updates: Auto-approved & merged
- Minor updates: Auto-approved & merged
- Major updates: Requires manual review

### PR Labels
- `dependencies`: NPM packages
- `github-actions`: Workflow updates
- `automated`: Dependabot PRs

## Status Checks

### Required for Merge
- test (Node 18, 20, 22)
- npm-audit
- codeql
- validate
- security-scan

### Optional
- coverage upload
- package size check

## Security Levels

### Critical
- Immediate action required
- Blocks all merges
- Fails npm audit

### High
- Review within 24h
- Blocks production deployments
- Requires security check

### Moderate
- Review within 1 week
- Warnings in PR
- Auto-merge blocked

### Low
- Review at convenience
- No blocking
- Tracked in security tab

## Troubleshooting

### Workflow Failed
```bash
gh run view RUN_ID --log-failed
```

### Rerun Failed Workflow
```bash
gh run rerun RUN_ID
```

### Cancel Running Workflow
```bash
gh run cancel RUN_ID
```

### Check Secrets
```bash
gh secret list
```
