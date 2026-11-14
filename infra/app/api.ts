import { readFileSync } from "node:fs";

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

type ApiArgs = {
  domain: string;
  zoneId: pulumi.Input<string>;
  allowedOrigin: string;
  adminEmail: pulumi.Input<string>;
  noReplyEmail: string;
  alarmEmail: pulumi.Input<string>;
  turnstileSecretKey?: pulumi.Input<string>;
  lambdaBinaryPath: string;
  wafRateLimitPer5Minutes: number;
  logRetentionDays: number;
};

const name = "personal-website-contact";

/**
 * Contact API: REST API Gateway (API key + WAF rate limit) -> Go Lambda -> SES.
 */
export const createApi = (args: ApiArgs) => {
  const stage = "production";

  // --- Lambda ---------------------------------------------------------------

  const logGroup = new aws.cloudwatch.LogGroup("contact", {
    name: `/aws/lambda/${name}`,
    retentionInDays: args.logRetentionDays,
  });

  const role = new aws.iam.Role("contact", {
    name: `${name}-lambda`,
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "lambda.amazonaws.com",
    }),
  });

  const template = new aws.ses.Template("contact-notify", {
    name: `${name}-notify`,
    subject: "A contact form submission was made",
    html: readFileSync(
      new URL("./templates/contact-notify-email.html", import.meta.url),
      "utf8",
    ),
  });

  const alerts = new aws.sns.Topic("alerts", { name: `${name}-alerts` });

  const configurationSet = new aws.sesv2.ConfigurationSet("contact", {
    configurationSetName: name,
    reputationOptions: { reputationMetricsEnabled: true },
  });

  new aws.sesv2.ConfigurationSetEventDestination("contact-bounces", {
    configurationSetName: configurationSet.configurationSetName,
    eventDestinationName: "bounces-and-complaints",
    eventDestination: {
      enabled: true,
      matchingEventTypes: ["BOUNCE", "COMPLAINT", "REJECT"],
      snsDestination: { topicArn: alerts.arn },
    },
  });

  const account = aws.getCallerIdentityOutput();
  const region = aws.getRegionOutput();

  new aws.iam.RolePolicy("contact", {
    role: role.id,
    policy: aws.iam.getPolicyDocumentOutput({
      statements: [
        {
          actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
          resources: [pulumi.interpolate`${logGroup.arn}:*`],
        },
        {
          actions: ["ses:SendEmail", "ses:SendTemplatedEmail"],
          resources: [
            pulumi.interpolate`arn:aws:ses:${region.region}:${account.accountId}:identity/*`,
            pulumi.interpolate`arn:aws:ses:${region.region}:${account.accountId}:template/${template.name}`,
            configurationSet.arn,
          ],
        },
      ],
    }).json,
  });

  const fn = new aws.lambda.Function(
    "contact",
    {
      name,
      runtime: "provided.al2023",
      architectures: ["arm64"],
      handler: "bootstrap",
      code: new pulumi.asset.AssetArchive({
        bootstrap: new pulumi.asset.FileAsset(args.lambdaBinaryPath),
      }),
      role: role.arn,
      memorySize: 128,
      // Turnstile verification alone may take up to 5s.
      timeout: 10,
      loggingConfig: { logFormat: "JSON", logGroup: logGroup.name },
      environment: {
        variables: {
          ADMIN_EMAIL: args.adminEmail,
          NO_REPLY_EMAIL: args.noReplyEmail,
          NOTIFY_EMAIL_TEMPLATE_NAME: template.name,
          SES_CONFIGURATION_SET_NAME: configurationSet.configurationSetName,
          ALLOWED_ORIGIN: args.allowedOrigin,
          TURNSTILE_SECRET_KEY: args.turnstileSecretKey ?? "",
        },
      },
    },
    { dependsOn: [logGroup] },
  );

  // --- API Gateway ----------------------------------------------------------

  const api = new aws.apigateway.RestApi("contact", {
    name,
    apiKeySource: "HEADER",
    endpointConfiguration: { types: "REGIONAL" },
  });

  const resource = new aws.apigateway.Resource("contact", {
    restApi: api.id,
    parentId: api.rootResourceId,
    pathPart: "contact",
  });

  const post = new aws.apigateway.Method("contact-post", {
    restApi: api.id,
    resourceId: resource.id,
    httpMethod: "POST",
    authorization: "NONE",
    apiKeyRequired: true,
  });

  const postIntegration = new aws.apigateway.Integration("contact-post", {
    restApi: api.id,
    resourceId: resource.id,
    httpMethod: post.httpMethod,
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: fn.invokeArn,
  });

  // CORS preflight is answered by API Gateway without invoking the Lambda.
  const options = new aws.apigateway.Method("contact-options", {
    restApi: api.id,
    resourceId: resource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
  });

  const optionsIntegration = new aws.apigateway.Integration("contact-options", {
    restApi: api.id,
    resourceId: resource.id,
    httpMethod: options.httpMethod,
    type: "MOCK",
    requestTemplates: { "application/json": '{ "statusCode": 200 }' },
  });

  const corsHeaders = {
    "method.response.header.Access-Control-Allow-Headers":
      "'Content-Type,X-Api-Key'",
    "method.response.header.Access-Control-Allow-Methods": "'POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin": `'${args.allowedOrigin}'`,
    "method.response.header.Access-Control-Max-Age": "'600'",
  };

  const optionsResponse = new aws.apigateway.MethodResponse("contact-options", {
    restApi: api.id,
    resourceId: resource.id,
    httpMethod: options.httpMethod,
    statusCode: "200",
    responseModels: { "application/json": "Empty" },
    responseParameters: Object.fromEntries(
      Object.keys(corsHeaders).map((key) => [key, true]),
    ),
  });

  const optionsIntegrationResponse = new aws.apigateway.IntegrationResponse(
    "contact-options",
    {
      restApi: api.id,
      resourceId: resource.id,
      httpMethod: options.httpMethod,
      statusCode: optionsResponse.statusCode,
      responseParameters: corsHeaders,
    },
    { dependsOn: [optionsIntegration] },
  );

  // Gateway errors (missing API key, throttling, WAF) also need CORS headers
  // or the browser hides the status from the form.
  for (const responseType of ["DEFAULT_4XX", "DEFAULT_5XX"]) {
    new aws.apigateway.Response(`contact-${responseType.toLowerCase()}`, {
      restApiId: api.id,
      responseType,
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": `'${args.allowedOrigin}'`,
        "gatewayresponse.header.Access-Control-Allow-Headers":
          "'Content-Type,X-Api-Key'",
      },
    });
  }

  new aws.lambda.Permission("contact-apigateway", {
    function: fn.name,
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*/POST/contact`,
  });

  const deployment = new aws.apigateway.Deployment(
    "contact",
    {
      restApi: api.id,
      // A deployment is an immutable snapshot; redeploy when the API changes.
      triggers: {
        redeployment: pulumi
          .all([
            resource.id,
            post.id,
            post.apiKeyRequired,
            postIntegration.uri,
            options.id,
            optionsIntegration.id,
            optionsIntegrationResponse.responseParameters,
          ])
          .apply((parts) => JSON.stringify(parts)),
      },
    },
    {
      dependsOn: [
        postIntegration,
        optionsIntegration,
        optionsIntegrationResponse,
      ],
      replaceOnChanges: ["triggers"],
      deleteBeforeReplace: false,
    },
  );

  const apiStage = new aws.apigateway.Stage("contact", {
    restApi: api.id,
    deployment: deployment.id,
    stageName: stage,
  });

  new aws.apigateway.MethodSettings("contact", {
    restApi: api.id,
    stageName: apiStage.stageName,
    methodPath: "*/*",
    settings: {
      throttlingRateLimit: 1,
      throttlingBurstLimit: 5,
      metricsEnabled: true,
    },
  });

  // The API key ships in client JS and is shared by every visitor, so keep the
  // throttle low; per-IP limits are enforced by the WAF rate-based rule.
  const usagePlan = new aws.apigateway.UsagePlan("contact", {
    name,
    apiStages: [{ apiId: api.id, stage: apiStage.stageName }],
    throttleSettings: { rateLimit: 1, burstLimit: 5 },
    quotaSettings: { limit: 1000, period: "DAY" },
  });

  const apiKey = new aws.apigateway.ApiKey("contact", { name });

  new aws.apigateway.UsagePlanKey("contact", {
    keyId: apiKey.id,
    keyType: "API_KEY",
    usagePlanId: usagePlan.id,
  });

  const waf = new aws.wafv2.WebAcl("contact", {
    name,
    scope: "REGIONAL",
    defaultAction: { allow: {} },
    rules: [
      {
        name: "rate-limit-per-ip",
        priority: 1,
        action: { block: {} },
        statement: {
          rateBasedStatement: {
            limit: args.wafRateLimitPer5Minutes,
            evaluationWindowSec: 300,
            aggregateKeyType: "IP",
          },
        },
        visibilityConfig: {
          cloudwatchMetricsEnabled: true,
          metricName: `${name}-rate-limit-per-ip`,
          sampledRequestsEnabled: true,
        },
      },
    ],
    visibilityConfig: {
      cloudwatchMetricsEnabled: true,
      metricName: name,
      sampledRequestsEnabled: true,
    },
  });

  new aws.wafv2.WebAclAssociation("contact", {
    resourceArn: apiStage.arn,
    webAclArn: waf.arn,
  });

  // --- Custom domain -------------------------------------------------------

  const certificate = new aws.acm.Certificate("api", {
    domainName: args.domain,
    validationMethod: "DNS",
  });

  const option = certificate.domainValidationOptions[0];
  const validationRecord = new aws.route53.Record("api-cert-validation", {
    zoneId: args.zoneId,
    name: option.resourceRecordName,
    type: option.resourceRecordType,
    records: [option.resourceRecordValue],
    ttl: 60,
    allowOverwrite: true,
  });

  const validation = new aws.acm.CertificateValidation("api", {
    certificateArn: certificate.arn,
    validationRecordFqdns: [validationRecord.fqdn],
  });

  const domainName = new aws.apigateway.DomainName("api", {
    domainName: args.domain,
    regionalCertificateArn: validation.certificateArn,
    endpointConfiguration: { types: "REGIONAL" },
    securityPolicy: "TLS_1_2",
  });

  new aws.apigateway.BasePathMapping("api", {
    restApi: api.id,
    stageName: apiStage.stageName,
    domainName: domainName.domainName,
  });

  new aws.route53.Record("api", {
    zoneId: args.zoneId,
    name: args.domain,
    type: "A",
    aliases: [
      {
        name: domainName.regionalDomainName,
        zoneId: domainName.regionalZoneId,
        evaluateTargetHealth: false,
      },
    ],
    allowOverwrite: true,
  });

  // --- Alarms ----------------------------------------------------------------

  new aws.sns.TopicPolicy("alerts", {
    arn: alerts.arn,
    policy: aws.iam.getPolicyDocumentOutput({
      statements: [
        {
          actions: ["sns:Publish"],
          principals: [
            {
              type: "Service",
              identifiers: ["cloudwatch.amazonaws.com", "ses.amazonaws.com"],
            },
          ],
          resources: [alerts.arn],
          conditions: [
            {
              test: "StringEquals",
              variable: "aws:SourceAccount",
              values: [account.accountId],
            },
          ],
        },
      ],
    }).json,
  });

  new aws.sns.TopicSubscription("alerts-email", {
    topic: alerts.arn,
    protocol: "email",
    endpoint: args.alarmEmail,
  });

  const alarms: Record<
    string,
    {
      description: string;
      namespace: string;
      metricName: string;
      dimensions: pulumi.Input<Record<string, pulumi.Input<string>>>;
      statistic: string;
      period: number;
      threshold: number;
    }
  > = {
    "lambda-errors": {
      description: "The contact Lambda threw errors",
      namespace: "AWS/Lambda",
      metricName: "Errors",
      dimensions: { FunctionName: fn.name },
      statistic: "Sum",
      period: 300,
      threshold: 0,
    },
    "lambda-throttles": {
      description: "The contact Lambda was throttled",
      namespace: "AWS/Lambda",
      metricName: "Throttles",
      dimensions: { FunctionName: fn.name },
      statistic: "Sum",
      period: 300,
      threshold: 0,
    },
    "api-5xx": {
      description: "The contact API returned 5XX responses",
      namespace: "AWS/ApiGateway",
      metricName: "5XXError",
      dimensions: { ApiName: api.name, Stage: apiStage.stageName },
      statistic: "Sum",
      period: 300,
      threshold: 0,
    },
    "api-4xx-spike": {
      description:
        "Spike in contact API 4XX responses (spam, throttling or quota exhaustion)",
      namespace: "AWS/ApiGateway",
      metricName: "4XXError",
      dimensions: { ApiName: api.name, Stage: apiStage.stageName },
      statistic: "Sum",
      period: 3600,
      threshold: 50,
    },
    "ses-bounce-rate": {
      description: "SES bounce rate is above 5% (AWS reviews accounts at 5%)",
      namespace: "AWS/SES",
      metricName: "Reputation.BounceRate",
      dimensions: {},
      statistic: "Maximum",
      period: 3600,
      threshold: 0.05,
    },
    "ses-complaint-rate": {
      description:
        "SES complaint rate is above 0.1% (AWS reviews accounts at 0.1%)",
      namespace: "AWS/SES",
      metricName: "Reputation.ComplaintRate",
      dimensions: {},
      statistic: "Maximum",
      period: 3600,
      threshold: 0.001,
    },
  };

  for (const [key, alarm] of Object.entries(alarms)) {
    new aws.cloudwatch.MetricAlarm(`contact-${key}`, {
      name: `${name}-${key}`,
      alarmDescription: alarm.description,
      namespace: alarm.namespace,
      metricName: alarm.metricName,
      dimensions: alarm.dimensions,
      statistic: alarm.statistic,
      period: alarm.period,
      evaluationPeriods: 1,
      threshold: alarm.threshold,
      comparisonOperator: "GreaterThanThreshold",
      treatMissingData: "notBreaching",
      alarmActions: [alerts.arn],
      okActions: [alerts.arn],
    });
  }

  return {
    url: `https://${args.domain}`,
    apiKey: pulumi.secret(apiKey.value),
  };
};
