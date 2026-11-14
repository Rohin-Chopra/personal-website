export const config = {
  adminEmail: process.env.ADMIN_EMAIL!,
  noReplyEmail: process.env.NO_REPLY_EMAIL!,
  notifyEmailTemplateName: process.env.NOTIFY_EMAIL_TEMPLATE_NAME!,
  sesConfigurationSetName: process.env.SES_CONFIGURATION_SET_NAME || undefined,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || undefined,
};
