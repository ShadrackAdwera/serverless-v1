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
  checkOutTable: ITable;
}

export class ServerlessV1Microservices extends Construct {
  public readonly productFn: NodejsFunction;
  public readonly checkoutFn: NodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    props: IServerlessV1MicroserviceProps
  ) {
    super(scope, id);
    this.productFn = this.createProductFunction(props);
    this.checkoutFn = this.createCheckOutFunction(props);
  }

  getFnProps(): NodejsFunctionProps {
    const nodeJsFnProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
      runtime: Runtime['NODEJS_16_X'],
    };
    return nodeJsFnProps;
  }

  createProductFunction(props: IServerlessV1MicroserviceProps): NodejsFunction {
    const productFn = new NodejsFunction(this, 'productsLambdaFn', {
      entry: path.join(__dirname, '/../../src/products/index.ts'),
      ...this.getFnProps(),
      environment: {
        DYNAMODB_TABLE_NAME: props.productsTable.tableName,
        PRIMARY_KEY: 'id',
      },
    });

    props.productsTable.grantReadWriteData(productFn);
    return productFn;
  }
  createCheckOutFunction(
    props: IServerlessV1MicroserviceProps
  ): NodejsFunction {
    const checkOutFn = new NodejsFunction(this, 'checkOutLambdaFn', {
      entry: path.join(__dirname, '/../../src/check-out/index.ts'),
      ...this.getFnProps(),
      environment: {
        DYNAMODB_TABLE_NAME: props.checkOutTable.tableName,
        PRIMARY_KEY: 'username',
      },
    });

    props.checkOutTable.grantReadWriteData(checkOutFn);
    return checkOutFn;
  }
}
