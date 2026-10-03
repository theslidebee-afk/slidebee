import { escapeHtml, sanitizeExternalUrl, sendEmail } from '../client';

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
  const safeClientName = escapeHtml(clientName || 'there');
  const safeServiceType = escapeHtml(serviceType);
  const safeSlideCount = escapeHtml(slideCount);
  const safeDriveLink = sanitizeExternalUrl(driveLink);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Executive Presentation Design on Demand</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">We Received Your Presentation Brief</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          Thank you for choosing SlideBee. A senior art director is currently reviewing your project requirements and asset links.
        </p>

        <div style="background-color: #FFF9E8; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #FCBF14;">
          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #936610; margin-top: 0; margin-bottom: 10px;">Brief Summary</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #111111; line-height: 1.8;">
            <li><strong>Service Tier:</strong> ${safeServiceType}</li>
            <li><strong>Total Slides:</strong> ${safeSlideCount} Slides</li>
            <li><strong>Turnaround Priority:</strong> ${rushDelivery ? '24h Rush Guarantee' : 'Standard 48h Delivery'}</li>
            ${safeDriveLink ? `<li><strong>Assets / Draft Link:</strong> <a href="${safeDriveLink}" target="_blank" rel="noopener noreferrer" style="color: #936610; font-weight: 700;">View Uploaded Files</a></li>` : ''}
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
        All files and corporate data are protected under strict mutual NDA.<br/>
        Questions? Reply directly to this email or reach us at <a href="mailto:hello@theslidebee.com" style="color: #936610;">hello@theslidebee.com</a>.
      </div>
    </div>
  `;

  // 1. Client confirmation email
  const clientResult = await sendEmail({
    to: clientEmail,
    fromEmail: 'design@theslidebee.com',
    fromName: 'SlideBee Design Studio',
    replyTo: 'design@theslidebee.com',
    subject: `Brief Received: ${safeServiceType} (${safeSlideCount} Slides) — SlideBee Studio`,
    html,
  });

  // 2. Studio admin notification email (alert design team of new brief)
  const studioNotificationHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; padding: 28px; border-radius: 16px; color: #ffffff;">
      <div style="background-color: #FCBF14; color: #111111; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px;">
        NEW PROJECT BRIEF — ACTION REQUIRED
      </div>
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 16px 0; color: #ffffff;">New Brief Received: ${safeServiceType}</h2>
      <div style="background-color: #1a1a1a; padding: 20px; border-radius: 12px; border: 1px solid #333333; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e0e0e0; line-height: 1.8;">
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14; width: 140px;">Client Name:</td><td>${safeClientName}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Client Email:</td><td><a href="mailto:${clientEmail}" style="color: #FCBF14;">${clientEmail}</a></td></tr>
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Service:</td><td>${safeServiceType}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Slide Count:</td><td>${safeSlideCount} Slides</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Priority:</td><td>${rushDelivery ? '24h RUSH — HIGH PRIORITY' : 'Standard 48h Delivery'}</td></tr>
          ${safeDriveLink ? `<tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Assets Link:</td><td><a href="${safeDriveLink}" target="_blank" rel="noopener noreferrer" style="color: #FCBF14; font-weight: 700;">View Uploaded Files</a></td></tr>` : ''}
        </table>
      </div>
      <p style="font-size: 12px; color: #999999; margin: 0;">Reply directly to this email to contact the client, or open the admin panel to manage the brief.</p>
    </div>
  `;

  sendEmail({
    to: 'design@theslidebee.com',
    fromEmail: 'hello@theslidebee.com',
    fromName: 'SlideBee Brief Alert',
    replyTo: clientEmail,
    subject: `[NEW BRIEF] ${safeServiceType} — ${safeClientName} (${safeSlideCount} Slides)${rushDelivery ? ' — RUSH' : ''}`,
    html: studioNotificationHtml,
  }).catch(err => console.warn('Studio brief notification dispatch:', err));

  return clientResult;
}

/**
 * 2. Contact / Lead Notification Email
 */
