import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View, DeviceEventEmitter, ScrollView, Pressable } from 'react-native';
import HistoryCard from '@/components/HistoryCard';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { router } from 'expo-router';
export default function TabTwoScreen({ navigation }: any) {
  const [history, setHistory] = useState([]);
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
  return (
    <View style={{
      marginTop: 20,
      paddingHorizontal: 15
    }}>
      <ScrollView>


        {
          history.map((items, index) => {
            const { status,transferData, originalData, date, location, checkedBy, receivedBy, transferNo } = items;

            return (
              <Pressable key={index} onPress={() => {
                router.push({
                  pathname: '/'
                })
                DeviceEventEmitter.emit('transferUpdate',items);
              }
              }>
                <HistoryCard
                  index={index+1}
                  date={new Date(date).toLocaleDateString()}
                  location={location}
                  checkedBy={checkedBy}
                  receivedBy={receivedBy}
                  transferNo={transferNo}
                  transferData={transferData}
                  originalData={originalData}
                  status={status}
                />
              </Pressable>

            )
          })
        }
      </ScrollView>

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
});
