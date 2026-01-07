import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GCS Upload Token Generator",
  description: "Generate temporary GCP tokens for GCS uploads via Vercel OIDC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

