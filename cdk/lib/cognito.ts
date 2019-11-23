import cdk = require("@aws-cdk/core");
import cognito = require("@aws-cdk/aws-cognito");
import dynamodb = require("@aws-cdk/aws-dynamodb");
import iam = require("@aws-cdk/aws-iam");
import lambda = require("@aws-cdk/aws-lambda");

import { config } from "../config";

const proj = config.projectname;
const env = config.environment;

interface PropsFromDynamoDb {
  table: dynamodb.Table;
}

interface CognitoProps {
  dynamodb: PropsFromDynamoDb;
  stackProps: cdk.StackProps;
}

export class Cognito extends cdk.Stack {
  public readonly userpool: cognito.UserPool;
  public readonly identitypool: cognito.CfnIdentityPool;
  public readonly webclient: cognito.CfnUserPoolClient;
  constructor(scope: cdk.Construct, id: string, props: CognitoProps) {
    super(scope, id, props.stackProps);

    this.userpool = new cognito.UserPool(this, `${proj}${env}UserPool`, {
      signInType: cognito.SignInType.EMAIL,
      autoVerifiedAttributes: [cognito.UserPoolAttribute.EMAIL]
    });

    const cfnUserPool = this.userpool.node.defaultChild as cognito.CfnUserPool;

    cfnUserPool.policies = {
      passwordPolicy: {
        minimumLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireSymbols: false,
        requireNumbers: false,
        temporaryPasswordValidityDays: 7
      }
    };

    this.webclient = new cognito.CfnUserPoolClient(
      this,
      `${proj}${env}UserPoolClient`,
      {
        clientName: "web",
        userPoolId: this.userpool.userPoolId,
        generateSecret: false
      }
    );

    this.identitypool = new cognito.CfnIdentityPool(
      this,
      `${proj}${env}IdentityPool`,
      {
        cognitoIdentityProviders: [
          {
            providerName: cfnUserPool.attrProviderName,
            clientId: this.webclient.ref
          }
        ],
        allowUnauthenticatedIdentities: false
      }
    );

    const fnCreateUser = new lambda.Function(this, `${proj}${env}CreateUser`, {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: "src/index.handler",
      code: lambda.Code.asset("./assets/lambda/createuser"),
      environment: {
        DYNAMODBTABLE: props.dynamodb.table.tableName
      },
      timeout: cdk.Duration.seconds(30)
    });

    this.userpool.addPostConfirmationTrigger(fnCreateUser);

    const createUserLambdaRole = fnCreateUser.role as iam.Role;

    const policyDynamoTable = new iam.Policy(
      this,
      `${proj}${env}PolicyLambdaToDynamo`,
      {
        policyName: `${proj}${env}PolicyLambdaToDynamo`
      }
    );

    const policyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [props.dynamodb.table.tableArn],
      actions: ["dynamodb:PutItem"]
    });

    policyDynamoTable.addStatements(policyStatement);

    createUserLambdaRole.attachInlinePolicy(policyDynamoTable);

    new cdk.CfnOutput(this, "userpoolid", {
      description: "userpoolid",
      value: this.userpool.userPoolId
    });

    new cdk.CfnOutput(this, "webclientid", {
      description: "webclientid",
      value: this.webclient.ref
    });

    new cdk.CfnOutput(this, "identitypoolid", {
      description: "identitypoolid",
      value: this.identitypool.ref
    });

    new cdk.CfnOutput(this, "cognitoregion", {
      description: "cognitoregion",
      value: "us-east-1"
    });

    new cdk.CfnOutput(this, "lambdaclicmd", {
      description: "lambdaclicmd",
      value:
        "cd assets/lambda/createuser && touch createuser.zip && rm createuser.zip && find ./ -path '*/.*' -prune -o -type f -print | zip ./createuser.zip -@ && aws lambda update-function-code --region us-east-1 --function-name " +
        fnCreateUser.functionName +
        " --zip-file fileb://./createuser.zip --profile=owlsdev && rm createuser.zip && cd ../../.."
    });
  }
}
