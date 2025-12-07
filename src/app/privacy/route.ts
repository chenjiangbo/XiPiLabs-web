import { NextResponse } from "next/server";
import { defaultLocale } from "../../../i18n";

export async function GET(request: Request) {
  const url = new URL(`/${defaultLocale}/privacy`, request.url);
  return NextResponse.redirect(url);
}
