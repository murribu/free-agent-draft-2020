import * as lambda from "aws-lambda";
import * as AWS from "aws-sdk";

exports.handler = async (
  event: any,
  serverlessContext: lambda.Context,
  callback: Function
) => {
  console.log({ event });
  const dynamoClient = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  const date = new Date();
  const dateAsIso = date.toISOString();
  const TableName: string = process.env.DYNAMODBTABLE || "";
  const ConditionExpression = "attribute_not_exists(PK)";
  const orgName = event.request.userAttributes["custom:org_name"];
  let TransactItems = [];
  let UserItem: any = {
    PK: { S: "user" + event.request.userAttributes["sub"] },
    SK: { S: "user" + dateAsIso },
    username: { S: event.userName },
    firstName: { S: event.request.userAttributes["custom:first_name"] },
    lastName: { S: event.request.userAttributes["custom:last_name"] },
    email: { S: event.request.userAttributes["email"] },
    updatedAt: { S: dateAsIso },
    createdAt: { S: dateAsIso },
    updatedById: { S: "user" + event.request.userAttributes["sub"] },
    updatedByName: {
      S:
        event.request.userAttributes["custom:first_name"] +
        " " +
        event.request.userAttributes["custom:last_name"]
    }
  };
  TransactItems.push({
    Put: { Item: UserItem, TableName, ConditionExpression }
  });
  try {
    const data = await dynamoClient
      .transactWriteItems({
        TransactItems
      })
      .promise();
    console.log({
      statusCode: 200,
      body: JSON.stringify({ UserItem })
    });
  } catch (error) {
    console.log({ error });
  }

  callback(null, event);
};
