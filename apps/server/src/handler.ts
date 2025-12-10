import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { z } from "zod";
import { config } from "./config";

const sesClient = new SESv2Client({ region: "ap-southeast-2" });

const schema = z
  .object({
    name: z.string().min(1).max(100).trim(),
    email: z.string().email().max(255).trim().toLowerCase(),
    message: z.string().min(1).max(5000).trim(),
  })
  .required();

// Sanitize input to prevent XSS
const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, "") // Remove < and > characters
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers like onclick=
};

const sendTemplatedEmail = async (
  toAddress: string,
  templateName: string,
  templateData: Record<string, unknown>
): Promise<void> => {
  await sesClient.send(
    new SendEmailCommand({
      FromEmailAddress: config.noReplyEmail,
      Destination: {
        ToAddresses: [toAddress],
      },
      Content: {
        Template: {
          TemplateName: templateName,
          TemplateData: JSON.stringify(templateData),
        },
      },
    })
  );
};

export const contactHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;
  const timestamp = new Date().toISOString();

  const log = (level: string, message: string, data?: Record<string, unknown>) => {
    const logEntry = {
      level,
      timestamp,
      requestId,
      message,
      ...data,
    };
    console.log(JSON.stringify(logEntry));
  };

  // Handle rate limiting (API Gateway returns 429, but we should handle it gracefully)
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
      log("error", "Failed to parse request body", { error: String(parseError) });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Invalid request format" }),
      };
    }

    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      log("warn", "Validation failed", { errors: validationResult.error.errors });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: "Invalid request",
          errors: validationResult.error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message,
          })),
        }),
      };
    }

    // Sanitize inputs
    const { name, email, message } = validationResult.data;
    const sanitizedName = sanitizeString(name);
    const sanitizedMessage = sanitizeString(message);

    log("info", "Processing contact form submission", { 
      email: email.substring(0, 3) + "***", // Partial email for logging
    });

    // Send email to myself about the message the user sent
    await sendTemplatedEmail(
      config.adminEmail,
      config.notifyEmailTemplateName,
      {
        NAME: sanitizedName,
        EMAIL: email,
        MESSAGE: sanitizedMessage,
      }
    );

    // Send email to the user confirming that I have received their email
    await sendTemplatedEmail(email, config.replyEmailTemplateName, {
      NAME: sanitizedName,
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
