# SSH Key Authentication Fix for CD Workflow

## Problem
The CD workflow is failing with SSH authentication error:
```
ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey], no supported methods remain
```

## Root Cause
The SSH private key stored in GitHub Secrets (VPS_SSH_KEY) is not being accepted by the VPS.

## Solution Steps

### Step 1: Generate New SSH Key Pair (on your local machine)
```bash
# Generate ED25519 key (recommended for GitHub Actions)
ssh-keygen -t ed25519 -C "github-actions@ibudget-cd" -f ~/.ssh/ibudget_github_actions -N ""

# This creates:
# - ~/.ssh/ibudget_github_actions (private key - for GitHub Secret)
# - ~/.ssh/ibudget_github_actions.pub (public key - for VPS)
```

### Step 2: Add Public Key to VPS
```bash
# Copy public key to VPS
ssh-copy-id -i ~/.ssh/ibudget_github_actions.pub root@72.61.114.163

# Or manually:
ssh root@72.61.114.163
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the content of ibudget_github_actions.pub
# Save and exit
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step 3: Test SSH Connection
```bash
# Test that the new key works
ssh -i ~/.ssh/ibudget_github_actions root@72.61.114.163 "echo 'SSH connection successful!'"
```

### Step 4: Update GitHub Secret
```bash
# Read the private key content
cat ~/.ssh/ibudget_github_actions

# Copy the ENTIRE output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... (all the lines)
# -----END OPENSSH PRIVATE KEY-----

# Update GitHub Secret
gh secret set VPS_SSH_KEY < ~/.ssh/ibudget_github_actions

# Or use the GitHub web UI:
# 1. Go to: https://github.com/PUP-BSIT/project-appvengers/settings/secrets/actions
# 2. Click on VPS_SSH_KEY → Update secret
# 3. Paste the entire private key content
# 4. Click Update secret
```

### Step 5: Verify GitHub Secrets
```bash
gh secret list

# Should show:
# VPS_HOST        (contains: 72.61.114.163)
# VPS_USERNAME    (contains: root)
# VPS_SSH_KEY     (contains: the private key - updated timestamp should be recent)
```

### Step 6: Trigger CD Workflow
```bash
# Make a small test change
echo "# CD Pipeline Test" >> README.md
git add README.md
git commit -m "test: Trigger CD workflow with fixed SSH key"
git push origin main

# Monitor the workflow
gh run watch
```

## Verification Checklist

- [ ] New SSH key pair generated
- [ ] Public key added to VPS ~/.ssh/authorized_keys
- [ ] SSH connection tested successfully from local machine
- [ ] GitHub Secret VPS_SSH_KEY updated with new private key
- [ ] CD workflow triggered and monitored
- [ ] Workflow completes successfully without SSH errors

## Common Issues

### Issue: "Permission denied (publickey)"
**Solution**: Verify authorized_keys permissions on VPS:
```bash
ssh root@72.61.114.163
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Issue: "Key format not recognized"
**Solution**: Ensure you're copying the ENTIRE private key including headers:
```
-----BEGIN OPENSSH PRIVATE KEY-----
... (all content)
-----END OPENSSH PRIVATE KEY-----
```

### Issue: "Host key verification failed"
**Solution**: Add to workflow file debug options and disable strict host key checking temporarily.
