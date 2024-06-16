import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedScanLine from '@/components/AnimatedScanLine';
import CustomMaskedView from '@/components/CustomMaskedView';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [torch, setTorch] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(true);

  // useFocusEffect(
  //   () => {
  //     console.log("focus");
  //     setShowCamera(true);

  //     return () => {
  //       setShowCamera(false);
  //       console.log("not in focus");
  //     };
  //   }
  // );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function handleBarcodeScan(scan: any) {
    setShowCamera(false);
    console.log(scan.data + "hwew")
    DeviceEventEmitter.emit('event.cameraScan', scan.data)
    setShowCamera(false)

    router.back();
  }

  if (showCamera) {

    return (
      <View
        style={styles.container}
      >


        <CameraView style={styles.camera} facing={facing} onBarcodeScanned={handleBarcodeScan} enableTorch={torch}>
          <CustomMaskedView torch={torch} setTorch={setTorch} toggleCameraFacing={toggleCameraFacing} />
        </CameraView>

      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  icon: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 30,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
