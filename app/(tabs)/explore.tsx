import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet,TextInput, Text, Platform, View, DeviceEventEmitter, ScrollView, Pressable, Dimensions, Modal } from 'react-native';
import HistoryCard from '@/components/HistoryCard';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { router } from 'expo-router';
export default function TabTwoScreen({ navigation }: any) {
  const [history, setHistory] = useState([]);
  const phrase = "Clear CheckMate history"
  const [modalVisible, setModalVisible] = useState(false);
  const [wrong,setWrong]=useState(false)
  const [check,setCheck]=useState("")
  useEffect(() => {
    async function getItem() {
      const data = await AsyncStorage.getItem('history')
      if (data) {
        setHistory(JSON.parse(data))
      }
    }
    getItem()
    DeviceEventEmitter.addListener('historyUpdate', evenData => {
      setHistory(prevData => [...prevData, evenData])
    })
    return () => {
      DeviceEventEmitter.removeAllListeners('historyUpdate')
    }
  }, [])

  async function handleClear(){
    if(check===phrase){
      await AsyncStorage.removeItem('history');
      setHistory([]);
      setWrong(false)
      setModalVisible(false)
      setCheck("");
    }
    else{
      setWrong(true)
    }

  }
  return (
    <View style={{
      marginTop: 20,
      paddingHorizontal: 15
    }}>
      <ScrollView style={{marginBottom:50}}>


        {
          history.map((items, index) => {
            const { startingTime,status, transferData, originalData, date, location, checkedBy, receivedBy, transferNo } = items;

            return (
              <Pressable key={index} onPress={() => {
                router.push({
                  pathname: '/'
                })
                DeviceEventEmitter.emit('transferUpdate', items);
              }
              }>
                <HistoryCard
                  index={index + 1}
                  date={new Date(date).toLocaleDateString()}
                  location={location}
                  checkedBy={checkedBy}
                  receivedBy={receivedBy}
                  transferNo={transferNo}
                  transferData={transferData}
                  originalData={originalData}
                  status={status}
                  startingTime={startingTime}
                />
              </Pressable>

            )
          })
        }
      </ScrollView>
      {
        history.length > 0 &&
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            position: 'absolute',
            top: Dimensions.get('screen').height - 130,
            alignItems: 'center',
            justifyContent: 'center',
            width: Dimensions.get('screen').width,
            backgroundColor: 'red',
            height: 40


          }}>
          <Text
            style={{ color: 'white', fontWeight: 600 }}
          >Clear History</Text>
        </Pressable>
      }
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>To confirm, type "<Text style={styles.phraseText}>{phrase}</Text>" in the box below</Text>

      <TextInput
        style={{borderWidth:1,borderColor:wrong?"red":"transparent",borderRadius: 15, backgroundColor: '#E7E7E7',width:300,marginBottom:20,height:40,padding:10}}
        value={check}
        onChangeText={(text)=>setCheck(text)}
      />
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => handleClear()}>
                <Text style={styles.textStyle}>Clear</Text>
              </Pressable>
            
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 3,
    padding: 10,
    elevation: 2,
    width:200,
    marginBottom:10,
    alignItems:'center'
  },
  buttonOpen: {
    backgroundColor: 'red',
  },
  buttonClose: {
    backgroundColor: 'red',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
  },
  phraseText: {
    fontWeight: "600"
  }
});
