// IAM roles GitHub Actions assumes through OIDC. Applied by hand
// (`pulumi up -s main` in infra/github); the `app` stack is deployed by CI.
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const repository = config.get("repository") ?? "Rohin-Chopra/personal-website";

const account = aws.getCallerIdentityOutput();
const region = aws.getRegionOutput();

const stateBucket = pulumi.interpolate`personal-website-pulumi-state-${account.accountId}`;
const secretsKey = aws.kms.getAliasOutput({ name: "alias/personal-website-pulumi" });

// The account already has the GitHub OIDC provider (shared with other repos).
const github = aws.iam.getOpenIdConnectProviderOutput({
  url: "https://token.actions.githubusercontent.com",
});

const trustPolicy = (subjects: string[]) =>
  aws.iam.getPolicyDocumentOutput({
    statements: [
      {
        actions: ["sts:AssumeRoleWithWebIdentity"],
        principals: [{ type: "Federated", identifiers: [github.arn] }],
        conditions: [
          {
            test: "StringEquals",
            variable: "token.actions.githubusercontent.com:aud",
            values: ["sts.amazonaws.com"],
          },
          {
            test: "StringLike",
            variable: "token.actions.githubusercontent.com:sub",
            values: subjects,
          },
        ],
      },
    ],
  }).json;

const stateAccess = (write: boolean) =>
  aws.iam.getPolicyDocumentOutput({
    statements: [
      {
        actions: ["s3:ListBucket", "s3:GetBucketLocation"],
        resources: [pulumi.interpolate`arn:aws:s3:::${stateBucket}`],
      },
      {
        // Previews still take a lock, so both roles can write lock files.
        actions: write
          ? ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
          : ["s3:GetObject"],
        resources: [pulumi.interpolate`arn:aws:s3:::${stateBucket}/.pulumi/*`],
      },
      ...(write
        ? []
        : [
            {
              actions: ["s3:PutObject", "s3:DeleteObject"],
              resources: [
                pulumi.interpolate`arn:aws:s3:::${stateBucket}/.pulumi/locks/*`,
              ],
            },
          ]),
      {
        actions: write
          ? ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"]
          : ["kms:Decrypt"],
        resources: [secretsKey.targetKeyArn],
      },
    ],
  }).json;

// --- Deploy role: `pulumi up` on main, from the protected environment ------

const deploy = new aws.iam.Role("personal-website-github-deploy", {
  name: "personal-website-github-deploy",
  assumeRolePolicy: trustPolicy([`repo:${repository}:environment:production`]),
  maxSessionDuration: 3600,
});

new aws.iam.RolePolicy("personal-website-github-deploy-state", {
  role: deploy.id,
  policy: stateAccess(true),
});

new aws.iam.RolePolicy("personal-website-github-deploy", {
  role: deploy.id,
  policy: aws.iam.getPolicyDocumentOutput({
    statements: [
      {
        sid: "ManageStackServices",
        actions: [
          "acm:*",
          "apigateway:*",
          "cloudfront:*",
          "cloudwatch:*",
          "lambda:*",
          "logs:*",
          "route53:*",
          "s3:*",
          "ses:*",
          "sns:*",
          "wafv2:*",
        ],
        resources: ["*"],
      },
      {
        sid: "ManageStackRoles",
        actions: [
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:UpdateRole",
          "iam:UpdateAssumeRolePolicy",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:ListInstanceProfilesForRole",
          "iam:GetRolePolicy",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:PassRole",
        ],
        resources: [
          pulumi.interpolate`arn:aws:iam::${account.accountId}:role/personal-website-*`,
        ],
      },
      {
        sid: "ServiceLinkedRoles",
        actions: ["iam:CreateServiceLinkedRole"],
        resources: ["*"],
      },
    ],
  }).json,
});

// --- Plan role: `pulumi preview` on pull requests -------------------------

const plan = new aws.iam.Role("personal-website-github-plan", {
  name: "personal-website-github-plan",
  assumeRolePolicy: trustPolicy([
    `repo:${repository}:pull_request`,
    `repo:${repository}:ref:refs/heads/*`,
  ]),
  maxSessionDuration: 3600,
});

new aws.iam.RolePolicyAttachment("personal-website-github-plan-read-only", {
  role: plan.name,
  policyArn: "arn:aws:iam::aws:policy/ReadOnlyAccess",
});

new aws.iam.RolePolicy("personal-website-github-plan-state", {
  role: plan.id,
  policy: stateAccess(false),
});

export const deployRoleArn = deploy.arn;
export const planRoleArn = plan.arn;
export const awsRegion = region.region;
