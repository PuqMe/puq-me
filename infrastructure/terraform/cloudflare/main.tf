terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "cloudflare_zones" "puqme" {
  name = var.zone_name
}

locals {
  zone_id = one(data.cloudflare_zones.puqme.result).id
}

resource "cloudflare_dns_record" "root" {
  zone_id = local.zone_id
  name    = var.zone_name
  type    = "A"
  content = var.frontend_origin_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "api" {
  zone_id = local.zone_id
  name    = "api"
  type    = "A"
  content = var.backend_origin_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "ws" {
  zone_id = local.zone_id
  name    = "ws"
  type    = "A"
  content = var.websocket_origin_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "cdn" {
  zone_id = local.zone_id
  name    = "cdn"
  type    = "CNAME"
  content = var.cdn_origin_host
  proxied = true
  ttl     = 1
}
