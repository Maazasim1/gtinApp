import { useCallback, useEffect, useRef, useState } from 'react';
import { Switch, ScrollView, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity, ToastAndroid, DeviceEventEmitter, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransferCard from '@/components/TransferCard';
import ExcelPicker from '@/components/ExcelPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportScreen, { createReportData } from '@/components/ReportScreen';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-root-toast';
import LastItemCard from '@/components/LastItemCard';
import { router } from 'expo-router';
import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import NumericPicker from '@/components/NumericPicker';
import { Picker } from '@react-native-picker/picker';
import ExcelPickerPO from '@/components/ExcelPickerPO';


export default function HomeScreen() {
  const [transferData, setTransferData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [difference, setDifference] = useState<{ allItemsArray:any[], discrepancyArray:any[] }>();
  const [scan, setScan] = useState("")
  const [date, setDate] = useState("")
  const [lastScanned, setLastScanned] = useState("")
  const [code, setCode] = useState("")
  const focus = useIsFocused();
  const [showTransferred, setShowTransferred] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [ready, setReady] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [input, setInput] = useState("");
  const [startingTime, setStartingTime] = useState<string>();
  const [search, setSearch] = useState();
  const [searchData,setSearchData]=useState([]);

  useEffect(() => {
    DeviceEventEmitter.addListener('event.cameraScan', async (eventData) => {
      console.log("Camera scan event received", eventData);
      if (isEnabled) {
        setInput("camera")
        setScan(eventData);
      }
      else {
        await handleScanCamera(eventData);
      }

    });

    return () => {
      DeviceEventEmitter.removeAllListeners('event.cameraScan')
    };
  }, [focus]);

  useEffect(() => {
    if (isEnabled && scan && input === "camera") {
      openPicker()
    }
  }, [scan, input])

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
    const data = createReportData(transferData, originalData)
    console.log(data)
    setDifference(data)
    if (originalData.length === 0) {
      setOriginalData(transferData)

    }
    else {
      saveCache()

    }
  }, [transferData, showTransferred])

  useEffect(() => {
    getCacheAndSetState(setTransferData, setUserData);


  }, [])

  const saveCache = useCallback(async () => {
    const date = new Date(userData.date)
    console.log(userData.date)
    try {
      // Store individual items one by one to avoid high memory usage
      await AsyncStorage.multiSet([
        ["startingTime", startingTime],
        ["originalData", JSON.stringify(originalData)],
        ["data", JSON.stringify(transferData)],
        ["location", userData.location || ""],
        ["date", (date.toDateString() || "")],
        ["transferNumber", userData.transferNo || ""],
        ["received", userData.receivedBy || ""],
        ["checked", userData.checkedBy || ""],
      ]);
    } catch (error) {
      console.error("Error saving cache", error);
    }
  }, [originalData, transferData, userData]);

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
      const start = await AsyncStorage.getItem("startingTime")
      const scanned = createReportData(JSON.parse(data), JSON.parse(ogData))
      console.log(scanned)
      setDifference(scanned)

      if (data !== null) {
        if (transferData.length === 0) {
          setTransferData(JSON.parse(data));
        }

      }
      if (ogData !== null) {
        if (originalData.length === 0) {
          setOriginalData(JSON.parse(ogData));
        }
      }

      setUserData((prevUserData) => ({
        ...prevUserData,
        location: location || prevUserData.location,
        transferNo: transferNumber || prevUserData.transferNo,
        receivedBy: received || prevUserData.receivedBy,
        checkedBy: checked || prevUserData.checkedBy,
        date: date || prevUserData.date,

      }));
      if (start) {
        setStartingTime(start)
      }


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
    const gtinRegex = /^(?:\d{8}|\d{12}|\d{13}|\d{14})|^.{16}$/;
    return gtinRegex.test(gtin);
  }
  function handleSearch(searchString:string){
    setSearch(searchString);
    if(searchString){
      const searchArray=transferData.filter((search)=>search["Line Desc"].includes(searchString)||search["Item Code"].includes(searchString));
      setSearchData(searchArray);
    }

  }



  const handleScanCamera = async (gtin: string, number = 1) => {
    setScan(gtin)
    console.log(gtin)
    if (!isValidGTIN(gtin)) {
      let toast = Toast.show('invalid gtin', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP
      })

    }
    if (isValidGTIN(gtin)) {
      const data = await searchGtin(gtin);
      console.log(data)

      if (data) {
        const index = transferData.findIndex((item) => item["Item Code"] === data.itemCode);
        console.log(originalData)
        console.log(transferData)
        if (index !== -1) {
          setLastScanned(transferData[index]["Line Desc"])
          if (parseInt(transferData[index]["Ship Qty."]) === 0) {
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
                    i === index ? { ...item, "Ship Qty.": (parseInt(item["Ship Qty."]) - number).toString() } : item
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
              i === index ? { ...item, "Ship Qty.": (parseInt(item["Ship Qty."]) - number).toString() } : item
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
      router.navigate('/camera')
    }
  }


  const handleScan = async (number = 1) => {
    console.log("over here" + code.length)
    setScan(code)
    if (isValidGTIN(code)) {
      const data = await searchGtin(code);

      if (data) {
        const index = transferData.findIndex((item) => item["Item Code"] === data.itemCode);
        console.log(index)
        if (index !== -1) {
          setLastScanned(transferData[index]["Line Desc"])
          console.log(transferData[index]["Ship Qty."])
          if (parseInt(transferData[index]["Ship Qty."]) === 0) {
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
                    i === index ? { ...item, "Ship Qty.": (parseInt(item["Ship Qty."]) - number).toString() } : item
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
              i === index ? { ...item, "Ship Qty.": (parseInt(item["Ship Qty."]) - number).toString() } : item
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
    const res = await fetch(
      `https://barcode-backend-fawn.vercel.app/searchGtin/${code}`,
      //`http://192.168.1.3:3000/searchGtin/${code}`,
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
      return prevItem + parseInt(nextItem["Ship Qty."]);
    }, 0);
    return summation;
  };

  function openPicker() {
    if (isEnabled) {
      pickerRef.current.focus();
    }

  }


  async function handleScanPicker(number: number) {
    setSelectedNumber(number);
    if (input === "camera") {
      pickerRef.current.blur();
      await handleScanCamera(scan, number);
    } else if (input === "text") {
      pickerRef.current.blur();
      await handleScan(number);
    }
    setInput("");
    setScan("");
  }

  function handleText() {
    setInput("text")
    openPicker();
  }

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const pickerRef = useRef()

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
      <View>

        <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, borderRadius: 25, backgroundColor: '#E7E7E7' }}>
          <Pressable onPress={() => {
            console.log("button Pressed")
            router.push('camera')
          }}>
            <Ionicons name="camera" size={24} color="black" style={{ marginRight: 10 }} />
          </Pressable>


          <TextInput
            style={{ height: 50,width:"70%" }}
            placeholder='Scan here'
            placeholderTextColor={'#989898'}
            onChangeText={(code) => setCode(code)}
            onSubmitEditing={() => isEnabled ? handleText() : handleScan()}
            blurOnSubmit={false}
            autoFocus={true}
            value={code}
          >
          </TextInput>
          <Switch
            trackColor={{ false: '#767577', true: '#009959' }}
            thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />

        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, borderRadius: 25, backgroundColor: '#E7E7E7' }}>

          <Ionicons name="search" size={24} color="black" style={{ marginRight: 10 }} />


          <TextInput

            style={{ height: 50, width: '100%' }}
            placeholder='Search here'
            placeholderTextColor={'#989898'}
            onChangeText={(code) => handleSearch(code)}
            value={search}
          >
          </TextInput>


        </View>
      </View>
      <View style={{ flex: 0.1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
        <TouchableOpacity onPress={() => setShowTransferred(true)}>
          <View style={{ alignItems: 'center', justifyContent: 'space-between', backgroundColor: showTransferred ? '#009959' : 'transparent', padding: 10, borderRadius: 20 }}>
            <Text style={{ fontWeight: 600, color: showTransferred ? 'white' : 'black' }}>Items to scan</Text>
            <Text style={{ color: showTransferred ? 'white' : 'black' }}>{totalItem(transferData)}</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: '100%', width: 2, backgroundColor: 'gray' }}>

        </View>

        <TouchableOpacity onPress={() => setShowTransferred(false)}>
          <View style={{ alignItems: 'center', justifyContent: 'space-between', backgroundColor: showTransferred ? 'transparent' : '#009959', padding: 10, borderRadius: 20 }}>
            <Text style={{ fontWeight: 600, color: !showTransferred ? 'white' : 'black' }}>Items scanned</Text>
            <Text style={{ color: !showTransferred ? 'white' : 'black' }}>{totalItem(originalData) - totalItem(transferData)}</Text>
          </View>
        </TouchableOpacity>

      </View>
      <View style={{ flex: 0.5, backgroundColor: '' }}>
        <Text style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Current Transfer Items</Text>
        <View>
          <ScrollView>
            {showTransferred ? (

              !search?
              transferData.map((items, index) => <TransferCard index={items["Ship Qty."]} key={index} code={items["Item Code"]} name={items["Line Desc"]} scanned={items["scanned"]} />)
              :searchData.map((items, index) => <TransferCard index={items["Ship Qty."]} key={index} code={items["Item Code"]} name={items["Line Desc"]} scanned={items["scanned"]} />)
            ) : (
              difference?.allItemsArray.filter((items) => Number(items[3]) !== 0).map((items, index) => <TransferCard index={items[3]} key={index} code={items[0]} name={items[1]} />)
            )
            }

            <ExcelPicker setStartingTime={setStartingTime} setTransferData={setTransferData} transferData={transferData} setUserData={setUserData} />
            <ExcelPickerPO setStartingTime={setStartingTime} setTransferData={setTransferData} transferData={transferData} setUserData={setUserData} />
            

          </ScrollView>
        

        </View>

      </View>
      {transferData.length > 0 && <ReportScreen transferData={transferData} originalData={originalData} clearCache={clearCache} setOriginalData={setOriginalData} setTransferData={setTransferData} location={userData.location} checkedBy={userData.checkedBy} receivedBy={userData.receivedBy} date={userData.date} transferNo={userData.transferNo} startingTime={startingTime} />}
      <View>
        <LastItemCard name={lastScanned || "No Items Scanned Yet"} />
      </View>

      <Picker
        style={{ display: 'none' }}
        ref={pickerRef}
        selectedValue={selectedNumber}
        onValueChange={(itemValue: number) => handleScanPicker(itemValue)}
      >
        {[...Array(100).keys()].map((number) => (
          <Picker.Item key={number + 1} label={(number + 1).toString()} value={number + 1} />
        ))}
      </Picker>
    



    </View >
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
