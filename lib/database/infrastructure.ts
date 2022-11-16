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
    // products dynamoDB table
    const productsTable = new Table(scope, 'products', {
      partitionKey: { name: 'id', type: AttributeType['STRING'] },
      tableName: 'products',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    const checkOutTable = new Table(scope, 'check-out', {
      partitionKey: { name: 'username', type: AttributeType['STRING'] },
      tableName: 'check-out',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    this.productsTable = productsTable;
    this.checkOutTable = checkOutTable;
  }
}
