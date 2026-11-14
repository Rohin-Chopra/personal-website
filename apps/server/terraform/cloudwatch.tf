resource "aws_cloudwatch_log_group" "contact_lambda_log_group" {
  name              = "/aws/lambda/${local.contact_lambda_function_name}"
  retention_in_days = var.log_retention_in_days
}

resource "aws_sns_topic" "alerts" {
  name = "personal-website-api-alerts"
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "alerts_topic_policy" {
  statement {
    sid     = "AllowCloudWatchAlarms"
    effect  = "Allow"
    actions = ["sns:Publish"]

    principals {
      type        = "Service"
      identifiers = ["cloudwatch.amazonaws.com"]
    }

    resources = [aws_sns_topic.alerts.arn]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }

  statement {
    sid     = "AllowSesEventNotifications"
    effect  = "Allow"
    actions = ["sns:Publish"]

    principals {
      type        = "Service"
      identifiers = ["ses.amazonaws.com"]
    }

    resources = [aws_sns_topic.alerts.arn]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

resource "aws_sns_topic_policy" "alerts" {
  arn    = aws_sns_topic.alerts.arn
  policy = data.aws_iam_policy_document.alerts_topic_policy.json
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = local.alarm_email
}

locals {
  alarm_email = coalesce(var.alarm_email, var.admin_email)

  alarms = {
    lambda_errors = {
      description = "The contact Lambda threw errors"
      namespace   = "AWS/Lambda"
      metric_name = "Errors"
      dimensions  = { FunctionName = aws_lambda_function.contact_lambda.function_name }
      statistic   = "Sum"
      period      = 300
      threshold   = 0
    }
    lambda_throttles = {
      description = "The contact Lambda was throttled"
      namespace   = "AWS/Lambda"
      metric_name = "Throttles"
      dimensions  = { FunctionName = aws_lambda_function.contact_lambda.function_name }
      statistic   = "Sum"
      period      = 300
      threshold   = 0
    }
    api_5xx = {
      description = "The contact API returned 5XX responses"
      namespace   = "AWS/ApiGateway"
      metric_name = "5XXError"
      dimensions  = { ApiName = aws_api_gateway_rest_api.api.name, Stage = aws_api_gateway_stage.api_stage.stage_name }
      statistic   = "Sum"
      period      = 300
      threshold   = 0
    }
    api_4xx_spike = {
      description = "Spike in contact API 4XX responses (spam, throttling or quota exhaustion)"
      namespace   = "AWS/ApiGateway"
      metric_name = "4XXError"
      dimensions  = { ApiName = aws_api_gateway_rest_api.api.name, Stage = aws_api_gateway_stage.api_stage.stage_name }
      statistic   = "Sum"
      period      = 3600
      threshold   = 50
    }
    ses_bounce_rate = {
      description = "SES bounce rate is above 5% (AWS reviews accounts at 5% and may pause sending at 10%)"
      namespace   = "AWS/SES"
      metric_name = "Reputation.BounceRate"
      dimensions  = {}
      statistic   = "Maximum"
      period      = 3600
      threshold   = 0.05
    }
    ses_complaint_rate = {
      description = "SES complaint rate is above 0.1% (AWS reviews accounts at 0.1% and may pause sending at 0.5%)"
      namespace   = "AWS/SES"
      metric_name = "Reputation.ComplaintRate"
      dimensions  = {}
      statistic   = "Maximum"
      period      = 3600
      threshold   = 0.001
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "contact_api" {
  for_each = local.alarms

  alarm_name          = "personal-website-api-${replace(each.key, "_", "-")}"
  alarm_description   = each.value.description
  namespace           = each.value.namespace
  metric_name         = each.value.metric_name
  dimensions          = each.value.dimensions
  statistic           = each.value.statistic
  period              = each.value.period
  evaluation_periods  = 1
  threshold           = each.value.threshold
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}
