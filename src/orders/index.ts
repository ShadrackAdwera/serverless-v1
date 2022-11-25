import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  EventBridgeEvent,
} from 'aws-lambda';

import {
  getAllOrders,
  getOrders,
  createOrder,
} from './controllers/orders-controllers';
import { TOrder } from './libs/types';

exports.handler = async (
  event: APIGatewayEvent | EventBridgeEvent<any, TOrder>,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if ('detail-type' in event) {
    await createOrder(event.detail);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Order placed!',
      }),
    };
  } else {
    return await apiGatewayInvocation(event);
  }
};

const eventBridgeInvocation = async (event: EventBridgeEvent<any, TOrder>) => {
  const basketItems = event.detail;
};

const apiGatewayInvocation = async (
  event: APIGatewayEvent
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
