variable "ec2_ami_id" {
  default = "ami-03446a3af42c5e74e"
  type    = string
}
variable "ec2_type" {
  default = "m7i-flex.large"
  type    = string
}
variable "ec2_root_storage" {
  default = 30
  type    = number
}