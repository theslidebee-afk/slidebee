// RPC action handlers for /api/data
// Handles fn_grant_starter_credits and fn_redeem_template_credit
import { getCorsHeaders, stringifyValue } from "./schema";

export async function handleRpc(db: any, rpcName: string, rpcParams: any, corsHeaders: Record<string, string>) {
  if (rpcName === "fn_grant_starter_credits") {
    const cleanEmail = String(rpcParams?.p_email || "").trim().toLowerCase();
    let profile = await db.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
    if (!profile) {
      const profileId = crypto.randomUUID();
      await db.prepare(
        `INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance)
         VALUES (?, ?, ?, ?, 'client', 5, 5)`
      ).bind(profileId, cleanEmail, rpcParams?.p_full_name || cleanEmail.split("@")[0], rpcParams?.p_company || "Client Enterprise").run();
      profile = await db.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
    }
    return new Response(JSON.stringify({ data: { success: true, credits_balance: profile.credits_balance, credits_total: profile.credits_total }, error: null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (rpcName === "fn_redeem_template_credit") {
    const userEmail = String(rpcParams?.p_user_email || "").trim().toLowerCase();
    const templateId = String(rpcParams?.p_template_id || "").trim();

    const user = await db.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(userEmail).first();
    if (!user) {
      return new Response(JSON.stringify({ data: { success: false, message: "User account not found." }, error: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (user.credits_balance < 5) {
      return new Response(JSON.stringify({ data: { success: false, message: "Insufficient design credits." }, error: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const template = await db.prepare(`SELECT * FROM templates WHERE id = ? OR slug = ? OR code = ?`).bind(templateId, templateId, templateId).first();
    if (!template) {
      return new Response(JSON.stringify({ data: { success: false, message: "Template not found." }, error: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let purchasedItems: any[] = [];
    try { purchasedItems = JSON.parse(user.purchased_items || "[]"); } catch {}

    const deliverable = template.download_url || template.image_url || "/portfolio/case_study_a_1.png";
    const newItem = {
      id: template.id,
      slug: template.slug,
      code: template.code || "SLD-MASTER",
      title: template.title,
      category: template.category,
      slides_count: template.slides_count || 30,
      formats: ["Master PowerPoint (.pptx)"],
      amount: 0,
      currency: "INR",
      download_url: deliverable,
      is_credit_redemption: true,
      purchased_at: new Date().toISOString(),
    };

    purchasedItems.unshift(newItem);
    const newBalance = Math.max(0, user.credits_balance - 5);
    const newUsed = (user.credits_used || 0) + 5;

    await db.prepare(
      `UPDATE profiles SET credits_balance = ?, credits_used = ?, purchased_items = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(newBalance, newUsed, JSON.stringify(purchasedItems), user.id).run();

    // Create completed order
    await db.prepare(
      `INSERT INTO orders (id, order_reference, service_type, slide_count, timeline, formats, project_brief, full_name, email, status)
       VALUES (?, ?, ?, ?, 'Instant Credit Dispatch', '[\"Master PowerPoint (.pptx)\"]', 'Redeemed via 5 starter credits.', ?, ?, 'completed')`
    ).bind(crypto.randomUUID(), `CRD-${crypto.randomUUID().substring(0, 8).toUpperCase()}`, `Starter Credit Claim: ${template.title}`, String(template.slides_count || 30), user.full_name || userEmail.split("@")[0], userEmail).run();

    return new Response(JSON.stringify({
      data: {
        success: true,
        message: "Template claimed successfully with your design credits!",
        template_title: template.title,
        download_url: deliverable,
        credits_remaining: newBalance,
      },
      error: null,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return null; // unknown RPC
}
