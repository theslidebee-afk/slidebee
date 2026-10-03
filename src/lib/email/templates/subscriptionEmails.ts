import { escapeHtml, sendEmail } from '../client';

/**
 * 1. Complimentary Pro Membership Granted Email
 */
export async function sendProGrantedEmail({
  clientEmail,
  clientName,
  slideQuota = 15,
  durationMonths = 12,
  partnershipReason = "VIP Strategic Client",
  customMessage,
  senderEmail = "design@theslidebee.com",
  subject
}: {
  clientEmail: string;
  clientName?: string;
  slideQuota?: number;
  durationMonths?: number;
  partnershipReason?: string;
  customMessage?: string;
  senderEmail?: string;
  subject?: string;
}) {
  const safeClientName = escapeHtml(clientName || 'there');
  const safeClientEmail = escapeHtml(clientEmail);
  const safeSlideQuota = Number(slideQuota) || 15;
  const safePartnershipReason = escapeHtml(partnershipReason);
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : '';
  const durationLabel = durationMonths >= 999 ? "Indefinite / Lifetime" : `${Number(durationMonths) || 12} Months`;
  const defaultSubject = `VIP Pro Membership Activated (${safeSlideQuota} Slides/mo) — SlideBee Design Studio`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Executive Presentation Design Portal</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <div style="display: inline-block; background-color: #FFF9E8; border: 1px solid #FCBF14; color: #936610; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
          VIP Pro Membership
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #111111;">Your Complimentary Pro Access Is Now Active</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          We are pleased to inform you that our leadership team has granted your account complimentary <strong>SlideBee Pro Studio Membership</strong>.
        </p>

        <div style="background-color: #FFF9E8; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #FCBF14;">
          <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #936610; margin-top: 0; margin-bottom: 12px;">Your Pro Membership Privileges</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #111111; line-height: 1.8;">
            <li><strong>Monthly Download Quota:</strong> ${safeSlideQuota} Full Presentation Template Downloads / month</li>
            <li><strong>Unrestricted Catalog Access:</strong> All presentation decks in our store are 100% unlocked for you</li>
            <li><strong>Complimentary Duration:</strong> ${durationLabel}</li>
            <li><strong>Membership Justification:</strong> ${safePartnershipReason}</li>
            <li><strong>Direct WhatsApp Studio Hotline:</strong> Unlocked in your portal dashboard</li>
            <li><strong>VIP Deck Review:</strong> Priority turnaround on bespoke presentation briefs</li>
          </ul>
        </div>

        ${safeCustomMessage ? `
          <div style="background-color: #F9FAFB; padding: 16px; border-radius: 8px; border-left: 4px solid #FCBF14; margin-bottom: 20px;">
            <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #726F6D; margin: 0 0 6px 0;">Note from SlideBee Studio Team:</p>
            <p style="font-size: 13px; color: #111111; line-height: 1.6; margin: 0; white-space: pre-wrap;">${safeCustomMessage}</p>
          </div>
        ` : ''}

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="https://theslidebee.com/templates" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Browse & Download Templates
          </a>
        </div>

        <p style="font-size: 12px; color: #726F6D; line-height: 1.6; text-align: center; margin: 0;">
          Simply sign in with <strong>${safeClientEmail}</strong> to begin downloading up to ${safeSlideQuota} full master presentation decks this month.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Studio • Official Inquiries: <a href="mailto:hello@theslidebee.com" style="color: #936610;">hello@theslidebee.com</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: senderEmail,
    fromName: 'SlideBee Design Studio',
    replyTo: senderEmail,
    subject: subject?.trim() || defaultSubject,
    html,
  });
}

/**
 * 2. Slide Credits Adjusted Email
 */
export async function sendCreditsAdjustedEmail({
  clientEmail,
  clientName,
  creditsAdded,
  newBalance,
  reason = "Studio Bonus Allocation",
  customMessage,
  senderEmail = "design@theslidebee.com",
  subject
}: {
  clientEmail: string;
  clientName?: string;
  creditsAdded: number;
  newBalance: number;
  reason?: string;
  customMessage?: string;
  senderEmail?: string;
  subject?: string;
}) {
  const safeClientName = escapeHtml(clientName || 'there');
  const safeCreditsAdded = Number(creditsAdded) || 0;
  const safeNewBalance = Number(newBalance) || 0;
  const safeReason = escapeHtml(reason);
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : '';
  const isAddition = safeCreditsAdded > 0;
  const defaultSubject = `Slide Credits Updated: ${isAddition ? `+${safeCreditsAdded}` : safeCreditsAdded} Credits — SlideBee Studio`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Executive Presentation Design Portal</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <h2 style="font-size: 18px; font-weight: 800; margin-top: 0; color: #111111;">Your Slide Download Credits Have Been Updated</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          Your SlideBee slide download credit balance has been modified by the studio operations team.
        </p>

        <div style="background-color: #FFF9E8; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #FCBF14;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px;">
            <span><strong>Credit Adjustment:</strong></span>
            <span style="font-weight: 800; color: ${isAddition ? '#059669' : '#DC2626'};">${isAddition ? `+${safeCreditsAdded}` : safeCreditsAdded} Credits</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px;">
            <span><strong>New Balance:</strong></span>
            <span style="font-weight: 800; color: #111111;">${safeNewBalance} Available Credits</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span><strong>Reason / Program:</strong></span>
            <span style="color: #4B5563;">${safeReason}</span>
          </div>
        </div>

        ${safeCustomMessage ? `
          <div style="background-color: #F9FAFB; padding: 16px; border-radius: 8px; border-left: 4px solid #FCBF14; margin-bottom: 20px;">
            <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #726F6D; margin: 0 0 6px 0;">Studio Notes:</p>
            <p style="font-size: 13px; color: #111111; line-height: 1.6; margin: 0; white-space: pre-wrap;">${safeCustomMessage}</p>
          </div>
        ` : ''}

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://theslidebee.com/templates" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Browse Master Presentation Catalog
          </a>
        </div>

        <p style="font-size: 12px; color: #726F6D; line-height: 1.6; text-align: center; margin: 0;">
          Credits can be applied directly to unlock any master presentation decks (.pptx) with full commercial usage rights.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Studio • Official Inquiries: <a href="mailto:hello@theslidebee.com" style="color: #936610;">hello@theslidebee.com</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: senderEmail,
    fromName: 'SlideBee Design Studio',
    replyTo: senderEmail,
    subject: subject?.trim() || defaultSubject,
    html,
  });
}

