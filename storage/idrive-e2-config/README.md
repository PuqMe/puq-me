# IDrive E2 Configuration

Buckets:

- `puq-images`
- `puq-avatars`
- `puq-chat-media`
- `puq-backups`

Object layout:

- `/images/{userId}/...`
- `/avatars/{userId}/...`
- `/chat/{conversationId}/...`
- `/backups/{date}/...`

Recommended settings:

- private buckets
- signed upload URLs
- signed download URLs where media is not public
- Cloudflare in front of `cdn.puq.me`
- lifecycle rules for old backups and rotated media derivatives
