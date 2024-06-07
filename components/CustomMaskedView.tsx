import MaskedView from '@react-native-masked-view/masked-view';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Dimensions, Image, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import AnimatedScanLine from './AnimatedScanLine';
import { MaterialIcons } from '@expo/vector-icons';

function CustomMaskedView(props: PropsWithChildren) {
    const { width } = useWindowDimensions();


    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={props.toggleCameraFacing}>
                    <MaterialIcons
                        name="flip-camera-ios"
                        size={24}
                        color="white"
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => props.setTorch(!props.torch)}>
                    <MaterialIcons
                        name={props.torch ? "flashlight-off" : "flashlight-on"}
                        size={24}
                        color="white"
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>
            <AnimatedScanLine />
            <Image source={require('@/assets/images/transparent.png')} style={{ objectFit: 'cover', width: Dimensions.get("window").width, height: Dimensions.get("window").height }} />


        </View>
    );
};

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
        zIndex:100

    },
    button: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        zIndex: 10
    },
    icon: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 15,
        overflow:'hidden'
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});


export default CustomMaskedView;