/**
 * 3. Pro Membership 1-Week Expiration Reminder Email
 */
export async function sendProExpiringSoonEmail({
  clientEmail,
  clientName,
  daysRemaining = 7,
  expiryDate,
  remainingQuota = 15,
  senderEmail = "design@theslidebee.com",
  subject,
  customMessage,
}: {
  clientEmail: string;
  clientName?: string;
  daysRemaining?: number;
  expiryDate?: string;
  remainingQuota?: number;
  senderEmail?: string;
  subject?: string;
  customMessage?: string;
}) {
  const safeClientName = escapeHtml(clientName || "there");
  const safeDaysRemaining = Number(daysRemaining) || 7;
  const safeRemainingQuota = Number(remainingQuota) || 15;
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : '';
  const defaultSubject = `Reminder: Your SlideBee Pro Membership Expires in ${safeDaysRemaining} Days`;
  const formattedExpiry = expiryDate ? new Date(expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "in 7 days";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Membership & Account Operations</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <div style="display: inline-block; background-color: #FEF3C7; border: 1px solid #F59E0B; color: #92400E; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
          Expiring Soon (${safeDaysRemaining} Days Left)
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #111111;">Your Pro Membership Concludes on ${formattedExpiry}</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          This is a friendly reminder that your SlideBee Pro Studio Membership is scheduled to conclude on <strong>${formattedExpiry}</strong>.
        </p>

        ${safeCustomMessage ? `
        <div style="background-color: #FFF9E8; border-left: 4px solid #FCBF14; padding: 14px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #111111; line-height: 1.6;">
          <strong>Personal Note from Studio Desk:</strong><br/>
          ${safeCustomMessage.replace(/\n/g, '<br/>')}
        </div>
        ` : ''}

        <div style="background-color: #FFF9E8; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #FCBF14;">
          <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #936610; margin-top: 0; margin-bottom: 10px;">Cycle Summary</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #111111; line-height: 1.8;">
            <li><strong>Remaining Template Downloads:</strong> ${safeRemainingQuota} master presentation decks</li>
            <li><strong>Expiration Date:</strong> ${formattedExpiry}</li>
            <li><strong>Perks At Stake:</strong> Unrestricted marketplace template downloads and direct WhatsApp Studio hotline</li>
          </ul>
        </div>

        <p style="font-size: 13px; color: #4B5563; line-height: 1.6;">
          Be sure to download any desired master PowerPoint decks before your validity period ends, or renew today to keep your unlimited workflow active without disruption.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://theslidebee.com/pricing" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Renew Pro Membership
          </a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Studio Desk • <a href="mailto:support@theslidebee.com" style="color: #936610;">support@theslidebee.com</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: senderEmail,
    fromName: "SlideBee Studio",
    replyTo: senderEmail,
    subject: subject?.trim() || defaultSubject,
    html,
  });
}

/**
 * 4. Pro Membership Expired / Concluded Email
 */
export async function sendProExpiredEmail({
  clientEmail,
  clientName,
  expiryDate,
  senderEmail = "design@theslidebee.com",
  subject,
  customMessage,
}: {
  clientEmail: string;
  clientName?: string;
  expiryDate?: string;
  senderEmail?: string;
  subject?: string;
  customMessage?: string;
}) {
  const safeClientName = escapeHtml(clientName || "there");
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : '';
  const defaultSubject = `Your SlideBee Pro Membership Has Concluded`;
  const formattedExpiry = expiryDate ? new Date(expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "recently";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Membership Services</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <div style="display: inline-block; background-color: #FEE2E2; border: 1px solid #EF4444; color: #991B1B; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
          Membership Expired
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #111111;">Your Pro Membership Ended on ${formattedExpiry}</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          Your SlideBee Pro Studio Membership ended on <strong>${formattedExpiry}</strong>. Your account has safely transitioned to our standard Free Tier.
        </p>

        ${safeCustomMessage ? `
        <div style="background-color: #FFF9E8; border-left: 4px solid #FCBF14; padding: 14px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #111111; line-height: 1.6;">
          <strong>Personal Note from Studio Desk:</strong><br/>
          ${safeCustomMessage.replace(/\n/g, '<br/>')}
        </div>
        ` : ''}

        <div style="background-color: #F9FAFB; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #E5E7EB;">
          <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #4B5563; margin-top: 0; margin-bottom: 10px;">What This Means:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4B5563; line-height: 1.8;">
            <li>All templates you previously downloaded remain in your account forever with perpetual commercial rights.</li>
            <li>Free Pro template monthly quota and VIP WhatsApp channel are now paused.</li>
            <li>You can still purchase individual presentation decks or reactivate Pro anytime.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://theslidebee.com/pricing" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reactivate Pro Membership
          </a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Studio • <a href="mailto:support@theslidebee.com" style="color: #936610;">support@theslidebee.com</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: senderEmail,
    fromName: "SlideBee Studio",
    replyTo: senderEmail,
    subject: subject?.trim() || defaultSubject,
    html,
  });
}
