import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue, IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface QueueProps {
  consumer: IFunction;
}

export class ServerlessV1Queue extends Construct {
  public readonly orderQueue: IQueue;
  constructor(scope: Construct, id: string, props: QueueProps) {
    super(scope, id);
    this.orderQueue = new Queue(this, 'OrderQueue', {
      queueName: 'OrderQueue',
      visibilityTimeout: Duration.seconds(30),
    });
    props.consumer.addEventSource(
      new SqsEventSource(this.orderQueue, {
        batchSize: 1,
      })
    );
  }
}
