const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const isConfigured = (val) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  return !(
    trimmed.startsWith('your_') ||
    trimmed.includes('xxxx') ||
    trimmed === 'your_brevo_api_key_here' ||
    trimmed === 'your_verified_sender_email@gmail.com'
  );
};

const parseSender = (defaultName = 'CampusMart') => {
  const rawFrom = (process.env.EMAIL_FROM || process.env.EMAIL_USER || '').trim();
  const match = rawFrom.match(/^(.*?)<([^>]+)>$/);
  if (match) {
    const parsedName = match[1].trim().replace(/^["']|["']$/g, '') || defaultName;
    return { name: parsedName, email: match[2].trim() };
  }
  const email = isConfigured(rawFrom) ? rawFrom : 'no-reply@campusmart.local';
  return { name: defaultName, email };
};

function wrapEmailLayout({ title, subtitle, bodyHtml, ctaText, ctaUrl, ctaColor = '#4F46E5', footerText = 'CampusMart College Marketplace Notification' }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; padding: 6px 14px; background: #EEF2FF; border-radius: 10px;">
          <span style="font-size: 22px; font-weight: 800; color: #4F46E5;">Campus</span><span style="font-size: 22px; font-weight: 800; color: #10B981;">Mart</span>
        </div>
        <h2 style="color: #0F172A; margin-top: 14px; margin-bottom: 4px; font-size: 20px;">${title}</h2>
        <p style="color: #64748B; font-size: 13px; margin: 0;">${subtitle}</p>
      </div>
      ${bodyHtml}
      ${ctaText && ctaUrl ? `
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${ctaUrl}" style="display: inline-block; background: ${ctaColor}; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px;">
            ${ctaText}
          </a>
        </div>
      ` : ''}
      <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 20px 0;">
      <div style="text-align: center; font-size: 12px; color: #94A3B8;">
        ${footerText}
      </div>
    </div>
  `;
}

async function dispatchEmail({ to, toName, subject, text, html, senderTitle = 'CampusMart' }) {
  dotenv.config({ override: true });

  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const sender = parseSender(senderTitle);

  if (isConfigured(brevoApiKey)) {
    if (!isConfigured(sender.email) || sender.email === 'no-reply@campusmart.local') {
      console.warn('⚠️ [Brevo Warning] BREVO_API_KEY is set, but EMAIL_FROM is not set to your verified Brevo sender email in .env!');
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {})
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Brevo API Error (${response.status}): ${data.message || JSON.stringify(data)}`);
    }

    console.log(`✅ [Brevo Email Delivered] To: ${to} | Subject: "${subject}" | MessageId: ${data.messageId || 'OK'}`);
    return { success: true, simulated: false, provider: 'brevo-api', info: data };
  }

  const smtpUser = (process.env.EMAIL_USER || '').trim();
  const smtpPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (isConfigured(smtpUser) && isConfigured(smtpPass)) {
    const isBrevoSmtp = smtpPass.startsWith('xsmtpsib-') || (process.env.EMAIL_SERVICE || '').toLowerCase() === 'brevo';
    const transporter = nodemailer.createTransport(
      isBrevoSmtp
        ? { host: 'smtp-relay.brevo.com', port: 587, secure: false, auth: { user: smtpUser, pass: smtpPass } }
        : { service: process.env.EMAIL_SERVICE || 'gmail', auth: { user: smtpUser, pass: smtpPass } }
    );

    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email !== 'no-reply@campusmart.local' ? sender.email : smtpUser}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`✅ [SMTP Email Delivered] To: ${to} | Subject: "${subject}"`);
    return { success: true, simulated: false, provider: 'smtp', info };
  }

  console.log('\n======================================================');
  console.log('📧 [SIMULATED EMAIL — Add BREVO_API_KEY & EMAIL_FROM in .env for real inbox delivery]');
  console.log(`From: "${sender.name}" <${sender.email}>`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------------------------------------');
  if (text) console.log(text);
  console.log('======================================================\n');

  return {
    success: true,
    simulated: true,
    provider: 'console-simulation',
    info: { messageId: 'simulated-' + Date.now() }
  };
}

