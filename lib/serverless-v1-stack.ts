import { Stack, StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { ServerlessV1Database } from './database/infrastructure';
import { ServerlessV1Microservices } from './api/microservices';
import { ServerlessV1ApiGateway } from './api/api-gateway';
import { ServerlessV1EventBus } from './events/eventbus';

// class open for extension but closed for modification
export class ServerlessV1Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new ServerlessV1Database(this, 'Database');
    const microservice = new ServerlessV1Microservices(this, 'Microservice', {
      productsTable: database.productsTable,
      checkOutTable: database.checkOutTable,
      ordersTable: database.ordersTable,
    });
    const apiGateway = new ServerlessV1ApiGateway(this, 'ApiGateway', {
      productFn: microservice.productFn,
      checkOutFn: microservice.checkoutFn,
      ordersFn: microservice.ordersFn,
    });

    const eventBus = new ServerlessV1EventBus(this, 'EventBus', {
      publisherFunction: microservice.checkoutFn,
      targetFunction: microservice.ordersFn,
    });
  }
}
