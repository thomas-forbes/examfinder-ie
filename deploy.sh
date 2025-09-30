#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}ExamFinder Ireland - AWS Deployment Script${NC}"
echo "==========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install it from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="eu-west-1"

echo -e "${YELLOW}Deploying to AWS Account: ${ACCOUNT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

# Step 1: Install infrastructure dependencies
echo -e "${GREEN}Step 1: Installing infrastructure dependencies...${NC}"
cd infrastructure
npm install
cd ..

# Step 2: Bootstrap CDK (if not already done)
echo -e "${GREEN}Step 2: Bootstrapping CDK...${NC}"
cd infrastructure
npx cdk bootstrap aws://${ACCOUNT_ID}/${REGION}
cd ..

# Step 3: Deploy CDK stack
echo -e "${GREEN}Step 3: Deploying CDK stack...${NC}"
cd infrastructure
npx cdk deploy --require-approval never
cd ..

# Get ECR repository URI from CDK outputs
REPOSITORY_URI=$(aws cloudformation describe-stacks \
  --stack-name ExamScraperStack \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?ExportName==`ExamScraperRepositoryUri`].OutputValue' \
  --output text)

echo -e "${GREEN}ECR Repository: ${REPOSITORY_URI}${NC}"

# Step 4: Build and push Docker image
echo -e "${GREEN}Step 4: Building and pushing Docker image...${NC}"

# Login to ECR
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Build Docker image
cd packages/data
docker build -t examfinder-scraper:latest .

# Tag and push
docker tag examfinder-scraper:latest ${REPOSITORY_URI}:latest
docker push ${REPOSITORY_URI}:latest

cd ../..

# Step 5: Force new deployment of ECS task
echo -e "${GREEN}Step 5: Updating ECS task definition...${NC}"

# Get the task definition ARN
TASK_DEF_ARN=$(aws cloudformation describe-stacks \
  --stack-name ExamScraperStack \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?ExportName==`ExamScraperTaskDefinitionArn`].OutputValue' \
  --output text)

# Get S3 bucket name
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ExamScraperStack \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?ExportName==`ExamDataBucketName`].OutputValue' \
  --output text)

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "======================================"
echo -e "${YELLOW}Deployment Summary:${NC}"
echo "======================================"
echo -e "Region: ${GREEN}${REGION} (Ireland)${NC}"
echo -e "ECR Repository: ${GREEN}${REPOSITORY_URI}${NC}"
echo -e "S3 Bucket: ${GREEN}${S3_BUCKET}${NC}"
echo -e "Task Definition: ${GREEN}${TASK_DEF_ARN}${NC}"
echo ""
echo -e "${YELLOW}The scraper will run automatically at 3 AM UTC daily${NC}"
echo ""
echo -e "${YELLOW}To run the scraper manually:${NC}"
echo "  ./run-scraper.sh"
echo ""
echo -e "${YELLOW}To download scraped data:${NC}"
echo "  aws s3 cp s3://${S3_BUCKET}/data.json ./data.json"
echo ""
echo -e "${YELLOW}To destroy the infrastructure:${NC}"
echo "  cd infrastructure && npx cdk destroy"