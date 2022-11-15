import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  getProductsByCategory,
} from './controllers/product-controllers';

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Request: ${JSON.stringify(event, undefined, 2)}`);
  try {
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
          event.queryStringParameters &&
          event.queryStringParameters.category
        ) {
          productBody = await getProductsByCategory(event);
        } else if (event.pathParameters && event.pathParameters.id) {
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
        const updatedProduct = await updateProduct(event);
        apiResponse = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Product Updated',
            product: updatedProduct,
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
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        errorMessage:
          error instanceof Error ? error.message : 'Internal Server Error',
        errorStack: error instanceof Error ? error.stack : '',
      }),
    };
  }
};
