import crypto from "node:crypto";

import { Storage } from "@google-cloud/storage";
import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import type { NextRequest } from "next/server";

async function getStorageClient(): Promise<Storage> {
  // Use OIDC authentication on Vercel
  if (process.env.VERCEL) {
    console.log(Object.keys(process.env));
    const projectId = process.env.GCP_PROJECT_ID;
    const projectNumber = process.env.GCP_PROJECT_NUMBER;
    const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
    const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
    const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

    if (
      !projectId ||
      !projectNumber ||
      !poolId ||
      !providerId ||
      !serviceAccountEmail
    ) {
      throw new Error(
        `Missing GCP OIDC environment variables: ${JSON.stringify({
          GCP_PROJECT_ID: !!projectId,
          GCP_PROJECT_NUMBER: !!projectNumber,
          GCP_WORKLOAD_IDENTITY_POOL_ID: !!poolId,
          GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: !!providerId,
          GCP_SERVICE_ACCOUNT_EMAIL: !!serviceAccountEmail,
        })}`,
      );
    }

    // Fetch the Vercel OIDC token and log it
    const oidcToken = await getVercelOidcToken();
    console.log("Vercel OIDC Token (x-vercel-oidc-token):", oidcToken);

    const authClient = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      service_account_impersonation: {
        token_lifetime_seconds: 3600,
      },
      subject_token_supplier: {
        getSubjectToken: getVercelOidcToken,
      },
    });

    console.log(
      Object.fromEntries(
        Object.entries(authClient as any).sort(([a], [b]) => a.localeCompare(b))
      )
    );
    if (!authClient) {
      throw new Error("Failed to create ExternalAccountClient");
    }

    return new Storage({
      projectId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authClient: authClient as any,
    });
  }

  // Local development: use Application Default Credentials or static credentials
  return new Storage({
    projectId: process.env.GCP_PROJECT_ID,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!file) {
      return Response.json(
        { error: "Missing 'file' query parameter" },
        { status: 400 },
      );
    }

    if (!bucketName) {
      return Response.json(
        { error: "Missing GCS_BUCKET_NAME environment variable" },
        { status: 500 },
      );
    }

    const storage = await getStorageClient();
    console.log(
      Object.fromEntries(
        Object.entries(storage as any).sort(([a], [b]) => a.localeCompare(b))
      )
    );
    const bucket = storage.bucket(bucketName);
    const randomFilename = `${crypto.randomBytes(5).toString("base64url")}-${file}`;
    const gcsFile = bucket.file(randomFilename);

    const options = {
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      fields: { "x-goog-meta-source": "vercel-oidc-upload" },
    };

    const [response] = await gcsFile.generateSignedPostPolicyV4(options);

    return Response.json({
      url: response.url,
      fields: response.fields,
      filename: randomFilename,
      expiresIn: "5 minutes",
    });
  } catch (error) {
    console.error("Error generating upload token:", error);
    return Response.json(
      {
        error: "Failed to generate upload token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

