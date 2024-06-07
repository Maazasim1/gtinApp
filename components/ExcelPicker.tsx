import React, { useState } from 'react';
import { View, Button, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import GetTransferDataModal from './GetTransferDataModal';

const ExcelPicker = (props: any) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [jsonData, setJsonData] = useState(null);
    const [transferData, setTransferData] = useState({});

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleFilePicker = async (location: string, transferNo: string, date: string, receivedBy: string, checkedBy: string) => {
        try {
            if (!location || !transferNo || !receivedBy || !checkedBy) {
                alert('Please fill in all fields');
                return;
            }
            const data = {
                location, transferNo, date, receivedBy, checkedBy
            }
            props.setUserData(data);
            const res = await DocumentPicker.getDocumentAsync({
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            if (res.assets) {
                const fileUri = res.assets[0].uri;

                // Read the file as a base64 string
                const fileContents = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // Convert base64 to binary string
                const binaryStr = atob(fileContents);

                // Convert binary string to array buffer
                const arrayBuffer = new Uint8Array(
                    [...binaryStr].map(char => char.charCodeAt(0))
                ).buffer;

                // Parse Excel file
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const data: any = XLSX.utils.sheet_to_json(sheet);
                console.log(data)
                if (data) {
                    const updatedArray = data.map(item => ({
                        ...item,
                        ["scanned"]: false
                    }));
                    props.setTransferData(updatedArray);
                }


            }
        } catch (err) {
            console.error(err);
        }
    };
    if (!(props.transferData.length > 0)) {


        return (
            <View>
                <GetTransferDataModal isVisible={isModalVisible} onClose={toggleModal} pickFile={handleFilePicker} />

                <TouchableOpacity onPress={toggleModal} style={{ backgroundColor: '#009959', alignItems: 'center', padding: 20, borderRadius: 40, marginTop: 20 }}>
                    <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Select Transfer File</Text>
                </TouchableOpacity>
            </View>


        );
    }
};

export default ExcelPicker;