async function sendOtpEmail(toEmail, otp, name = 'Student') {
  try {
    const subject = `🔐 Verify your CampusMart Account — OTP: ${otp}`;
    const text = `Hello ${name},\n\nYour 6-digit verification code is: ${otp}\n\nThis code is valid for 10 minutes. Please enter it on CampusMart to verify your account.\n\nBest regards,\nCampusMart Team`;
    const html = wrapEmailLayout({
      title: 'Verify Your College Account',
      subtitle: 'Use the 6-digit code below to complete your verification.',
      bodyHtml: `
        <div style="background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 8px;">Your 6-Digit OTP</div>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 0.25em; color: #4F46E5; font-family: monospace;">${otp}</div>
          <div style="font-size: 12px; color: #94A3B8; margin-top: 8px;">⏱️ Valid for 10 minutes only</div>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Hi <strong>${name}</strong>,<br>
          Please enter this code on the CampusMart verification screen to activate your account and start buying & selling within your campus. Never share this code with anyone.
        </p>
      `,
      footerText: `© ${new Date().getFullYear()} CampusMart — Built for college students.`
    });

    return await dispatchEmail({ to: toEmail, toName: name, subject, text, html, senderTitle: 'CampusMart Security' });
  } catch (error) {
    console.error(`❌ [Email Error] Failed to send OTP to ${toEmail}:`, error.message || error);
    return { success: false, simulated: false, error };
  }
}

async function sendNewOfferEmail(sellerEmail, sellerName, buyerName, productTitle, amount, message) {
  try {
    const formattedAmount = '₹' + Number(amount).toLocaleString('en-IN');
    const appUrl = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
    const subject = `🏷️ New Offer of ${formattedAmount} received for "${productTitle}"!`;
    const text = `Hello ${sellerName},\n\n${buyerName} made an offer of ${formattedAmount} on your listing: "${productTitle}".\n\nBuyer note: "${message || 'No additional note'}"\n\nVisit your Offers dashboard on CampusMart (${appUrl}/offers.html) to accept, counter, or decline.\n\nBest regards,\nCampusMart`;
    const html = wrapEmailLayout({
      title: 'You Received a New Offer! 🏷️',
      subtitle: `Hi ${sellerName}, a fellow student wants to buy your item.`,
      bodyHtml: `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">Listing:</div>
          <div style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">${productTitle}</div>
          <table style="width: 100%; border-top: 1px dashed #CBD5E1; padding-top: 12px;">
            <tr>
              <td style="vertical-align: top;">
                <span style="font-size: 12px; color: #64748B;">Offered by:</span><br>
                <strong style="font-size: 14px; color: #0F172A;">${buyerName}</strong>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="font-size: 12px; color: #64748B;">Offer Amount:</span><br>
                <span style="font-size: 22px; font-weight: 800; color: #10B981;">${formattedAmount}</span>
              </td>
            </tr>
          </table>
          ${message ? `
            <div style="margin-top: 12px; padding: 10px 12px; background: #ffffff; border-radius: 8px; border: 1px solid #E2E8F0; font-size: 13px; color: #475569;">
              <strong>Buyer's Note:</strong> <em>"${message}"</em>
            </div>
          ` : ''}
        </div>
      `,
      ctaText: 'View & Respond to Offer',
      ctaUrl: `${appUrl}/offers.html`
    });

    return await dispatchEmail({ to: sellerEmail, toName: sellerName, subject, text, html, senderTitle: 'CampusMart Offers' });
  } catch (error) {
    console.error(`❌ [Email Error] Failed to send new offer email to ${sellerEmail}:`, error.message || error);
    return { success: false, simulated: false, error };
  }
}

