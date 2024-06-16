import React, { useState } from 'react';
import { View, Button, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import GetTransferDataModal from './GetTransferDataModal';
import GetTransferDataModalPO from './GetTransferDataModalPO';

const ExcelPickerPO = (props: any) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [jsonData, setJsonData] = useState(null);
    const [transferData, setTransferData] = useState({});

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleFilePicker = async (location: string, referenceNumber: string, date: string, receivedBy: string,invoiceNumber:string) => {
        try {
            if (!location || !referenceNumber || !receivedBy ) {
                alert('Please fill in all fields');
                return;
            }
            const data = {
                location, referenceNumber, date, receivedBy,transferNo:invoiceNumber
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
                    const updatedArray = data.map((item: any) => ({
                        "Ship Qty.":item["Ordered"],
                        "Line Desc":item["Item Description"],
                        "Item Code":item["Item Code"],
                        ["scanned"]: false
                    }));
                 
                    props.setTransferData(updatedArray);
                    const date = new Date().toLocaleString();
                    console.log(date)
                    props.setStartingTime(date)
                }


            }
        } catch (err) {
            console.error(err);
        }
    };
    if (!(props.transferData.length > 0)) {


        return (
            <View>
                <GetTransferDataModalPO isVisible={isModalVisible} onClose={toggleModal} pickFile={handleFilePicker} />

                <TouchableOpacity onPress={toggleModal} style={{ backgroundColor: '#009959', alignItems: 'center', padding: 20, borderRadius: 40, marginTop: 20 }}>
                    <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Select PO File</Text>
                </TouchableOpacity>
            </View>


        );
    }
};

export default ExcelPickerPO;
