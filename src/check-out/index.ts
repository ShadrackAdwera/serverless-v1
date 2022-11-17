import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Request: ${JSON.stringify(event, undefined, 2)}`);
  console.log(`Context: ${JSON.stringify(context, undefined, 2)}`);

  let apiResponse: APIGatewayProxyResult = {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `This method / route does not exist!`,
    }),
  };

  try {
    switch (event.httpMethod) {
      case 'GET':
        apiResponse = {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Hello from check out lambda function`,
            path: `${event.path}`,
            method: `${event.httpMethod}`,
          }),
        };
      case 'POST':
        apiResponse = {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Hello from check out lambda function`,
            path: `${event.path}`,
            method: `${event.httpMethod}`,
          }),
        };
      case 'DELETE':
        apiResponse = {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Hello from check out lambda function`,
            path: `${event.path}`,
            method: `${event.httpMethod}`,
          }),
        };
    }
    return apiResponse;
  } catch (error) {
    console.error(error);
    return apiResponse;
  }
};
