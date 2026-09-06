/**
 * SlideBee Email Dispatch Service powered by Resend
 */

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.warn('Failed to send email via SlideBee email router:', error);
    return { success: false, error };
  }
}

/**
 * 1. Order Brief Confirmation Email
 */
export async function sendOrderConfirmationEmail({
  clientName,
  clientEmail,
  serviceType,
  slideCount,
  rushDelivery,
  driveLink
}: {
  clientName: string;
  clientEmail: string;
  serviceType: string;
  slideCount: number | string;
  rushDelivery: boolean;
  driveLink?: string;
}) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">🐝 SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Executive Presentation Design on Demand</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">We Received Your Presentation Brief! 🎉</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${clientName || 'there'}</strong>,<br/><br/>
          Thank you for choosing SlideBee. A senior art director is currently reviewing your project requirements and asset links.
        </p>

        <div style="background-color: #FFF9E8; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #FCBF14;">
          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #936610; margin-top: 0; margin-bottom: 10px;">Brief Summary</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #111111; line-height: 1.8;">
            <li><strong>Service Tier:</strong> ${serviceType}</li>
            <li><strong>Total Slides:</strong> ${slideCount} Slides</li>
            <li><strong>Turnaround Priority:</strong> ${rushDelivery ? '⚡ 24h Rush Guarantee' : 'Standard 48h Delivery'}</li>
            ${driveLink ? `<li><strong>Assets / Draft Link:</strong> <a href="${driveLink}" style="color: #936610; font-weight: 700;">View Uploaded Files</a></li>` : ''}
          </ul>
        </div>

        <p style="font-size: 13px; color: #4B5563; line-height: 1.6;">
          <strong>What happens next?</strong><br/>
          1. Our design team will verify the slide count and brand assets.<br/>
          2. We will send you a 2-slide design direction sample within 4–6 hours.<br/>
          3. Once you approve the visual style, we execute the full deck with revisions.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        🔒 All files and corporate data are protected under strict mutual NDA.<br/>
        Questions? Reply directly to this email or reach us at <a href="mailto:hello@theslidebee.com" style="color: #936610;">hello@theslidebee.com</a>.
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `🐝 Brief Received: ${serviceType} (${slideCount} Slides) — SlideBee Studio`,
    html,
  });
}

/**
 * 2. Client Welcome & Account Registration Email
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
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">🐝 Welcome to SlideBee</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Your Executive Presentation Design Portal</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">Account Confirmed</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${clientName || 'there'}</strong>,<br/><br/>
          Your SlideBee client account is now active${company ? ` for <strong>${company}</strong>` : ''}.
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
          <a href="https://theslidebee.com/#/account" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Access Client Portal →
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `🐝 Welcome to SlideBee Studio — Your Client Account is Ready`,
    html,
  });
}
