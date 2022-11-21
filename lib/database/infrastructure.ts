import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import {
  Table,
  AttributeType,
  BillingMode,
  ITable,
} from 'aws-cdk-lib/aws-dynamodb';

export class ServerlessV1Database extends Construct {
  public readonly productsTable: ITable;
  public readonly checkOutTable: ITable;
  public readonly ordersTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.productsTable = this.createProductsTable();
    this.checkOutTable = this.createCheckoutTable();
    this.ordersTable = this.createOrdersTable();
  }

  private createProductsTable(): ITable {
    const productsTable = new Table(this, 'products', {
      partitionKey: { name: 'id', type: AttributeType['STRING'] },
      tableName: 'products',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    return productsTable;
  }

  private createCheckoutTable(): ITable {
    const checkOutTable = new Table(this, 'check-out', {
      partitionKey: { name: 'username', type: AttributeType['STRING'] },
      tableName: 'check-out',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    return checkOutTable;
  }

  private createOrdersTable(): ITable {
    const ordersTable = new Table(this, 'orders', {
      partitionKey: { name: 'id', type: AttributeType['STRING'] },
      tableName: 'orders',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    return ordersTable;
  }
}
