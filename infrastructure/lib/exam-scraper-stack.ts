import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export class ExamScraperStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket to store scraped data
    const dataBucket = new s3.Bucket(this, 'ExamDataBucket', {
      bucketName: `examfinder-data-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    });

    // VPC for ECS tasks
    const vpc = new ec2.Vpc(this, 'ScraperVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // ECR repository for the scraper Docker image
    const repository = new ecr.Repository(this, 'ScraperRepository', {
      repositoryName: 'examfinder-scraper',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 5,
          description: 'Keep only 5 most recent images',
        },
      ],
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'ScraperCluster', {
      vpc,
      clusterName: 'examfinder-scraper-cluster',
      containerInsights: true,
    });

    // CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'ScraperLogGroup', {
      logGroupName: '/ecs/examfinder-scraper',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Task execution role
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy'
        ),
      ],
    });

    // Task role with S3 permissions
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    dataBucket.grantReadWrite(taskRole);

    // Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ScraperTask', {
      memoryLimitMiB: 2048,
      cpu: 1024,
      executionRole,
      taskRole,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    // Container definition
    const container = taskDefinition.addContainer('ScraperContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'scraper',
        logGroup,
      }),
      environment: {
        AWS_REGION: this.region,
        S3_BUCKET: dataBucket.bucketName,
        LOG_LEVEL: 'info',
      },
      // Puppeteer needs more shared memory
      linuxParameters: new ecs.LinuxParameters(this, 'LinuxParams', {
        sharedMemorySize: 512,
      }),
    });

    // Security group for ECS tasks
    const securityGroup = new ec2.SecurityGroup(this, 'ScraperSecurityGroup', {
      vpc,
      description: 'Security group for exam scraper ECS tasks',
      allowAllOutbound: true,
    });

    // EventBridge rule to trigger scraper daily at 3 AM UTC (4 AM Irish time)
    const rule = new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '3',
        weekDay: '*',
      }),
      description: 'Trigger exam scraper daily at 3 AM UTC',
    });

    // Add ECS task as target
    rule.addTarget(
      new targets.EcsTask({
        cluster,
        taskDefinition,
        taskCount: 1,
        subnetSelection: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [securityGroup],
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: repository.repositoryUri,
      description: 'ECR Repository URI for the scraper image',
      exportName: 'ExamScraperRepositoryUri',
    });

    new cdk.CfnOutput(this, 'DataBucketName', {
      value: dataBucket.bucketName,
      description: 'S3 bucket name for scraped data',
      exportName: 'ExamDataBucketName',
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster name',
      exportName: 'ExamScraperClusterName',
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: taskDefinition.taskDefinitionArn,
      description: 'ECS Task Definition ARN',
      exportName: 'ExamScraperTaskDefinitionArn',
    });
  }
}