import { Resend } from "resend";

let resendApiKey: string;

// Environment-specific API key selection
if (process.env.NODE_ENV === "development") {
  resendApiKey = process.env.RESEND_API_KEY_TEST || process.env.RESEND_API_KEY!;
} else {
  resendApiKey = process.env.RESEND_API_KEY!;
}

// Validate API key presence
if (!resendApiKey) {
  throw new Error(
    `Missing RESEND_API_KEY environment variable for ${process.env.NODE_ENV} environment`
  );
}

// Validate API key format
if (!resendApiKey.startsWith("re_")) {
  console.warn(
    '⚠️ Resend API key format appears invalid (should start with "re_")'
  );
}

const resend = new Resend(resendApiKey);

// Enhanced email sending function with logging and error handling
export const sendEmail = async (emailData: {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  reply_to?: string;
}) => {
  try {
    // Use environment-specific from email if not provided
    const fromEmail =
      emailData.from || process.env.RESEND_FROM_EMAIL || "noreply@videatly.ai";

    // Add reply-to if configured
    const replyTo = emailData.reply_to || process.env.RESEND_REPLY_TO;

    const emailPayload = {
      ...emailData,
      from: fromEmail,
      ...(replyTo && { reply_to: replyTo }),
    };

    console.log(
      `[EMAIL] Sending email to: ${Array.isArray(emailData.to) ? emailData.to.join(", ") : emailData.to}`
    );
    console.log(`[EMAIL] Subject: ${emailData.subject}`);

    const result = await resend.emails.send({
      ...emailPayload,
      text: emailPayload.text || "",
    });

    if (result.error) {
      console.error(`[EMAIL] Failed to send email:`, result.error);
      throw new Error(`Email sending failed: ${result.error.message}`);
    }

    console.log(`[EMAIL] Email sent successfully. ID: ${result.data?.id}`);
    return result;
  } catch (error) {
    console.error(`[EMAIL] Error sending email:`, error);

    // Re-throw with more context for debugging
    if (error instanceof Error) {
      throw new Error(`Resend email delivery failed: ${error.message}`);
    }

    throw new Error("Unknown error occurred during email sending");
  }
};

// Utility function to verify Resend configuration
export const verifyResendConfig = async (): Promise<boolean> => {
  try {
    console.log("🔍 Verifying Resend configuration...");

    // Test API key by attempting to get domains (this doesn't send an email)
    const domains = await resend.domains.list();

    if (domains.error) {
      console.error("❌ Resend configuration invalid:", domains.error);
      return false;
    }

    console.log("✅ Resend configuration verified successfully");
    console.log(`📧 Available domains: ${domains.data?.data?.length || 0}`);

    return true;
  } catch (error) {
    console.error("❌ Resend configuration verification failed:", error);
    return false;
  }
};

export default resend;
