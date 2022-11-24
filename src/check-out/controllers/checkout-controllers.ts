import { APIGatewayEvent } from 'aws-lambda';
import {
  ScanCommand,
  ScanCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  DeleteItemCommand,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  PutEventsCommand,
  PutEventsCommandInput,
  PutEventsCommandOutput,
} from '@aws-sdk/client-eventbridge';

import { ebClient } from '../libs/ebClient';
import { ddbClient } from '../libs/ddbClient';

interface ICheckOutPayload {
  username: string;
  totalPrice: number;
  firstName?: string;
  lastName?: string;
  email: string;
  address: string;
  cardInfo: string;
  paymentMethod: string;
}

const handleOrderPayload = (
  checkOutRequest: ICheckOutPayload,
  checkOutBasket: Record<string, any>
): ICheckOutPayload => {
  try {
    let total = 0;
    if (checkOutBasket.items.length === 0)
      throw new Error('Check out items do not exist!');
    checkOutBasket.items.forEach(
      (item: { price: number }) => (total += item.price)
    );
    checkOutRequest.totalPrice = total;
    Object.assign(checkOutRequest, checkOutBasket);
    return checkOutRequest;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const publishCheckOutEvent = async (
  publishedEventPayload: ICheckOutPayload
): Promise<PutEventsCommandOutput> => {
  try {
    const params: PutEventsCommandInput = {
      Entries: [
        {
          Source: process.env.EVENT_SOURCE,
          Detail: JSON.stringify(publishedEventPayload),
          DetailType: process.env.EVENT_DETAILTYPE,
          Resources: [],
          EventBusName: process.env.EVENT_BUSNAME,
        },
      ],
    };

    const data = await ebClient.send(new PutEventsCommand(params));

    console.log('Success, event sent; requestID:', data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

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
      : {
          message: `No items found for ${username}`,
        };
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

const createCheckoutBasket = async (body: string | null) => {
  const data = JSON.parse(body!);
  const params: PutItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall({ ...data } || {}),
  };
  try {
    const { Attributes } = await ddbClient.send(new PutItemCommand(params));
    return {
      message: 'Checkout basket created',
      data: Attributes,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const submitCheckoutBasket = async (event: APIGatewayEvent) => {
  if (event.body === null) throw new Error('Provide an event body');
  const payload: ICheckOutPayload = JSON.parse(event.body);
  if (!payload.username) throw new Error('Provide a username');
  let basketItems;

  // 1. get basket items
  try {
    basketItems = await getCheckOutByUsername(payload.username);
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (!basketItems.checkout)
    throw new Error('The user does not have any items in the basket');

  // 2. prepare order payload
  const orderPayload = handleOrderPayload(payload, basketItems.checkout);

  // 3. publish event to event bridge

  try {
    await publishCheckOutEvent(orderPayload);
  } catch (error) {
    console.error(error);
    throw error;
  }

  // 4. delete basket item
  try {
    await deleteCheckout(payload.username);
    return {
      message: 'Items checked out successfully',
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteCheckout = async (username: string) => {
  const params: DeleteItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ username }),
  };
  try {
    await ddbClient.send(new DeleteItemCommand(params));
    return {
      message: 'Checkout deleted',
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export {
  getCheckOutByUsername,
  getCheckOut,
  deleteCheckout,
  createCheckoutBasket,
  submitCheckoutBasket,
};
