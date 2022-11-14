import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

import { getProductById, getProducts } from './controllers/product-controllers';

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  switch (event.httpMethod) {
    case 'GET':
      let productRes: Record<string, any>;
      let productsRes: Record<string, any>[];
      if (
        event.pathParameters !== null &&
        event.pathParameters.id !== undefined
      ) {
        productRes = await getProductById(event.pathParameters.id);
      } else {
        productsRes = await getProducts();
      }
    case 'POST':
    case 'PATCH':
    case 'DELETE':
    default:
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Invalid method provided.',
        }),
      };
  }
};
