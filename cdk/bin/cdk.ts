#!/usr/bin/env node
import "source-map-support/register";
import cdk = require("@aws-cdk/core");
import { DynamoDb } from "../lib/dynamodb";
import { Appsync } from "../lib/appsync";
import { Cognito } from "../lib/cognito";
import { S3 } from "../lib/s3";
import { Lambda } from "../lib/lambda";
import { Output } from "../lib/output";

import { config } from "../config";

const proj = config.projectname;
const envname = config.environment;
const env = { region: "us-east-1" };

const app = new cdk.App();

const dynamodb = new DynamoDb(app, `${proj}${envname}DynamoDb`, { env });
const cognito = new Cognito(app, `${proj}${envname}Cognito`, {
  stackProps: { env },
  dynamodb
});
const appsync = new Appsync(app, `${proj}${envname}Appsync`, {
  stackProps: { env },
  dynamodb,
  cognito
});
new S3(app, `${proj}${envname}S3`, { env });
new Lambda(app, `${proj}${envname}Lambda`, { stackProps: { env }, dynamodb });
new Output(app, `${proj}${envname}Output`, {
  stackProps: { env },
  cognito,
  appsync
});
