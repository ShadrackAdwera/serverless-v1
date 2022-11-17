import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import {
  getCheckOutByUsername,
  getCheckOut,
} from './controllers/checkout-controllers';

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
        if (event.pathParameters && event.pathParameters.username) {
          const response = await getCheckOutByUsername(
            event.pathParameters.username
          );
          apiResponse = {
            statusCode: 200,
            body: JSON.stringify(response),
          };
        } else {
          const response = await getCheckOut();
          apiResponse = {
            statusCode: 200,
            body: JSON.stringify(response),
          };
        }
        break;
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
