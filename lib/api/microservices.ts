import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import * as path from 'path';

interface IServerlessV1MicroserviceProps {
  productsTable: ITable;
}

export class ServerlessV1Microservices extends Construct {
  public readonly productFn: NodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    props: IServerlessV1MicroserviceProps
  ) {
    super(scope, id);

    const nodeJsFnProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: props.productsTable.tableName,
      },
      runtime: Runtime['NODEJS_16_X'],
    };

    const productFn = new NodejsFunction(this, 'productsLambdaFn', {
      entry: path.join(__dirname, '/../../src/products/index.ts'),
      ...nodeJsFnProps,
    });

    props.productsTable.grantReadWriteData(productFn);
    this.productFn = productFn;
  }
}
