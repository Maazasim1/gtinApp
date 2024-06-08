import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Button,
  DeviceEventEmitter,
  Image,
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MyTextInput from '@/components/MyTextInput';
import { router } from 'expo-router';
const Profile = ({ navigation }: any) => {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>('');

  useEffect(() => {
    DeviceEventEmitter.addListener('event.pictureupdate', eventData =>
      updatePicture(eventData),
    );

    AsyncStorage.getItem('profilepicture').then(pic => setProfilePicture(pic));

    return () => {
      DeviceEventEmitter.removeAllListeners('event.pictureupdate');
    };
  }, []);

  const updatePicture = (newPicture: string) => {
    if (newPicture) {
      setProfilePicture(newPicture);
    }
  };

  useEffect(() => {
    async function readCache() {
      const data = await AsyncStorage.getItem('profileData')
      if (data) {
        const profileData = JSON.parse(data);
        setFirstName(profileData?.firstName);
        setLastName(profileData?.lastName);
        setProfilePicture(profileData?.picture);
      }
    }
    readCache()
  }, [])

  async function saveData() {
    const data = { firstName, lastName, profilePicture }
    await AsyncStorage.setItem('profileData', JSON.stringify(data));
    DeviceEventEmitter.emit("update", true);

  }


  return (
    <ScrollView style={{ padding: 16 }}>
      <TouchableOpacity
        onPress={() => {
          router.navigate('/cameraprofile')
        }}
        style={{ padding: 16, alignSelf: 'center' }}>
        {profilePicture ? (
          <Image
            source={{ uri: 'data:image/png;base64,' + profilePicture }}
            resizeMode="contain"
            style={{ height: 300, width: 300 }}
          />
        ) : (
          <MaterialIcons name="account-circle" size={100} />
        )}
      </TouchableOpacity>
      <MyTextInput
        label="First Name"
        value={firstName}
        onChange={(newValue: string) => setFirstName(newValue)}
      />
      <MyTextInput
        label="Last Name"
        value={lastName}
        onChange={(newValue: string) => setLastName(newValue)}
      />

      <TouchableOpacity onPress={saveData} style={{ backgroundColor: '#009959', alignItems: 'center', padding: 20, borderRadius: 40, marginTop: 20 }}>
        <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Save Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>router.navigate("/map")} style={{ backgroundColor: '#009959', alignItems: 'center', padding: 20, borderRadius: 40, marginTop: 20 }}>
        <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Get Location</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default Profile;
