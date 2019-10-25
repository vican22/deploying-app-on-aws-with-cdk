import cdk = require("@aws-cdk/core");
import dynamoDB = require("@aws-cdk/aws-dynamodb");
import lambda = require("@aws-cdk/aws-lambda");
import iam = require("@aws-cdk/aws-iam");
import apiGateway = require("@aws-cdk/aws-apigateway");

export class SaveRequestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const requestTable = new dynamoDB.Table(this, "request-table", {
      tableName: "request",
      partitionKey: {
        name: "id",
        type: dynamoDB.AttributeType.STRING
      },
      billingMode: dynamoDB.BillingMode.PAY_PER_REQUEST
    });

    const requestHandler = new lambda.Function(this, "request-handler", {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: "app.lambda_handlera",
      functionName: "lambda_handler",
      environment: {
        REQUEST_TABLE: requestTable.tableName
      },
      description:
        "Request handler to insert a request into DynamoDB. Triggered by API Gateway.",
      code: lambda.Code.asset("./request-handler")
    });

    requestHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: [requestTable.tableArn]
      })
    );

    const requestRestApi = new apiGateway.LambdaRestApi(this, "request-api", {
      proxy: false,
      handler: requestHandler
    });

    const requestRestApiSendResource = requestRestApi.root.addResource("send");

    const badRequestResponse: apiGateway.IntegrationResponse = {
      statusCode: "400"
    };

    const internalServerResponse: apiGateway.IntegrationResponse = {
      statusCode: "500"
    };

    const okResponse: apiGateway.IntegrationResponse = {
      statusCode: "200"
    };

    const requestRestApiLambdaIntegration = new apiGateway.LambdaIntegration(
      requestHandler,
      {
        integrationResponses: [
          badRequestResponse,
          internalServerResponse,
          okResponse
        ]
      }
    );

    requestRestApiSendResource.addMethod(
      "POST",
      requestRestApiLambdaIntegration
    );
  }
}
