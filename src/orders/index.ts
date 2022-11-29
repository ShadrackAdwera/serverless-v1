import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  EventBridgeEvent,
  SQSEvent,
} from 'aws-lambda';

import {
  getAllOrders,
  getOrdersByUserNameAndOrderDate,
  createOrder,
} from './controllers/orders-controllers';
import { TOrder } from './libs/types';

exports.handler = async (
  event: APIGatewayEvent | EventBridgeEvent<any, TOrder> | SQSEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if ('detail-type' in event) {
    await eventBridgeInvocation(event);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Order placed!',
      }),
    };
  } else if ('Records' in event) {
    await handleSqsEvent(event);
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

const handleSqsEvent = async (event: SQSEvent) => {
  console.log('SQS Event: ', event.Records);

  for (const record of event.Records) {
    console.log('SQS Record: ', record);
    const data = JSON.parse(record.body) as TOrder;
    await createOrder(data);
  }
};

const eventBridgeInvocation = async (event: EventBridgeEvent<any, TOrder>) => {
  console.log(`Event Bridge Invokation event:`, event);
  await createOrder(event.detail);
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
        if (
          event.pathParameters &&
          event.pathParameters.username &&
          event.queryStringParameters &&
          event.queryStringParameters.orderDate
        ) {
          const orders = await getOrdersByUserNameAndOrderDate(
            event.pathParameters.username,
            event.queryStringParameters.orderDate
          );
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
