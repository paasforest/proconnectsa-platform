import { NextResponse } from "next/server";

export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://www.proconnectsa.co.za/sitemap.xml
`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

