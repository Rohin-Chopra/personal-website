resource "aws_ses_template" "contact_notify_template" {
  name    = "contact-notify-template"
  subject = "A contact form submission was made"
  html    = file("../email-templates/contact-notify-email.html")
}

resource "aws_sesv2_configuration_set" "contact" {
  configuration_set_name = "personal-website-contact"

  reputation_options {
    reputation_metrics_enabled = true
  }
}

resource "aws_sesv2_configuration_set_event_destination" "contact_bounces_and_complaints" {
  configuration_set_name = aws_sesv2_configuration_set.contact.configuration_set_name
  event_destination_name = "bounces-and-complaints"

  event_destination {
    enabled              = true
    matching_event_types = ["BOUNCE", "COMPLAINT", "REJECT"]

    sns_destination {
      topic_arn = aws_sns_topic.alerts.arn
    }
  }
}
