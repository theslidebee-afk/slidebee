// Cloudflare Pages Function: /api/admin-template
// Provides authorized administrative actions for template management in SlideBee.
// Deletes template records from Cloudflare D1 and automatically purges associated presentation decks (.pptx)
// and slide images from Cloudflare R2.

import { getCorsHeaders, Env } from "./admin-template/utils";
import { handleDeleteTemplate } from "./admin-template/deleteTemplate";
import { handleUpdateTemplate } from "./admin-template/updateTemplate";
import { handleCreateTemplate } from "./admin-template/createTemplate";

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  return handleDeleteTemplate(context.request, context.env);
}

export async function onRequestPut(context: { request: Request; env: Env }) {
  return handleUpdateTemplate(context.request, context.env);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  return handleCreateTemplate(context.request, context.env);
}
