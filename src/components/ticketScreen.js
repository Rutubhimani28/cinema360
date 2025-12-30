import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Image, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native'
import { Picker } from '@react-native-picker/picker';

import { getStoreData } from '../services/localStorage'
import moment from 'moment';
import ConfirmLeavePrompt from './ConfirmLeavePrompt';
import { useNavigation } from '@react-navigation/native';
import { constant } from '../constant';
import axiosInstance from '../services/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TicketScreen = (props) => {
    const { resetTimer } = props;

    const [selectedScreen, setSelectedScreen] = useState(null);
    const [selectedShowTime, setSelectedShowTime] = useState(null);
    const [timezone, setTimezone] = useState('');
    const [selectedShow, setSelectedShow] = useState([]);
    const [loading, setIsLoading] = useState(false);
    const [showsData, setShowsData] = useState([]);
    const [movieData, setMovieData] = useState([]);
    const [movieDetails, setMovieDetails] = useState([]);
    const [ticketDetails, setTicketDetails] = useState([]);
    const navigation = useNavigation()

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
            console.error(err, "errrrrrr");
        } finally {

        }
    }

    const fetchTicketData = async () => {
        setIsLoading(true)
        const token = await getStoreData('token')
        const locationId = await getStoreData('LocationId')
        const userEmail = await getStoreData('userEmail')
        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/Screen/GetScreensByLocID/${locationId}`, {
                // const response = await axiosInstance.get(`${constant.baseUrl}/api/Screen/GetScreensByLocID/5ede13602a12a451b883932d`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    UserEmail: userEmail,
                    // UserEmail: "chirag.aditri90@gmail.com",
                    // LocationId: "5ede13602a12a451b883932d"
                    LocationId: locationId
                }
            });

            if (response?.status === 200) {
                const visibleData = response?.data.filter((item) => item?.Visible === 1)
                setShowsData(visibleData)
            }
        } catch (err) {
            console.log(err, "err");
        } finally {
            setIsLoading(false)

        }
    }
    const fetchMovieData = async (screenId) => {
        setIsLoading(true)
        const token = await getStoreData('token')
        const userEmail = await getStoreData('userEmail')
        const locationId = await getStoreData('LocationId')
        const timeZone = await getStoreData('timezone')

        const startTime = timeZone.split('T')[0]

        const todayFormatted = moment(startTime).format("YYYY-MM-DD") + "T00:00:00.000Z";
        const tomorrowFormatted = moment(startTime).format("YYYY-MM-DD") + "T23:59:59.000Z";
        try {
            const response = await axiosInstance.get(`${constant.baseUrl}/api/MovieSchedule/GetByDateAndLocationId/${locationId}/${todayFormatted}/${tomorrowFormatted}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    UserEmail: userEmail,
                    // UserEmail: "chirag.aditri90@gmail.com",
                    LocationId: locationId
                }
            });

            if (response?.status === 200) {

                const movie = response?.data?.filter((item) => item?.ScreenID === screenId)

                // const sortTime = movie.sort((a, b) => {
                //     const timeA = convertTo12HourFormat(a.StartDateTime);
                //     const timeB = convertTo12HourFormat(b.StartDateTime);

                //     // First, sort by AM/PM period
                //     if (timeA.time12.includes('AM') && timeB.time12.includes('PM')) return -1;
                //     if (timeA.time12.includes('PM') && timeB.time12.includes('AM')) return 1;

                //     // If both are in the same period (AM or PM), sort by actual time
                //     console.log(timeA.date - timeB.date, " const sortTime");
                //     return timeA.date - timeB.date;
                // })

                setMovieData(movie)
            }
        } catch (err) {
            console.log(err, "error");
        } finally {
            setIsLoading(false)

        }
    }
    const getShowTicketCount = async (showId) => {
        setIsLoading(true)
        const token = await getStoreData('token')
        const locationId = await getStoreData('LocationId')
        const userEmail = await getStoreData('userEmail')

        try {
            const response = await axiosInstance.post(`${constant.baseUrl}/api/SalesOrder/GetShowTicketCount`, [showId], {
                headers: {
                    Authorization: 'Bearer ' + token,
                    UserEmail: userEmail,
                    // UserEmail: "chirag.aditri90@gmail.com",
                    LocationId: locationId
                }
            });

            if (response?.status === 200) {
                setTicketDetails(response?.data?.[0])
            }

        } catch (err) {
            console.log(err, "server error");
        } finally {
            setIsLoading(false)

        }
    }
    useEffect(() => {
        getLocation();
        fetchTicketData();
    }, []);

    const handleScreenChange = (screenId) => {
        setSelectedScreen(screenId);
        setSelectedShow(null);
        fetchMovieData(screenId);
    };

    const handleShowChange = (value) => {
        const show = showsData?.filter(shows => shows?.Screen_ID === value?.ScreenID);

        const movieDetais = movieData?.filter(shows => shows?.ShowID === value?.ShowID);

        getShowTicketCount(movieDetais[0]?.ShowID)
        setMovieDetails(movieDetais[0])
        setSelectedShow(show);
    };

    let updatedRows = [];


    if (selectedShow?.[0]?.Rows && selectedShow?.[0]?.BlankSeats) {
        const rowsObj = selectedShow[0].Rows.reduce((acc, row) => {
            const rowName = row[0];
            const seatCount = parseInt(row.slice(1));
            acc[rowName] = seatCount;
            return acc;
        }, {});

        selectedShow[0].BlankSeats.forEach(seat => {
            const { Row, SeatNumber, Count } = seat;
            if (rowsObj[Row] !== undefined) {
                rowsObj[Row] += Count;
            }
        });

        updatedRows = Object.entries(rowsObj).map(([rowName, seatCount]) => `${rowName}${seatCount}`);
    }

    // const generateSeatData = (rows, blanks, unavailable) => {
    //     let seatData = rows?.map(row => {
    //         let rowName = row[0];
    //         let totalSeats = parseInt(row?.slice(1));
    //         let seats = new Array(totalSeats)?.fill({ reserved: "available" });

    //         // Mark blanks first
    //         blanks?.forEach(blank => {
    //             if (blank?.Row === rowName) {
    //                 for (let i = blank?.SeatNumber - 1; i < blank?.SeatNumber - 1 + blank?.Count; i++) {
    //                     seats[i] = { reserved: "blank" }; // Mark as blank
    //                 }
    //             }
    //         });

    //         // Mark unavailable seats next
    //         if (ticketDetails?.Seats?.some((item) => item !== null)) {
    //             ticketDetails?.Seats?.forEach(unavail => {
    //                 let unavailRow = unavail[0];
    //                 let unavailSeat = parseInt(unavail?.slice(1));

    //                 if (unavailRow === rowName) {
    //                     // Ensure we do not overwrite blank seats
    //                     if (seats[unavailSeat - 1]?.reserved !== "blank") {
    //                         seats[unavailSeat - 1] = { reserved: "unavailable" }; // Mark as unavailable
    //                     }
    //                 }
    //             });
    //         }

    //         return { rowName, seats };
    //     });

    //     return seatData;
    // };


    //working
    // const generateSeatData = (rows, blanks, unavailable) => {
    //     let seatData = rows?.map(row => {
    //         let rowName = row[0];
    //         let totalSeats = parseInt(row?.slice(1));
    //         console.log(totalSeats, "totalSeats");

    //         let seats = new Array(totalSeats).fill({ reserved: "available" }); // Initialize all seats as available

    //         // Mark blanks first
    //         // blanks?.forEach(blank => {
    //         //     if (blank?.Row === rowName) {
    //         //         // Add blank seats without replacing existing blanks
    //         //         for (let i = blank?.SeatNumber + 1; i < blank?.SeatNumber + 1 + blank?.Count; i++) {
    //         //             // Check if the seat is already blank, if not, mark it as blank
    //         //             if (seats[i]?.reserved !== "blank") {
    //         //                 seats[i] = { reserved: "blank" }; // Mark as blank
    //         //             }
    //         //         }
    //         //     }
    //         // });
    //         blanks?.forEach(blank => {
    //             console.log(blanks, "blanks");

    //             if (blank?.Row === rowName) {
    //                 // Add blank seats without shifting numbers incorrectly
    //                 const startIndex = selectedShow?.[0]?.IsColsReverse ? blank?.SeatNumber : blank?.SeatNumber - 1; // Adjust index properly (since it's 0-based)----------------------
    //                 const endIndex = startIndex + blank?.Count;
    //                 console.log(startIndex, endIndex);

    //                 // Replace seats with blank ones for the specified range
    //                 for (let i = startIndex; i < endIndex; i++) {
    //                     seats[i] = { reserved: "blank" }; // Mark seat as blank
    //                 }
    //             }
    //         });

    //         // Then mark unavailable seats
    //         if (ticketDetails?.Seats?.some((item) => item !== null)) {
    //             console.log(ticketDetails?.Seats, "ticketDetails?.Seats");

    //             ticketDetails?.Seats?.forEach(unavail => {
    //                 let unavailRow = unavail[0];
    //                 let unavailSeat = parseInt(unavail?.slice(1));
    //                 console.log(unavail, "unavail");
    //                 console.log(unavailSeat, "unavailSeat");


    //                 console.log(unavailRow, rowName, "LLLLLLLLLLLLLLLLLlll");

    //                 if (unavailRow === rowName) {
    //                     console.log(seats, "blank", "++++++++++++++++++++++")
    //                     if (seats[unavailSeat - 1]?.reserved !== "blank") {
    //                         // Only mark as unavailable if it's not already blank
    //                         seats[unavailSeat - 1] = { reserved: "unavailable" }; // Mark as unavailable
    //                     }
    //                     //  else {
    //                     //     seats[unavailSeat + 1] = { reserved: "unavailable" }; // Mark as unavailable

    //                     // }
    //                 }
    //             });
    //         }

    //         return { rowName, seats };
    //     });

    //     return seatData;
    // };

    const generateSeatData = (rows, blanks, unavailable) => {
        let seatData = rows?.map((row) => {
            let rowName = row[0];
            let totalSeats = parseInt(row?.slice(1)); // Extract total seats
            console.log(totalSeats, "Total Seats");

            // Initialize all seats as available
            let seats = new Array(totalSeats).fill({ reserved: "available" });

            // Track how many seats are shifted by blank seats
            let seatShiftMap = new Array(totalSeats).fill(0); // Track shifting for unavailable seats

            // Mark blank seats
            blanks?.forEach((blank) => {
                if (blank?.Row === rowName) {
                    const startIndex = selectedShow?.[0]?.IsColsReverse
                        ? blank?.SeatNumber // Use exact index if reversed
                        : blank?.SeatNumber - 1; // Adjust for 0-based index

                    const endIndex = startIndex + blank?.Count;
                    console.log(`Blank Range: ${startIndex} - ${endIndex}`);

                    for (let i = startIndex; i < endIndex; i++) {
                        seats[i] = { reserved: "blank" }; // Mark seat as blank
                        seatShiftMap[i] = 1; // Mark this index as shifted
                    }
                }
            });

            // Adjust seat shift to cumulative shift
            let cumulativeShift = 0;
            for (let i = 0; i < seatShiftMap.length; i++) {
                cumulativeShift += seatShiftMap[i];
                seatShiftMap[i] = cumulativeShift; // Store cumulative shift at each index
            }

            // Mark unavailable seats, adjusting for any shifts caused by blank seats
            ticketDetails?.Seats?.forEach((unavail) => {
                let unavailRow = unavail[0];
                let unavailSeat = parseInt(unavail?.slice(1)); // Parse seat number
                console.log(`Unavailable Seat: ${unavail}`);

                if (unavailRow === rowName) {
                    let originalIndex = unavailSeat - 1; // Adjust for 0-based index
                    let shiftedIndex = originalIndex + seatShiftMap[originalIndex]; // Adjust index by shift

                    // Only mark as unavailable if it's not blank
                    if (seats[shiftedIndex]?.reserved !== "blank") {
                        seats[shiftedIndex] = { reserved: "unavailable" }; // Mark unavailable
                    } else {
                        seats[shiftedIndex + 1] = { reserved: "unavailable" }; // Mark unavailable

                    }
                }
            });

            return { rowName, seats }; // Return row with seat data
        });

        return seatData; // Return final seat layout
    };



    // thoduk working
    // const generateSeatData = (rows, blanks, unavailable) => {
    //     let seatData = rows?.map(row => {
    //         let rowName = row[0];
    //         let totalSeats = parseInt(row?.slice(1));
    //         let seats = new Array(totalSeats)?.fill({ reserved: "available" }); // Initialize all seats as available

    //         // Mark blanks first
    //         blanks?.forEach(blank => {
    //             if (blank?.Row === rowName) {
    //                 for (let i = blank?.SeatNumber - 1; i < blank?.SeatNumber - 1 + blank?.Count; i++) {
    //                     seats[i] = { reserved: "blank" }; // Mark as blank
    //                 }
    //             }
    //         });

    //         // Then mark unavailable seats
    //         if (ticketDetails?.Seats?.some((item) => item !== null)) {
    //             ticketDetails?.Seats?.forEach(unavail => {
    //                 let unavailRow = unavail[0];
    //                 let unavailSeat = parseInt(unavail?.slice(1));

    //                 if (unavailRow === rowName) {
    //                     if (seats[unavailSeat - 1]?.reserved !== "blank") {
    //                         // Only mark as unavailable if it's not already blank
    //                         seats[unavailSeat - 1] = { reserved: "unavailable" }; // Mark as unavailable
    //                     }
    //                 }
    //             });
    //         }
    //         console.log(rowName, seats, "++++++++++++++++++++++++");

    //         return { rowName, seats };
    //     });

    //     return seatData;
    // };


    // old
    // const generateSeatData = (rows, blanks, unavailable) => {


    //     let seatData = rows?.map(row => {
    //         let rowName = row[0];
    //         let totalSeats = parseInt(row?.slice(1));
    //         let seats = new Array(totalSeats)?.fill({ reserved: "available" });
    //         console.log(row, "blanks");

    //         blanks?.forEach(blank => {
    //             if (blank?.Row === rowName) {
    //                 console.log(blank?.Row, rowName, "blank?.Row === ++++++++++++++++++");

    //                 for (let i = blank?.SeatNumber - 1; i < blank?.SeatNumber - 1 + blank?.Count; i++) {
    //                     seats[i] = { reserved: "blank" }; // Marking as blank
    //                 }
    //             }
    //         });

    //         if (ticketDetails?.Seats?.some((item) => item !== null)) {
    //             ticketDetails?.Seats?.forEach(unavail => {
    //                 let unavailRow = unavail[0];
    //                 let unavailSeat = parseInt(unavail?.slice(1));
    //                 console.log(unavailRow, rowName, "unavailRow === rowName");

    //                 if (unavailRow === rowName) {
    //                     seats[unavailSeat - 1] = { reserved: "unavailable" }; // Marking as unavailable
    //                 }
    //             });
    //         }
    //         console.log(rowName, seats, "rowName, seatsrowName, seats");

    //         return { rowName, seats };
    //     });
    //     console.log(seatData, "seatData");

    //     return seatData;
    // };
    const rowsssss = ["A10", "B15"];
    // const blanks = [{ row: "A", seatNumber: 15, count: 4 }, { row: "B", seatNumber: 16, count: 1 }];
    const blanks = selectedShow?.[0]?.BlankSeats
    // const unavailable = ["A3", "A2", "B4", "C20"];
    const unavailable = selectedShow?.[0]?.Unavailable
    let seatData = generateSeatData(updatedRows, blanks, unavailable);
    return (
        <ScrollView onTouchStart={resetTimer}>
            <View style={styles.container}>
                {loading ?
                    <View >
                        <ActivityIndicator size="extralarge" />
                    </View>
                    :
                    <>
                        <View style={styles.header}>
                            <Image source={require('../assets/images/tik.png')} />
                            <Text style={styles.headerText}>Screens and Tickets</Text>
                        </View>
                        <Text style={styles.label}>Available Screen:</Text>
                        <View style={styles.inputGroup}>
                            <Picker
                                style={styles.inputField}
                                selectedValue={selectedScreen}
                                onValueChange={(screenId) => handleScreenChange(screenId)}
                            >
                                <Picker.Item label="Select Screen" value={null} style={{ fontWeight: "bold" }} />
                                {showsData && showsData?.map((screen) => (
                                    <Picker.Item key={screen?.Screen_ID} label={screen?.Screen_Name} value={screen?.Screen_ID} color="#4d4b4b" />
                                ))}
                            </Picker>
                        </View>

                        {selectedScreen && (
                            <>
                                <Text style={styles.label}>Showtimes:</Text>
                                <View style={styles.inputGroup}>
                                    <Picker
                                        // selectedValue={selectedShow ? selectedShow[0]?.Screen_ID : null}
                                        selectedValue={selectedShowTime}
                                        onValueChange={(value) => {
                                            setSelectedShowTime(value)
                                            handleShowChange(value)
                                        }}
                                        style={styles.inputField}
                                    >
                                        <Picker.Item label="Select Showtime" value={null} style={{ fontWeight: "bold" }} />
                                        {movieData
                                            ?.filter((item) => item?.Status === 2 && item?.StartDateTime) // Ensure StartDateTime exists
                                            ?.sort((a, b) => {
                                                // Ensure valid date comparison
                                                const dateA = new Date(a.StartDateTime).getTime();
                                                const dateB = new Date(b.StartDateTime).getTime();
                                                return dateA - dateB;
                                            })
                                            ?.map((show) => (
                                                <Picker.Item
                                                    key={show.ScreenID}
                                                    label={`${moment(show?.StartDateTime, "DD-MM-YYYY hh:mm A").format('hh:mm A')} - ${moment(show?.EndDateTime, "DD-MM-YYYY hh:mm A").format('hh:mm A')}`}
                                                    // value={show.ScreenID}
                                                    value={show}
                                                    color="#4d4b4b"
                                                />
                                            ))}
                                    </Picker>
                                </View>
                                {selectedShow && selectedShow?.[0] && (
                                    <View style={styles.detailsContainer}>
                                        <View style={styles.section}>
                                            <Text style={styles.heading}>Movie Name:</Text>
                                            <Text >{movieDetails?.MovieName}</Text>
                                        </View>
                                        <View style={styles.section}>
                                            <Text style={styles.heading}>Total Available Seats:</Text>
                                            <Text>{selectedShow[0]?.Total_Seats}</Text>
                                        </View>
                                        <View style={styles.section}>
                                            <Text style={styles.heading}>Number of Tickets Sold:</Text>
                                            <Text>{ticketDetails?.TicketsSold}</Text>
                                        </View>
                                        {
                                            selectedShowTime?.Seating === "allocated" &&
                                            <>
                                                <View >
                                                    <Text style={{
                                                        fontWeight: 'regular',
                                                        fontSize: 15,
                                                        color: '#827F7F',
                                                        paddingVertical: 5
                                                    }}>Number of seats reserved:</Text>
                                                </View>

                                                {/* <ScrollView horizontal={true}>
                                                    <View style={styles.seatLayout}>
                                                        {seatData?.length > 0 &&
                                                            seatData?.map((row, index) => {
                                                                let seatNumber = 0; // Initialize seat counter for each row
                                                                return (
                                                                    <View
                                                                        key={index}
                                                                        style={[
                                                                            styles.row,
                                                                            {
                                                                                marginTop:
                                                                                    selectedShow?.[0]?.UpAisle?.includes(row.rowName) && 8,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Text style={styles.rowsLabel}>{row.rowName}</Text>
                                                                        {row.seats.map((seat, idx) => {
                                                                            if (seat.reserved === "blank") {
                                                                                return <View key={idx} style={styles.blankSeat} />;
                                                                            } else {
                                                                                seatNumber++; // Increment seat counter only for non-blank seats
                                                                                return seat.reserved === "available" ? (
                                                                                    <View key={idx}>
                                                                                        <View
                                                                                            style={{
                                                                                                textAlign: "center",
                                                                                                justifyContent: "center",
                                                                                                alignItems: "center",
                                                                                                position: "relative",
                                                                                            }}
                                                                                        >
                                                                                            <Image
                                                                                                source={require("../assets/images/unbook.png")}
                                                                                                style={{ width: 20, height: 20, textAlign: "center" }}
                                                                                            />
                                                                                            <Text
                                                                                                style={{
                                                                                                    position: "absolute",
                                                                                                    fontSize: 8,
                                                                                                    top: 7,
                                                                                                    color: "#fff",
                                                                                                    textAlign: "center",
                                                                                                    justifyContent: "center",
                                                                                                    alignItems: "center",
                                                                                                }}
                                                                                            >
                                                                                                {seatNumber}
                                                                                            </Text>
                                                                                        </View>
                                                                                    </View>
                                                                                ) : (
                                                                                    <Image
                                                                                        key={idx}
                                                                                        source={require("../assets/images/book.png")}
                                                                                        style={{ width: 20, height: 20, marginTop: 3 }}
                                                                                    />
                                                                                );
                                                                            }
                                                                        })}
                                                                        <Text style={styles.rowsLabel}>{row.rowName}</Text>
                                                                    </View>
                                                                );
                                                            })}
                                                    </View>
                                                </ScrollView> */}
                                                {/* roe reverse */}
                                                {/* <ScrollView horizontal={true}>
                                                    <View style={styles.seatLayout}>
                                                        {seatData?.length > 0 &&
                                                            (selectedShow?.[0]?.IsRowsReverse === true ? [...seatData].reverse() : seatData).map((row, index) => {
                                                                let seatNumber = 0; // Initialize seat counter for each row
                                                                const seatsToShow = selectedShow?.[0]?.IsRowsReverse === true ? [...row.seats].reverse() : row.seats;

                                                                return (
                                                                    <View
                                                                        key={index}
                                                                        style={[
                                                                            styles.row,
                                                                            {
                                                                                marginTop: selectedShow?.[0]?.UpAisle?.includes(row.rowName) && 8,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Text style={styles.rowsLabel}>{row.rowName}</Text>
                                                                        {seatsToShow.map((seat, idx) => {
                                                                            if (seat.reserved === "blank") {
                                                                                return <View key={idx} style={styles.blankSeat} />;
                                                                            } else {
                                                                                seatNumber++; // Increment seat counter only for non-blank seats
                                                                                return seat.reserved === "available" ? (
                                                                                    <View key={idx}>
                                                                                        <View
                                                                                            style={{
                                                                                                textAlign: "center",
                                                                                                justifyContent: "center",
                                                                                                alignItems: "center",
                                                                                                position: "relative",
                                                                                            }}
                                                                                        >
                                                                                            <Image
                                                                                                source={require("../assets/images/unbook.png")}
                                                                                                style={{ width: 20, height: 20, textAlign: "center" }}
                                                                                            />
                                                                                            <Text
                                                                                                style={{
                                                                                                    position: "absolute",
                                                                                                    fontSize: 8,
                                                                                                    top: 7,
                                                                                                    color: "#fff",
                                                                                                    textAlign: "center",
                                                                                                    justifyContent: "center",
                                                                                                    alignItems: "center",
                                                                                                }}
                                                                                            >
                                                                                                {seatNumber}
                                                                                            </Text>
                                                                                        </View>
                                                                                    </View>
                                                                                ) : (
                                                                                    <Image
                                                                                        key={idx}
                                                                                        source={require("../assets/images/book.png")}
                                                                                        style={{ width: 20, height: 20, marginTop: 3 }}
                                                                                    />
                                                                                );
                                                                            }
                                                                        })}
                                                                        <Text style={styles.rowsLabel}>{row.rowName}</Text>
                                                                    </View>
                                                                );
                                                            })}
                                                    </View>
                                                </ScrollView> */}
                                                {/* <View style={{ justifyContent: "center", placeSelf: "center", flex: 1, alignItems: "center" }}>
                                                    <ScrollView horizontal={true} >
                                                        <View style={styles.seatLayout}>
                                                            {seatData?.length > 0 &&
                                                                (selectedShow?.[0]?.IsRowsReverse === true ? [...seatData].reverse() : seatData).map((row, index) => {

                                                                    const seatsToShow = selectedShow?.[0]?.IsColsReverse === true ? [...row.seats].reverse() : row.seats;
                                                                    let seatNumber = selectedShow?.[0]?.IsColsReverse === true ? seatsToShow.length + 1 : 0; // Initialize seat counter for each row
                                                                 
                                                                    return (
                                                                        <View
                                                                            key={index}
                                                                            style={[
                                                                                styles.row,
                                                                                {
                                                                                    marginTop: selectedShow?.[0]?.UpAisle?.includes(row.rowName) ? 8 : 0,
                                                                                },
                                                                            ]}
                                                                        >
                                                                            <Text style={[styles.rowsLabel]}>{row.rowName}</Text>

                                                                            {seatsToShow.map((seat, idx) => {
                                                                                if (seat.reserved === "blank") {
                                                                                    return <View key={idx} style={styles.blankSeat} />;
                                                                                } else {
                                                                                    selectedShow?.[0]?.IsColsReverse === true ? seatNumber-- : seatNumber++;
                                                                                    return seat.reserved === "available" ? (
                                                                                        <View key={idx} >
                                                                                            <View
                                                                                                style={{
                                                                                                    justifyContent: "center",
                                                                                                    alignItems: "center",
                                                                                                    position: "relative",
                                                                                                }}
                                                                                            >
                                                                                                <Image
                                                                                                    source={require("../assets/images/unbook.png")}
                                                                                                    style={{ width: 25, height: 25 }}
                                                                                                />
                                                                                                <Text
                                                                                                    style={{
                                                                                                        position: "absolute",
                                                                                                        fontSize: 10,
                                                                                                        top: 9,
                                                                                                        fontWeight: "500",
                                                                                                        color: "#fff",
                                                                                                        textAlign: "center",
                                                                                                    }}
                                                                                                >
                                                                                                    {seatNumber}
                                                                                                </Text>
                                                                                            </View>
                                                                                        </View>
                                                                                    ) : (
                                                                                        <Image
                                                                                            key={idx}
                                                                                            source={require("../assets/images/book.png")}
                                                                                            style={{ width: 25, height: 25, marginTop: 3 }}
                                                                                        />
                                                                                    );
                                                                                }
                                                                            })}

                                                                            <Text style={[styles.rowsLabel]}>{row.rowName}</Text>
                                                                        </View>
                                                                    );
                                                                })}
                                                        </View>
                                                    </ScrollView>

                                                </View> */}
                                                <View style={{ justifyContent: "center", alignSelf: "center", flex: 1, alignItems: "center" }}>
                                                    <ScrollView horizontal={true}>
                                                        <View style={styles.seatLayout}>
                                                            {seatData?.length > 0 &&
                                                                (selectedShow?.[0]?.IsRowsReverse ? [...seatData].reverse() : seatData).map((row, rowIndex) => {
                                                                    const seatsToShow = selectedShow?.[0]?.IsColsReverse ? [...row.seats].reverse() : row.seats;

                                                                    // Calculate the total number of non-blank seats in the row
                                                                    const nonBlankSeatsCount = seatsToShow.filter(seat => seat?.reserved !== "blank").length;

                                                                    // Initialize the seat counter based on whether columns are reversed
                                                                    let seatCounter = selectedShow?.[0]?.IsColsReverse ? nonBlankSeatsCount : 1;

                                                                    return (
                                                                        <View
                                                                            key={rowIndex}
                                                                            style={[
                                                                                styles.row,
                                                                                { marginTop: selectedShow?.[0]?.UpAisle?.includes(row.rowName) ? 8 : 0 },
                                                                            ]}
                                                                        >
                                                                            <Text style={styles.rowsLabel}>{row.rowName}</Text>

                                                                            {seatsToShow.map((seat, seatIndex) => {
                                                                                // Skip incrementing seat counter if the seat is "blank"
                                                                                let currentSeatNumber = seat.reserved !== "blank" ? seatCounter : null;

                                                                                // Increment or decrement the seat counter only if the seat is not "blank"
                                                                                if (seat.reserved !== "blank") {
                                                                                    selectedShow?.[0]?.IsColsReverse ? seatCounter-- : seatCounter++;
                                                                                }

                                                                                return seat.reserved === "blank" ? (
                                                                                    <View key={seatIndex} style={styles.blankSeat} />
                                                                                ) : seat.reserved === "available" ? (
                                                                                    <View key={seatIndex} style={{ justifyContent: "center", alignItems: "center", position: "relative" }}>
                                                                                        <Image
                                                                                            source={require("../assets/images/unbook.png")}
                                                                                            style={{ width: 25, height: 25 }}
                                                                                        />
                                                                                        <Text
                                                                                            style={{
                                                                                                position: "absolute",
                                                                                                fontSize: 10,
                                                                                                top: 9,
                                                                                                fontWeight: "500",
                                                                                                color: "#fff",
                                                                                                textAlign: "center",
                                                                                            }}
                                                                                        >
                                                                                            {currentSeatNumber}
                                                                                        </Text>
                                                                                    </View>
                                                                                ) : (
                                                                                    <Image
                                                                                        key={seatIndex}
                                                                                        source={require("../assets/images/book.png")}
                                                                                        style={{ width: 25, height: 25, marginTop: 3 }}
                                                                                    />
                                                                                );
                                                                            })}

                                                                            <Text style={styles.rowsLabel}>{row.rowName}</Text>
                                                                        </View>
                                                                    );
                                                                })}
                                                        </View>
                                                    </ScrollView>
                                                </View>

                                                <View style={styles.legend}>
                                                    <View style={styles.legendItem}>
                                                        <Image source={require('../assets/images/unbook.png')} style={{ width: 16, height: 16 }} />
                                                        <Text style={styles.legendText}>Available</Text>
                                                    </View>
                                                    <View style={styles.legendItem}>
                                                        <Image source={require('../assets/images/book.png')} style={{ width: 16, height: 16 }} />
                                                        <Text style={styles.legendText}>Unavailable</Text>
                                                    </View>
                                                </View>
                                            </>
                                        }
                                    </View>
                                )}
                            </>
                        )}
                    </>
                }
                <ConfirmLeavePrompt
                    navigation={navigation}
                    message="Are you sure you want to exit? "
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        marginBottom: 70,
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
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
    },
    inputField: {
        fontSize: 16,
        height: 50,
        width: '100%',
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
    seatLayout: {
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: "center",
    },

    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        marginHorizontal: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendText: {
        marginLeft: 8,
    },
    rowsLabel: {
        fontWeight: 'bold',
        width: 20,
        textAlign: "center",
    },
    blankSeat: {
        width: 25,
        height: 25,
        backgroundColor: 'transparent', // Adjust as per your needs
        // borderWidth: 1,
        // borderColor: 'black',
    },
});

export default TicketScreen
