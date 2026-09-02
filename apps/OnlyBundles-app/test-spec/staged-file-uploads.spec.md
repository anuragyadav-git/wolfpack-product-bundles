# Test Spec: Staged File Uploads
**Spec ID:** staged-file-uploads  **Created:** 2026-08-18

## Purpose
Verify that `app/routes/app/app.upload-store-file.tsx` validates MIME types, file sizes, creates staged uploads and Shopify file records via GraphQL Admin API, and accurately checks file processing status.

## Test Cases
### UploadStoreFileSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Upload valid image file | Valid image/jpeg file <= 20MB | Staged upload created, file posted, fileCreate returns fileId, returns `{ ok: true, fileId }` | Happy path |
| 2 | Invalid mime type | `application/pdf` or `text/plain` | Returns `{ ok: false, error: "Only image files are accepted." }` | Validation |
| 3 | File exceeds 20MB | File > 20MB | Returns `{ ok: false, error: "File must be under 20 MB." }` | Size limit |
| 4 | Missing file | Empty formData | Returns `{ ok: false, error: "No file received." }` | Bad request |
| 5 | Loader polling READY file | GET `?fileId=gid://shopify/MediaImage/1` when READY | Returns `{ fileStatus: "READY", file: { id, url, filename, alt, createdAt } }` | Loader polling |
| 6 | Loader polling PROCESSING file | GET `?fileId=gid://shopify/MediaImage/1` when PROCESSING | Returns `{ fileStatus: "PROCESSING" }` | Loader polling |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] GraphQL Admin API is used exclusively for staged uploads, file creation, and status polling
