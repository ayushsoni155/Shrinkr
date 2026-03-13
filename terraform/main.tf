# key pair
resource "aws_key_pair" "ec2_ssh_key" {
  key_name   = "shrinkr-key"
  public_key = file("./../shrinkr-key.pub")
}
# vpc && security
resource "aws_default_vpc" "default" {

}

resource "aws_security_group" "shrinkr-sg" {
  name        = "shrinkr-group"
  description = "this is test sequrity group"
  vpc_id      = aws_default_vpc.default.id
  ingress {
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 22
    to_port     = 22
    description = "Open to all SSH"
  }
  ingress {
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 80
    to_port     = 80
    description = "Open to all http"
  }
  ingress {
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 423
    to_port     = 423
    description = "Open to all https"
  }
  egress {
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 0
    to_port     = 0
    description = "Open for all outbounds"
  }
  tags = {
    Name = "shrinkr-sg"
  }
}
# ec2
resource "aws_instance" "ec2" {
  key_name        = aws_key_pair.ec2_ssh_key.key_name
  security_groups = [ aws_security_group.shrinkr-sg.name]
  ami             = var.ec2_ami_id
  instance_type   = var.ec2_type
  root_block_device {
    volume_size = var.ec2_root_storage
    volume_type = "gp3"
  }
  user_data = file("../scripts/dockerInstall.sh")
  tags = {
    Name = "shrinkr-ec2"
  }
}
resource "aws_ec2_instance_state" "shrinkr_instance_state" {
  instance_id = aws_instance.ec2.id
  state       = "running"
}