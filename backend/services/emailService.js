const nodemailer = require("nodemailer");
const crypto = require("crypto");

/**
 * Generate a unique, strong, production-ready password
 * Example format: Eco@K7m#92
 */
const generateProductionPassword = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const specials = "#@!$%&*";
  let pass = "Eco@";
  for (let i = 0; i < 4; i++) {
    pass += letters[crypto.randomInt(0, letters.length)];
  }
  pass += specials[crypto.randomInt(0, specials.length)];
  for (let i = 0; i < 2; i++) {
    pass += crypto.randomInt(1, 9).toString();
  }
  return pass;
};

const createTransporter = () => {
  const user = process.env.EMAIL || "solutions@hommlie.com";
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || "akcz egci gbsg xzky";

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass
    }
  });
};

/**
 * Send email credentials and order confirmation to customer
 */
const sendCustomerCredentialsEmail = async ({ toEmail, plainPassword, orderId, customerName, isNewAccount = true }) => {
  if (!toEmail) {
    console.warn("sendCustomerCredentialsEmail skipped: No recipient email provided.");
    return false;
  }

  try {
    const transporter = createTransporter();
    const loginUrl = process.env.CLIENT_URL || "http://localhost:5174/login";
    const fromEmail = process.env.EMAIL || "solutions@hommlie.com";

    const subject = `Ecosphere Waste Solutions - Order #${orderId} Confirmed & Portal Login Details`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation & Login Credentials</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);">
                
                <!-- HEADER BANNER -->
                <tr>
                  <td style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 35px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">
                      Ecosphere Waste Solutions
                    </h1>
                    <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 1.5px;">
                      Sustainable & Clean Earth Operations
                    </p>
                  </td>
                </tr>

                <!-- MAIN BODY CONTENT -->
                <tr>
                  <td style="padding: 35px 35px 25px 35px; color: #334155;">
                    <h2 style="color: #064e3b; margin-top: 0; font-size: 20px; font-weight: 700;">
                      Hello ${customerName || "Valued Customer"},
                    </h2>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 25px;">
                      Great news! Your waste collection request has been officially <strong>Booked</strong> by our operations team. Below are your order details and customer portal login credentials.
                    </p>

                    <!-- ORDER CONFIRMATION BOX -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #16a34a; border-radius: 10px; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0; font-size: 13px; color: #166534; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                            Order Reference ID
                          </p>
                          <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 800; color: #15803d;">
                            #${orderId}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CREDENTIALS BOX -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 25px; overflow: hidden;">
                      <tr>
                        <td style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">
                            🔑 Your Storefront Login Credentials
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">Email Address</span>
                                <span style="font-size: 15px; color: #0f172a; font-weight: 700;">${toEmail}</span>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 6px;">Temporary Password</span>
                                <div style="display: inline-block; background-color: #064e3b; color: #ecfdf5; font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 800; padding: 10px 18px; border-radius: 8px; letter-spacing: 2px; border: 1px solid #047857;">
                                  ${plainPassword || "Use your configured account password"}
                                </div>
                              </td>
                            </tr>
                          </table>
                          <p style="margin: 15px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">
                            * Please use this email and password to log in to your customer dashboard.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CALL TO ACTION BUTTON -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0 20px 0;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: 700; border-radius: 10px; display: inline-block; box-shadow: 0 4px 14px rgba(132, 204, 22, 0.35);">
                            Log In to Customer Portal →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 13px; color: #64748b; margin-top: 25px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                      If you need assistance or have questions regarding your booking, please reach out to our dedicated support team at <a href="mailto:${fromEmail}" style="color: #059669; text-decoration: underline;">${fromEmail}</a>.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Ecosphere Waste Solutions. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Ecosphere Waste Solutions" <${fromEmail}>`,
      to: toEmail,
      subject,
      html: htmlContent
    });

    console.log(`Customer credentials email sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("sendCustomerCredentialsEmail error:", err);
    return false;
  }
};

/**
 * Send password reset verification OTP email to customer
 */
const sendResetOTPEmail = async ({ toEmail, otp, customerName }) => {
  if (!toEmail) return false;

  try {
    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL || "solutions@hommlie.com";
    const subject = `Ecosphere Password Reset Verification OTP`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Verification OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);">
                
                <!-- HEADER BANNER -->
                <tr>
                  <td style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 35px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">
                      Ecosphere Waste Solutions
                    </h1>
                    <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 1.5px;">
                      Account Security Verification
                    </p>
                  </td>
                </tr>

                <!-- MAIN BODY CONTENT -->
                <tr>
                  <td style="padding: 35px 35px 25px 35px; color: #334155;">
                    <h2 style="color: #064e3b; margin-top: 0; font-size: 20px; font-weight: 700;">
                      Hello ${customerName || "Customer"},
                    </h2>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 25px;">
                      We received a request to reset the password for your Ecosphere customer portal account. Please use the verification OTP below to complete your password reset:
                    </p>

                    <!-- OTP HIGHLIGHT BOX -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 25px; text-align: center;">
                      <tr>
                        <td style="padding: 25px 20px;">
                          <p style="margin: 0; font-size: 13px; color: #166534; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px;">
                            Your 4-Digit Verification OTP
                          </p>
                          <div style="display: inline-block; background-color: #064e3b; color: #ecfdf5; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; padding: 12px 30px; border-radius: 10px; letter-spacing: 6px; border: 2px solid #047857;">
                            ${otp}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 13px; color: #64748b; margin-top: 20px; line-height: 1.5;">
                      * This OTP is valid for password reset. For security reasons, please do not share this OTP with anyone.
                    </p>
                    <p style="font-size: 13px; color: #64748b; margin-top: 10px; line-height: 1.5;">
                      If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Ecosphere Waste Solutions. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Ecosphere Waste Solutions" <${fromEmail}>`,
      to: toEmail,
      subject,
      html: htmlContent
    });

    console.log(`Password reset OTP email sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("sendResetOTPEmail error:", err);
    return false;
  }
};

module.exports = {
  generateProductionPassword,
  sendCustomerCredentialsEmail,
  sendResetOTPEmail
};
