# EventFlow Deployment Guide

This guide covers deployment strategies for EventFlow in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Vercel Deployment](#vercel-deployment)
4. [Docker Deployment](#docker-deployment)
5. [CI/CD Setup](#cicd-setup)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

Before deploying, ensure you have:

- ✅ All tests passing (`npm run test`)
- ✅ Type checks passing (`npm run type-check`)
- ✅ Lint checks passing (`npm run lint`)
- ✅ Production build successful (`npm run build`)
- ✅ Security checks passed (`npm run security:check`)
- ✅ Lighthouse scores >90 (`npm run lighthouse`)
- ✅ Production readiness verified (`npm run verify`)

## Environment Configuration

### Required Environment Variables

Create `.env.production` with:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-token

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Security Checklist

- [ ] All secrets use strong random values
- [ ] Production keys (not test keys) configured
- [ ] Environment variables not committed to git
- [ ] Database uses SSL/TLS connection
- [ ] API endpoints rate-limited
- [ ] Security headers configured in `next.config.ts`

## Vercel Deployment

### Option 1: Git Integration (Recommended)

1. **Connect Repository**

   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Configure Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all production variables
   - Separate staging/production as needed

### Option 2: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Docker Deployment

### Build Docker Image

```bash
# Build image
docker build -t eventflow:latest .

# Tag for registry
docker tag eventflow:latest registry.example.com/eventflow:latest

# Push to registry
docker push registry.example.com/eventflow:latest
```

### Run with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Docker Environment Variables

Create `.env` file:

```env
# Copy from .env.production
# Ensure all required variables are set
```

### Docker Health Checks

The Docker container includes health checks:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:3000/api/health
```

## CI/CD Setup

### GitHub Actions

The CI/CD pipeline is configured in `.github/workflows/ci-cd.yml`.

**Workflow Stages:**

1. **Lint & Type Check**: Code quality verification
2. **Unit Tests**: Component and utility tests
3. **Integration Tests**: API and integration tests
4. **E2E Tests**: Full application tests
5. **Security Scan**: Vulnerability scanning
6. **Build**: Production build
7. **Deploy Staging**: Auto-deploy to staging (develop branch)
8. **Deploy Production**: Manual approval required (main branch)

### Required Secrets

Add these secrets in GitHub Settings → Secrets:

- `VERCEL_TOKEN`: Vercel deployment token
- `DATABASE_URL`: Production database URL
- `NEXTAUTH_SECRET`: Authentication secret
- `STRIPE_SECRET_KEY`: Stripe production key
- `SNYK_TOKEN`: Security scanning token (optional)

### Manual Deployment Trigger

```bash
# Push to main branch
git push origin main

# Or create a release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## Post-Deployment

### Verification Steps

1. **Smoke Tests**

   ```bash
   # Test critical endpoints
   curl https://your-domain.com/api/health
   curl https://your-domain.com
   ```

2. **Functional Tests**

   - Test user registration
   - Test event creation
   - Test ticket purchase
   - Test payment processing

3. **Performance Check**

   ```bash
   # Run Lighthouse
   npm run lighthouse -- --url https://your-domain.com
   ```

4. **Security Headers**
   ```bash
   # Check security headers
   node scripts/security/check-headers.js https://your-domain.com
   ```

### Database Migrations

```bash
# Run migrations on production
npm run db:migrate

# Verify migration
npm run db:verify
```

### SSL/TLS Setup

For Docker deployments:

1. **Obtain SSL Certificate**

   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d your-domain.com
   ```

2. **Configure Nginx**
   - Update `nginx.conf` with SSL configuration
   - Restart Nginx container

## Monitoring

### Application Monitoring

1. **Error Tracking**

   - Errors automatically reported to monitoring service
   - Check dashboard for error rates

2. **Performance Monitoring**

   - Core Web Vitals tracked
   - API response times monitored
   - Database query performance

3. **Uptime Monitoring**
   - Use external service (UptimeRobot, Pingdom)
   - Monitor `/api/health` endpoint

### Log Management

```bash
# View application logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f nginx

# Export logs
docker-compose logs > logs.txt
```

### Alerts Configuration

Set up alerts for:

- Error rate > 1%
- API response time > 1s
- Failed health checks
- High memory/CPU usage
- Failed deployments

## Rollback Procedures

### Vercel Rollback

1. Go to Vercel Dashboard
2. Select previous deployment
3. Click "Promote to Production"

### Docker Rollback

```bash
# Stop current version
docker-compose down

# Pull previous version
docker pull registry.example.com/eventflow:v1.0.0

# Update docker-compose.yml to use previous tag
# Restart services
docker-compose up -d
```

### Database Rollback

```bash
# Rollback last migration
npm run db:rollback

# Rollback to specific version
npm run db:rollback --to 20240101000000
```

### Emergency Rollback

If critical issue detected:

1. **Immediate Action**

   - Enable maintenance mode
   - Rollback to last stable version
   - Notify team

2. **Communication**

   - Update status page
   - Notify users (if needed)
   - Document incident

3. **Post-Mortem**
   - Analyze root cause
   - Implement fixes
   - Update deployment procedures

## Scaling

### Horizontal Scaling

For high traffic:

1. **Vercel**: Automatic scaling included
2. **Docker**: Use orchestration (Kubernetes, Docker Swarm)

### Database Scaling

- Read replicas for read-heavy operations
- Connection pooling
- Query optimization

### CDN Configuration

- Static assets served via CDN
- Image optimization
- Edge caching for API responses

## Maintenance

### Scheduled Maintenance

1. **Notify Users**

   - 48 hours advance notice
   - Display maintenance banner

2. **Enable Maintenance Mode**

   ```bash
   # Set environment variable
   MAINTENANCE_MODE=true
   ```

3. **Perform Updates**

   - Database migrations
   - Configuration changes
   - Dependency updates

4. **Verify and Re-enable**
   - Run smoke tests
   - Disable maintenance mode
   - Monitor for issues

## Support

For deployment issues:

- 📖 Check logs: `docker-compose logs`
- 🔍 Review checklist: `npm run verify`
- 💬 Contact DevOps: devops@eventflow.com
- 🆘 Emergency: emergency@eventflow.com

## Appendix

### Deployment Checklist

```markdown
## Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] Rollback plan documented

## Deployment

- [ ] Build successful
- [ ] Deployment completed
- [ ] Health checks passing
- [ ] Smoke tests completed

## Post-Deployment

- [ ] Functional tests passed
- [ ] Performance verified
- [ ] Monitoring active
- [ ] Team notified
- [ ] Documentation updated
```

### Common Issues

**Issue**: Build fails with memory error
**Solution**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`

**Issue**: Database connection timeout
**Solution**: Check DATABASE_URL, verify network access, increase timeout

**Issue**: Assets not loading
**Solution**: Verify CDN configuration, check CORS headers

---

**Last Updated**: December 2024  
**Version**: 1.0.0
