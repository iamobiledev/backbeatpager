export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/((?!api/auth|api/v1|slack|internal|health|ready|_next/static|_next/image|favicon.ico).*)"
  ]
};
