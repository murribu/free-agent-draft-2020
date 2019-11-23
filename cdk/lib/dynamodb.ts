import cdk = require("@aws-cdk/core");
import dynamodb = require("@aws-cdk/aws-dynamodb");

import { config } from "../config";

const proj = config.projectname;
const env = config.environment;

export class DynamoDb extends cdk.Stack {
  public readonly table: dynamodb.Table;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.table = new dynamodb.Table(this, `${proj}${env}`, {
      tableName: `${proj}${env}`,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE
    });

    const readScaling = this.table.autoScaleReadCapacity({
      minCapacity: 1,
      maxCapacity: 50
    });

    const writeScaling = this.table.autoScaleWriteCapacity({
      minCapacity: 1,
      maxCapacity: 50
    });

    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 70
    });

    writeScaling.scaleOnUtilization({
      targetUtilizationPercent: 70
    });

    const gsi1 = this.table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: dynamodb.AttributeType.STRING
      },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING }
    });

    const gsi1ReadCapacity = this.table.autoScaleGlobalSecondaryIndexReadCapacity(
      "GSI1",
      {
        minCapacity: 1,
        maxCapacity: 50
      }
    );

    gsi1ReadCapacity.scaleOnUtilization({ targetUtilizationPercent: 70 });

    const gsi1WriteCapacity = this.table.autoScaleGlobalSecondaryIndexWriteCapacity(
      "GSI1",
      {
        minCapacity: 1,
        maxCapacity: 50
      }
    );

    gsi1WriteCapacity.scaleOnUtilization({ targetUtilizationPercent: 70 });
  }
}
