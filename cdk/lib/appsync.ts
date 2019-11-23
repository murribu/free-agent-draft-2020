import cdk = require("@aws-cdk/core");
import appsync = require("@aws-cdk/aws-appsync");
import cognito = require("@aws-cdk/aws-cognito");
import dynamodb = require("@aws-cdk/aws-dynamodb");
import iam = require("@aws-cdk/aws-iam");
import fs = require("fs");

import { config } from "../config";

const proj = config.projectname;
const env = config.environment;

interface PropsFromCognito {
  userpool: cognito.UserPool;
  identitypool: cognito.CfnIdentityPool;
}

interface PropsFromDynamoDb {
  table: dynamodb.Table;
}

interface AppsyncProps {
  cognito: PropsFromCognito;
  dynamodb: PropsFromDynamoDb;
  stackProps: cdk.StackProps;
}

export class Appsync extends cdk.Stack {
  public readonly protectedapi: appsync.CfnGraphQLApi; // Used in Outputs
  public readonly publicapi: appsync.CfnGraphQLApi; // Used in Outputs
  public readonly apikey: appsync.CfnApiKey; // Used in Outputs
  constructor(scope: cdk.Construct, id: string, props: AppsyncProps) {
    super(scope, id, props.stackProps);

    const api = new appsync.CfnGraphQLApi(this, `${proj}${env}API`, {
      authenticationType: "AMAZON_COGNITO_USER_POOLS",
      userPoolConfig: {
        awsRegion: "us-east-1",
        userPoolId: props.cognito.userpool.userPoolId,
        defaultAction: "ALLOW"
      },
      name: `${proj}${env}API`
    });

    const sharedSchema = fs.readFileSync(
      "./assets/appsync/schema.shared.graphql",
      "utf8"
    );
    let protectedSchema = fs.readFileSync(
      "./assets/appsync/schema.protected.graphql",
      "utf8"
    );
    protectedSchema += sharedSchema;
    let publicSchema = fs.readFileSync(
      "./assets/appsync/schema.public.graphql",
      "utf8"
    );
    publicSchema += sharedSchema;

    new appsync.CfnGraphQLSchema(this, `${proj}${env}Schema`, {
      apiId: api.attrApiId,
      definition: protectedSchema
    });

    const protectedPolicyDocument = new iam.PolicyDocument();
    const protectedPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW
    });
    protectedPolicyStatement.addActions(
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:UpdateItem"
    );
    protectedPolicyStatement.addResources(
      props.dynamodb.table.tableArn,
      props.dynamodb.table.tableArn + "/*"
    );
    protectedPolicyDocument.addStatements(protectedPolicyStatement);

    const protectedApiRole = new iam.Role(this, `${proj}${env}RoleAppsyncDS`, {
      assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      inlinePolicies: { dynamoDSPolicyDocument: protectedPolicyDocument }
    });

    const publicPolicyDocument = new iam.PolicyDocument();
    const publicPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW
    });
    publicPolicyStatement.addActions("es:ESHttpGet", "es:ESHttpHead");
    // if this gives problems, it might be helpful to know that I copied this block of code (setting the publicApiRole and the protectedApiRole) from appsync.ts. I also changed the "resource" from specifying the domain to all domains in this account. This _should_ work...
    publicPolicyStatement.addResources(
      `arn:aws:es:us-east-1:${this.account}:domain/*/*`
    );
    publicPolicyDocument.addStatements(publicPolicyStatement);

    const publicApiRole = new iam.Role(
      this,
      `${proj}${env}PublicRoleAppsyncDS`,
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
        inlinePolicies: { elasticSearchPolicyDocument: publicPolicyDocument }
      }
    );

    const ds = new appsync.CfnDataSource(this, `${proj}${env}DataSource`, {
      apiId: api.attrApiId,
      name: `${proj}${env}DataSource`,
      type: "AMAZON_DYNAMODB",
      dynamoDbConfig: {
        awsRegion: "us-east-1",
        tableName: props.dynamodb.table.tableName
      },
      serviceRoleArn: protectedApiRole.roleArn
    });

    const requestTemplateGetProfile = fs.readFileSync(
      "./assets/appsync/resolvers/Query.getProfile.request",
      "utf8"
    );
    const responseTemplateGetProfile = fs.readFileSync(
      "./assets/appsync/resolvers/Query.getProfile.response",
      "utf8"
    );

    new appsync.CfnResolver(this, `${proj}${env}GetProfile`, {
      apiId: api.attrApiId,
      fieldName: "getProfile",
      typeName: "Query",
      dataSourceName: ds.attrName,
      kind: "UNIT",
      requestMappingTemplate: requestTemplateGetProfile,
      responseMappingTemplate: responseTemplateGetProfile
    });

    const publicapi = new appsync.CfnGraphQLApi(
      this,
      `${proj}${env}PublicAPI`,
      {
        authenticationType: "API_KEY",
        name: `${proj}${env}PublicAPI`
      }
    );

    new appsync.CfnGraphQLSchema(this, `${proj}${env}PublicSchema`, {
      apiId: publicapi.attrApiId,
      definition: publicSchema
    });

    const expires: number =
      Math.floor(new Date().getTime() / 1000) + 365 * 24 * 60 * 60;

    const apikey = new appsync.CfnApiKey(this, `${proj}${env}ApiKey`, {
      apiId: publicapi.attrApiId,
      expires
    });

    new cdk.CfnOutput(this, "apiurl", {
      description: "apiurl",
      value: api.attrGraphQlUrl
    });

    new cdk.CfnOutput(this, "publicapikey", {
      description: "publicapikey",
      value: apikey.attrApiKey
    });

    new cdk.CfnOutput(this, "publicapiurl", {
      description: "publicapiurl",
      value: publicapi.attrGraphQlUrl
    });
  }
}
