import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const res = await fetch(
    `https://coub.com/api/v2/timeline/subscriptions/fresh?page=${page}`,
    { next: { revalidate: 10 } }
  );
  const product = await res.json();

  return NextResponse.json(product);
}
