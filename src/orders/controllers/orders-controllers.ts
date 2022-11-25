import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from '../libs/ddbClient';

// const createOrder = async () => {

// }

const getOrders = async (username: string) => {
  const params: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ username }),
  };

  try {
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    return Item
      ? {
          orders: unmarshall(Item),
        }
      : {
          message: 'No orders found',
        };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllOrders = async () => {
  const params: ScanCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
  };
  try {
    const { Items } = await ddbClient.send(new ScanCommand(params));
    return Items && Items.length > 0
      ? { orders: Items.map((item) => unmarshall(item)) }
      : { orders: [] };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { getOrders, getAllOrders };
