import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import dynamodb = require("@aws-cdk/aws-dynamodb");
import iam = require("@aws-cdk/aws-iam");
import s3 = require("@aws-cdk/aws-s3");
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";

import { config } from "../config";

const proj = config.projectname;
const env = config.environment;

interface PropsFromDynamoDb {
  table: dynamodb.Table;
}

interface LambdaProps {
  dynamodb: PropsFromDynamoDb;
  stackProps: cdk.StackProps;
}

export class Lambda extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: LambdaProps) {
    super(scope, id, props.stackProps);

    const uploadBucket = new s3.Bucket(this, `${proj}${env}UploadBucket`);

    const fnParsePredictions = new lambda.Function(
      this,
      `${proj}${env}ParsePredictions`,
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: "src/index.handler",
        code: lambda.Code.asset("./assets/lambda/parsepredictions"),
        environment: {
          DYNAMODBTABLE: props.dynamodb.table.tableName
        },
        timeout: cdk.Duration.minutes(15),
        memorySize: 3000
      }
    );

    const parsePredictionsLambdaRole = fnParsePredictions.role as iam.Role;

    const policyForParsingLambda = new iam.Policy(
      this,
      `${proj}${env}PolicyForParsingLambda`,
      {
        policyName: `${proj}${env}PolicyForParsingLambda`
      }
    );

    const policyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [
        uploadBucket.bucketArn,
        uploadBucket.bucketArn + "/*",
        props.dynamodb.table.tableArn
      ],
      actions: ["s3:GetObject", "dynamodb:PutItem"]
    });

    policyForParsingLambda.addStatements(policyStatement);

    parsePredictionsLambdaRole.attachInlinePolicy(policyForParsingLambda);

    fnParsePredictions.addEventSource(
      new S3EventSource(uploadBucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "predictions.txt" }]
      })
    );

    new cdk.CfnOutput(this, "uploadbucket", {
      description: "uploadbucket",
      value: uploadBucket.bucketName
    });

    new cdk.CfnOutput(this, "s3predictionscmd", {
      description: "s3predictionscmd",
      value:
        "aws s3 cp ../predictions.txt s3://" +
        uploadBucket.bucketName +
        "/predictions.txt"
    });

    new cdk.CfnOutput(this, "functionname", {
      description: "functionname",
      value: fnParsePredictions.functionName
    });

    new cdk.CfnOutput(this, "parsePredictionsclicmd", {
      description: "parsePredictionsclicmd",
      value:
        "cd assets/lambda/parsepredictions && touch parsepredictions.zip && rm parsepredictions.zip && find ./ -path '*/.*' -prune -o -type f -print | zip ./parsepredictions.zip -@ && aws lambda update-function-code --region us-east-1 --function-name " +
        fnParsePredictions.functionName +
        " --zip-file fileb://./parsepredictions.zip && rm parsepredictions.zip && cd ../../.."
    });
  }
}
