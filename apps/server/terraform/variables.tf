variable "aws_region" {
  type        = string
  description = "Region where AWS resources are going to be deployed"
}

variable "api_stage" {
  type        = string
  description = "Stage/env for the API"
}

variable "no_reply_email" {
  type        = string
  description = "The no reply email address that the API is going to send emails from"
}

variable "admin_email" {
  type        = string
  description = "The email address that the API will notify of a form submission"
}

variable "alarm_email" {
  type        = string
  description = "Email address subscribed to CloudWatch alarms and SES bounce/complaint notifications. Defaults to admin_email"
  default     = null
}

variable "log_retention_in_days" {
  type        = number
  description = "How long to keep the contact Lambda's CloudWatch logs"
  default     = 30
}

variable "waf_rate_limit_per_5_minutes" {
  type        = number
  description = "Maximum requests a single IP can make to the API in a 5 minute window before WAF blocks it"
  default     = 20
}

variable "turnstile_secret_key" {
  type        = string
  description = "Cloudflare Turnstile secret key. When set, the contact Lambda rejects submissions without a valid Turnstile token"
  default     = ""
  sensitive   = true
}
