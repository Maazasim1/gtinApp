import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';


// Function to generate and save the report
const generateReport = async (data: any, transferNo: string) => {

    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: "xlsx"
    });
    const uri = FileSystem.cacheDirectory + `${transferNo}.xlsx`;
    console.log(`Writing to ${JSON.stringify(uri)} with text: ${wbout}`);
    await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64
    });
    return uri;
};

// Function to share the report
const shareReport = async (filePath: any) => {
    try {
        await Sharing.shareAsync(filePath);
    } catch (error) {
        console.error('Error sharing file:', error);
    }
};

const createReportData = (transferData: any, originalData: any) => {
    const originalArray: any[][] = [];
    const transferArray: any[][] = [];
    const finalArray: any[][] = [];
    //items["Order Qty."]} key={index} code={items["Item Code"]} name={items["Line Desc"]} scanned={items["scanned"]
    if (transferData.length > 0) {
        originalData.map((items) => {
            originalArray.push([items["Item Code"], items["Line Desc"], items["Order Qty."]])
        })
        transferData.map((items) => {
            transferArray.push([items["Item Code"], items["Line Desc"], items["Order Qty."]])
        })

        for (let index = 0; index < originalArray.length; index++) {
            let received=originalArray[index][2] - transferArray[index][2]
            let expected=parseInt(originalArray[index][2])
            let variance = received-expected
            finalArray.push([originalArray[index][0], originalArray[index][1], expected, received, variance])
        }
        return finalArray;


    }
}
// Combine everything in a component
const ReportScreen = ({ transferData, originalData, clearCache, setOriginalData, date, location, checkedBy, receivedBy, transferNo, setTransferData }: any) => {
    const data: any[][] = [
        [["Location/Site No :"], ["Date Received :"], ["Transfer No :"], ["Received By"], ["Checked By"]],
        [location, date, transferNo, receivedBy, checkedBy],
        [],
        [["Pronto Code: This needs to be in full as it appears in system"], ["Product Description"], ["Expected Quantity"], ["Received Quantity"], ["Variance (+ -)"]],
    ];

    const handleGenerateAndShareReport = async () => {
        const tempArray = createReportData(transferData, originalData);
        const compileReport = data.concat(tempArray);
        const filePath = await generateReport(compileReport, transferNo);
        if (filePath) {
            await shareReport(filePath);
            // setTransferData([]);
            // setOriginalData([]);
            // await clearCache();
        }
    };

    const totalItem = (array: any[]): number => {
        const summation = array.reduce((prevItem: number, nextItem: any) => {
            return prevItem + parseInt(nextItem["Order Qty."]);
        }, 0);
        return summation;
    };

    const alertForChoice = async () => {
        Alert.alert('Finish Transfer', 'would you like to end the transfer or continue on a later date', [
            {
                text: 'Finish',
                onPress: () => handleFinishTranfer(),
                style: 'cancel',
            },
            { text: 'Coninue Later', onPress: () => handleContinueLater("toBeContinued") },
            { text: 'Cancel', onPress: () => console.log('cancel Pressed') },
        ]);
    }

    async function handleFinishTranfer() {
        if (totalItem(transferData) !== totalItem(originalData)) {
            Alert.alert('Unfinished Transfer', 'All the items have not been scanned would you like to finish the transfer', [
                {
                    text: "Cancel",
                    onPress: () => console.log("cancel pressed during finish"),
                },
                {
                    text: "Finish",
                    onPress: async () => {
                        const tempArray = createReportData(transferData, originalData);
                        const compileReport = data.concat(tempArray);
                        const filePath = await generateReport(compileReport, transferNo);
                        if (filePath) {
                            await shareReport(filePath);
                            setTransferData([]);
                            setOriginalData([]);
                            await clearCache();
                        }
                        await handleContinueLater("finished")
                    },
                },
            ]
            )
        }


    }

    async function handleContinueLater(status: string) {
        const history = await AsyncStorage.getItem('history')
        if (history) {
            const parsed = JSON.parse(history);
            const consolidatedArray = { status, transferData, originalData, date, location, checkedBy, receivedBy, transferNo };
            parsed.push(consolidatedArray);
            await AsyncStorage.setItem('history', JSON.stringify(parsed));
            DeviceEventEmitter.emit('historyUpdate', consolidatedArray);
            router.push({
                pathname: '/explore'
            })
        }
        else {
            const consolidatedArray = { status, transferData, originalData, date, location, checkedBy, receivedBy, transferNo };
            await AsyncStorage.setItem('history', JSON.stringify([consolidatedArray]));
            DeviceEventEmitter.emit('historyUpdate', consolidatedArray);
            router.push({
                pathname: '/explore'
            })
        }

    }

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            flex: 0.2,
        }}>
            <TouchableOpacity style={{ backgroundColor: '#009959', alignItems: 'center', padding: 20, borderRadius: 40 }} onPress={handleGenerateAndShareReport}>
                <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Export Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#009959', alignItems: 'center', padding: 20, borderRadius: 40 }} onPress={alertForChoice}>
                <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Finish Transfer</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ReportScreen;
