export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <h1>GCS Upload Token Generator</h1>
      <p>
        This service generates temporary upload tokens for Google Cloud Storage
        using Vercel OIDC federation.
      </p>

      <h2>API Endpoint</h2>
      <code
        style={{
          display: "block",
          background: "#f4f4f4",
          padding: "1rem",
          borderRadius: "4px",
          marginBottom: "1rem",
        }}
      >
        GET /api/upload-token?file=filename.jpg
      </code>

      <h2>Required Environment Variables</h2>
      <ul>
        <li>
          <code>GCP_PROJECT_ID</code> - Your GCP project ID
        </li>
        <li>
          <code>GCP_PROJECT_NUMBER</code> - Your GCP project number
        </li>
        <li>
          <code>GCP_WORKLOAD_IDENTITY_POOL_ID</code> - Workload Identity Pool ID
        </li>
        <li>
          <code>GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID</code> - Provider ID
        </li>
        <li>
          <code>GCP_SERVICE_ACCOUNT_EMAIL</code> - Service account email
        </li>
        <li>
          <code>GCS_BUCKET_NAME</code> - Target GCS bucket name
        </li>
      </ul>

      <h2>Example Response</h2>
      <pre
        style={{
          background: "#f4f4f4",
          padding: "1rem",
          borderRadius: "4px",
          overflow: "auto",
        }}
      >
        {JSON.stringify(
          {
            url: "https://storage.googleapis.com/your-bucket",
            fields: {
              key: "abc123-filename.jpg",
              "x-goog-meta-source": "vercel-oidc-upload",
              policy: "...",
              "x-goog-signature": "...",
            },
            filename: "abc123-filename.jpg",
            expiresIn: "5 minutes",
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}