export async function sendContactNotificationEmail({
  name,
  email,
  subject,
  message
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const safeName = escapeHtml(name || 'there');
  const safeSubject = escapeHtml(subject || 'General Inquiry');
  const safeMessage = escapeHtml(message || '');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Studio</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Inquiry Confirmation</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">We Received Your Message</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeName}</strong>,<br/><br/>
          Thank you for reaching out to SlideBee Studio. Our design leads review every project note and will reply within <strong>2 hours</strong>.
        </p>

        <div style="background-color: #FFF9E8; padding: 14px; border-radius: 8px; margin: 18px 0; border: 1px solid #FCBF14;">
          <p style="font-size: 12px; font-weight: bold; color: #936610; margin: 0 0 6px 0;">SUBJECT: ${safeSubject}</p>
          <p style="font-size: 13px; color: #111111; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
        </div>
      </div>
    </div>
  `;

  // 1. Client confirmation
  const clientResult = await sendEmail({
    to: email,
    fromEmail: 'hello@theslidebee.com',
    fromName: 'SlideBee Studio',
    replyTo: 'hello@theslidebee.com',
    subject: `We Received Your Note: ${safeSubject} — SlideBee Studio`,
    html,
  });

  // 2. Studio notification
  const studioAlertHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; padding: 28px; border-radius: 16px; color: #ffffff;">
      <div style="background-color: #FCBF14; color: #111111; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px;">
        NEW CONTACT INQUIRY
      </div>
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 16px 0; color: #ffffff;">Contact Form: ${safeSubject}</h2>
      <div style="background-color: #1a1a1a; padding: 20px; border-radius: 12px; border: 1px solid #333333; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e0e0e0; line-height: 1.8;">
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14; width: 100px;">From:</td><td>${safeName}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Email:</td><td><a href="mailto:${email}" style="color: #FCBF14;">${email}</a></td></tr>
          <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Subject:</td><td>${safeSubject}</td></tr>
        </table>
        <div style="margin-top: 14px; padding: 14px; background-color: #222222; border-radius: 8px; font-size: 13px; color: #e0e0e0; white-space: pre-wrap;">${safeMessage}</div>
      </div>
      <p style="font-size: 12px; color: #999999; margin: 0;">Reply to this email to respond directly to ${safeName}.</p>
    </div>
  `;

  sendEmail({
    to: 'hello@theslidebee.com',
    fromEmail: 'hello@theslidebee.com',
    fromName: 'SlideBee Contact Alert',
    replyTo: email,
    subject: `[CONTACT] ${safeSubject} — from ${safeName}`,
    html: studioAlertHtml,
  }).catch(err => console.warn('Studio contact notification dispatch:', err));

  return clientResult;
}

/**
 * 3. Template Purchase Receipt & Instant Deliverables Email
 */
export async function sendTemplatePurchaseReceiptEmail({
  clientEmail,
  clientName,
  templateTitle,
  templateCode,
  downloadUrl,
  amountPaid,
  currency = 'INR'
}: {
  clientEmail: string;
  clientName?: string;
  templateTitle: string;
  templateCode: string;
  downloadUrl: string;
  amountPaid: number;
  currency?: string;
}) {
  const safeClientName = escapeHtml(clientName || 'there');
  const safeTemplateTitle = escapeHtml(templateTitle);
  const safeTemplateCode = escapeHtml(templateCode);
  const safeDownloadUrl = sanitizeExternalUrl(downloadUrl) || '#';
  const safeCurrency = currency === 'USD' ? '$' : '₹';
  const safeAmount = Number(amountPaid) || 0;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Template Store</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Order Confirmed & Deliverables Ready</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">Your Master Presentation Files Are Ready</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${safeClientName}</strong>,<br/><br/>
          Thank you for purchasing <strong>${safeTemplateTitle}</strong> (${safeTemplateCode}). Your commercial license is active.
        </p>

        <div style="background-color: #FFF9E8; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #FCBF14;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span><strong>Item:</strong></span>
            <span>${safeTemplateTitle} (${safeTemplateCode})</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span><strong>Amount Paid:</strong></span>
            <span>${safeCurrency}${safeAmount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span><strong>License:</strong></span>
            <span>Single Commercial Unlimited Use</span>
          </div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${safeDownloadUrl}" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Download Master Presentation (.pptx)
          </a>
        </div>

        <p style="font-size: 12px; color: #726F6D; line-height: 1.6; text-align: center;">
          Need help customizing or want our designers to tailor this deck to your branding?<br/>
          Reply to this email or submit a quick redesign order on <a href="https://theslidebee.com/ordernow" style="color: #936610; font-weight: bold;">theslidebee.com/ordernow</a>.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Studio • Official Inquiries: <a href="mailto:hello@theslidebee.com" style="color: #936610;">hello@theslidebee.com</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    fromEmail: 'design@theslidebee.com',
    fromName: 'SlideBee Design Studio',
    replyTo: 'design@theslidebee.com',
    subject: `Your Master Presentation Files: ${safeTemplateTitle} (${safeTemplateCode}) — SlideBee`,
    html,
  });
}
