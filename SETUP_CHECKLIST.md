# Security & Automation Setup Checklist

Complete these steps to activate all security and automation features.

## 1. GitHub Repository Settings

### Enable GitHub Actions
- [ ] Go to Settings → Actions → General
- [ ] Set "Workflow permissions" to "Read and write permissions"
- [ ] Enable "Allow GitHub Actions to create and approve pull requests"
- [ ] Click "Save"

### Configure Branch Protection
- [ ] Go to Settings → Branches
- [ ] Add rule for `master` (or `main`) branch
- [ ] Enable "Require status checks to pass before merging"
- [ ] Select required status checks:
  - [ ] test (Node 18, 20, 22)
  - [ ] npm-audit
  - [ ] codeql
  - [ ] validate
  - [ ] security-scan
- [ ] Enable "Require branches to be up to date before merging"
- [ ] Enable "Allow auto-merge"
- [ ] Set "Require approvals" to 1
- [ ] Click "Save changes"

### Enable Security Features
- [ ] Go to Settings → Security → Code security and analysis
- [ ] Enable "Dependabot alerts"
- [ ] Enable "Dependabot security updates"
- [ ] Enable "CodeQL analysis" (should auto-enable with workflow)
- [ ] Enable "Secret scanning"

## 2. Secrets Configuration

### NPM Authentication Token
- [ ] Login to npm: `npm login`
- [ ] Create token: `npm token create --read-only=false`
- [ ] Copy the token
- [ ] Go to Settings → Secrets and variables → Actions
- [ ] Click "New repository secret"
- [ ] Name: `NPM_TOKEN`
- [ ] Value: Paste your npm token
- [ ] Click "Add secret"

### Verify Secrets
- [ ] Go to Settings → Secrets and variables → Actions
- [ ] Confirm `NPM_TOKEN` is listed
- [ ] `GITHUB_TOKEN` is automatically provided

## 3. Repository Labels

Create these labels for auto-labeling (Settings → Labels):

- [ ] `dependencies` (color: 0366d6)
- [ ] `automated` (color: ededed)
- [ ] `github-actions` (color: 2188ff)
- [ ] `tests` (color: 0e8a16)
- [ ] `ci-cd` (color: 1d76db)
- [ ] `documentation` (color: 0075ca)
- [ ] `code` (color: d73a4a)
- [ ] `auto-merge` (color: bfd4f2)

Quick command to create all labels:
```bash
gh label create dependencies --color 0366d6
gh label create automated --color ededed
gh label create github-actions --color 2188ff
gh label create tests --color 0e8a16
gh label create ci-cd --color 1d76db
gh label create documentation --color 0075ca
gh label create code --color d73a4a
gh label create auto-merge --color bfd4f2
```

## 4. Test Workflows

### Test Security Workflow
- [ ] Create a test branch: `git checkout -b test/security-workflows`
- [ ] Make a small change: `echo "test" >> README.md`
- [ ] Commit: `git commit -am "test: security workflows"`
- [ ] Push: `git push origin test/security-workflows`
- [ ] Create PR: `gh pr create --title "test: security workflows"`
- [ ] Check that these workflows run:
  - [ ] Test
  - [ ] Security Scanning
  - [ ] PR Checks
- [ ] Verify CodeQL analysis appears in Security tab
- [ ] Close PR after verification

### Test Auto-Merge
- [ ] Wait for Dependabot to create first PR (or create one manually with `auto-merge` label)
- [ ] Verify auto-approval happens
- [ ] Verify auto-merge happens after all checks pass
- [ ] Check PR was merged successfully

### Test Auto-Publish
- [ ] Update version: `npm version patch`
- [ ] Commit: `git commit -am "chore: bump version"`
- [ ] Push to master: `git push origin master`
- [ ] Verify auto-publish workflow runs
- [ ] Check package published to npm: `npm view @kareem-3del/aramex-sdk`
- [ ] Verify Git tag created: `git tag -l`
- [ ] Verify GitHub release created

## 5. Monitoring Setup

### Enable Notifications
- [ ] Go to Settings → Notifications
- [ ] Configure "Actions" notifications
- [ ] Enable notifications for:
  - [ ] Failed workflows
  - [ ] Dependabot alerts
  - [ ] Security alerts

### GitHub Security Tab
- [ ] Visit Security tab in repository
- [ ] Confirm CodeQL scanning is active
- [ ] Check for any existing vulnerabilities
- [ ] Review Dependabot alerts

### NPM Package Health
- [ ] Visit https://www.npmjs.com/package/@kareem-3del/aramex-sdk
- [ ] Verify package shows as published
- [ ] Check package health score
- [ ] Review download statistics

## 6. Documentation Review

Review these files for understanding:
- [ ] `SECURITY_AUTOMATION.md` - Complete documentation
- [ ] `.github/WORKFLOWS.md` - Quick reference
- [ ] `.github/SECURITY.md` - Security policy
- [ ] `SETUP_CHECKLIST.md` - This file

## 7. Verify Integration

### Complete Flow Test
- [ ] Create feature branch
- [ ] Make changes
- [ ] Create PR
- [ ] Verify all checks run
- [ ] Approve PR
- [ ] Merge PR
- [ ] Verify no auto-publish (version unchanged)

### Version Release Test
- [ ] Update version in package.json
- [ ] Commit and push to master
- [ ] Verify auto-publish runs
- [ ] Check npm for new version
- [ ] Verify Git tag created
- [ ] Verify GitHub release created

## 8. Weekly Maintenance

Set calendar reminders for:
- [ ] Monday 10 AM: Review Dependabot PRs
- [ ] Weekly: Check Security tab for new alerts
- [ ] Weekly: Review failed workflow runs
- [ ] Monthly: Audit npm dependencies manually

## 9. Team Setup (if applicable)

If working with a team:
- [ ] Add team members as collaborators
- [ ] Share npm token securely (or create team token)
- [ ] Document merge approval process
- [ ] Set up code review assignments
- [ ] Configure notification preferences

## 10. Troubleshooting Verification

Test these scenarios:
- [ ] Workflow failure: Verify notification received
- [ ] Security vulnerability: Check Dependabot creates PR
- [ ] Manual publish: Verify publish.yml works with tags
- [ ] Failed auto-merge: Verify comment is added to PR

## Completion Checklist

All critical items completed:
- [ ] GitHub Actions enabled
- [ ] Branch protection configured
- [ ] NPM_TOKEN secret added
- [ ] Security features enabled
- [ ] Labels created
- [ ] Workflows tested successfully
- [ ] Notifications configured
- [ ] Documentation reviewed

## Support

If you encounter issues:
1. Check workflow logs: `gh run list` → `gh run view RUN_ID`
2. Verify secrets are set: `gh secret list`
3. Review branch protection rules
4. Check GitHub Actions permissions
5. Consult SECURITY_AUTOMATION.md

## Next Steps After Setup

1. Start using the automated workflows
2. Monitor Dependabot PRs weekly
3. Review security alerts promptly
4. Keep documentation updated
5. Optimize workflows based on usage patterns

---

**Setup Status**: ⬜ Not Started | 🔄 In Progress | ✅ Completed

Mark this document as you complete each step!
