variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "zone_name" {
  type    = string
  default = "puq.me"
}

variable "frontend_origin_ip" {
  type = string
}

variable "backend_origin_ip" {
  type = string
}

variable "websocket_origin_ip" {
  type = string
}

variable "cdn_origin_host" {
  type = string
}
