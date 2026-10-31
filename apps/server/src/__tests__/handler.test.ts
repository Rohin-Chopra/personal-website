import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { APIGatewayEvent } from "aws-lambda";
import { contactHandler } from "../handler";

const mockSend = jest.fn();

// The SES client is created when the handler module loads, so `send` must
// defer to `mockSend` lazily to let individual tests control its behaviour.
jest.mock("@aws-sdk/client-sesv2", () => ({
  SESv2Client: jest.fn().mockImplementation(() => ({
    send: (...args: unknown[]) => mockSend(...args),
  })),
  SendEmailCommand: jest.fn(),
}));

describe("contactHandler", () => {
  const createMockEvent = (body: unknown): APIGatewayEvent => ({
    body: JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/contact",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      requestId: "test-request-id",
      accountId: "test-account",
      apiId: "test-api",
      authorizer: {},
      protocol: "HTTP/1.1",
      httpMethod: "POST",
      path: "/contact",
      stage: "test",
      requestTime: "09/Dec/2024:00:00:00 +0000",
      requestTimeEpoch: 1234567890,
      resourceId: "test-resource",
      resourcePath: "/contact",
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: "127.0.0.1",
        user: null,
        userAgent: "test-agent",
        userArn: null,
      },
    },
    resource: "/contact",
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockReset().mockResolvedValue({});
  });

  it("should return 200 for valid request", async () => {
    const event = createMockEvent({
      name: "Test User",
      email: "test@example.com",
      message: "Test message",
    });

    const result = await contactHandler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "Message sent" });
    expect(result.headers).toHaveProperty("Access-Control-Allow-Origin");
  });

  it("should return 400 for invalid email", async () => {
    const event = createMockEvent({
      name: "Test User",
      email: "invalid-email",
      message: "Test message",
    });

    const result = await contactHandler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Invalid request");
    expect(body.errors).toBeDefined();
  });

  it("should return 400 for missing fields", async () => {
    const event = createMockEvent({
      name: "",
      email: "test@example.com",
      message: "Test message",
    });

    const result = await contactHandler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Invalid request");
  });

  it("should return 400 for invalid JSON", async () => {
    const event = createMockEvent(null);
    event.body = "invalid json";

    const result = await contactHandler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Invalid request format");
  });

  it("should sanitize input to prevent XSS", async () => {
    const event = createMockEvent({
      name: "<script>alert('xss')</script>",
      email: "test@example.com",
      message: "javascript:alert('xss')",
    });

    const result = await contactHandler(event);

    expect(result.statusCode).toBe(200);
    const templateData = jest
      .mocked(SendEmailCommand)
      .mock.calls.map(([input]) => input.Content?.Template?.TemplateData)
      .join("\n");
    expect(templateData).not.toContain("<script>");
    expect(templateData).not.toContain("javascript:");
  });

  it("should handle errors gracefully", async () => {
    mockSend.mockRejectedValueOnce(new Error("SES error"));

    const event = createMockEvent({
      name: "Test User",
      email: "test@example.com",
      message: "Test message",
    });

    const result = await contactHandler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Internal Server Error");
    // Should not expose internal error details
    expect(body.error).toBeUndefined();
  });
});
