import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const NumericPicker = ({selectedNumber, setSelectedNumber}:any) => {
    

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select a Number:</Text>
            <Picker
                selectedValue={selectedNumber}
                onValueChange={(itemValue) => setSelectedNumber(itemValue)}
                style={styles.picker}
            >
                {[...Array(10).keys()].map((number) => (
                    <Picker.Item key={number + 1} label={(number + 1).toString()} value={number + 1} />
                ))}
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    picker: {
        width: 200,
        height: 50,
    },
});

export default NumericPicker;
