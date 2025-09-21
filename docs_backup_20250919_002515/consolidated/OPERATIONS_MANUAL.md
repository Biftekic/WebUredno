# Operations Manual - WebUredno Platform

## Table of Contents

1. [Security Operations](#security-operations)
2. [GDPR Compliance Procedures](#gdpr-compliance-procedures)
3. [Maintenance Procedures](#maintenance-procedures)
4. [Backup & Recovery](#backup-recovery)
5. [Monitoring & Alerting](#monitoring-alerting)
6. [Incident Management](#incident-management)
7. [Performance Management](#performance-management)
8. [Operational Checklists](#operational-checklists)

## Security Operations

### Daily Security Tasks

#### Morning Security Check (09:00)
```bash
#!/bin/bash
# daily-security-check.sh

echo "=== Daily Security Check $(date) ==="

# 1. Check for failed login attempts
echo "Checking failed login attempts..."
grep "Failed login" /var/log/auth.log | tail -20

# 2. Review security alerts
echo "Checking security alerts..."
curl -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/organizations/uredno/issues/?query=level:error"

# 3. Check SSL certificate expiry
echo "Checking SSL certificates..."
echo | openssl s_client -servername uredno.eu -connect uredno.eu:443 2>/dev/null | \
  openssl x509 -noout -enddate

# 4. Review rate limiting logs
echo "Checking rate limit violations..."
redis-cli GET "rate_limit:violations:$(date +%Y%m%d)"

# 5. Check for suspicious API activity
echo "Checking API anomalies..."
psql $DATABASE_URL -c "
  SELECT ip_address, COUNT(*) as attempts
  FROM audit_logs
  WHERE created_at > NOW() - INTERVAL '24 hours'
    AND action LIKE '%failed%'
  GROUP BY ip_address
  HAVING COUNT(*) > 10
  ORDER BY attempts DESC;
"

echo "=== Security check complete ==="
```

### Security Monitoring Dashboard

```typescript
// lib/security/monitoring.ts
export class SecurityMonitor {
  private readonly thresholds = {
    failedLogins: 5,
    apiRateLimit: 100,
    suspiciousIPs: 3,
    dataExfiltration: 1000, // records
  };

  async performSecurityAudit(): Promise<SecurityAuditResult> {
    const results = {
      timestamp: new Date(),
      checks: [],
      alerts: [],
      score: 100,
    };

    // Check failed login attempts
    const failedLogins = await this.checkFailedLogins();
    if (failedLogins.count > this.thresholds.failedLogins) {
      results.alerts.push({
        severity: 'high',
        message: `${failedLogins.count} failed login attempts detected`,
        details: failedLogins.details,
      });
      results.score -= 20;
    }

    // Check for brute force attempts
    const bruteForce = await this.checkBruteForce();
    if (bruteForce.detected) {
      results.alerts.push({
        severity: 'critical',
        message: 'Brute force attack detected',
        ips: bruteForce.sourceIPs,
      });
      results.score -= 30;
    }

    // Check for SQL injection attempts
    const sqlInjection = await this.checkSQLInjection();
    if (sqlInjection.attempts > 0) {
      results.alerts.push({
        severity: 'critical',
        message: `${sqlInjection.attempts} SQL injection attempts`,
        payloads: sqlInjection.payloads,
      });
      results.score -= 40;
    }

    // Check for data exfiltration
    const dataExfiltration = await this.checkDataExfiltration();
    if (dataExfiltration.suspicious) {
      results.alerts.push({
        severity: 'high',
        message: 'Possible data exfiltration detected',
        volume: dataExfiltration.recordCount,
      });
      results.score -= 25;
    }

    return results;
  }

  private async checkFailedLogins() {
    const query = `
      SELECT COUNT(*) as count, ip_address, email
      FROM login_attempts
      WHERE success = false
        AND created_at > NOW() - INTERVAL '1 hour'
      GROUP BY ip_address, email
      HAVING COUNT(*) > 3
    `;

    return await prisma.$queryRaw(query);
  }

  private async checkBruteForce() {
    const rateLimiter = new RateLimiter();
    const violations = await rateLimiter.getViolations();

    return {
      detected: violations.length > 0,
      sourceIPs: violations.map(v => v.ip),
    };
  }

  private async checkSQLInjection() {
    const suspiciousPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i,
    ];

    const logs = await this.getRecentLogs();
    const attempts = logs.filter(log =>
      suspiciousPatterns.some(pattern => pattern.test(log.payload))
    );

    return {
      attempts: attempts.length,
      payloads: attempts.map(a => a.payload),
    };
  }

  private async checkDataExfiltration() {
    const query = `
      SELECT user_id, COUNT(*) as record_count
      FROM audit_logs
      WHERE action IN ('export', 'download', 'api_fetch')
        AND created_at > NOW() - INTERVAL '1 hour'
      GROUP BY user_id
      HAVING COUNT(*) > $1
    `;

    const results = await prisma.$queryRaw(query, this.thresholds.dataExfiltration);

    return {
      suspicious: results.length > 0,
      recordCount: results[0]?.record_count || 0,
    };
  }
}
```

### Security Incident Response

```typescript
// lib/security/incident-response.ts
export class IncidentResponse {
  async handleSecurityIncident(incident: SecurityIncident) {
    const response = {
      id: generateIncidentId(),
      timestamp: new Date(),
      type: incident.type,
      severity: incident.severity,
      actions: [],
    };

    switch (incident.type) {
      case 'brute_force':
        response.actions = await this.respondToBruteForce(incident);
        break;
      case 'data_breach':
        response.actions = await this.respondToDataBreach(incident);
        break;
      case 'ddos':
        response.actions = await this.respondToDDoS(incident);
        break;
      case 'unauthorized_access':
        response.actions = await this.respondToUnauthorizedAccess(incident);
        break;
    }

    // Log incident
    await this.logIncident(response);

    // Notify stakeholders
    await this.notifyStakeholders(response);

    return response;
  }

  private async respondToBruteForce(incident: SecurityIncident) {
    const actions = [];

    // 1. Block attacking IPs
    for (const ip of incident.sourceIPs) {
      await this.blockIP(ip);
      actions.push(`Blocked IP: ${ip}`);
    }

    // 2. Force password reset for affected accounts
    for (const userId of incident.affectedUsers) {
      await this.forcePasswordReset(userId);
      actions.push(`Password reset forced for user: ${userId}`);
    }

    // 3. Increase rate limiting
    await this.adjustRateLimits(10); // Reduce to 10 requests per minute
    actions.push('Rate limits tightened');

    // 4. Enable CAPTCHA
    await this.enableCAPTCHA();
    actions.push('CAPTCHA enabled for login');

    return actions;
  }

  private async respondToDataBreach(incident: SecurityIncident) {
    const actions = [];

    // 1. Immediate containment
    await this.revokeAllTokens();
    actions.push('All authentication tokens revoked');

    // 2. Identify scope
    const affectedRecords = await this.identifyAffectedData(incident);
    actions.push(`${affectedRecords.count} records potentially affected`);

    // 3. Preserve evidence
    await this.createForensicBackup();
    actions.push('Forensic backup created');

    // 4. GDPR notification (within 72 hours)
    if (affectedRecords.containsPII) {
      await this.notifyDataProtectionAuthority();
      await this.notifyAffectedUsers(affectedRecords.userIds);
      actions.push('GDPR notifications sent');
    }

    return actions;
  }
}
```

## GDPR Compliance Procedures

### Data Subject Request Handling

```typescript
// lib/gdpr/data-subject-requests.ts
export class GDPRRequestHandler {
  async handleAccessRequest(userId: string): Promise<UserDataExport> {
    const userData = {
      profile: await this.getProfileData(userId),
      bookings: await this.getBookingHistory(userId),
      communications: await this.getCommunicationHistory(userId),
      consents: await this.getConsentHistory(userId),
      logs: await this.getActivityLogs(userId),
    };

    // Format for export
    const exportData = {
      exportDate: new Date(),
      userId: userId,
      data: userData,
      format: 'json',
    };

    // Log the export
    await this.logDataExport(userId, 'access_request');

    return exportData;
  }

  async handleDeletionRequest(userId: string): Promise<DeletionResult> {
    const result = {
      userId,
      timestamp: new Date(),
      deletedData: {},
      retainedData: {},
      reason: 'user_request',
    };

    // Check for legal obligations to retain data
    const retentionRequirements = await this.checkRetentionRequirements(userId);

    if (retentionRequirements.hasLegalObligations) {
      // Anonymize instead of delete
      result.retainedData = await this.anonymizeUserData(userId);
      result.reason = 'legal_retention_required';
    } else {
      // Complete deletion
      result.deletedData = {
        profile: await this.deleteProfile(userId),
        bookings: await this.deleteBookings(userId),
        communications: await this.deleteCommunications(userId),
        logs: await this.deleteActivityLogs(userId),
      };
    }

    // Send confirmation
    await this.sendDeletionConfirmation(userId, result);

    return result;
  }

  async handlePortabilityRequest(userId: string): Promise<PortableData> {
    const data = await this.handleAccessRequest(userId);

    // Convert to portable format
    const portableData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      dataSubject: {
        id: userId,
        ...data.data.profile,
      },
      services: {
        bookings: this.formatBookingsForPortability(data.data.bookings),
        preferences: data.data.profile.preferences,
      },
    };

    // Create downloadable file
    const csv = this.convertToCSV(portableData);
    const json = JSON.stringify(portableData, null, 2);

    return {
      formats: {
        csv,
        json,
      },
      checksum: this.calculateChecksum(json),
    };
  }

  private async anonymizeUserData(userId: string) {
    const anonymized = {
      personalData: {},
      retainedData: {},
    };

    // Anonymize personal identifiers
    await prisma.customer.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@anonymous.eu`,
        firstName: 'ANONYMIZED',
        lastName: 'USER',
        phone: null,
        deletedAt: new Date(),
      },
    });

    // Retain anonymized transactional data for accounting
    anonymized.retainedData = await prisma.booking.updateMany({
      where: { customerId: userId },
      data: {
        specialInstructions: null,
        internalNotes: null,
      },
    });

    return anonymized;
  }
}
```

### Consent Management

```typescript
// lib/gdpr/consent-manager.ts
export class ConsentManager {
  async recordConsent(consent: ConsentRecord): Promise<void> {
    await prisma.consentRecord.create({
      data: {
        userId: consent.userId,
        type: consent.type,
        granted: consent.granted,
        version: consent.version,
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent,
        timestamp: new Date(),
      },
    });

    // Update user preferences
    await this.updateUserPreferences(consent);
  }

  async verifyConsent(userId: string, type: ConsentType): Promise<boolean> {
    const latestConsent = await prisma.consentRecord.findFirst({
      where: {
        userId,
        type,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!latestConsent) return false;

    // Check if consent is still valid
    const consentAge = Date.now() - latestConsent.timestamp.getTime();
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year

    return latestConsent.granted && consentAge < maxAge;
  }

  async getConsentHistory(userId: string) {
    return await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
```

### Data Retention Policy

```sql
-- Data retention procedures
-- Run monthly via cron job

-- Delete old audit logs (>90 days)
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days'
  AND action NOT IN ('login', 'payment', 'data_export');

-- Anonymize completed bookings (>3 years)
UPDATE bookings
SET special_instructions = NULL,
    internal_notes = NULL,
    updated_at = NOW()
WHERE completed_at < NOW() - INTERVAL '3 years'
  AND status = 'completed';

-- Delete unverified accounts (>30 days)
DELETE FROM customers
WHERE email_verified = false
  AND created_at < NOW() - INTERVAL '30 days';

-- Archive old communications (>1 year)
INSERT INTO archived_communications
SELECT * FROM communications
WHERE sent_at < NOW() - INTERVAL '1 year';

DELETE FROM communications
WHERE sent_at < NOW() - INTERVAL '1 year';

-- Clean up orphaned records
DELETE FROM addresses
WHERE customer_id NOT IN (SELECT id FROM customers);

DELETE FROM reviews
WHERE booking_id NOT IN (SELECT id FROM bookings);
```

## Maintenance Procedures

### Scheduled Maintenance Windows

```typescript
// lib/maintenance/scheduler.ts
export class MaintenanceScheduler {
  private readonly maintenanceWindows = {
    daily: { hour: 3, minute: 0 }, // 3:00 AM Zagreb time
    weekly: { day: 0, hour: 2, minute: 0 }, // Sunday 2:00 AM
    monthly: { date: 1, hour: 1, minute: 0 }, // 1st of month, 1:00 AM
  };

  async scheduleMaintenanceTasks() {
    // Daily tasks
    cron.schedule('0 3 * * *', async () => {
      await this.runDailyMaintenance();
    }, {
      timezone: 'Europe/Zagreb',
    });

    // Weekly tasks
    cron.schedule('0 2 * * 0', async () => {
      await this.runWeeklyMaintenance();
    }, {
      timezone: 'Europe/Zagreb',
    });

    // Monthly tasks
    cron.schedule('0 1 1 * *', async () => {
      await this.runMonthlyMaintenance();
    }, {
      timezone: 'Europe/Zagreb',
    });
  }

  private async runDailyMaintenance() {
    console.log('Starting daily maintenance...');

    // 1. Clean temporary files
    await this.cleanTempFiles();

    // 2. Optimize database
    await this.vacuumDatabase();

    // 3. Rotate logs
    await this.rotateLogs();

    // 4. Update search indexes
    await this.updateSearchIndexes();

    // 5. Clear expired sessions
    await this.clearExpiredSessions();

    console.log('Daily maintenance completed');
  }

  private async runWeeklyMaintenance() {
    console.log('Starting weekly maintenance...');

    // 1. Database integrity check
    await this.checkDatabaseIntegrity();

    // 2. Update statistics
    await this.updateDatabaseStatistics();

    // 3. Security updates check
    await this.checkSecurityUpdates();

    // 4. Backup verification
    await this.verifyBackups();

    // 5. Performance analysis
    await this.analyzePerformanceMetrics();

    console.log('Weekly maintenance completed');
  }

  private async runMonthlyMaintenance() {
    console.log('Starting monthly maintenance...');

    // 1. Full system backup
    await this.performFullBackup();

    // 2. Certificate renewal check
    await this.checkCertificateRenewal();

    // 3. Capacity planning review
    await this.reviewCapacityMetrics();

    // 4. Compliance audit
    await this.runComplianceAudit();

    // 5. Disaster recovery test
    await this.testDisasterRecovery();

    console.log('Monthly maintenance completed');
  }
}
```

### Database Maintenance

```sql
-- database-maintenance.sql
-- Run during maintenance windows

-- 1. Update table statistics
ANALYZE customers;
ANALYZE bookings;
ANALYZE addresses;
ANALYZE payments;

-- 2. Reindex frequently queried tables
REINDEX INDEX CONCURRENTLY idx_bookings_date;
REINDEX INDEX CONCURRENTLY idx_customers_email;
REINDEX INDEX CONCURRENTLY idx_bookings_status;

-- 3. Vacuum tables to reclaim space
VACUUM (VERBOSE, ANALYZE) bookings;
VACUUM (VERBOSE, ANALYZE) audit_logs;

-- 4. Check for table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS external_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- 5. Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;
```

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup-strategy.sh

# Configuration
BACKUP_DIR="/backups/weburedno"
S3_BUCKET="s3://uredno-backups"
RETENTION_DAYS=30

# Daily backup function
daily_backup() {
  echo "Starting daily backup - $(date)"

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="${BACKUP_DIR}/daily/weburedno_${TIMESTAMP}.sql"

  # 1. Database backup
  pg_dump $DATABASE_URL \
    --no-owner \
    --no-privileges \
    --verbose \
    --file=$BACKUP_FILE

  # 2. Compress backup
  gzip $BACKUP_FILE

  # 3. Upload to S3
  aws s3 cp ${BACKUP_FILE}.gz ${S3_BUCKET}/daily/

  # 4. Backup uploaded files
  tar czf ${BACKUP_DIR}/daily/uploads_${TIMESTAMP}.tar.gz /uploads/
  aws s3 cp ${BACKUP_DIR}/daily/uploads_${TIMESTAMP}.tar.gz ${S3_BUCKET}/daily/

  # 5. Clean old local backups
  find ${BACKUP_DIR}/daily -name "*.gz" -mtime +7 -delete

  echo "Daily backup completed"
}

# Weekly backup function
weekly_backup() {
  echo "Starting weekly backup - $(date)"

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)

  # 1. Full database backup with data only
  pg_dump $DATABASE_URL \
    --data-only \
    --verbose \
    --file=${BACKUP_DIR}/weekly/data_${TIMESTAMP}.sql

  # 2. Schema backup
  pg_dump $DATABASE_URL \
    --schema-only \
    --verbose \
    --file=${BACKUP_DIR}/weekly/schema_${TIMESTAMP}.sql

  # 3. Compress and upload
  tar czf ${BACKUP_DIR}/weekly/weekly_${TIMESTAMP}.tar.gz \
    ${BACKUP_DIR}/weekly/*.sql

  aws s3 cp ${BACKUP_DIR}/weekly/weekly_${TIMESTAMP}.tar.gz \
    ${S3_BUCKET}/weekly/

  # 4. Create database snapshot
  aws rds create-db-snapshot \
    --db-instance-identifier weburedno-prod \
    --db-snapshot-identifier weekly-${TIMESTAMP}

  echo "Weekly backup completed"
}

# Monthly backup function
monthly_backup() {
  echo "Starting monthly backup - $(date)"

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)

  # 1. Full system backup
  pg_dumpall -h $DB_HOST -U $DB_USER \
    --verbose \
    --file=${BACKUP_DIR}/monthly/full_${TIMESTAMP}.sql

  # 2. Application code backup
  tar czf ${BACKUP_DIR}/monthly/code_${TIMESTAMP}.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    /app/

  # 3. Configuration backup
  tar czf ${BACKUP_DIR}/monthly/config_${TIMESTAMP}.tar.gz \
    /etc/nginx/ \
    /etc/systemd/system/weburedno* \
    /etc/environment

  # 4. Create archive
  tar czf ${BACKUP_DIR}/monthly/monthly_${TIMESTAMP}.tar.gz \
    ${BACKUP_DIR}/monthly/*.{sql,tar.gz}

  # 5. Upload to S3 with glacier storage class
  aws s3 cp ${BACKUP_DIR}/monthly/monthly_${TIMESTAMP}.tar.gz \
    ${S3_BUCKET}/monthly/ \
    --storage-class GLACIER

  echo "Monthly backup completed"
}
```

### Recovery Procedures

```bash
#!/bin/bash
# recovery-procedures.sh

# Point-in-time recovery
recover_to_timestamp() {
  TIMESTAMP=$1

  echo "Starting point-in-time recovery to ${TIMESTAMP}"

  # 1. Stop application
  systemctl stop weburedno

  # 2. Backup current state
  pg_dump $DATABASE_URL > /tmp/pre_recovery_$(date +%Y%m%d_%H%M%S).sql

  # 3. Find appropriate backup
  BACKUP_FILE=$(aws s3 ls ${S3_BUCKET}/daily/ | \
    grep -E "weburedno_[0-9]{8}" | \
    awk '{print $4}' | \
    sort -r | \
    head -1)

  # 4. Download and restore backup
  aws s3 cp ${S3_BUCKET}/daily/${BACKUP_FILE} /tmp/
  gunzip /tmp/${BACKUP_FILE}

  psql $DATABASE_URL < /tmp/${BACKUP_FILE%.gz}

  # 5. Apply transaction logs up to timestamp
  pg_restore --recovery-target-time="${TIMESTAMP}" \
    --recovery-target-action=promote

  # 6. Verify recovery
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM bookings;"

  # 7. Restart application
  systemctl start weburedno

  echo "Recovery completed"
}

# Disaster recovery
disaster_recovery() {
  echo "Starting disaster recovery procedure"

  # 1. Provision new infrastructure
  terraform apply -auto-approve

  # 2. Restore latest database backup
  LATEST_BACKUP=$(aws s3 ls ${S3_BUCKET}/daily/ | \
    sort | tail -1 | awk '{print $4}')

  aws s3 cp ${S3_BUCKET}/daily/${LATEST_BACKUP} /tmp/
  gunzip /tmp/${LATEST_BACKUP}

  psql $NEW_DATABASE_URL < /tmp/${LATEST_BACKUP%.gz}

  # 3. Restore application code
  git clone $GIT_REPO /app
  cd /app
  npm install
  npm run build

  # 4. Update DNS
  aws route53 change-resource-record-sets \
    --hosted-zone-id $ZONE_ID \
    --change-batch file://dns-failover.json

  # 5. Verify services
  curl -f https://uredno.eu/api/health || exit 1

  echo "Disaster recovery completed"
}
```

## Monitoring & Alerting

### Monitoring Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'weburedno-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

rule_files:
  - '/etc/prometheus/alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

### Alert Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 5% for 5 minutes"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow response times"
          description: "95th percentile response time is above 2 seconds"

      - alert: LowBookingRate
        expr: rate(bookings_created_total[1h]) < 1
        for: 2h
        labels:
          severity: warning
        annotations:
          summary: "Low booking rate"
          description: "Less than 1 booking per hour for 2 hours"

  - name: database
    rules:
      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"

      - alert: DatabaseSlowQueries
        expr: rate(pg_stat_statements_mean_time_seconds[5m]) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Database queries are slow"

      - alert: DatabaseDeadlocks
        expr: increase(pg_stat_database_deadlocks[1h]) > 5
        labels:
          severity: critical
        annotations:
          summary: "Multiple database deadlocks detected"

  - name: infrastructure
    rules:
      - alert: HighCPUUsage
        expr: rate(process_cpu_seconds_total[5m]) > 0.8
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / node_memory_MemTotal_bytes > 0.9
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Disk space is running low"

      - alert: SSLCertificateExpiry
        expr: probe_ssl_earliest_cert_expiry - time() < 7 * 24 * 60 * 60
        labels:
          severity: warning
        annotations:
          summary: "SSL certificate expires soon"
```

### Custom Metrics

```typescript
// lib/metrics/custom.ts
import { Counter, Histogram, Gauge, register } from 'prom-client';

// Business metrics
export const bookingsCreated = new Counter({
  name: 'bookings_created_total',
  help: 'Total number of bookings created',
  labelNames: ['service_type', 'payment_method'],
});

export const bookingValue = new Histogram({
  name: 'booking_value_euros',
  help: 'Booking values in euros',
  buckets: [20, 40, 60, 80, 100, 150, 200, 300, 500],
});

export const activeBookings = new Gauge({
  name: 'active_bookings_count',
  help: 'Number of active bookings',
  labelNames: ['status'],
});

export const customerSatisfaction = new Gauge({
  name: 'customer_satisfaction_score',
  help: 'Average customer satisfaction score',
});

// Technical metrics
export const apiLatency = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'API request latency',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const databaseQueryTime = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query execution time',
  labelNames: ['operation', 'table'],
});

export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  labelNames: ['cache_type'],
});

// Register custom metrics
register.registerMetric(bookingsCreated);
register.registerMetric(bookingValue);
register.registerMetric(activeBookings);
register.registerMetric(customerSatisfaction);
register.registerMetric(apiLatency);
register.registerMetric(databaseQueryTime);
register.registerMetric(cacheHitRate);
```

## Incident Management

### Incident Response Runbooks

#### Runbook: Database Connection Failure

```markdown
## Database Connection Failure

### Symptoms
- API returning 500 errors
- "Database connection failed" in logs
- Monitoring shows database unreachable

### Immediate Actions
1. Check database status:
   ```bash
   pg_isready -h $DB_HOST -p 5432
   systemctl status postgresql
   ```

2. Check connection pool:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
   ```

3. Kill long-running queries:
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state != 'idle'
   AND query_start < NOW() - INTERVAL '5 minutes';
   ```

### Recovery Steps
1. Restart connection pool:
   ```bash
   pm2 restart weburedno
   ```

2. If database is down:
   ```bash
   systemctl restart postgresql
   ```

3. If connection limit reached:
   ```sql
   ALTER SYSTEM SET max_connections = 200;
   SELECT pg_reload_conf();
   ```

4. Failover to replica if primary is unrecoverable:
   ```bash
   ./scripts/failover-to-replica.sh
   ```

### Post-Incident
- Review connection pool settings
- Analyze query patterns
- Update monitoring thresholds
- Document in incident log
```

#### Runbook: High Traffic Spike

```markdown
## High Traffic Spike Response

### Symptoms
- Response times > 3 seconds
- CPU usage > 90%
- Request queue building up

### Immediate Actions
1. Enable rate limiting:
   ```typescript
   // Reduce from 60 to 30 requests per minute
   await redis.set('rate_limit:global', 30);
   ```

2. Scale application instances:
   ```bash
   kubectl scale deployment weburedno --replicas=5
   ```

3. Enable CDN caching:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/cache_level" \
     -H "Authorization: Bearer $CF_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"aggressive"}'
   ```

### Mitigation Steps
1. Enable queue mode:
   ```typescript
   await redis.set('feature:queue_mode', 'true');
   ```

2. Defer non-critical operations:
   ```typescript
   await redis.set('feature:email_notifications', 'false');
   await redis.set('feature:analytics', 'false');
   ```

3. Increase cache TTL:
   ```typescript
   await redis.set('cache:ttl:default', 3600); // 1 hour
   ```

### Recovery
1. Monitor metrics for stabilization
2. Gradually reduce scaling
3. Re-enable features
4. Analyze traffic patterns
```

## Performance Management

### Performance Optimization Tasks

```typescript
// lib/performance/optimizer.ts
export class PerformanceOptimizer {
  async runOptimizations() {
    const report = {
      timestamp: new Date(),
      optimizations: [],
      improvements: {},
    };

    // 1. Database query optimization
    const slowQueries = await this.identifySlowQueries();
    for (const query of slowQueries) {
      const optimized = await this.optimizeQuery(query);
      report.optimizations.push({
        type: 'query',
        original: query.execution_time,
        optimized: optimized.execution_time,
        improvement: `${((1 - optimized.execution_time / query.execution_time) * 100).toFixed(1)}%`,
      });
    }

    // 2. Image optimization
    const images = await this.findUnoptimizedImages();
    for (const image of images) {
      const optimized = await this.optimizeImage(image);
      report.optimizations.push({
        type: 'image',
        path: image.path,
        originalSize: image.size,
        optimizedSize: optimized.size,
        savings: `${((1 - optimized.size / image.size) * 100).toFixed(1)}%`,
      });
    }

    // 3. Cache optimization
    const cacheStats = await this.analyzeCacheUsage();
    const cacheImprovements = await this.optimizeCacheStrategy(cacheStats);
    report.improvements.cache = cacheImprovements;

    // 4. Bundle optimization
    const bundleAnalysis = await this.analyzeBundles();
    if (bundleAnalysis.recommendations.length > 0) {
      report.improvements.bundles = bundleAnalysis.recommendations;
    }

    return report;
  }

  private async identifySlowQueries() {
    const query = `
      SELECT
        query,
        mean_time,
        calls,
        total_time
      FROM pg_stat_statements
      WHERE mean_time > 100
      ORDER BY mean_time DESC
      LIMIT 10
    `;

    return await prisma.$queryRaw(query);
  }

  private async optimizeQuery(query: SlowQuery) {
    // Add missing indexes
    const missingIndexes = await this.identifyMissingIndexes(query);
    for (const index of missingIndexes) {
      await prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ${index.name}
        ON ${index.table} (${index.columns})
      `;
    }

    // Rewrite query if possible
    const rewritten = this.rewriteQuery(query);

    return {
      execution_time: await this.measureQueryTime(rewritten),
    };
  }
}
```

### Performance Dashboard

```typescript
// app/api/performance/dashboard/route.ts
export async function GET() {
  const metrics = {
    current: {
      responseTime: await getAverageResponseTime('5m'),
      throughput: await getRequestsPerSecond('5m'),
      errorRate: await getErrorRate('5m'),
      activeUsers: await getActiveUserCount(),
    },
    trends: {
      responseTime: await getResponseTimeTrend('24h'),
      throughput: await getThroughputTrend('24h'),
      errorRate: await getErrorRateTrend('24h'),
    },
    bottlenecks: await identifyBottlenecks(),
    recommendations: await generateRecommendations(),
  };

  return NextResponse.json(metrics);
}

