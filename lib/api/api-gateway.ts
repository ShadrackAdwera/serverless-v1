import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

interface IServerlessV1ApiGatewayProps {
  productFn: NodejsFunction;
}

export class ServerlessV1ApiGateway extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: IServerlessV1ApiGatewayProps
  ) {
    super(scope, id);

    const apiGateway = new LambdaRestApi(this, 'productsApi', {
      restApiName: 'Products Service API',
      handler: props.productFn,
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
