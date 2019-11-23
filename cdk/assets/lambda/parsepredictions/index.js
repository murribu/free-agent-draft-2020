"use strict";
const fs = require("fs");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");

const s3 = new AWS.S3();
const dynamoClient = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const TableName = process.env.DYNAMODBTABLE || "";
const ConditionExpression = "attribute_not_exists(PK)";

exports.handler = async function(event, context, callback) {
  console.log("test here");
  console.log(event);
  const date = new Date();
  const dateAsIso = date.toISOString();

  const bucket = event.Records[0].s3.bucket.name;
  const file = event.Records[0].s3.object.key;

  var response = await s3
    .getObject({ Bucket: bucket, Key: file }, err => {
      console.log("error!", err);
    })
    .promise();

  const predictions = response.Body.toString();

  const lines = predictions.split("\n");
  for (let line in lines) {
    let TransactItems = [];
    const cols = lines[line].split(",");
    const Item = {
      PK: { S: "player" + cols[0] },
      SK: { S: "player" },
      name: { S: cols[1] },
      team: { S: cols[2] },
      years: { N: cols[3] },
      amount: { N: cols[4] }
    };

    await dynamoClient.putItem({ Item, TableName }).promise();
  }

  callback(null, "yay!");
};
