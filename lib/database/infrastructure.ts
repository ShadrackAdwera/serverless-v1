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

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.productsTable = this.createProductsTable();
    this.checkOutTable = this.createCheckoutTable();
  }

  createProductsTable(): ITable {
    const productsTable = new Table(this, 'products', {
      partitionKey: { name: 'id', type: AttributeType['STRING'] },
      tableName: 'products',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    return productsTable;
  }

  createCheckoutTable(): ITable {
    const checkOutTable = new Table(this, 'check-out', {
      partitionKey: { name: 'username', type: AttributeType['STRING'] },
      tableName: 'check-out',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    return checkOutTable;
  }
}
