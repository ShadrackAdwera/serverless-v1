import { ddbClient } from '../libs/ddbClient';
import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

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

const deleteProduct = async (
  productId: string
): Promise<DeleteItemCommandOutput> => {
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

export { getProductById, getProducts, createProduct, deleteProduct };
