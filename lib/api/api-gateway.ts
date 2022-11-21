import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface IServerlessV1ApiGatewayProps {
  productFn: IFunction;
  checkOutFn: IFunction;
  ordersFn: IFunction;
}

export class ServerlessV1ApiGateway extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: IServerlessV1ApiGatewayProps
  ) {
    super(scope, id);
    this.createProductsApis(props.productFn);
    this.createCheckoutApis(props.checkOutFn);
    this.createOrdersApis(props.ordersFn);
  }

  createProductsApis(productFn: IFunction): void {
    const productsApiGateway = new LambdaRestApi(this, 'productsApis', {
      restApiName: 'Products Service API',
      handler: productFn,
      proxy: false,
    });
    const products = productsApiGateway.root.addResource('products');
    products.addMethod('GET'); // GET /products
    products.addMethod('POST'); // POST /products

    // single product
    const product = products.addResource('{id}'); // /products/:id
    product.addMethod('GET'); // GET product by id
    product.addMethod('PATCH'); // PATCH update product
    product.addMethod('DELETE'); // DELETE delete product
  }

  createCheckoutApis(checkoutFn: IFunction): void {
    const checkoutApiGateway = new LambdaRestApi(this, 'checkoutApis', {
      restApiName: 'Checkout REST API',
      handler: checkoutFn,
      proxy: false,
    });
    const checkout = checkoutApiGateway.root.addResource('checkout');
    checkout.addMethod('GET'); // GET: /checkout
    checkout.addMethod('POST'); // POST create new checkout basket

    const checkoutItems = checkout.addResource('{username}'); // /basket/{username}
    checkoutItems.addMethod('GET');
    checkoutItems.addMethod('DELETE');

    const submitCheckout = checkout.addResource('submit-checkout'); // /checkout/submit-checkout
    submitCheckout.addMethod('POST'); // submit checkout items to event bridge
  }

  createOrdersApis(ordersFn: IFunction): void {
    const ordersApiGateway = new LambdaRestApi(this, 'ordersApis', {
      restApiName: 'orders',
      handler: ordersFn,
      proxy: false,
    });
    const orders = ordersApiGateway.root.addResource('orders');
    orders.addMethod('GET'); // GET: /orders
    const orderByUsername = orders.addResource('{username}');
    orderByUsername.addMethod('GET'); // GET: /orders/{username}
  }
}
