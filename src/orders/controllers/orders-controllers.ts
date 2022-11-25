import { GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
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

export { getOrders };
