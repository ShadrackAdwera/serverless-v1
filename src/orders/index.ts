import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { getAllOrders, getOrders } from './controllers/orders-controllers';

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  let apiResponse: APIGatewayProxyResult = {
    statusCode: 404,
    body: JSON.stringify({
      message: `Invalid method / route`,
    }),
  };

  try {
    switch (event.httpMethod) {
      case 'GET':
        if (event.pathParameters && event.pathParameters.username) {
          const orders = await getOrders(event.pathParameters.username);
          apiResponse = {
            statusCode: 200,
            body: JSON.stringify({
              orders,
            }),
          };
        } else {
          const orders = await getAllOrders();
          apiResponse = {
            statusCode: 200,
            body: JSON.stringify({
              orders,
            }),
          };
        }
    }
    return apiResponse;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : 'An error occured, try again.',
      }),
    };
  }
};
