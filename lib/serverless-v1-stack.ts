import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';

import { Construct } from 'constructs';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ServerlessV1Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productTable = new Table(this, 'products', {
      partitionKey: { name: 'id', type: AttributeType['STRING'] },
      tableName: 'products',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });

    const nodeJsFnProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime['NODEJS_16_X'],
    };

    const productFn = new NodejsFunction(this, 'productsLambdaFn', {
      entry: path.join(__dirname, '/../src/products/index.ts'),
      ...nodeJsFnProps,
    });

    productTable.grantReadWriteData(productFn);

    const apiGateway = new LambdaRestApi(this, 'productsApi', {
      restApiName: 'Products Service API',
      handler: productFn,
      proxy: false,
    });
    const products = apiGateway.root.addResource('products');
    products.addMethod('GET'); // GET /products
    products.addMethod('POST'); // POST /products

    // single product
    const product = products.addResource('{id}'); // /products/:id
    product.addMethod('GET'); // GET product by id
    product.addMethod('PATCH'); // PATCH update product
    product.addMethod('DELETE'); // DELETE delete product
  }
}
