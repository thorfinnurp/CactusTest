const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3000;
const app = express();
const amqp = require('amqplib/callback_api');

const o = 'ORDER'

const messageBrokerInfo = {
    exchanges: {
        order: 'order_exchange'
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
    Object.values(messageBrokerInfo.exchanges).forEach(val => {
        channel.assertExchange(val, 'direct', { durable: true });
    });
};

(async () => {
    const messageBrokerConnection = await createMessageBrokerConnection();
    const channel = await createChannel(messageBrokerConnection);

    configureMessageBroker(channel);

    const { order } = messageBrokerInfo.exchanges;
    const { createOrder } = messageBrokerInfo.routingKeys;

    app.use(bodyParser.json());

    // TODO: Setup route
    app.post('/api/orders/', (req, res) =>{ 

        const { body } = req
        const bodyJson = JSON.stringify(body)

        channel.publish(order, 
                        createOrder,
                        new Buffer(bodyJson))

        return res
                .status(200)
                .send("o r d e r        p l  a c e d ")
    })

    app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
})().catch(e => console.error(e));
