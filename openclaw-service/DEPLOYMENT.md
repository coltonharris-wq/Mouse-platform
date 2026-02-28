# OpenClaw-as-a-Service Production Deployment Checklist

## Pre-Deployment

### Infrastructure
- [ ] Provision servers (minimum 2 CPU, 4GB RAM per API instance)
- [ ] Set up PostgreSQL (managed service recommended)
- [ ] Set up Redis (managed service recommended)
- [ ] Configure SSL certificates
- [ ] Set up DNS records
- [ ] Configure firewall rules

### Secrets & Configuration
- [ ] Generate JWT_SECRET (openssl rand -base64 48)
- [ ] Generate ENCRYPTION_KEY (openssl rand -base64 32)
- [ ] Generate API_KEY_SECRET (openssl rand -base64 48)
- [ ] Set up Orgo API key
- [ ] Set up Stripe credentials
- [ ] Set up Telegram bot (if using)
- [ ] Set up WhatsApp Business API (if using)
- [ ] Set up Sentry DSN (optional)

## Deployment Steps

1. **Database Setup**
   ```bash
   psql -f database/schema.sql
   ```

2. **Environment Configuration**
   ```bash
   cp deployment/.env.example .env
   # Fill in all required values
   ```

3. **Deploy Services**
   ```bash
   ./scripts/deploy.sh production
   ```

4. **Verify Deployment**
   ```bash
   curl https://api.yourdomain.com/health
   ```

## Post-Deployment

### Security
- [ ] Change default passwords
- [ ] Enable 2FA on all accounts
- [ ] Set up log aggregation
- [ ] Configure alerting
- [ ] Run security scan

### Monitoring
- [ ] Verify Prometheus scraping
- [ ] Set up Grafana dashboards
- [ ] Configure log alerts
- [ ] Test error reporting (Sentry)

### Backups
- [ ] Configure automated DB backups
- [ ] Set up Redis persistence
- [ ] Test restore procedure

## Scaling Considerations

### Horizontal Scaling
- API servers behind load balancer
- Multiple webhook handlers
- Database read replicas

### VM Pool Management
- Monitor Orgo workspace limits
- Set up VM pool auto-scaling
- Configure cost alerts

## Security Checklist

- [ ] RLS policies active
- [ ] Credentials encrypted
- [ ] API rate limiting enabled
- [ ] Webhook signatures verified
- [ ] TLS 1.3 only
- [ ] Security headers set
- [ ] CORS properly configured
- [ ] No secrets in logs

## Testing

- [ ] Create test tenant
- [ ] Send test Telegram message
- [ ] Send test WhatsApp message
- [ ] Deploy test Knight
- [ ] Verify real-time websocket
- [ ] Test rate limiting
- [ ] Verify tenant isolation
