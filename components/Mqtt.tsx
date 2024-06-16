import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Client, Message } from 'react-native-paho-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Mqtt = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState('');
    const [topic, setTopic] = useState('public/test');
    const [mqttMessage, setMqttMessage] = useState('');
    const [client, setClient] = useState(null);

    useEffect(() => {
        const mqttClient = new Client({
            uri: 'ws://broker.emqx.io:8083/testTopic',
            clientId: 'id_' + (Math.random()*100000),
            storage: AsyncStorage,
        });

        mqttClient.on('connectionLost', (responseObject) => {
            if (responseObject.errorCode !== 0) {
                console.log(`Connection Lost: ${responseObject.errorMessage}`);
                setIsConnected(false);
            }
        });

        mqttClient.on('messageReceived', (message) => {
            setMqttMessage(message.payloadString);
            console.log(`Message received on topic ${message.destinationName}: ${message.payloadString}`);
        });

        mqttClient.connect({
            onSuccess: () => {
                setIsConnected(true);
                mqttClient.subscribe(topic);
            },
            onFailure: (responseObject) => {
                console.log(`Failed to connect: ${responseObject.errorMessage}`);
            },
        });

        setClient(mqttClient);

        return () => {
            if (mqttClient.isConnected()) {
                mqttClient.disconnect();
            }
        };
    }, [topic]);

    const publishMessage = () => {
        if (client && client.isConnected()) {
            const mqttMessage = new Message(message);
            mqttMessage.destinationName = topic;
            client.send(mqttMessage);
            setMessage('');
        }
    };

    return (
        <View>
            {
                isConnected ?

                    <Text>{mqttMessage}</Text> : <Text>Not Connected</Text>
            }

        </View>
    );
}

export default Mqtt;