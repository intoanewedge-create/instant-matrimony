# Backup and Recovery Strategy

This document covers backup operations for database tables and asset storage.

## 1. Database Backups

We use PostgreSQL `pg_dump` to create compressed logical backups.

### Automated Backup Script (`backup.sh`)

```bash
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
DB_NAME="instantmatrimony"
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-backup-$TIMESTAMP.sql.gz"

echo "Starting database backup..."
pg_dump -h db -U postgres -d $DB_NAME | gzip > $BACKUP_FILE

echo "Uploading backup to AWS S3..."
aws s3 cp $BACKUP_FILE s3://instantmatrimony-backups/db/

# Delete backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -name "*.sql.gz" -exec rm {} \;
echo "Backup complete!"
```

### Restore Commands

To restore a compressed SQL backup:
```bash
gunzip -c instantmatrimony-backup-YYYYMMDD.sql.gz | psql -h db -U postgres -d instantmatrimony
```

## 2. Cloud Media Backups

All media files uploaded by users are stored on S3 / Cloudinary. Configure automated cross-region replication (CRR) inside AWS Console or Cloudinary dashboard to ensure media files are replicated to a secondary failover region.
