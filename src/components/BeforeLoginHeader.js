import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect } from 'react';
import { Alert, Button, Image, Pressable, StyleSheet, View } from 'react-native';
import { AuthContext } from '../auth/AuthProvider';
import qs from "qs";
import { storeData } from '../services/localStorage';
import { useNavigation } from '@react-navigation/native';

const BeforeLoginHeader = (props) => {

    const navigation = useNavigation()
    const { signOutBarCode, signOutScanner } = useContext(AuthContext);
    const handleClear = async () => {
        await AsyncStorage.clear();
        signOutScanner()
        signOutBarCode()
    };

    const showConfirmationDialog = () => {
        Alert.alert(
            "",
            "Are you sure you want to unregister?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: handleClear
                }
            ],
            { cancelable: true }
        );
    };

    const handleLogoClick = () => {
        // const currentRoute = navigation.getState().routes[navigation.getState().index].name;
        // const params = navigation.getState().routes[navigation.getState().index].params;
        // navigation.navigate(currentRoute, { ...params });
        navigation.navigate("barcode");
    };
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Pressable onPress={handleLogoClick}>
                    <Image
                        source={require('../assets/images/c360newlogo.png')}
                        style={styles.logo}
                    />
                </Pressable>
            </View>
            {props?.from === "login" &&
                <View style={styles.userContainer}>
                    <Button title="Unregister" onPress={showConfirmationDialog} />
                </View>}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 130,
        height: 40,
        marginRight: 10,
    },
    logoText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userText: {
        color: '#fff',
        fontSize: 16,
        marginRight: 10,
    },
    logoutButton: {
        backgroundColor: '#007bff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default BeforeLoginHeader;
