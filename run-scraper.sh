#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REGION="eu-west-1"

echo -e "${GREEN}Running ExamFinder Scraper Manually...${NC}"

# Get cluster name
CLUSTER_NAME=$(aws cloudformation describe-stacks \
  --stack-name ExamScraperStack \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?ExportName==`ExamScraperClusterName`].OutputValue' \
  --output text)

# Get task definition ARN
TASK_DEF_ARN=$(aws cloudformation describe-stacks \
  --stack-name ExamScraperStack \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?ExportName==`ExamScraperTaskDefinitionArn`].OutputValue' \
  --output text)

# Get VPC details
VPC_ID=$(aws ec2 describe-vpcs \
  --region ${REGION} \
  --filters "Name=tag:aws:cloudformation:stack-name,Values=ExamScraperStack" \
  --query 'Vpcs[0].VpcId' \
  --output text)

SUBNET_IDS=$(aws ec2 describe-subnets \
  --region ${REGION} \
  --filters "Name=vpc-id,Values=${VPC_ID}" "Name=tag:aws-cdk:subnet-type,Values=Private" \
  --query 'Subnets[*].SubnetId' \
  --output text | tr '\t' ',')

SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --region ${REGION} \
  --filters "Name=vpc-id,Values=${VPC_ID}" "Name=tag:aws:cloudformation:stack-name,Values=ExamScraperStack" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

echo -e "${YELLOW}Starting ECS task...${NC}"
echo "Cluster: ${CLUSTER_NAME}"
echo "Task Definition: ${TASK_DEF_ARN}"

# Run the task
TASK_ARN=$(aws ecs run-task \
  --cluster ${CLUSTER_NAME} \
  --task-definition ${TASK_DEF_ARN} \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS}],securityGroups=[${SECURITY_GROUP}],assignPublicIp=DISABLED}" \
  --region ${REGION} \
  --query 'tasks[0].taskArn' \
  --output text)

echo -e "${GREEN}✅ Task started successfully!${NC}"
echo "Task ARN: ${TASK_ARN}"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "aws logs tail /ecs/examfinder-scraper --follow --region ${REGION}"
echo ""
echo -e "${YELLOW}To check task status:${NC}"
echo "aws ecs describe-tasks --cluster ${CLUSTER_NAME} --tasks ${TASK_ARN} --region ${REGION}"