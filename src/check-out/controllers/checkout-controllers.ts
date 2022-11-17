import {
  ScanCommand,
  ScanCommandInput,
  GetItemCommand,
  GetItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ddbClient } from '../libs/ddbClient';

const getCheckOutByUsername = async (username: string) => {
  const params: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ username }),
  };
  try {
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    return Item
      ? {
          checkout: unmarshall(Item),
        }
      : [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getCheckOut = async () => {
  const params: ScanCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
  };
  try {
    const { Items } = await ddbClient.send(new ScanCommand(params));
    return Items && Items.length > 0
      ? {
          count: Items.length,
          items: Items.map((item) => unmarshall(item)),
        }
      : {
          message: 'No items found for this checkout',
        };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getCheckOutByUsername, getCheckOut };
