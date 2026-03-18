# IDrive E2 Storage

Use IDrive E2 as the S3-compatible primary media and backup store.

`PuQ.me` uses IDrive e2 for storage only:

- profile photos
- avatars
- chat uploads
- exports and backups

Do not treat IDrive e2 as an API or WebSocket host. It is the storage layer behind the main backend.

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

Recommended bucket configuration files:

- CORS: [`storage/idrive-e2-config/cors.json`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/storage/idrive-e2-config/cors.json)
- Lifecycle: [`storage/idrive-e2-config/lifecycle.json`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/storage/idrive-e2-config/lifecycle.json)

Production notes:

- point `cdn.puq.me` at the IDrive e2 public endpoint through Cloudflare
- keep raw bucket URLs private and unadvertised
- continue issuing uploads from the API via signed URLs in [`apps/api/src/modules/media/storage.service.ts`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/apps/api/src/modules/media/storage.service.ts)
