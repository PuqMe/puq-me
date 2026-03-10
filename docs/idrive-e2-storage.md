# IDrive E2 Storage

Use IDrive E2 as the S3-compatible primary media and backup store.

Buckets:

- `puq-images`
- `puq-avatars`
- `puq-chat-media`
- `puq-backups`

Recommended mapping:

- profile images -> `puq-images/images`
- avatars -> `puq-avatars/avatars`
- chat uploads -> `puq-chat-media/chat`
- database/media backups -> `puq-backups/backups`

Security:

- all buckets private
- uploads only via signed URLs
- public delivery only through Cloudflare `cdn.puq.me`
- pending or rejected assets must not be publicly linked
