import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { contentSecurityPolicy } from "../../apps/web/security.ts";

type WebArgs = {
  /** Apex domain, e.g. rohinchopra.com. The canonical host is www.<apex>. */
  domain: string;
  zoneId: pulumi.Input<string>;
  usEast1: aws.Provider;
  /** Origins the contact form may call (connect-src). */
  apiOrigin: string;
};

/**
 * Static site: a private S3 bucket behind CloudFront (Origin Access Control),
 * with clean URLs, an apex -> www redirect and security headers.
 */
export const createWeb = ({ domain, zoneId, usEast1, apiOrigin }: WebArgs) => {
  const wwwDomain = `www.${domain}`;

  const bucket = new aws.s3.Bucket("site", {
    bucketPrefix: "personal-website-site-",
    forceDestroy: false,
  });

  new aws.s3.BucketOwnershipControls("site", {
    bucket: bucket.id,
    rule: { objectOwnership: "BucketOwnerEnforced" },
  });

  new aws.s3.BucketPublicAccessBlock("site", {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  });

  new aws.s3.BucketServerSideEncryptionConfiguration("site", {
    bucket: bucket.id,
    rules: [
      { applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" } },
    ],
  });

  new aws.s3.BucketVersioning("site", {
    bucket: bucket.id,
    versioningConfiguration: { status: "Enabled" },
  });

  new aws.s3.BucketLifecycleConfiguration("site", {
    bucket: bucket.id,
    rules: [
      {
        id: "expire-old-versions",
        status: "Enabled",
        filter: {},
        noncurrentVersionExpiration: { noncurrentDays: 30 },
      },
    ],
  });

  // --- Certificate (CloudFront needs it in us-east-1) ----------------------

  const certificate = new aws.acm.Certificate(
    "site",
    {
      domainName: domain,
      subjectAlternativeNames: [wwwDomain],
      validationMethod: "DNS",
    },
    { provider: usEast1 },
  );

  const validationRecords = [domain, wwwDomain].map((name, index) => {
    const option = certificate.domainValidationOptions.apply(
      (options) => options.find((o) => o.domainName === name)!,
    );
    return new aws.route53.Record(`site-cert-validation-${index}`, {
      zoneId,
      name: option.resourceRecordName,
      type: option.resourceRecordType,
      records: [option.resourceRecordValue],
      ttl: 60,
      allowOverwrite: true,
    });
  });

  const validation = new aws.acm.CertificateValidation(
    "site",
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: validationRecords.map((r) => r.fqdn),
    },
    { provider: usEast1 },
  );

  // --- Edge logic ----------------------------------------------------------

  // Viewer-request: redirect the apex to www and map clean URLs onto the
  // prerendered `<path>/index.html` objects.
  const router = new aws.cloudfront.Function("site-router", {
    name: "personal-website-router",
    runtime: "cloudfront-js-2.0",
    publish: true,
    comment: "apex -> www redirect and clean URLs",
    code: `
function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : "";

  if (host === "${domain}") {
    var qs = Object.keys(request.querystring).map(function (key) {
      var param = request.querystring[key];
      return param.multiValue
        ? param.multiValue.map(function (v) { return key + "=" + v.value; }).join("&")
        : key + "=" + param.value;
    }).join("&");
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: "https://${wwwDomain}" + request.uri + (qs ? "?" + qs : "") },
        "strict-transport-security": { value: "max-age=63072000; includeSubDomains; preload" },
      },
    };
  }

  var uri = request.uri;
  if (uri.length > 1 && uri.endsWith("/")) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: uri.slice(0, -1) } },
    };
  }
  if (uri === "/") {
    request.uri = "/index.html";
  } else if (uri.lastIndexOf(".") < uri.lastIndexOf("/")) {
    request.uri = uri + "/index.html";
  }
  return request;
}
`,
  });

  const csp = contentSecurityPolicy(apiOrigin);

  const headers = new aws.cloudfront.ResponseHeadersPolicy("site", {
    name: "personal-website-security-headers",
    securityHeadersConfig: {
      contentSecurityPolicy: { contentSecurityPolicy: csp, override: true },
      strictTransportSecurity: {
        accessControlMaxAgeSec: 63072000,
        includeSubdomains: true,
        preload: true,
        override: true,
      },
      contentTypeOptions: { override: true },
      frameOptions: { frameOption: "DENY", override: true },
      referrerPolicy: {
        referrerPolicy: "strict-origin-when-cross-origin",
        override: true,
      },
    },
    customHeadersConfig: {
      items: [
        {
          header: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          override: true,
        },
        {
          header: "Cross-Origin-Opener-Policy",
          value: "same-origin",
          override: true,
        },
      ],
    },
  });

  const oac = new aws.cloudfront.OriginAccessControl("site", {
    name: "personal-website-site",
    originAccessControlOriginType: "s3",
    signingBehavior: "always",
    signingProtocol: "sigv4",
  });

  // Managed policies: CachingOptimized honours the Cache-Control the deploy
  // sets on each object (immutable assets, revalidated HTML).
  const cachingOptimized = "658327ea-f89d-4fab-a63d-7e88639e58f6";

  const distribution = new aws.cloudfront.Distribution("site", {
    enabled: true,
    comment: "rohinchopra.com",
    aliases: [domain, wwwDomain],
    defaultRootObject: "index.html",
    httpVersion: "http2and3",
    isIpv6Enabled: true,
    // PriceClass_100 excludes Australia, where most visitors are.
    priceClass: "PriceClass_All",
    origins: [
      {
        originId: "site",
        domainName: bucket.bucketRegionalDomainName,
        originAccessControlId: oac.id,
        s3OriginConfig: { originAccessIdentity: "" },
      },
    ],
    defaultCacheBehavior: {
      targetOriginId: "site",
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      cachePolicyId: cachingOptimized,
      responseHeadersPolicyId: headers.id,
      functionAssociations: [
        { eventType: "viewer-request", functionArn: router.arn },
      ],
    },
    // Without s3:ListBucket, S3 answers 403 for missing keys.
    customErrorResponses: [403, 404].map((errorCode) => ({
      errorCode,
      responseCode: 404,
      responsePagePath: "/404.html",
      errorCachingMinTtl: 60,
    })),
    restrictions: { geoRestriction: { restrictionType: "none" } },
    viewerCertificate: {
      acmCertificateArn: validation.certificateArn,
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021",
    },
  });

  new aws.s3.BucketPolicy("site", {
    bucket: bucket.id,
    policy: aws.iam.getPolicyDocumentOutput({
      statements: [
        {
          sid: "AllowCloudFront",
          actions: ["s3:GetObject"],
          resources: [pulumi.interpolate`${bucket.arn}/*`],
          principals: [
            { type: "Service", identifiers: ["cloudfront.amazonaws.com"] },
          ],
          conditions: [
            {
              test: "StringEquals",
              variable: "AWS:SourceArn",
              values: [distribution.arn],
            },
          ],
        },
        {
          sid: "DenyInsecureTransport",
          effect: "Deny",
          actions: ["s3:*"],
          resources: [bucket.arn, pulumi.interpolate`${bucket.arn}/*`],
          principals: [{ type: "*", identifiers: ["*"] }],
          conditions: [
            {
              test: "Bool",
              variable: "aws:SecureTransport",
              values: ["false"],
            },
          ],
        },
      ],
    }).json,
  });

  // --- DNS -----------------------------------------------------------------
  // allowOverwrite UPSERTs over the records that pointed at the previous host.

  const alias = {
    name: distribution.domainName,
    zoneId: distribution.hostedZoneId,
    evaluateTargetHealth: false,
  };

  for (const type of ["A", "AAAA"]) {
    new aws.route53.Record(`site-apex-${type.toLowerCase()}`, {
      zoneId,
      name: domain,
      type,
      aliases: [alias],
      allowOverwrite: true,
    });
  }

  new aws.route53.Record("site-www", {
    zoneId,
    name: wwwDomain,
    type: "CNAME",
    records: [distribution.domainName],
    ttl: 300,
    allowOverwrite: true,
  });

  return { bucket, distribution };
};
