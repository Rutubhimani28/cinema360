
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import qs from "qs";
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getStoreData, storeData } from '../services/localStorage';
import { AuthContext } from '../auth/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import ConfirmLeavePrompt from './ConfirmLeavePrompt';
import { constant } from '../constant';
import axiosInstance from '../services/axiosInstance';

const Login = (props) => {
    const { resetTimer } = props;

    const [employeeList, setEmployeeList] = useState([]);
    const [ticketEmployeeData, setTicketEmployeeData] = useState([]);
    const [ticketEmployeeList, setTicketEmployeeList] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [pin, setPin] = useState('');
    const [timezone, setTimezone] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [type, setType] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [loading, setIsLoading] = useState(false);
    const { signInUser } = useContext(AuthContext);
    const navigation = useNavigation()
    // const todayDate = new Date();
    // const tomorrowDate = new Date(todayDate);
    // tomorrowDate.setDate(todayDate.getDate() + 1);
    // const todayFormatted = moment(todayDate).format("YYYY-MM-DD") + "T00:00:00.000Z";
    // const tomorrowFormatted = moment(todayDate).format("YYYY-MM-DD") + "T23:59:59.000Z";
    console.log(timezone);

    const getTimeZone = async (Timezone) => {
        const token = await getStoreData('token')
        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/Location/GetDateByTimeZoneName?timeZone=${Timezone}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            });
            if (response?.status === 200) {
                await AsyncStorage.setItem('timezone', response?.data);
                const storedTimezone = await AsyncStorage.getItem('timezone');
                setTimezone(response?.data);
            }
        } catch (err) {
            console.log(err, "err");
        }
    }
    const getLocation = async () => {

        const token = await getStoreData('token')
        const locationId = await getStoreData('LocationId')
        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/Location/${locationId}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    LocationId: locationId
                }
            });
            if (response?.status === 200) {
                getTimeZone(response?.data?.Timezone)
            }

        } catch (err) {
            console.error(err, "err");
        } finally {

        }
    }

    const fetchEmployeeData = async () => {
        const token = await getStoreData('token')
        const companyId = await getStoreData('CompanyId')
        const locationId = await getStoreData('LocationId')
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/Employee/GetOverRideAcessEmployeeListByLocationId/${locationId}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    // CompanyId: "f604d90",
                    // LocationId: "5ede13602a12a451b883932d"
                    CompanyId: companyId,
                    LocationId: locationId
                }
            });
            if (response?.status === 200) {
                // setEmployeeList(response?.data);
                const isLocVisible = response?.data?.filter((item) => item?.SelectedLocationAndRoles.some((data) => data?.LocationId === locationId && data?.LocVisible === 1))
                setEmployeeList(isLocVisible);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTicketEmployeeData = async () => {
        const token = await getStoreData('token')
        const companyId = await getStoreData('CompanyId')
        const locationId = await getStoreData('LocationId')
        const timeZone = await getStoreData('timezone')

        const startTime = timeZone.split('T')[0]

        const todayFormatted = moment(startTime).format("YYYY-MM-DD") + "T00:00:00.000Z";
        const tomorrowFormatted = moment(startTime).format("YYYY-MM-DD") + "T23:59:59.000Z";
        setIsLoading(true)

        try {
            // const response = await axiosInstance.get(`${constant.baseUrl}/api/EmployeeSchedule/GetEmployeeSchedule/${locationId}/2024-07-04T00:00:00.000Z/2024-07-05T11:59:00.000Z`, {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/EmployeeSchedule/GetEmployeeSchedule/${locationId}/${todayFormatted}/${tomorrowFormatted}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    // UserEmail: userEmail,
                    // UserEmail: "chirag.aditri90@gmail.com",
                    // CompanyId: "f604d90",
                    CompanyId: companyId,
                    LocationId: locationId
                    // LocationId: "5ede13602a12a451b883932d"
                }
                // }
            });

            if (response?.status === 200) {

                const data = response?.data?.map((item) => ({
                    ...item,
                    DisplayName: item?.EmployeeName,
                    EmployeeId: item?.EmployeeID
                }))

                // const filterTime=data?.filter((item,i)=>item?.StartDateTime)

                setTicketEmployeeData(data);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (empId) => {
        setSelectedEmployee(empId)

        const empEmail = employeeList?.find((item) => item?.EmployeeId === empId)

        const ticketEmpEmail = ticketEmployeeData?.find((item) => item?.EmployeeId === empId)
        if (empEmail) {
            storeData('userEmail', empEmail?.Email);
        } else {
            storeData('userEmail', ticketEmpEmail?.Email);
        }

    }
    const signIn = async () => {
        setIsLoading(true)
        const email = employeeList?.find((item) => item.EmployeeId === selectedEmployee);

        const token = await getStoreData('token')
        const companyId = await getStoreData('CompanyId')
        const locationId = await getStoreData('LocationId')
        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/Employee/PinVerification/${email?.Email}/${pin}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    UserEmail: "chirag.aditri90@gmail.com",
                    // CompanyId: "f604d90",
                    // LocationId: "5ede13602a12a451b883932d"
                    CompanyId: companyId,
                    LocationId: locationId
                }
            });
            if (response?.status === 200) {
                storeData('userName', response?.data?.FirstName);
                signInUser(response?.data?.FirstName)
                setSelectedEmployee('');
                setPin('')
                resetTimer()

            } else {
                alert("Invalid pin");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false)
        }
    }


    const fetchDetails = async () => {

        const storeType = await getStoreData('type')
        const user = await getStoreData('userEmail')
        setUserEmail(user)
        setType(storeType)
    }
    useEffect(() => {
        fetchTicketEmployeeData()
    }, [timezone])

    useEffect(() => {
        getLocation()
        fetchDetails()
        fetchEmployeeData();
    }, []);


    useEffect(() => {
        if (selectedEmployee && pin.length >= 4) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    }, [selectedEmployee, pin]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    onPress={() => handleRefresh()}
                    title="Refresh"
                />
            ),
        });
    }, [navigation]);

    const handleRefresh = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'login' }],
            })
        );
    };

    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                "",
                "Are you sure want to exit app?",
                [
                    {
                        text: "NO",
                        onPress: () => null,
                        style: "cancel"
                    },
                    { text: "YES", onPress: () => BackHandler.exitApp() }
                ]
            );
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.container}>
            {loading ?
                <View >
                    <ActivityIndicator size="extralarge" />
                </View>
                :
                <>
                    <View>
                        <View style={styles.inputGroup}>
                            <Image source={require('../assets/images/profile.png')}
                                style={{ width: 24, height: 24 }}
                            />
                            <Picker
                                selectedValue={selectedEmployee}
                                onValueChange={(itemValue, itemIndex) => handleChange(itemValue)}
                                style={styles.inputField}
                            >
                                <Picker.Item label="Select Employee" value="" fontWeight="bold" style={{ fontWeight: "bold" }} />
                                {/* {type === "ticket" ? ticketEmployeeData?.length > 0 && ticketEmployeeData?.filter(item => new Date(item?.StartDateTime) <= new Date() && new Date(item?.EndDateTime) >= new Date())?.map((item, i) => ( */}
                                {type === "ticket" ? ticketEmployeeData?.length > 0 && ticketEmployeeData?.map((item, i) => (
                                    <Picker.Item key={i} value={item?.EmployeeId} label={item?.DisplayName} color="#4d4b4b" />
                                )) :
                                    employeeList?.length > 0 && employeeList.map((item, i) => (
                                        <Picker.Item key={i} value={item?.EmployeeId} label={item?.DisplayName} color="#4d4b4b" />
                                    ))
                                }
                            </Picker>
                        </View>

                        <View style={styles.inputGroup}>
                            <Image source={require('../assets/images/padlock.png')}
                                style={{ width: 24, height: 24, marginRight: 12 }}
                            />
                            <TextInput
                                placeholder="Employee Pin"
                                secureTextEntry={true}
                                value={pin}
                                onChangeText={setPin}
                                keyboardType="numeric"
                                style={styles.inputField}
                            />
                        </View>
                    </View>

                    <View>
                        <TouchableOpacity
                            style={[styles.signinButton, isButtonDisabled ? styles.disabledButton : {}]}
                            onPress={signIn}
                            disabled={isButtonDisabled}
                        >
                            <Text style={styles.signinButtonText}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    // container: {
    //     width: '100%',
    //     paddingHorizontal: 30,
    //     justifyContent: 'space-evenly',
    //     alignItems: 'center',
    //     flex: 1,
    // },
    container: {
        flex: 1,
        justifyContent: 'space-evenly',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        marginBottom: 60,
        shadowColor: '#1f1f1f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 2,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    icon: {
        marginRight: 10,
    },
    inputField: {
        fontSize: 16,
        height: 50,
        width: '100%',
    },
    signinButton: {
        backgroundColor: '#2C77F4',
        padding: 15,
        borderRadius: 5,
        // width: 320,
        alignItems: 'center',
    },
    signinButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        fontWeight: "900",
    },
    disabledButton: {
        backgroundColor: '#76a6f2',
    },
});

export default Login;
