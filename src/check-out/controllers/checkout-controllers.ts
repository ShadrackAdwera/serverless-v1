import { GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ddbClient } from '../libs/ddbClient';

const getCheckOut = async (username: string) => {
  const params: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ username }),
  };
  try {
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
