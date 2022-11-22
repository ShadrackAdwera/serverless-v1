import { GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from '../libs/ddbClient';

const getOrders = () => {
  const params: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ username: '' }),
  };
};
