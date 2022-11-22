import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import {
  getCheckOutByUsername,
  getCheckOut,
  deleteCheckout,
  createCheckoutBasket,
  submitCheckoutBasket,
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

  /*
  GET /checkout
  POST /checkout
  GET /checkout/{username}
  DELETE /checkout/{username}
  POST /checkout/submit-checkout
  */

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
        if (event.path === '/checkout/submit-checkout') {
          await submitCheckoutBasket(event);
          apiResponse = {
            statusCode: 201,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Checkout basket submitted`,
            }),
          };
        } else {
          await createCheckoutBasket(event.body);
          apiResponse = {
            statusCode: 201,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Checkout item created`,
            }),
          };
        }
        break;
      case 'DELETE':
        if (event.pathParameters && event.pathParameters.username) {
          await deleteCheckout(event.pathParameters.username);
          apiResponse = {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `The item has been deleted`,
            }),
          };
        } else {
          apiResponse = {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Please provide a username`,
            }),
          };
        }
        break;
      default:
        return apiResponse;
    }
    return apiResponse;
  } catch (error) {
    console.error(error);
    return apiResponse;
  }
};
