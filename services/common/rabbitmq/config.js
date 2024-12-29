import { connect as _connect } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL;

async function connect() {
  try {
    return await _connect(RABBITMQ_URL);
  } catch (error) {
    console.error('Not connected to MQ Server', error);
  }
}

const mq = connect();

export  { mq };
