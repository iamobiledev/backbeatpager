import { handleServerRequest } from "@/server/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handleServerRequest;
export const POST = handleServerRequest;
export const PUT = handleServerRequest;
export const PATCH = handleServerRequest;
export const DELETE = handleServerRequest;
