import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { APIGatewayEvent } from "aws-lambda";
import { config } from "../config";
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

  it("only emails the site owner, with the sender as reply-to", async () => {
    config.adminEmail = "owner@example.com";
    const event = createMockEvent({
      name: "Test User",
      email: "test@example.com",
      message: "Test message",
    });

    await contactHandler(event);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const [[input]] = jest.mocked(SendEmailCommand).mock.calls;
    expect(input.Destination?.ToAddresses).toEqual(["owner@example.com"]);
    expect(input.ReplyToAddresses).toEqual(["test@example.com"]);
  });

  it("silently drops submissions that fill in the honeypot", async () => {
    const event = createMockEvent({
      name: "Bot",
      email: "bot@example.com",
      message: "Spam",
      website: "https://spam.example.com",
    });

    const result = await contactHandler(event);

    expect(result.statusCode).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
  });

  describe("with Turnstile enabled", () => {
    const fetchMock = jest.fn();
    const originalFetch = global.fetch;

    beforeEach(() => {
      config.turnstileSecretKey = "secret";
      fetchMock.mockReset();
      global.fetch = fetchMock as unknown as typeof fetch;
    });

    afterEach(() => {
      config.turnstileSecretKey = undefined;
      global.fetch = originalFetch;
    });

    it("rejects requests without a token", async () => {
      const result = await contactHandler(
        createMockEvent({
          name: "Test User",
          email: "test@example.com",
          message: "Test message",
        }),
      );

      expect(result.statusCode).toBe(403);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("rejects tokens that fail verification", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ success: false }),
      });

      const result = await contactHandler(
        createMockEvent({
          name: "Test User",
          email: "test@example.com",
          message: "Test message",
          turnstileToken: "bad-token",
        }),
      );

      expect(result.statusCode).toBe(403);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("sends the email when the token is valid", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await contactHandler(
        createMockEvent({
          name: "Test User",
          email: "test@example.com",
          message: "Test message",
          turnstileToken: "good-token",
        }),
      );

      expect(result.statusCode).toBe(200);
      const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
      expect(body.get("secret")).toBe("secret");
      expect(body.get("response")).toBe("good-token");
      expect(body.get("remoteip")).toBe("127.0.0.1");
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });
});