async function identifyBottlenecks() {
  const bottlenecks = [];

  // Check database connection pool
  const poolStats = await getConnectionPoolStats();
  if (poolStats.utilization > 0.8) {
    bottlenecks.push({
      type: 'database',
      severity: 'high',
      description: 'Connection pool near capacity',
      recommendation: 'Increase max_connections or optimize query patterns',
    });
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const heapUsedPercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
  if (heapUsedPercent > 0.9) {
    bottlenecks.push({
      type: 'memory',
      severity: 'critical',
      description: 'High memory usage detected',
      recommendation: 'Investigate memory leaks or increase heap size',
    });
  }

  // Check cache hit rate
  const cacheHitRate = await getCacheHitRate();
  if (cacheHitRate < 0.7) {
    bottlenecks.push({
      type: 'cache',
      severity: 'medium',
      description: 'Low cache hit rate',
      recommendation: 'Review cache strategy and TTL settings',
    });
  }

  return bottlenecks;
}
```

## Operational Checklists

### Daily Operations Checklist

```markdown
## Daily Operations Checklist

### Morning (09:00)
- [ ] Review overnight alerts and incidents
- [ ] Check system health dashboard
- [ ] Verify backup completion
- [ ] Review error logs for patterns
- [ ] Check scheduled job status
- [ ] Monitor booking pipeline health
- [ ] Verify payment processing status
- [ ] Check email delivery rates

### Afternoon (14:00)
- [ ] Review performance metrics
- [ ] Check database query performance
- [ ] Monitor API response times
- [ ] Verify cache hit rates
- [ ] Check for security alerts
- [ ] Review customer support tickets

### Evening (18:00)
- [ ] Prepare for next day's bookings
- [ ] Verify calendar synchronization
- [ ] Check resource utilization
- [ ] Review day's incident reports
- [ ] Update operational status page
```

### Weekly Operations Checklist

```markdown
## Weekly Operations Checklist

### Monday
- [ ] Review previous week's metrics
- [ ] Plan maintenance windows
- [ ] Update security patches
- [ ] Review capacity planning

### Tuesday
- [ ] Database performance review
- [ ] Query optimization analysis
- [ ] Index maintenance check

### Wednesday
- [ ] Security audit review
- [ ] Access control verification
- [ ] SSL certificate check

### Thursday
- [ ] Backup verification test
- [ ] Disaster recovery review
- [ ] Documentation updates

### Friday
- [ ] Performance optimization
- [ ] Code deployment preparation
- [ ] Team sync on operational issues
```

### Monthly Operations Checklist

```markdown
## Monthly Operations Checklist

### First Week
- [ ] Full system backup
- [ ] Capacity planning review
- [ ] Cost optimization analysis
- [ ] Vendor contract reviews

### Second Week
- [ ] Security compliance audit
- [ ] GDPR compliance check
- [ ] Data retention cleanup
- [ ] Access rights review

### Third Week
- [ ] Disaster recovery drill
- [ ] Performance baseline update
- [ ] Infrastructure review
- [ ] Monitoring threshold adjustment

### Fourth Week
- [ ] Monthly reporting preparation
- [ ] SLA compliance review
- [ ] Incident analysis and RCA
- [ ] Process improvement planning
```

### Emergency Response Checklist

```markdown
## Emergency Response Checklist

### Initial Response (0-15 minutes)
- [ ] Acknowledge alert/incident
- [ ] Assess severity and impact
- [ ] Notify on-call team
- [ ] Start incident channel/bridge
- [ ] Begin incident timeline

### Mitigation (15-60 minutes)
- [ ] Implement immediate fixes
- [ ] Consider rollback if needed
- [ ] Scale resources if required
- [ ] Enable emergency features
- [ ] Update status page

### Communication
- [ ] Internal stakeholder notification
- [ ] Customer communication (if needed)
- [ ] Status page updates every 30 min
- [ ] Prepare RCA template

### Recovery
- [ ] Verify service restoration
- [ ] Monitor for recurrence
- [ ] Document actions taken
- [ ] Schedule post-mortem
- [ ] Update runbooks
```

---

*Operations Manual Version 2.0 | Last Updated: 2024*