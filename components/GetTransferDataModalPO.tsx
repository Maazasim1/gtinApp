import React, { ReactEventHandler, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

const GetTransferDataModalPO = ({ isVisible, onClose, pickFile }: any) => {
    const [refereceNumber, setReferenceNumber] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [receivedBy, setReceivedBy] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const handleDateChange = (event, selectedDate:Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
    };



    return (
        <Modal isVisible={isVisible}>
            <View style={styles.modalContent}>
                <Text style={styles.title}>PO Form</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Reference No"
                    value={refereceNumber}
                    onChangeText={setReferenceNumber}
                    placeholderTextColor={'gray'}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Invoice No"
                    value={invoiceNumber}
                    onChangeText={setInvoiceNumber}
                    placeholderTextColor={'gray'}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.input}>
                        {date.toDateString()}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholder="Received By"
                    value={receivedBy}
                    onChangeText={setReceivedBy}
                    placeholderTextColor={'gray'}
                />

                <Pressable onPress={() => pickFile("No location in PO report", refereceNumber, date, receivedBy,invoiceNumber)} style={{ backgroundColor: '#009959', alignItems: 'center', padding: 20, borderRadius: 40, marginTop: 20 }}>
                    <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Import File</Text>
                </Pressable>
                <Pressable onPress={onClose} style={{ borderWidth: 1, borderColor: '#009959', backgroundColor: '#fff', alignItems: 'center', padding: 20, borderRadius: 40, marginTop: 20 }}>
                    <Text style={{ color: 'black', fontWeight: 600, fontSize: 16 }}>Close Modal</Text>
                </Pressable>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 10,
        padding: 8,
    },
});

export default GetTransferDataModalPO;
