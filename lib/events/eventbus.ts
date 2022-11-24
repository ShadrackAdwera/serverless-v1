import { EventBus, IEventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export const EVENT_SOURCE = 'com.serverless.checkout.items';
export const EVENT_DETAILTYPE = 'CheckoutItems';
export const EVENT_BUSNAME = 'OrdersCheckoutEventBus';

interface IEventBusProps {
  publisherFunction: IFunction;
  targetFunction: IFunction;
}

export class ServerlessV1EventBus extends Construct {
  constructor(scope: Construct, id: string, props: IEventBusProps) {
    super(scope, id);
    // event bus
    const bus = this.generateEventBus();
    bus.grantPutEventsTo(props.publisherFunction);
    // rule
    const checkoutBasketRule = this.generateRule(bus);
    checkoutBasketRule.addTarget(new LambdaFunction(props.targetFunction));
  }

  private generateEventBus(): IEventBus {
    const eventBus = new EventBus(this, 'OrdersCheckoutEventBus', {
      eventBusName: EVENT_BUSNAME,
    });
    return eventBus;
  }

  private generateRule(bus: IEventBus): Rule {
    const rule = new Rule(this, 'ServerlessV1CheckoutRule', {
      eventBus: bus,
      enabled: true,
      description: 'Handle check out events from checkout microservice',
      eventPattern: {
        source: [EVENT_SOURCE],
        detailType: [EVENT_DETAILTYPE],
      },
      ruleName: 'ServerlessV1CheckoutRule',
    });
    return rule;
  }
}

/**
 * SAMPLE EVENT
 * [
  { "Source": "com.serverless.checkout.items", 
  "Detail": "{ "username": "abc", "item": "item 1" }", 
  "Resources": ["resource1","resource2"], 
  "DetailType": "CheckoutItems", 
  "EventBusName":"OrdersCheckoutEventBus" 
}
  ]
 * 
 */
