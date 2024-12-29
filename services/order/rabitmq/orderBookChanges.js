import { SendMessageQueue } from '../../common/rabbitmq/sendMessage.js';

const ORDER_BOOK_CHANGES_QUEUE = process.env.ORDER_BOOK_CHANGES_QUEUE;

const sendMessageQueue = new SendMessageQueue(ORDER_BOOK_CHANGES_QUEUE);

export { sendMessageQueue };
