
const amqp = require('amqplib/callback_api');

const messageBrokerInfo = {
    exchanges: {
        order: 'order_exchange'
    },
    queues: {
        orderQueue: 'order_queue'
    },
    routingKeys: {
        createOrder: 'orders'
    }
}

const createMessageBrokerConnection = () => new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) { reject(err); }
        resolve(conn);
    });
});

const createChannel = connection => new Promise((resolve, reject) => {
    connection.createChannel((err, channel) => {
       if (err) { reject(err); }
        resolve(channel);
    });
});

const configureMessageBroker = channel => {
    const { order }         = messageBrokerInfo.exchanges
    const { orderQueue }    = messageBrokerInfo.queues
    const { createOrder }   = messageBrokerInfo.routingKeys

    channel.assertExchange(order, 'direct', { durable: true })
    channel.assertQueue(orderQueue, { durable: true })
    channel.bindQueue(orderQueue, order, createOrder)
};

(async () => {
    const messageBrokerConnection = await createMessageBrokerConnection()
    const channel = await createChannel(messageBrokerConnection)

    configureMessageBroker(channel)

    const { order }          = messageBrokerInfo.exchanges
    const { orderQueue }    = messageBrokerInfo.queues
    const { output }        = messageBrokerInfo.routingKeys

    channel.consume(orderQueue, data => {
        console.log(data.content.toString())
    })
})().catch(e => console.error(e))