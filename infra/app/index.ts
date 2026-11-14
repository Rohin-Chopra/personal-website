import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { createApi } from "./api.ts";
import { createWeb } from "./web.ts";

const config = new pulumi.Config();

const domain = config.get("domain") ?? "rohinchopra.com";
const apiDomain = `api.${domain}`;
const siteOrigin = `https://www.${domain}`;

const zone = aws.route53.getZoneOutput({ name: domain, privateZone: false });

const usEast1 = new aws.Provider("us-east-1", {
  region: "us-east-1",
  defaultTags: { tags: { Project: "personal-website", ManagedBy: "pulumi" } },
});

const web = createWeb({
  domain,
  zoneId: zone.zoneId,
  usEast1,
  apiOrigin: `https://${apiDomain}`,
});

// Off until the old Terraform-managed API (which owns api.<domain>) is removed.
const api = config.getBoolean("contactApiEnabled")
  ? createApi({
      domain: apiDomain,
      zoneId: zone.zoneId,
      allowedOrigin: siteOrigin,
      adminEmail: config.requireSecret("adminEmail"),
      noReplyEmail: config.get("noReplyEmail") ?? `no-reply@${domain}`,
      alarmEmail:
        config.getSecret("alarmEmail") ?? config.requireSecret("adminEmail"),
      turnstileSecretKey: config.getSecret("turnstileSecretKey"),
      lambdaBinaryPath: new URL(
        "../../apps/api/dist/bootstrap",
        import.meta.url,
      ).pathname,
      wafRateLimitPer5Minutes:
        config.getNumber("wafRateLimitPer5Minutes") ?? 20,
      logRetentionDays: config.getNumber("logRetentionDays") ?? 30,
    })
  : undefined;

export const siteUrl = siteOrigin;
export const siteBucket = web.bucket.bucket;
export const distributionId = web.distribution.id;
export const distributionDomain = web.distribution.domainName;
export const apiUrl = api?.url ?? `https://${apiDomain}`;
export const apiKey = api?.apiKey ?? pulumi.secret("");
