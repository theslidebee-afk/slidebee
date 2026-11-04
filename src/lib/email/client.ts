/**
 * SlideBee Email Dispatch Client powered by Resend / Serverless Router
 */

export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeExternalUrl(url?: string): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return '';
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, fromEmail, fromName, replyTo }: SendEmailParams) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html, fromEmail, fromName, replyTo }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.warn('Failed to send email via SlideBee email router:', error);
    return { success: false, error };
  }
}
