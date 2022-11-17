import { Stack, StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { ServerlessV1Database } from './database/infrastructure';
import { ServerlessV1Microservices } from './api/microservices';
import { ServerlessV1ApiGateway } from './api/api-gateway';

// class open for extension but closed for modification
export class ServerlessV1Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new ServerlessV1Database(this, 'Database');
    const microservice = new ServerlessV1Microservices(this, 'Microservice', {
      productsTable: database.productsTable,
      checkOutTable: database.checkOutTable,
    });
    const apiGateway = new ServerlessV1ApiGateway(this, 'ApiGateway', {
      productFn: microservice.productFn,
      checkOutFn: microservice.checkoutFn,
    });
  }
}
