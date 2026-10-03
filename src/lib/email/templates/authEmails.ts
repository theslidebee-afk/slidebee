import { escapeHtml, sanitizeExternalUrl, sendEmail } from '../client';

/**
 * 1. Client Welcome & Account Registration Email
 */
export async function sendWelcomeEmail({
  clientName,
  clientEmail,
  company
}: {
  clientName: string;
  clientEmail: string;
  company?: string;
}) {
  const safeClientName = escapeHtml(clientName || 'there');
  const safeCompany = company ? escapeHtml(company) : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">Welcome to SlideBee</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Your Executive Presentation Design Portal</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">Account Confirmed</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          Your SlideBee client account is now active${safeCompany ? ` for <strong>${safeCompany}</strong>` : ''}.
        </p>

        <p style="font-size: 13px; color: #4B5563; line-height: 1.6;">
          From your client portal, you can:
        </p>
        <ul style="font-size: 13px; color: #111111; line-height: 1.8;">
          <li>Submit new investor pitch decks & keynote briefs with 1 click.</li>
          <li>Track active presentation drafts and download deliverables.</li>
          <li>Access purchased PowerPoint master templates (.pptx).</li>
          <li>Monitor monthly retainer slide quotas.</li>
        </ul>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://theslidebee.com/account" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Access Client Portal
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: 'hello@theslidebee.com',
    fromName: 'SlideBee Studio',
    replyTo: 'hello@theslidebee.com',
    subject: `Welcome to SlideBee Studio — Your Client Account is Ready`,
    html,
  });
}

/**
 * 2. Waitlist Confirmation Email
 */
export async function sendWaitlistConfirmationEmail({
  clientEmail,
  source: _source
}: {
  clientEmail: string;
  source?: string;
}) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Exclusive Early Access Reservation</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">You're on the VIP Waitlist</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Thank you for joining the SlideBee early access list. We are putting the final touches on our on-demand executive presentation design studio and master PowerPoint template store.
        </p>

        <div style="background-color: #FFF9E8; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #FCBF14;">
          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #936610; margin-top: 0; margin-bottom: 8px;">VIP Benefits Reserved for You:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #111111; line-height: 1.8;">
            <li><strong>30% Off First Custom Project:</strong> Investor pitch deck, sales deck, or keynote redesign.</li>
            <li><strong>Free Starter Master Deck:</strong> Instant download access upon launch.</li>
            <li><strong>Priority Turnaround:</strong> Guaranteed 24h rush queue access.</li>
          </ul>
        </div>

        <p style="font-size: 13px; color: #4B5563; line-height: 1.6;">
          Need urgent presentation slides designed right now? Reply directly to this email or reach us at <a href="mailto:hello@theslidebee.com" style="color: #936610; font-weight: 700;">hello@theslidebee.com</a>.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Studio • <a href="https://theslidebee.com" style="color: #936610;">theslidebee.com</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: 'hello@theslidebee.com',
    fromName: 'SlideBee Studio',
    replyTo: 'hello@theslidebee.com',
    subject: `VIP Access Confirmed: You're on the SlideBee Waitlist`,
    html,
  });
}

/**
 * 3. Account Deletion / Data Erasure Notice Email
 */
export async function sendAccountDeletionEmail({
  clientEmail,
  clientName,
  reason = "User requested account closure",
  customNotes,
  senderEmail = "support@theslidebee.com",
  subject
}: {
  clientEmail: string;
  clientName?: string;
  reason?: string;
  customNotes?: string;
  senderEmail?: string;
  subject?: string;
}) {
  const safeClientName = escapeHtml(clientName || 'there');
  const safeClientEmail = escapeHtml(clientEmail);
  const safeReason = escapeHtml(reason);
  const safeCustomNotes = customNotes ? escapeHtml(customNotes) : '';
  const defaultSubject = `Account Deletion & Data Privacy Confirmation — SlideBee Studio`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Account Security & Privacy Desk</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <h2 style="font-size: 18px; font-weight: 800; margin-top: 0; color: #111111;">Account Deletion Confirmed</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          This notice confirms that your SlideBee client account associated with <strong>${safeClientEmail}</strong> has been successfully closed and purged from our active ledger.
        </p>

        <div style="background-color: #FFF9E8; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #FCBF14;">
          <div style="font-size: 13px; margin-bottom: 8px;">
            <strong style="color: #936610; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px;">Reason for Deletion:</strong>
            <span style="color: #111111; font-weight: 600;">${safeReason}</span>
          </div>
          <div style="font-size: 13px;">
            <strong style="color: #936610; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px;">Data Privacy Status:</strong>
            <span style="color: #111111;">Your user profile, session authentication tokens, and active subscription entries have been purged in compliance with our data governance standards.</span>
          </div>
        </div>

        ${safeCustomNotes ? `
          <div style="background-color: #F9FAFB; padding: 16px; border-radius: 8px; border-left: 4px solid #FCBF14; margin-bottom: 20px;">
            <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #726F6D; margin: 0 0 6px 0;">Additional Notes:</p>
            <p style="font-size: 13px; color: #111111; line-height: 1.6; margin: 0; white-space: pre-wrap;">${safeCustomNotes}</p>
          </div>
        ` : ''}

        <p style="font-size: 12px; color: #726F6D; line-height: 1.6; margin-top: 20px;">
          If this action was taken in error or if you wish to commission new presentation decks in the future, you may register a new account anytime at <a href="https://theslidebee.com/login" style="color: #936610; font-weight: bold;">theslidebee.com</a>.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Privacy Team • Inquiries: <a href="mailto:support@theslidebee.com" style="color: #936610;">support@theslidebee.com</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: senderEmail,
    fromName: 'SlideBee Privacy Desk',
    replyTo: senderEmail,
    subject: subject?.trim() || defaultSubject,
    html,
  });
}

/**
 * 4. Password Reset Recovery Email
 */
export async function sendPasswordResetEmail({
  clientEmail,
  resetUrl,
}: {
  clientEmail: string;
  resetUrl: string;
}) {
  const safeEmail = escapeHtml(clientEmail);
  const safeResetUrl = sanitizeExternalUrl(resetUrl);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Executive Presentation Design Studio</p>
      </div>

      <div style="background-color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <h2 style="font-size: 18px; font-weight: 800; margin-top: 0; color: #111111;">Password Reset Request</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          We received a request to reset the password for your SlideBee account (<strong>${safeEmail}</strong>).
        </p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Click the button below to choose a secure new password. This recovery link is valid for <strong>60 minutes</strong>.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${safeResetUrl}" style="background-color: #FCBF14; color: #111111; font-weight: 800; border-radius: 9999px; text-decoration: none; padding: 14px 28px; display: inline-block; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(252,191,20,0.3);">
            Reset Password
          </a>
        </div>

        <div style="background-color: #FFF9E8; padding: 14px; border-radius: 8px; border: 1px solid rgba(252,191,20,0.4); font-size: 12px; color: #936610; line-height: 1.5;">
          <strong>Security Note:</strong> If you did not request this password reset, no action is needed. Your current password remains secure and this link will expire automatically.
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D; line-height: 1.6;">
        SlideBee &bull; Curated Master PowerPoint Presentation Catalog<br/>
        Need assistance? Reply directly to this email or reach us at <a href="mailto:hello@theslidebee.com" style="color: #936610; text-decoration: underline;">hello@theslidebee.com</a>.
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: 'hello@theslidebee.com',
    fromName: 'SlideBee Security',
    replyTo: 'hello@theslidebee.com',
    subject: 'Reset Your SlideBee Password',
    html,
  });
}
