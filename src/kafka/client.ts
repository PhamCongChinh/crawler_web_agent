import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "app",
    brokers: ["103.97.125.64:9092"]
})

export default kafka