import cdk = require("@aws-cdk/core");
import cognito = require("@aws-cdk/aws-cognito");
import appsync = require("@aws-cdk/aws-appsync");

import { config } from "../config";

const proj = config.projectname;
const env = config.environment;

interface PropsFromAppsync {
  protectedapi: appsync.CfnGraphQLApi;
  publicapi: appsync.CfnGraphQLApi;
  apikey: appsync.CfnApiKey;
}

interface PropsFromCognito {
  userpool: cognito.UserPool;
  identitypool: cognito.CfnIdentityPool;
  webclient: cognito.CfnUserPoolClient;
}

interface OutputProps {
  appsync: PropsFromAppsync;
  cognito: PropsFromCognito;
  stackProps: cdk.StackProps;
}

export class Output extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: OutputProps) {
    super(scope, id, props.stackProps);

    new cdk.CfnOutput(this, "apiurl", {
      description: "protectedapiurl",
      value: props.appsync.protectedapi.attrGraphQlUrl
    });

    new cdk.CfnOutput(this, "publicapiurl", {
      description: "publicapiurl",
      value: props.appsync.publicapi.attrGraphQlUrl
    });

    new cdk.CfnOutput(this, "publicapikey", {
      description: "publicapikey",
      value: props.appsync.apikey.attrApiKey
    });
    new cdk.CfnOutput(this, "userpoolid", {
      description: "userpoolid",
      value: props.cognito.userpool.userPoolId
    });

    new cdk.CfnOutput(this, "webclientid", {
      description: "webclientid",
      value: props.cognito.webclient.ref
    });

    new cdk.CfnOutput(this, "identitypoolid", {
      description: "identitypoolid",
      value: props.cognito.identitypool.ref
    });

    new cdk.CfnOutput(this, "cognitoregion", {
      description: "cognitoregion",
      value: "us-east-1"
    });
  }
}
