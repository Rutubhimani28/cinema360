import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { Box, HamburgerIcon, Menu, Pressable } from 'native-base';
import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { AuthContext } from '../auth/AuthProvider';
import { getStoreData, storeData } from '../services/localStorage';
import { Button } from 'react-native';
import axios from 'axios';
import { constant } from '../constant';
import axiosInstance from '../services/axiosInstance';
// import jwtDecode from 'jwt-decode';


const Header = (props) => {
    const navigation = useNavigation();
    const { signOutBarCode, signOutScanner, tokenEXP } = useContext(AuthContext);
    const [user, setUser] = useState('');
    const [type, setType] = useState('');
    const [logo, setLogo] = useState('');
    const [token, setToken] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);
    const [lastActivityTime, setLastActivityTime] = useState(new Date());



    
    useEffect(() => {
        const fetchUserName = async () => {
            const userName = await getStoreData('userName');
            setUser(userName);
            const storeType = await getStoreData('type');
            setType(storeType);
            const compnyLogo = await getStoreData('Company_Logo')
            setLogo(compnyLogo)
            const token = await getStoreData('token')
            setToken(token)
        };
        fetchUserName();
    }, [logo]);


    const fetchCompanyData = async () => {
        const token = await getStoreData('token')
        const companyId = await getStoreData('CompanyId');
        const locationId = await getStoreData('LocationId')

        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/Location/GetLocationByIdWithCompanyImage?locationId=${locationId}`,
                {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                }
            );
            if (response?.status === 200) {
                storeData('Company_Logo', response?.data?.LogoImage);
                setLogo(response?.data?.LogoImage)
            }
        } catch (err) {
            console.log(err);
        }
    }
    // const fetchCompanyData = async () => {
    //     const token = await getStoreData('token')
    //     const companyId = await getStoreData('CompanyId');
    //     try {
    //         const response = await axiosInstance.get(`${constant.baseUrl}/api/Company`,
    //             {
    //                 headers: {
    //                     Authorization: 'Bearer ' + token
    //                 }
    //             }
    //         );
    //         if (response?.status === 200) {
    //             const data = response?.data?.find((item) => item.Company_ID === companyId)
    //             storeData('Company_Logo', data?.LogoImage);
    //             setLogo(data?.LogoImage)
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }
    useEffect(() => {
        fetchCompanyData();

    }, [token]);

    const handleUserClearAutomatic = async () => {
        await AsyncStorage.removeItem('userName');
        signOutBarCode();
        clearTimeout(timeoutId);
        setTimeoutId(null);
    };



    let logoutTimer;

    const handleLogout = async () => {
        await AsyncStorage.clear();

        // // Clear any remaining timers
        // if (logoutTimer) {
        //     clearTimeout(logoutTimer);
        // }
        signOutScanner();
        signOutBarCode();
        // clearTimeout(timeoutId);
        // setTimeoutId(null);
    };

    const handleUserClear = async () => {
        await AsyncStorage.removeItem('userName');
        signOutBarCode();
        // clearTimeout(timeoutId);
        // setTimeoutId(null);
    };

    const handleScreenandTickets = async () => {
        navigation.navigate('ticket-screen');
        // handleUserActivity();
    };

    const showConfirmationUserDialog = () => {
        Alert.alert(
            "",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: handleUserClear
                }
            ],
            { cancelable: true }
        );
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
                    onPress: handleLogout
                }
            ],
            { cancelable: true }
        );
    };

    const handleLogoClick = () => {
        // const currentRoute = navigation.getState().routes[navigation.getState().index].name;
        // const params = navigation.getState().routes[navigation.getState().index].params;
        // navigation.navigate(currentRoute, { ...params });

        const excludedRoutes = ["main-screen", "scan", "login"];
        if (!excludedRoutes.includes(props?.route?.name)) {
            navigation.navigate("barcode");
        }
    };


    useEffect(() => {
    }, [])
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                {
                    (props?.route?.name === "main-screen" || props?.route?.name === "scan") ?
                        <Image
                            source={require('../assets/images/c360newlogo.png')}
                            style={styles.logo}
                        />
                        :
                        logo ?
                            <Pressable
                            //  onPress={handleLogoClick}
                            >
                                <Image
                                    source={{ uri: logo }}
                                    style={styles.logo}
                                />
                            </Pressable>
                            :
                            <Image
                                source={require('../assets/images/c360newlogo.png')}
                                style={styles.logo}
                            />
                }
            </View>
            {user ?
                <View style={styles.userContainer}>
                    <Text style={styles.userText}>Hi, {user}</Text>
                    <Box alignItems="center">
                        <Menu
                            w="220"
                            trigger={(triggerProps) => {
                                return (
                                    <Pressable
                                        accessibilityLabel="More options menu"
                                        {...triggerProps}
                                    >
                                        <Image source={require('../assets/images/profile.png')}
                                            style={{ width: 24, height: 24 }}
                                        />
                                    </Pressable>
                                );
                            }}
                        >
                            {type === 'ticket' &&
                                <Menu.Item onPress={handleScreenandTickets}>Screens and Tickets</Menu.Item>
                            }
                            <Menu.Item onPress={showConfirmationUserDialog}>Logout</Menu.Item>
                            <Menu.Item onPress={showConfirmationDialog}>Unregister</Menu.Item>
                        </Menu>
                    </Box>
                </View> :

                props?.from === "login" &&
                <View style={styles.userContainer}>
                    <Button title="Unregister" onPress={showConfirmationDialog} />
                </View>

            }

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
        height: 45,
        marginRight: 10,
        resizeMode: "stretch"
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

export default Header;
