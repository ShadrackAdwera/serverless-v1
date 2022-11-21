import { EventBus, IEventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface IEventBusProps {
  publisherFunction: IFunction;
  targetFunction: IFunction;
}

export class ServerlessV1EventBus extends Construct {
  constructor(scope: Construct, id: string, props: IEventBusProps) {
    super(scope, id);
    const bus = this.generateEventBus();
    const checkoutBasketRule = this.generateRule();
    // this.orderingFn
    checkoutBasketRule.addTarget(new LambdaFunction(props.targetFunction));
    bus.grantPutEventsTo(props.publisherFunction);
  }

  private generateEventBus(): IEventBus {
    const eventBus = new EventBus(this, 'ServerlessV1EventBus', {
      eventBusName: 'ServerlessV1EventBus',
    });
    return eventBus;
  }

  private generateRule(): Rule {
    const rule = new Rule(this, 'ServerlessV1CheckoutRule', {
      eventBus: this.generateEventBus(),
      enabled: true,
      description: 'Handle check out events from checkout microservice',
      eventPattern: {
        source: ['com.serverless.checkout.items'],
        detailType: ['CheckoutItems'],
      },
      ruleName: 'ServerlessV1CheckoutRule',
    });
    return rule;
  }
}
