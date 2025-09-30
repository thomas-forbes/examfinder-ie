#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ExamScraperStack } from '../lib/exam-scraper-stack';

const app = new cdk.App();

new ExamScraperStack(app, 'ExamScraperStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-1', // Ireland region
  },
  description: 'ExamFinder Ireland - Scheduled web scraper running in Dublin',
});

app.synth();