'use strict';

const { Kafka, logLevel } = require('kafkajs');

let producer;
let kafka;

function getKafka() {
    if (!kafka) {
        kafka = new Kafka({
            clientId: 'redirect-service',
            brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
            logLevel: logLevel.WARN,
            retry: {
                initialRetryTime: 300,
                retries: 10,
            },
        });
    }
    return kafka;
}

async function getProducer() {
    if (!producer) {
        producer = getKafka().producer({
            allowAutoTopicCreation: true,
            idempotent: false,
            maxInFlightRequests: 5,
        });
        await producer.connect();
        console.log('[Kafka] Producer connected');

        producer.on('producer.disconnect', () => {
            console.warn('[Kafka] Producer disconnected, resetting...');
            producer = null;
        });
    }
    return producer;
}

/**
 * Fire-and-forget Kafka publish.
 * Errors are logged but never thrown to avoid blocking the redirect response.
 */
async function publishClickEvent(payload) {
    try {
        const p = await getProducer();
        await p.send({
            topic: 'url_clicks',
            messages: [
                {
                    key: payload.shortId,
                    value: JSON.stringify(payload),
                },
            ],
        });
    } catch (err) {
        console.error('[Kafka] Failed to publish click event:', err.message);
    }
}

module.exports = { publishClickEvent };
