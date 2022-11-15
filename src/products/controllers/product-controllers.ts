import { ddbClient } from '../libs/ddbClient';
import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
  QueryCommand,
  QueryCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

//TODO: Write unit tests for these controllers
const getProductById = async (productId: string) => {
  const params: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ id: productId }),
  };
  try {
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getProductsByCategory = async (event: APIGatewayEvent) => {
  let productId = '';
  let category = '';
  if (event.pathParameters && event.pathParameters.id) {
    productId = event.pathParameters.id;
  } else {
    throw new Error('Provide the path params');
  }

  if (event.queryStringParameters && event.queryStringParameters.category) {
    category = event.queryStringParameters.category;
  } else {
    throw new Error('Provide the query string params');
  }

  const params: QueryCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'id = :productId',
    FilterExpression: 'contains (category, :category)',
    ExpressionAttributeValues: {
      ':productId': { S: productId },
      ':category': { S: category },
    },
  };

  try {
    const { Items } = await ddbClient.send(new QueryCommand(params));
    return Items ? Items.map((Item) => unmarshall(Item)) : [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getProducts = async () => {
  const params: ScanCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
  };
  try {
    const { Items } = await ddbClient.send(new ScanCommand(params));
    return Items && Items?.length > 0
      ? Items.map((Item) => unmarshall(Item))
      : [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createProduct = async (
  event: APIGatewayEvent
): Promise<PutItemCommandOutput> => {
  const requestBody = JSON.parse(event.body!);
  // TODO: configure validator
  // TODO: enforce schema in dynamoDB
  // TODO: Query S3 for a signed URL to put image into an s3 container and save the url to DynamoDB
  const params: PutItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall({ ...requestBody, id: uuidv4() } || {}),
  };
  try {
    const createResult = await ddbClient.send(new PutItemCommand(params));
    return createResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateProduct = async (
  event: APIGatewayEvent
): Promise<UpdateItemCommandOutput> => {
  let productId = '';
  if (event.pathParameters && event.pathParameters.id) {
    productId = event.pathParameters.id;
  } else {
    throw new Error('Please provide the ID for this product');
  }
  const product = await getProductById(productId);
  if (Object.keys(product).length === 0) {
    throw new Error('This product does not exist!');
  }

  const requestBody = JSON.parse(event.body!);
  const objKeys = Object.keys(requestBody);

  const params: UpdateItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ id: productId }),
    UpdateExpression: `SET ${objKeys
      .map((_, index) => `#key${index} = :value${index}`)
      .join(', ')}`,
    ExpressionAttributeNames: objKeys.reduce(
      (acc, key, index) => ({
        ...acc,
        [`#key${index}`]: key,
      }),
      {}
    ),
    ExpressionAttributeValues: marshall(
      objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`:value${index}`]: requestBody[key],
        }),
        {}
      )
    ),
  };
  try {
    return await ddbClient.send(new UpdateItemCommand(params));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteProduct = async (
  productId: string
): Promise<DeleteItemCommandOutput> => {
  const product = await getProductById(productId);
  if (Object.keys(product).length === 0) {
    throw new Error('This product does not exist!');
  }

  const params: DeleteItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ id: productId }),
  };
  try {
    return await ddbClient.send(new DeleteItemCommand(params));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export {
  getProductById,
  getProducts,
  getProductsByCategory,
  createProduct,
  deleteProduct,
  updateProduct,
};
