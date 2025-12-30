import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getStoreData } from '../services/localStorage'
import { useNavigation } from '@react-navigation/native'
import ConfirmLeavePrompt from './ConfirmLeavePrompt'
import { constant } from '../constant'
import axiosInstance from '../services/axiosInstance'
import { Picker } from '@react-native-picker/picker';
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'


const CustomAlert = ({ visible, onClose }) => {
    const navigation = useNavigation()

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <Text style={styles.message}> No ticket found</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            onClose();
                            navigation.navigate("barcode");
                        }}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
const NotMatchAlert = ({ visible, onClose }) => {
    const navigation = useNavigation()

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <Text style={styles.message}>No Ticket Found</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            onClose();
                            navigation.navigate("barcode");
                        }}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
const TodayNotTicketAlert = ({ visible, onClose }) => {
    const navigation = useNavigation()

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <Text style={[styles.message, { fontWeight: "500" }]}>Checkin is only allowed on the show date. Please try again.</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            onClose();
                            navigation.navigate("barcode");
                        }}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const TicketDetails = (props) => {
    const { resetTimer } = props;

    const [ticketDetails, setTicketDetails] = useState([])
    const [loading, setIsLoading] = useState(false);
    const [timezone, setTimezone] = useState('');
    const [type, setType] = useState('')
    const [alertVisible, setAlertVisible] = useState(false);
    const [notMatchAlert, setNotMatchAlert] = useState(false);
    const [todayNotTicketAlert, setTodayNotTicketAlert] = useState(false);

    const navigation = useNavigation()
    const handleSaveType = () => {
        setType("save");
        setTimeout(() => {
            navigation.navigate("barcode");
            setType("");
        }, 200)
    }


    const today = new Date();

    const todayFormatted = moment(timezone).format("MM/DD/YYYY");

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

    const fetchTicketDetails = async () => {
        setIsLoading(true)
        const token = await getStoreData('token')
        const userEmail = await getStoreData('userEmail')
        const locationId = await getStoreData('LocationId')
        const timezone = await getStoreData('timezone')
        const startTime = timezone.split('T')[0]
        const todayFormatted = moment(startTime).format("MM/DD/YYYY");
        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/SalesOrder/${props?.route?.params?.barcode}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    UserEmail: userEmail,
                    // UserEmail: "chirag.aditri90@gmail.com",
                    // LocationId: "5ede13602a12a451b883932d"
                    LocationId: locationId
                }
            });

            if (response?.status === 200) {
                if (response?.data?.Tickets?.every((item) => item?.Status === 1)) {
                    setAlertVisible(true);
                } else {
                    if (locationId === response?.data?.LocationId) {
                        const todayTicket = response?.data?.Tickets.filter((item) => item?.Showdate === todayFormatted)

                        if (todayTicket.length > 0) {
                            setTicketDetails(response?.data?.Tickets)
                        } else {
                            setTodayNotTicketAlert(true)
                        }


                    } else {
                        setNotMatchAlert(true)
                    }
                }
            } else {
                alert('Invalid QRcode')
                handleSaveType()
            }
        } catch (err) {
            console.log(err);
            alert('Invalid Conformation code')
            handleSaveType()
        } finally {
            setIsLoading(false)

        }
    }

    console.log(ticketDetails, "ticketDetails");


    const handleCheckIn = async () => {
        setIsLoading(true)
        const token = await getStoreData('token')
        const userEmail = await getStoreData('userEmail')
        const locationId = await getStoreData('LocationId')
        const companyId = await getStoreData('CompanyId')
        try {
            // const response = await axiosInstance.patch(`${constant.baseUrl}/api/SalesOrder/ChangeTicketStatus/${props?.route?.params?.barcode}/all/2`, null, {
            const response = await axiosInstance.patch(`${constant.baseUrl}/api/SalesOrder/ChangeTicketStatusByMobileApp/${props?.route?.params?.barcode}/all/2`, null, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    UserEmail: userEmail,
                    locationId: locationId,
                    CompanyId: companyId,
                    // UserEmail: "chirag.aditri90@gmail.com",
                    // locationId: "5ede13602a12a451b883932d",
                    // CompanyId: "f604d90",
                }
            });
            if (response?.status === 200) {

                fetchTicketDetails()

            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false)

        }
    }


    useEffect(() => {
        fetchTicketDetails()
        getLocation()
    }, [])
    const displayStatus = (status) => {
        switch (status) {
            case 0:
                return "OnHold"
            case 1:
                return "Void"
            case 2:
                return "Printed"
            case 3:
                return "Pending"
            case 4:
                return "Reserved"
            case 5:
                return "Failed"
            default:
                return "OnHold";
        }
    }

    const uniqueMovies = [...new Set(ticketDetails.map(item => item.MovieId))];

    const [selectedMovieId, setSelectedMovieId] = useState(uniqueMovies[0]);

    const selectedMovie = ticketDetails.find(item => item.MovieId === selectedMovieId);
    // const filterdTicket = ticketDetails?.filter((item) => [2, 4]?.includes(item?.Status))
    const filteredTicket = ticketDetails?.filter((item) => [2, 4]?.includes(item?.Status) && item.MovieId === selectedMovieId);


    useEffect(() => {
        if (uniqueMovies.length > 0) {
            setSelectedMovieId(uniqueMovies[0]);
        }
    }, [ticketDetails]);
    return (
        <View style={styles.container} onTouchStart={resetTimer}>
            <CustomAlert visible={alertVisible} onClose={() => setAlertVisible(false)} />
            <NotMatchAlert visible={notMatchAlert} onClose={() => setNotMatchAlert(false)} />
            <TodayNotTicketAlert visible={todayNotTicketAlert} onClose={() => setTodayNotTicketAlert(false)} />
            {loading ?
                <View >
                    <ActivityIndicator size="extralarge" />
                </View>
                :
                <>
                    <View style={styles.header}>
                        <Image source={require('../assets/images/tik.png')} />
                        <Text style={styles.headerText}>Movie</Text>
                    </View>
                    <View>
                        <View>
                            <Text style={styles.heading}>Movie Name:</Text>
                            {/* <Text>{ticketDetails[0]?.MovieName}</Text> */}
                            {uniqueMovies.length > 1 ? (
                                <><View style={{
                                    borderColor: '#ccc',
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    marginBottom: 5,
                                }}>

                                    <Picker
                                        style={{ padding: 0 }}
                                        selectedValue={selectedMovieId}
                                        onValueChange={(itemValue) => setSelectedMovieId(itemValue)} // Handle movie ID selection
                                        Icon={() => {
                                            return <Icon name="chevron-down" size={20} color="gray" />;
                                        }}
                                    >
                                        {uniqueMovies.map((movieId, index) => {
                                            const movieName = ticketDetails.find(item => item.MovieId === movieId)?.MovieName;
                                            return (
                                                <Picker.Item key={index} label={movieName} value={movieId} />
                                            );
                                        })}
                                    </Picker>
                                </View>
                                </>
                            ) : (
                                <View style={styles.section}>
                                    <Text>{selectedMovie?.MovieName}</Text>
                                </View>
                            )}
                            {/* <View style={styles.section}>
                                <Text style={styles.heading}>Show Date and Time:</Text>
                                <Text>{ticketDetails[0]?.Showdate}  {ticketDetails[0]?.Showtime}</Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.heading}>Screen and Seat:</Text>                               
                                <Text>{ticketDetails[0]?.ScreenName}  [{filterdTicket?.map((item) => item?.SeatNumber !== null ? item.SeatNumber : null)?.filter(seat => seat !== null)?.join(',') || `${filterdTicket.length} Seats`}]
                                </Text>
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.heading}>Status:</Text>
                                <Text>{displayStatus(filterdTicket[0]?.Status)}</Text>
                            </View> */}
                            <View style={styles.section}>
                                <Text style={styles.heading}>Show Date and Time:</Text>
                                <Text>{selectedMovie?.Showdate} {selectedMovie?.Showtime}</Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.heading}>Screen and Seat:</Text>
                                <Text>
                                    {selectedMovie?.ScreenName}{" "}
                                    [{ticketDetails.filter(item => item.MovieId === selectedMovieId)
                                        .map(item => item.SeatNumber !== null ? item.SeatNumber : null)?.filter(seat => seat !== null)?.join(', ') || `${filteredTicket.length} Seats`}]
                                </Text>

                            </View>

                            <View style={styles.section}>
                                <Text style={styles.heading}>Status:</Text>
                                <Text>{displayStatus(filteredTicket[0]?.Status)}</Text>
                            </View>
                            {/* <Text>{selectedMovie?.Status}</Text> */}
                        </View>
                    </View>
                    {/* {
                        ticketDetails[0]?.Status === 4 ?
                            <TouchableOpacity TouchableOpacity style={styles.saveButton} onPress={() => { handleCheckIn(); }}>
                                <Text style={styles.saveButtonText}>Check in</Text>
                            </TouchableOpacity>
                            : <TouchableOpacity TouchableOpacity style={styles.saveButton} onPress={() => { handleSaveType(); }}>
                                <Text style={styles.saveButtonText}>Done</Text>
                            </TouchableOpacity>

                    } */}
                    {
                        filteredTicket[0]?.Status === 4 ? (
                            <TouchableOpacity style={styles.saveButton} onPress={() => { handleCheckIn(); }}>
                                <Text style={styles.saveButtonText}>Check in</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.saveButton} onPress={() => { handleSaveType(); }}>
                                <Text style={styles.saveButtonText}>Done</Text>
                            </TouchableOpacity>
                        )
                    }

                </>
            }
            {
                type !== "save" &&
                <ConfirmLeavePrompt
                    navigation={navigation}
                    message="Are you sure you want to exit? "
                />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "start",
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        marginBottom: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderColor: "#e8e8e8",
        paddingBottom: 8,
        marginBottom: 20
    },
    headerText: {
        fontSize: 16,
        marginLeft: 15,
        fontWeight: 'bold',
    },
    section: {
        borderBottomColor: "#ff0000",
        marginVertical: 12,
        borderBottomWidth: 2,
        borderColor: "#e8e8e8",
        paddingBottom: 8
    },
    heading: {
        fontWeight: 'regular',
        fontSize: 15,
        color: '#827F7F',
        paddingBottom: 5

    },
    saveButton: {
        backgroundColor: '#2C77F4',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 45
    },
    saveButtonText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
    },
    message2: {
        fontSize: 16,
        marginBottom: 20
    },
    button: {
        backgroundColor: '#007BFF', // Set your desired color
        padding: 10,
        borderRadius: 5,
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default TicketDetails
