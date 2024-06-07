import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SlidingText({ text }: any) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const slideAnimation = () => {
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: -width,
                    duration: 5000,
                    useNativeDriver: true,
                    delay: 500,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]).start(() => slideAnimation());
        };

        slideAnimation();
    }, [animatedValue]);

    return (
        <View style={styles.container}>
            <Animated.Text
                style={[
                    styles.text,
                    {
                        transform: [{ translateX: animatedValue }],
                    },
                ]}
            >
                {text}
            </Animated.Text>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        whiteSpace: 'nowrap',
    },
});
