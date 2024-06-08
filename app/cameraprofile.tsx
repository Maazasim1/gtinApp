import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { Button, DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedScanLine from '@/components/AnimatedScanLine';
import CustomMaskedView from '@/components/CustomMaskedView';
import { Fontisto } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system'
export default function CameraProfile() {
    const [facing, setFacing] = useState('back');
    const [torch, setTorch] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const cameraRef = useRef();

    useFocusEffect(
        React.useCallback(() => {
            console.log("focus");
            setShowCamera(true);

            return () => {
                setShowCamera(false);
                console.log("not in focus");
            };
        }, [])
    );

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

    const readPhotoAsBase64 = async (photoUri) => {
        try {
            const base64String = await FileSystem.readAsStringAsync(photoUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            DeviceEventEmitter.emit('event.pictureupdate', base64String);
            // Navigate back
            router.back();
        } catch (error) {
            console.error('Error reading photo as base64:', error);
        }
    };

    async function capturePic() {
        if (cameraRef) {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
              readPhotoAsBase64(photo.uri)
            }
        }
    };


    return (
        <View
            style={styles.container}
        >

            {showCamera && (
                <CameraView style={styles.camera} facing={facing} enableTorch={torch} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                            <MaterialIcons
                                name="flip-camera-ios"
                                size={24}
                                color="white"
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => capturePic()}>
                            <Fontisto
                                name={"record"}
                                size={44}
                                color="white"
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setTorch(!torch)}>
                            <MaterialIcons
                                name={torch ? "flashlight-off" : "flashlight-on"}
                                size={24}
                                color="white"
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}
        </View >
    );
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
        alignItems: 'center'

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
