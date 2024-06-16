import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { DeviceEventEmitter, Image, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  // const [image, setImage] = useState()
  // useEffect(() => {
  //   DeviceEventEmitter.addListener('update', eventData =>updateBottomPic(eventData))
  //   return()=> DeviceEventEmitter.removeAllListeners('update')
  // },[])



  // async function updateBottomPic(profilepicture) {
  //   const pic = await AsyncStorage.getItem("profileData")
  //   if (pic) {
  //     const serializedPic = JSON.parse(pic)
  //     setImage(profilepicture)
  //   }

  // }
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light" ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="home" size={28} color={focused ? "#009959" : 'gray'} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="history" size={28} color={focused ? "#009959" : 'gray'} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            
            <Image source={image?{ uri: 'data:image/png;base64,' + image }:require('@/assets/images/react-logo.png')}
              style={{ objectFit: 'cover', width: 30, height: 30, borderRadius: 20 }}
            />

          ),
        }}
      /> */}
    </Tabs>
  );
}
