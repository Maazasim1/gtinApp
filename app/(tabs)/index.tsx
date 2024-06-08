import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity, ToastAndroid, DeviceEventEmitter, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransferCard from '@/components/TransferCard';
import ExcelPicker from '@/components/ExcelPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportScreen from '@/components/ReportScreen';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-root-toast';
import LastItemCard from '@/components/LastItemCard';
import { router } from 'expo-router';
import React from 'react';

export default function HomeScreen() {
  const [transferData, setTransferData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [scan, setScan] = useState("")
  const [date, setDate] = useState("")
  const [lastScanned, setLastScanned] = useState("")
  const [code, setCode] = useState("")

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('cameraScan', (eventData) => {
      console.log("Camera scan event received", eventData);
      handleScanCamera(eventData);
    });

    return () => {
      subscription.remove();
    };
  }, [handleScanCamera]);

  useEffect(() => {
    const handleTransferUpdate = (eventData: any[]) => {
      console.log(transferData.length);
      if (transferData.length > 0) {
        Alert.alert(
          'Lose Transfer',
          'All changes will be lost from the current transfer if you load this one, continue?',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                setTransferData(eventData.transferData);
                setOriginalData(eventData.originalData);
              },
            },
          ]
        );
      } else {
        setTransferData(eventData.transferData);
        setOriginalData(eventData.originalData);
      }
    };

    const subscription = DeviceEventEmitter.addListener('transferUpdate', handleTransferUpdate);

    return () => {
      subscription.remove();
    };
  }, [transferData.length]);


  useEffect(() => {
    if (originalData.length === 0) {
      setOriginalData(transferData)

    }
    else {
      saveCache()
    }
  }, [transferData])

  useEffect(() => {
    getCacheAndSetState(setTransferData, setUserData);
  }, [])

  const saveCache = async () => {
    await AsyncStorage.setItem("originalData", JSON.stringify(originalData));
    await AsyncStorage.setItem("data", JSON.stringify(transferData));
    await AsyncStorage.setItem("location", userData.location);
    await AsyncStorage.setItem("date", JSON.stringify(userData.date));
    await AsyncStorage.setItem("transferNumber", userData.transferNo);
    await AsyncStorage.setItem("received", userData.receivedBy);
    await AsyncStorage.setItem("checked", userData.checkedBy);
  }

  const getCacheAndSetState = async (setTransferData, setUserData) => {
    try {
      // await AsyncStorage.clear()
      const ogData = await AsyncStorage.getItem("originalData");
      const data = await AsyncStorage.getItem("data");
      const location = await AsyncStorage.getItem("location");
      const cachedDate = await AsyncStorage.getItem("date");
      const transferNumber = await AsyncStorage.getItem("transferNumber");
      const received = await AsyncStorage.getItem("received");
      const checked = await AsyncStorage.getItem("checked");
      const date = await AsyncStorage.getItem("date")

      if (data !== null) {
        setTransferData(JSON.parse(data));

      }
      if (ogData !== null) {
        setOriginalData(JSON.parse(ogData));
      }

      setUserData((prevUserData) => ({
        ...prevUserData,
        location: location || prevUserData.location,
        transferNo: transferNumber || prevUserData.transferNo,
        receivedBy: received || prevUserData.receivedBy,
        checkedBy: checked || prevUserData.checkedBy,
        date: date || prevUserData.date,
      }));


    } catch (error) {
      console.error("Error retrieving data from cache", error);
    }
  }

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem("data");
      await AsyncStorage.removeItem("location");
      await AsyncStorage.removeItem("date");
      await AsyncStorage.removeItem("transferNumber");
      await AsyncStorage.removeItem("received");
      await AsyncStorage.removeItem("checked");
    } catch (error) {
      console.error("Error clearing cache", error);
    }
  }

  const isValidGTIN = (gtin: string) => {
    const gtinRegex = /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/;
    return gtinRegex.test(gtin);
  }



  const handleScanCamera = React.useCallback(async (gtin: string) => {
    setScan(gtin)
    if (isValidGTIN(gtin)) {
      const data = await searchGtin(gtin);
      console.log(data)

      if (data) {
        const index = transferData.findIndex((item) => item["Item Code"] === data.itemCode);
        console.log(transferData)
        if (index !== -1) {
          setLastScanned(transferData[index]["Line Desc"])
          if (parseInt(transferData[index]["Order Qty."]) === 0) {
            Alert.alert('Extra item detected', "You have already scanned all of this item. Would you like to scan an extra item?", [
              {
                text: 'Cancel',
                onPress: () => {
                  console.log('Cancel Pressed');
                  return;
                },
                style: 'cancel',
              },
              {
                text: 'OK', onPress: () => {
                  const updatedTransferData = transferData.map((item: any, i) =>
                    i === index ? { ...item, "Order Qty.": (parseInt(item["Order Qty."]) - 1).toString() } : item
                  );
                  //ts-ignore
                  setTransferData(updatedTransferData);

                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  )
                  let toast = Toast.show('Scanned Successfully', {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.TOP
                  });



                  setScan("")

                }
              },
            ]);

          }
          else {

            const updatedTransferData = transferData.map((item: any, i) =>
              i === index ? { ...item, "Order Qty.": (parseInt(item["Order Qty."]) - 1).toString() } : item
            );
            setTransferData(updatedTransferData);

            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            )
            let toast = Toast.show('Scanned Successfully', {
              duration: Toast.durations.SHORT,
              position: Toast.positions.TOP
            });



            setScan("")
          }
        }
      }
    }
  }, []);


  const handleScan = async () => {
    console.log("over here" + code)
    setScan(code)
    if (isValidGTIN(code)) {
      const data = await searchGtin(code);

      if (data) {
        const index = transferData.findIndex((item) => item["Item Code"] === data.itemCode);

        if (index !== -1) {
          setLastScanned(transferData[index]["Line Desc"])
          if (parseInt(transferData[index]["Order Qty."]) === 0) {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            )
            Alert.alert('Extra item detected', "You have already scanned all of this item. Would you like to scan an extra item?", [
              {
                text: 'Cancel',
                onPress: () => {
                  console.log('Cancel Pressed');
                  return;
                },
                style: 'cancel',
              },
              {
                text: 'OK', onPress: () => {
                  const updatedTransferData = transferData.map((item: any, i) =>
                    i === index ? { ...item, "Order Qty.": (parseInt(item["Order Qty."]) - 1).toString() } : item
                  );
                  //ts-ignore
                  setTransferData(updatedTransferData);

                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  )
                  let toast = Toast.show('Scanned Successfully', {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.TOP
                  });



                  setScan("")

                }
              },
            ]);

          }
          else {

            const updatedTransferData = transferData.map((item: any, i) =>
              i === index ? { ...item, "Order Qty.": (parseInt(item["Order Qty."]) - 1).toString() } : item
            );
            setTransferData(updatedTransferData);

            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            )
            let toast = Toast.show('Scanned Successfully', {
              duration: Toast.durations.SHORT,
              position: Toast.positions.TOP
            });



            setScan("")
            setCode("")
          }
        }
      }
    }
    else {
      let toast = Toast.show('invalid gtin', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP
      });

    }
  }

  const searchGtin = async (code: string) => {
    let result;
    const res = await fetch(`https://barcode-backend-fawn.vercel.app/searchGtin/${code}`,
      {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then((res) => res.json())
      .then((data) => {
        if (data.error) {
          result = null;
          let toast = Toast.show('item not found', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.TOP
          });

        }
        else {
          result = data;
        }

      })
    console.log(result)
    return result;


  }

  const totalItem = (array: any[]): number => {
    const summation = array.reduce((prevItem: number, nextItem: any) => {
      return prevItem + parseInt(nextItem["Order Qty."]);
    }, 0);
    return summation;
  };

  return (
    <View style={{ paddingTop: 30, paddingHorizontal: 15, backgroundColor: '#F6F6F6', flex: 1, justifyContent: 'space-around' }}>
      {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>

        <View style={{ borderRadius: 20, overflow: 'hidden', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
          <Image source={require('@/assets/images/icon.png')} style={{ objectFit: 'cover', height: 40, width: 40 }} />
        </View>
        <View>
          <Text style={{ fontWeight: 600 }}>Welcome back,</Text>
          <Text style={{ fontWeight: 800 }}>{userData.checkedBy}</Text>
        </View>
      </View> */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 25, backgroundColor: '#E7E7E7' }}>
        <Pressable onPress={() => {
          console.log("button Pressed")
          router.push('camera')
        }}>
          <Ionicons name="camera" size={24} color="black" style={{ marginRight: 10 }} />
        </Pressable>

        <TextInput

          style={{ width: '100%', height: 30, }}
          placeholder='Scan here'
          placeholderTextColor={'#989898'}
          onChangeText={(code) => setCode(code)}
          onSubmitEditing={handleScan}
          blurOnSubmit={false}
          autoFocus={true}
          value={code}
        >
        </TextInput>
      </View>
      <View style={{ flex: 0.1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
        <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 600 }}>Items to scan</Text>
          <Text>{totalItem(transferData)}</Text>
        </View>
        <View style={{ height: '100%', width: 2, backgroundColor: 'gray' }}>

        </View>
        <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 600 }}>Items scanned</Text>
          <Text>{totalItem(originalData) - totalItem(transferData)}</Text>
        </View>

      </View>
      <View style={{ flex: 0.5, backgroundColor: '' }}>
        <Text style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Current Transfer Items</Text>
        <View>
          <ScrollView>
            {
              transferData.map((items, index) =>
                <TransferCard index={items["Order Qty."]} key={index} code={items["Item Code"]} name={items["Line Desc"]} scanned={items["scanned"]} />
              )
            }

            <ExcelPicker setTransferData={setTransferData} transferData={transferData} setUserData={setUserData} />

          </ScrollView>

        </View>

      </View>
      {transferData.length > 0 && <ReportScreen transferData={transferData} originalData={originalData} clearCache={clearCache} setOriginalData={setOriginalData} setTransferData={setTransferData} location={userData.location} checkedBy={userData.checkedBy} receivedBy={userData.receivedBy} date={userData.date} transferNo={userData.transferNo} />}
      <View>
        <LastItemCard name={lastScanned || "No Items Scanned Yet"} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
