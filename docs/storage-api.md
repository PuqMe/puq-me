# Upload API

Authenticated upload intent endpoints:

- `POST /upload/avatar`
- `POST /upload/image`
- `POST /upload/chat-media`
- `POST /v1/media/profile-photos/upload-intent`
- `POST /v1/media/profile-photos/complete`

Request body:

```json
{
  "fileName": "avatar.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 428190
}
```

Signed upload response:

```json
{
  "uploadId": "uuid",
  "purpose": "avatar",
  "bucket": "puq-avatars",
  "objectKey": "avatars/123/2026-03-10/uuid.jpg",
  "uploadUrl": "https://storage.idrivee2-7.com/...",
  "publicUrl": "https://cdn.puq.me/avatars/123/2026-03-10/uuid.jpg",
  "expiresInSeconds": 600,
  "maxUploadSizeBytes": 5242880,
  "acceptedMimeTypes": ["image/jpeg", "image/png", "image/webp"],
  "requiredHeaders": {
    "content-type": "image/jpeg",
    "x-amz-meta-upload-id": "uuid",
    "x-amz-meta-upload-purpose": "avatar"
  },
  "security": {
    "signedUrl": true,
    "malwareScanHookConfigured": true,
    "moderationRequired": true,
    "publicDeliveryRequiresApproval": true
  }
}
```
