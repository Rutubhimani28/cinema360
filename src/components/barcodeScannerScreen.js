import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Image, Dimensions, ScrollView, Vibration, Alert, BackHandler, Pressable } from 'react-native';
import { barCodeScannerStyle } from '../css/style';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or another icon set
import { getStoreData } from '../services/localStorage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // or another icon set

const BarcodeScannerScreen = (props) => {
    console.warn(props, "resetTimer")
    const { resetTimer } = props;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [openCamera, setOpenCamera] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [types, setTypes] = useState('');
    const [facing, setFacing] = useState("back");
    const [light, setLight] = useState(false);
    const isFocused = useIsFocused();


    useEffect(() => {
        (async () => {
            const type = await getStoreData('type');
            setTypes(type);
        })();
    }, []);


    useEffect(() => {
        if (permission?.granted) {
            if (isFocused) {
                setScanned(false)
            }
        }
    }, [isFocused, permission])

    const handleBarCodeScanned = async ({ type, data }) => {
        setBarcode(data);
        setOpenCamera(false)
        setScanned(true)
        Vibration.vibrate();
        if (types === "inventory") {
            props.navigation.navigate("Form", { barcode: data })
        } else {
            props.navigation.navigate("ticket-details", { barcode: data })
        }
        setBarcode("")
    };
    const handleNavigate = () => {
        if (barcode === "") {
            alert("Please Enter BarCode")
        } else {

            if (types === "inventory") {
                props.navigation.navigate("Form", { barcode })
            } else {
                props.navigation.navigate("ticket-details", { barcode })
            }
            setOpenCamera(false)
            setScanned(false)
            setBarcode("");
        }
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

    const screenWidth = Dimensions.get('window').width;
    const desiredWidth = screenWidth * 0.75; // 80% of screen width
    const aspectRatio = 1.5;
    const calculatedHeight = desiredWidth * aspectRatio;

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to show the camera
                </Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    return (
        <ScrollView onTouchStart={resetTimer}>
            <View
                style={[!openCamera ? styles.scannerContainer : "", { height: calculatedHeight }]}
            >
                {openCamera ?
                    <CameraView
                        style={styles.camera}
                        facing={facing}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr", "code128", "code39", "upc_a", "upc_e"],
                            bounds: {
                                x: 0,
                                y: 0,
                                width: 300,
                                height: 300,
                            },
                        }}
                        enableTorch={light}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    >
                        <View style={styles.buttonContainer}>
                            <View style={styles.button}>
                                <Pressable
                                    onPress={() => {
                                        setLight(!light);
                                    }}
                                    style={{
                                        borderRadius: 100,
                                        padding: 10,
                                        backgroundColor: "#f1f1f1",
                                        // width: 50,
                                        // height: 50,
                                    }}
                                >
                                    <Image
                                        source={light ? require('../assets/images/flashlightOn.png') : require('../assets/images/torch.png')}
                                        style={{
                                            width: 30,
                                            height: 30,
                                        }}
                                    />
                                </Pressable>

                                {/* <Button
                                    title={`Flash ${light ? "OFF" : "ON"}`}
                                    iconContainerStyle={styles.iconButtonHomeContainer}
                                    icon={
                                        <Icon
                                            name={light ? "flash-off" : "flash-on"}
                                            size={24}
                                            color="white"
                                        />
                                    }
                                    titleStyle={{ ...styles.titleButtonHome, fontSize: 20 }}
                                    buttonStyle={{ ...styles.buttonHome, height: 50 }}
                                    containerStyle={{
                                        ...styles.buttonHomeContainer,
                                        marginTop: 20,
                                        marginBottom: 10,
                                    }}
                                    onPress={() => {
                                        setLight(!light);
                                    }}
                                /> */}
                            </View>
                            <View style={styles.button}>
                                <Pressable
                                    onPress={() => {
                                        setOpenCamera(false)
                                    }}
                                    style={{
                                        borderRadius: 100,
                                        padding: 15,
                                        backgroundColor: "#f1f1f1",
                                    }}
                                >
                                    <Image
                                        source={require('../assets/images/close.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                        }}
                                    />
                                </Pressable>

                                {/* <Button
                                    title={"back"}
                                    iconContainerStyle={styles.iconButtonHomeContainer}
                                    titleStyle={{ ...styles.titleButtonHome, fontSize: 20 }}
                                    buttonStyle={{ ...styles.buttonHome, height: 50 }}
                                    containerStyle={{
                                        ...styles.buttonHomeContainer,
                                        marginTop: 20,
                                        marginBottom: 10,
                                    }}
                                    onPress={() => {
                                        setOpenCamera(false)
                                    }}
                                /> */}
                            </View>
                        </View>
                    </CameraView>
                    :
                    types === "ticket" ?
                        <Image source={require('../assets/images/qr.png')} style={barCodeScannerStyle.image} />
                        :
                        <Image source={require('../assets/images/barcode.png')} style={barCodeScannerStyle.image} />

                }
                {!openCamera &&
                    <TouchableOpacity style={[barCodeScannerStyle.scaneBarcodeButton, { flexDirection: "row", alignItems: "center", justifyContent: "center" }]} onPress={() => { setOpenCamera(true) }}>
                        <Icon name="camera-alt" style={{ marginRight: 8 }} size={20} />
                        {
                            types === "ticket" ?
                                <Text style={barCodeScannerStyle.scaneBarcodeButtonText} >
                                    Scan QRcode
                                </Text>
                                :
                                <Text style={barCodeScannerStyle.scaneBarcodeButtonText} >
                                    Scan Barcode
                                </Text>
                        }
                    </TouchableOpacity>
                }
            </View>

            <View style={styles.barcodeForm}>
                <View style={styles.input}>
                    {
                        types === "ticket" ?
                            <Text style={barCodeScannerStyle.label}> Enter the Confirmation code</Text>
                            :
                            <Text style={barCodeScannerStyle.label}>Enter the barcode</Text>
                    }
                    <TextInput
                        style={barCodeScannerStyle.input}
                        placeholder={types === "ticket" ? "Enter the Confirmation code" : "Enter the barcode"}
                        value={barcode}
                        onChangeText={setBarcode}
                    />

                </View>

                <View style={styles.saveButton}>
                    <TouchableOpacity style={barCodeScannerStyle.saveButton} onPress={handleNavigate}>
                        <Text style={barCodeScannerStyle.saveButtonText} >NEXT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    scannerContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    barcodeForm: {
        borderTopWidth: 2,
        borderColor: "#e8e8e8",
        paddingTop: 20,
        flex: 1,
        // marginTop: 5,
        marginHorizontal: 15,
    },
    container: {
        flex: 1,
        justifyContent: "center",
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        margin: 25,
    },
    button: {
        marginVertical: 5,
        // alignSelf: "flex-end",
        alignItems: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    iconButtonHomeContainer: { marginRight: 10 },
    iconButtonHome: {
        type: "material",
        // size: 50,
        color: "white",
    },
    // titleButtonHome: {
    //     fontWeight: "700",
    //     fontSize: 25,
    // },
    buttonHome: {
        borderWidth: 0,
        // height: 100,
    },
    buttonHomeContainer: {
        width: 200,
        marginHorizontal: 50,
        marginVertical: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanBox: {
        // width: width * 0.8,
        // height: width * 0.8,
        borderColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    scannerLine: {
        width: '100%',
        height: 2, // Increased height to look like a bar
        backgroundColor: 'black',
        position: 'absolute',
        top: 0,
    },
});
export default BarcodeScannerScreen;
