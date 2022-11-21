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
  ordersTable: ITable;
}

export class ServerlessV1Microservices extends Construct {
  public readonly productFn: NodejsFunction;
  public readonly checkoutFn: NodejsFunction;
  public readonly ordersFn: NodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    props: IServerlessV1MicroserviceProps
  ) {
    super(scope, id);
    this.productFn = this.createProductFunction(props);
    this.checkoutFn = this.createCheckOutFunction(props);
    this.ordersFn = this.createOrdersFunction(props);
  }

  private getFnProps(): NodejsFunctionProps {
    const nodeJsFnProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
      runtime: Runtime['NODEJS_16_X'],
    };
    return nodeJsFnProps;
  }

  private createProductFunction(
    props: IServerlessV1MicroserviceProps
  ): NodejsFunction {
    const productFn = new NodejsFunction(this, 'productsLambdaFn', {
      entry: path.join(__dirname, '/../../src/products/index.ts'),
      environment: {
        DYNAMODB_TABLE_NAME: props.productsTable.tableName,
        PRIMARY_KEY: 'id',
      },
      ...this.getFnProps(),
    });

    props.productsTable.grantReadWriteData(productFn);
    return productFn;
  }
  private createCheckOutFunction(
    props: IServerlessV1MicroserviceProps
  ): NodejsFunction {
    const checkOutFn = new NodejsFunction(this, 'checkOutLambdaFn', {
      entry: path.join(__dirname, '/../../src/check-out/index.ts'),
      environment: {
        DYNAMODB_TABLE_NAME: props.checkOutTable.tableName,
        PRIMARY_KEY: 'username',
      },
      ...this.getFnProps(),
    });

    props.checkOutTable.grantReadWriteData(checkOutFn);
    return checkOutFn;
  }

  private createOrdersFunction(
    props: IServerlessV1MicroserviceProps
  ): NodejsFunction {
    const ordersFn = new NodejsFunction(this, 'ordersLambdaFn', {
      entry: path.join(__dirname, '/../../src/orders/index.ts'),
      environment: {
        DYNAMODB_TABLE_NAME: props.ordersTable.tableName,
        PRIMARY_KEY: 'id',
      },
      ...this.getFnProps(),
    });
    props.ordersTable.grantReadWriteData(ordersFn);
    return ordersFn;
  }
}
