# GCS Upload Token Generator

Generate temporary GCP tokens for GCS uploads using Vercel OIDC federation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in Vercel:
   ```
   GCP_PROJECT_ID=your-project-id
   GCP_PROJECT_NUMBER=123456789012
   GCP_WORKLOAD_IDENTITY_POOL_ID=vercel-pool
   GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID=vercel-provider
   GCP_SERVICE_ACCOUNT_EMAIL=sa@your-project.iam.gserviceaccount.com
   GCS_BUCKET_NAME=your-bucket
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

## Usage

```
GET /api/upload-token?file=myfile.jpg
```

Returns a signed POST policy for uploading to GCS.

