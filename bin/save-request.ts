#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { SaveRequestStack } from '../lib/save-request-stack';

const app = new cdk.App();
new SaveRequestStack(app, 'SaveRequestStack');