async function sendOfferStatusEmail(buyerEmail, buyerName, sellerName, productTitle, amount, status, counterAmount = null, counterMessage = '') {
  try {
    const formattedAmount = '₹' + Number(amount).toLocaleString('en-IN');
    const appUrl = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
    const isAccepted = status === 'accepted';
    const isCountered = status === 'countered';
    const isRejected = status === 'rejected';

    let subject = `Offer Update for "${productTitle}"`;
    let statusTitle = 'Your Offer Was Updated';
    let statusText = 'The seller has responded to your offer.';
    let textBody = `Hello ${buyerName},\n\nThe seller (${sellerName}) updated your offer for "${productTitle}".`;

    if (isAccepted) {
      subject = `🎉 Offer Accepted! "${productTitle}" for ${formattedAmount}`;
      statusTitle = 'Your Offer Was Accepted! 🎉';
      statusText = `<strong>${sellerName}</strong> has accepted your offer of <strong style="color: #10B981;">${formattedAmount}</strong>! You can now open CampusMart to scan the seller's UPI QR code or chat with them to complete the deal.`;
      textBody = `Hello ${buyerName},\n\nGreat news! ${sellerName} accepted your offer of ${formattedAmount} for "${productTitle}".\n\nOpen ${appUrl}/offers.html to pay via UPI QR or chat with the seller.`;
    } else if (isCountered) {
      const formattedCounter = '₹' + Number(counterAmount).toLocaleString('en-IN');
      subject = `🔄 Counter Offer of ${formattedCounter} for "${productTitle}"`;
      statusTitle = 'Counter Offer Received! 🔄';
      statusText = `<strong>${sellerName}</strong> sent a counter offer of <strong style="color: #F59E0B;">${formattedCounter}</strong> (your original offer was ${formattedAmount}).${counterMessage ? `<br><br><strong>Seller's Note:</strong> <em>"${counterMessage}"</em>` : ''}`;
      textBody = `Hello ${buyerName},\n\n${sellerName} sent a counter offer of ${formattedCounter} for "${productTitle}".${counterMessage ? `\nSeller Note: "${counterMessage}"` : ''}\n\nOpen ${appUrl}/offers.html to accept or decline the counter offer.`;
    } else if (isRejected) {
      subject = `Offer Declined for "${productTitle}"`;
      statusTitle = 'Offer Declined';
      statusText = `<strong>${sellerName}</strong> has declined your offer of ${formattedAmount}. You can make a new offer or browse other listings on CampusMart.`;
      textBody = `Hello ${buyerName},\n\n${sellerName} has declined your offer of ${formattedAmount} for "${productTitle}".`;
    }

    const html = wrapEmailLayout({
      title: statusTitle,
      subtitle: `Hi ${buyerName}, here is an update on your offer.`,
      bodyHtml: `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">Listing:</div>
          <div style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">${productTitle}</div>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">${statusText}</p>
        </div>
      `,
      ctaText: isAccepted ? '💳 View & Pay via UPI' : 'Open Offers Dashboard',
      ctaUrl: `${appUrl}/offers.html`,
      ctaColor: isAccepted ? '#10B981' : '#4F46E5'
    });

    return await dispatchEmail({ to: buyerEmail, toName: buyerName, subject, text: textBody, html, senderTitle: 'CampusMart Offers' });
  } catch (error) {
    console.error(`❌ [Email Error] Failed to send status email to ${buyerEmail}:`, error.message || error);
    return { success: false, simulated: false, error };
  }
}

async function sendCounterAcceptedEmailToSeller(sellerEmail, sellerName, buyerName, productTitle, agreedAmount) {
  try {
    const formattedAmount = '₹' + Number(agreedAmount).toLocaleString('en-IN');
    const appUrl = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
    const subject = `🤝 Counter Offer Accepted! ${buyerName} agreed to ${formattedAmount} for "${productTitle}"`;
    const text = `Hello ${sellerName},\n\n${buyerName} has accepted your counter offer of ${formattedAmount} for "${productTitle}"!\n\nThey can now pay you via your UPI QR code or reach out via CampusMart Chat.\n\nView details: ${appUrl}/offers.html`;
    const html = wrapEmailLayout({
      title: 'Counter Offer Accepted! 🤝',
      subtitle: `Hi ${sellerName}, your counter offer was accepted.`,
      bodyHtml: `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">Listing:</div>
          <div style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">${productTitle}</div>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">
            <strong>${buyerName}</strong> accepted your counter offer of <strong style="color: #10B981;">${formattedAmount}</strong>. They can now scan your payment QR code or coordinate pickup with you in chat.
          </p>
        </div>
      `,
      ctaText: 'View Accepted Deal',
      ctaUrl: `${appUrl}/offers.html`,
      ctaColor: '#10B981'
    });

    return await dispatchEmail({ to: sellerEmail, toName: sellerName, subject, text, html, senderTitle: 'CampusMart Offers' });
  } catch (error) {
    console.error(`❌ [Email Error] Failed to send counter-accepted email to ${sellerEmail}:`, error.message || error);
    return { success: false, simulated: false, error };
  }
}

module.exports = {
  sendOtpEmail,
  sendNewOfferEmail,
  sendOfferStatusEmail,
  sendCounterAcceptedEmailToSeller
};
