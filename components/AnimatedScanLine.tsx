// AnimatedScanLine.js
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
} from 'react-native-reanimated';

const AnimatedScanLine = () => {
    const scanLinePosition = useSharedValue(0);

    useEffect(() => {
        scanLinePosition.value = withRepeat(withTiming(1, {
            duration: 2000,
           // easing: Easing.linear,
        }),-1)
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: scanLinePosition.value * 300 }],
        };
    });

    return <Animated.View style={[styles.scanLine, animatedStyle]} />;
};

const styles = StyleSheet.create({
    scanLine: {
        width: 2,
        height: 180,
        backgroundColor: 'grey',
        position: 'absolute',
        top: Dimensions.get("window").height*0.15,
        left: '7.7%',
    },
});

export default AnimatedScanLine;
