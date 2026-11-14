import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { z } from "zod";
import { config } from "./config";

const sesClient = new SESv2Client({ region: "ap-southeast-2" });

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  message: z.string().min(1).max(5000).trim(),
  // Honeypot: hidden from people, so only bots fill it in.
  website: z.string().max(500).optional(),
  turnstileToken: z.string().max(2048).optional(),
});

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const verifyTurnstileToken = async (
  secret: string,
  token: string | undefined,
  remoteIp: string | undefined,
): Promise<boolean> => {
  if (!token) return false;

  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp) form.set("remoteip", remoteIp);

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return false;

  const result = (await res.json()) as { success?: boolean };
  return result.success === true;
};

// Sanitize input to prevent XSS
const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, "") // Remove < and > characters
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers like onclick=
};

const sendTemplatedEmail = async ({
  toAddress,
  replyToAddress,
  templateName,
  templateData,
}: {
  toAddress: string;
  replyToAddress?: string;
  templateName: string;
  templateData: Record<string, unknown>;
}): Promise<void> => {
  await sesClient.send(
    new SendEmailCommand({
      FromEmailAddress: config.noReplyEmail,
      Destination: {
        ToAddresses: [toAddress],
      },
      ReplyToAddresses: replyToAddress ? [replyToAddress] : undefined,
      ConfigurationSetName: config.sesConfigurationSetName,
      Content: {
        Template: {
          TemplateName: templateName,
          TemplateData: JSON.stringify(templateData),
        },
      },
    }),
  );
};

export const contactHandler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;
  const timestamp = new Date().toISOString();

  const log = (
    level: string,
    message: string,
    data?: Record<string, unknown>,
  ) => {
    const logEntry = {
      level,
      timestamp,
      requestId,
      message,
      ...data,
    };
    console.log(JSON.stringify(logEntry));
  };

  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://www.rohinchopra.com",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Parse and validate request body
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (parseError) {
      log("error", "Failed to parse request body", {
        error: String(parseError),
      });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Invalid request format" }),
      };
    }

    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      log("warn", "Validation failed", {
        errors: validationResult.error.issues,
      });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Invalid request",
          errors: validationResult.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        }),
      };
    }

    const { name, email, message, website, turnstileToken } =
      validationResult.data;

    // Pretend the honeypot submission worked so bots don't adapt.
    if (website) {
      log("warn", "Honeypot field filled, dropping submission");
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Message sent" }),
      };
    }

    if (config.turnstileSecretKey) {
      const isHuman = await verifyTurnstileToken(
        config.turnstileSecretKey,
        turnstileToken,
        event.requestContext.identity?.sourceIp,
      );
      if (!isHuman) {
        log("warn", "Turnstile verification failed");
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Bot verification failed, please try again",
          }),
        };
      }
    }

    const sanitizedName = sanitizeString(name);
    const sanitizedMessage = sanitizeString(message);

    log("info", "Processing contact form submission", {
      email: email.substring(0, 3) + "***", // Partial email for logging
    });

    // Only ever email the site owner. Sending anything to the caller-supplied
    // address would let anyone use this API to email arbitrary people.
    await sendTemplatedEmail({
      toAddress: config.adminEmail,
      replyToAddress: email,
      templateName: config.notifyEmailTemplateName,
      templateData: {
        NAME: sanitizedName,
        EMAIL: email,
        MESSAGE: sanitizedMessage,
      },
    });

    log("info", "Contact form submission successful");

    return {
      headers: corsHeaders,
      statusCode: 200,
      body: JSON.stringify({
        message: "Message sent",
      }),
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    log("error", "Contact handler error", {
      error: errorMessage,
      stack: errorStack,
    });

    // Don't expose internal errors to users
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
