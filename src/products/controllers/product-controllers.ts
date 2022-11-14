import { ddbClient } from '../libs/ddbClient';
import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

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

export { getProductById, getProducts };
