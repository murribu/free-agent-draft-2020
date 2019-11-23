# Integrity - OWLS

This project's basis can be found [here](https://github.com/corydozen/serverless-cdk-cicd)

## Deploy backend <a name="deploy-backend"></a>

Make sure your cdk/config.ts file has some data. For this example, I'm using:

```js
export const config = {
  environment: "Dev",
  projectname: "FreeAgent2020"
};
```

Then...

```sh
cd cdk/assets/lambda/createuser
yarn
cd ../../..
yarn
yarn build && cdk synth
cdk deploy FreeAgent2020DevCognito --require-approval=never &> ../cdkdeployresult_cognito.txt
cdk deploy FreeAgent2020DevAppsync --require-approval=never &> ../cdkdeployresult_appsync.txt
cd ..
yarn
echo "export default {};" > src/config.js
node parseAwsOutputs.js src/config.js
yarn build
```

## Deploy frontend

```sh
cd cdk
yarn
cdk deploy FreeAgentDevS3
```

## More stuff

### To create a new environment

Change [cdk/config.ts](cdk/config.ts) to have a different value for `environment`.

Then follow the [Deploy backend](#deploy-backend) instructions, but replace `Dev` with your new environment value.
