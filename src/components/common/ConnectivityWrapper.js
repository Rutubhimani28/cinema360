import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const ConnectivityWrapper = ({ children }) => {
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                Alert.alert('No Internet', 'You are currently offline. Please check your internet connection.');
            }
        });

        // Cleanup the subscription on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return <View style={{ flex: 1 }}>{children}</View>;
};

export default ConnectivityWrapper;
