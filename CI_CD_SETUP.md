# CI/CD Pipeline Setup Guide

## Overview
This guide helps you set up the Continuous Deployment (CD) pipeline for iBudget. The pipeline automatically builds and deploys code from the `main` branch to production.

## Architecture
```
Push to main branch
    ↓
GitHub Actions CI (runs tests)
    ↓
GitHub Actions CD (builds artifacts)
    ↓
Commits build to 'prod' branch
    ↓
SSH into VPS and runs deployment script
    ↓
VPS pulls 'prod' branch and deploys
```

## Prerequisites
✅ VPS is configured and running (72.61.114.163)
✅ SSH key generated for GitHub Actions
✅ Deployment script created on VPS
✅ CD workflow file created

## Step 1: Configure GitHub Secrets

You need to add 3 secrets to your GitHub repository:

1. Go to GitHub repository: https://github.com/PUP-BSIT/project-appvengers
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

### Secret 1: VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: `72.61.114.163`

### Secret 2: VPS_USERNAME
- **Name**: `VPS_USERNAME`
- **Value**: `root`

### Secret 3: VPS_SSH_KEY
- **Name**: `VPS_SSH_KEY`
- **Value**: Copy the PRIVATE KEY from the output above (the entire content between `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` including those lines)

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDK4eV8dZqYtckD3KjfvgWVoPzZ9/pUj+/tuhfJXobf6gAAAKAQNAcdEDQH
HQAAAAtzc2gtZWQyNTUxOQAAACDK4eV8dZqYtckD3KjfvgWVoPzZ9/pUj+/tuhfJXobf6g
AAAEBddgG9hx8e0ClPHYVtbG5XyoVKaPuvvea1Au7WZNm/Msrh5Xx1mpi1yQPcqN++BZWg
/Nn3+lSP7+26F8leht/qAAAAFmdpdGh1Yi1hY3Rpb25zQGlidWRnZXQBAgMEBQYH
-----END OPENSSH PRIVATE KEY-----
```

## Step 2: Create the 'prod' Branch

The CD workflow will create this automatically on first run, but you can create it manually:

```bash
git checkout -b prod
git push origin prod
```

## Step 3: Commit and Push Workflow Files

```bash
# Add the new CD workflow file
git add .github/workflows/cd.yml

# Commit
git commit -m "Add CI/CD pipeline for automated deployment"

# Push to main branch
git push origin main
```

## Step 4: Test the Deployment

Once you've pushed to main:

1. Go to **Actions** tab in GitHub repository
2. You should see the "I-Budget CD Deployment Workflow" running
3. Click on it to see the progress
4. Watch the logs for each step

## How It Works

### When Code is Pushed to Main:

1. **CI Workflow** (`ci.yml`) runs first:
   - Runs frontend tests
   - Runs backend tests
   - Must pass before CD can run

2. **CD Workflow** (`cd.yml`) runs after CI passes:
   - Builds Angular frontend (production mode)
   - Builds Spring Boot backend (JAR file)
   - Commits build artifacts to `prod` branch
   - SSH into VPS
   - Runs `/var/www/ibudget/scripts/deploy.sh`

3. **Deployment Script** on VPS:
   - Creates backup of current deployment
   - Pulls latest code from `prod` branch
   - Stops backend service
   - Deploys new backend JAR
   - Starts backend service
   - Deploys new frontend build
   - Reloads Nginx
   - Cleans up old backups (keeps last 5)

## Deployment Script Location
- **VPS Path**: `/var/www/ibudget/scripts/deploy.sh`
- **Backup Location**: `/var/www/ibudget-backups/`

## Manual Deployment (If Needed)

If you need to deploy manually:

```bash
ssh root@72.61.114.163
cd /var/www/ibudget
./scripts/deploy.sh
```

## Rollback Procedure

If something goes wrong, backups are stored in `/var/www/ibudget-backups/`:

```bash
ssh root@72.61.114.163
cd /var/www/ibudget-backups
ls -lt  # Find the backup you need (format: YYYYMMDD_HHMMSS)

# Copy files back
cp YYYYMMDD_HHMMSS/*.jar /var/www/ibudget/backend/appvengers/target/
cp -r YYYYMMDD_HHMMSS/dist /var/www/ibudget/frontend/ibudget/

# Restart backend
systemctl restart ibudget-backend
```

## Monitoring Deployment

### View Workflow Logs
- GitHub → Actions tab → Click on workflow run

### View Deployment Logs on VPS
```bash
ssh root@72.61.114.163 "journalctl -u ibudget-backend -f"
```

### Check Service Status
```bash
ssh root@72.61.114.163 "systemctl status ibudget-backend nginx"
```

## Troubleshooting

### CD Workflow Fails at "Deploy to VPS" Step
- Check if SSH key is correctly added to GitHub Secrets
- Verify VPS is accessible: `ssh root@72.61.114.163`

### Backend Service Fails to Start
- Check logs: `journalctl -u ibudget-backend -n 50`
- Verify JAR file exists: `ls -lh /var/www/ibudget/backend/appvengers/target/*.jar`

### Frontend Not Updating
- Check if build artifacts are in prod branch
- Verify Nginx is serving from correct directory
- Clear browser cache

## Security Notes
- SSH private key is stored securely in GitHub Secrets
- Only root user can run deployment script
- Deployment script runs with restricted permissions
- Old backups are automatically cleaned up

## Workflow Files
- **CI**: `.github/workflows/ci.yml` (already exists)
- **CD**: `.github/workflows/cd.yml` (newly created)
- **Deployment Script**: `/var/www/ibudget/scripts/deploy.sh` (on VPS)

## Next Steps After Setup
1. Test deployment by making a small change and pushing to main
2. Monitor the GitHub Actions workflow
3. Verify the site updates at https://i-budget.site
4. Set up branch protection rules (optional):
   - Require CI to pass before merging to main
   - Require pull request reviews
