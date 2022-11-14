import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from './controllers/product-controllers';

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  let apiResponse: APIGatewayProxyResult = {
    statusCode: 404,
    body: JSON.stringify({
      message: 'Invalid method / route provided.',
    }),
  };
  switch (event.httpMethod) {
    case 'GET':
      let productBody: Record<string, any> | Record<string, any>[];
      if (
        event.pathParameters !== null &&
        event.pathParameters.id !== undefined
      ) {
        productBody = await getProductById(event.pathParameters.id);
      } else {
        productBody = await getProducts();
      }
      apiResponse = {
        statusCode: 200,
        body: JSON.stringify(productBody),
      };
      break;
    case 'POST':
      const result = await createProduct(event);
      apiResponse = {
        statusCode: 201,
        body: JSON.stringify({
          message: 'Product Created',
          product: result.Attributes,
        }),
      };
      break;
    case 'PATCH':
      await updateProduct(event);
      apiResponse = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Product Updated',
        }),
      };
      break;
    case 'DELETE':
      if (
        event.pathParameters !== null &&
        event.pathParameters.id !== undefined
      ) {
        await deleteProduct(event.pathParameters.id);
        apiResponse = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Product Deleted',
          }),
        };
      }
      break;
    default:
      throw new Error('Invalid method / route');
  }
  return apiResponse;
};
