import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from '../libs/ddbClient';
import { TOrder } from '../libs/types';

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

const createOrder = async (order: TOrder) => {
  const orderDate = new Date().toISOString();
  const foundOrder = { ...order };
  foundOrder.orderDate = orderDate;
  console.log(foundOrder);
  const params: PutItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall({ ...foundOrder } || {}),
  };

  try {
    const result = await ddbClient.send(new PutItemCommand(params));
    console.log(result);
    return {
      message: 'Order created successfully',
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getOrders, getAllOrders, createOrder };
