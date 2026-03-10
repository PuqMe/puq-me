# Backup Strategy

Database:

- daily logical dump
- point-in-time recovery if managed PostgreSQL supports WAL archiving
- retain 30 daily, 12 monthly

Media:

- weekly bucket inventory + object verification
- immutable backup copies into `puq-backups`

Restore drills:

- staging restore every month
- verify one database dump and one media sample restore path
