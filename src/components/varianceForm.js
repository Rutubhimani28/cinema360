
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getApi } from '../services/api';
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../auth/AuthProvider';
import { navigate } from '../auth/navigate';
import { getStoreData } from '../services/localStorage';
import { useNavigation } from '@react-navigation/native';
import ConfirmLeavePrompt from './ConfirmLeavePrompt';
import { constant } from '../constant';
import axiosInstance from '../services/axiosInstance';


const VarianceForm = (props) => {
    const { resetTimer } = props;
    const [storageArea, setStorageArea] = useState('');
    const [inventoryName, setInventoryName] = useState('');
    const [expectedQuantity, setExpectedQuantity] = useState('');
    const [inventoryId, setInventoryId] = useState('');
    const [purchasePriceUnit, setPurchasePriceUnit] = useState(0);
    const [totalItemsReceived, setTotalItemsReceived] = useState(0);
    const [actualCount, setActualCount] = useState('');
    const [uom, setUom] = useState('');
    const [variance, setVariance] = useState('');
    const [notes, setNotes] = useState('');
    const [noteErr, setNoteErr] = useState(false);
    const [uomList, setUomList] = useState([])
    const [storageRoomList, setStorageRoomList] = useState([])
    const [loading, setLoading] = useState(false)
    const [defaultUnit, setDefaultUnit] = useState("")
    const [selectedOldUnit, setSelectedOldUnit] = useState(null)
    const [type, setType] = useState('')
    const [alertVisible, setAlertVisible] = useState(false);
    const [visible, setVisible] = useState(false);
    const navigation = useNavigation();

    const CustomAlert = ({ visible, onClose }) => {
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <View style={styles.alertContainer}>
                        <Text style={styles.message}>Inventory is not available in this storage room.</Text>
                        <Text style={styles.message2} >Select another storage room to proceed.</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                onClose();
                            }}
                        >
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };
    const VisibleAlert = ({ visible, onClose }) => {
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <View style={styles.alertContainer}>
                        <Text style={[styles.message, { marginBottom: 5 }]}>Invalid barcode id </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                onClose();
                            }}
                        >
                            <TouchableOpacity onPress={() => props.navigation.navigate("barcode")}><Text style={styles.buttonText}>OK</Text></TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };


    const extractBracketValue = (str) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : '';
    };

    const handleSave = async () => {
        // if (!notes || notes.trim() === "") {
        //     setNoteErr(true)
        //     return;
        // }
        if (Number(expectedQuantity.split(" ")[0]) == Number(actualCount)) {
            setStorageArea('');
            setInventoryName('');
            setExpectedQuantity('');
            setActualCount('');
            setUom('');
            setVariance('');
            setTotalItemsReceived('');
            setNotes('');
            setType('');
            props.navigation.navigate("barcode");
            alert("Data saved successfully");
            return;
        }

        const locationId = await getStoreData('LocationId')
        const userEmail = await getStoreData('userEmail')
        setLoading(true)
        let payload = [{}];
        let api = ""
        if (Number(expectedQuantity.split(" ")[0]) < Number(actualCount)) {

            payload = [
                {
                    "ReceivablesId": null,
                    "ReceivedDate": "2024-06-25T12:34:55Z",
                    "VendorName": "Nestle",
                    "InvoiceNo": "Correction",
                    "InventoryItems": [
                        {
                            "InventoryId": inventoryId,
                            "InventoryName": inventoryName,
                            "TotalItemsReceived": totalItemsReceived,
                            "PurchasePriceUnit": purchasePriceUnit,
                            "StorageRoomId": storageArea,
                            "TotalCost": totalItemsReceived * purchasePriceUnit,
                            "UOM": uom,
                            "Notes": notes
                        }
                    ],
                    "LocationId": locationId,
                    "LocationName": "",
                    "TotalQtyInHand": Number(expectedQuantity.split(" ")[0]),
                    // "ExceptedQtyUI": 0.5
                }
            ];

            api = `${constant.baseUrl}/api/Inventory/AddReceivablesCorrection`;

        } else {
            payload = [
                {
                    "Reasons": [
                        {
                            "Action": 3,
                            "Quantity": totalItemsReceived,
                            "UOM": uom,
                            "Note": notes
                        }
                    ],
                    "Quantity": totalItemsReceived,
                    "InventoryName": inventoryName,
                    "LocationId": locationId,
                    "StorageRoomId": storageArea,
                    "InventoryId": inventoryId,
                    "TotalQtyInHand": Number(expectedQuantity.split(" ")[0]),
                    "ExceptedQtyUI": Number(expectedQuantity.split(" ")[0]),
                }
            ]

            api = `${constant.baseUrl}/api/InvMain/PostInvMainList`;

        }

        try {
            const response = await axiosInstance.post(api, payload, {
                headers: {
                    Authorization: 'Bearer ' + await AsyncStorage.getItem("token"),
                    UserEmail: userEmail,
                    LocationId: locationId
                }
            });

            if (response?.status === 200 || response?.status === 204) {
                alert("Data save successfully")
                setStorageArea('');
                setInventoryName('');
                setExpectedQuantity('');
                setActualCount('');
                setUom('');
                setVariance('');
                setTotalItemsReceived('');
                setNotes('');
                props.navigation.navigate("barcode");
                setType("")
            }
        } catch (err) {
            console.error("Error while saving the data:", err);
        } finally {
            setLoading(false)
        }
    };


    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await getApi('/api/UnitOfMeasure/GetUnitOfMeasure');
            if (response?.status === 200) {
                setUomList(response?.data)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }
    const getAllStorageRooms = async () => {
        const locationId = await getStoreData('LocationId')
        setLoading(true)
        try {
            // https://cinema360devapi.azurewebsites.net/api/Inventory/GetInventoryStorageRoomByInventoryId/6662946a6b74bf75e14dfec5
            // const response = await getApi('api/Inventory/GetAllStorageRoomsByLocationId/64461bc8f23a19675f1ebd25');
            const response = await getApi(`/api/Inventory/GetAllStorageRoomsByLocationId/${locationId}`);
            if (response?.status === 200) {

                const visibleData = response?.data.filter((item) => item?.Visible === 1)
                setStorageRoomList(visibleData)
                const defaultStorageId = response?.data.find((item) => item.IsDefaultStorage === true)?.StorageRoomId
                // setStorageArea(defaultStorageId)
                fetchInventoryData(defaultStorageId)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchInventoryData = async (defaultStorageId) => {
        const locationId = await getStoreData('LocationId')
        setLoading(true)
        try {
            const response = await getApi(`/api/Inventory/GetInventoryByBarcodeLocationIdAndStorageroomId/${props?.route?.params?.barcode}/${locationId}/${defaultStorageId} `);
            if (response?.status === 200 || response?.status === 204) {
                const storageRoom = response?.data;


                if (storageRoom?.Visible === 0) {
                    setVisible(true)
                } else {
                    if (storageRoom) {
                        setStorageArea(defaultStorageId);
                        getInventoryName(storageRoom.InventoryId)
                        setInventoryId(storageRoom.InventoryId)
                        setPurchasePriceUnit(storageRoom.PurchasePriceUnit)
                        setExpectedQuantity(storageRoom?.TotalQuantityInHand?.toString() + " " + extractBracketValue(storageRoom?.UOM))
                        setUom(storageRoom.UOM)
                        setDefaultUnit(storageRoom.UOM)

                        setVariance(`0.00 ${extractBracketValue(storageRoom.UOM)}`)
                    } else {
                        setAlertVisible(true)
                    }
                }
            } else {
                props.navigation.navigate("barcode");
                alert("Barcode Invalid")
            }
        } catch (err) {
            props.navigation.navigate("barcode");
            alert("Barcode Invalid")
            console.log("Error :-", err)
        } finally {
            setLoading(false)
        }
    }

    const getInventoryName = async (InventoryID) => {
        setLoading(true)
        try {
            const response = await getApi(`/api/Inventory/${InventoryID}`);
            if (response?.status === 200) {
                setInventoryName(response?.data?.Title)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const calclulateVariance = async (expectedQuantity, actualCount, selectedUnit) => {
        const response = await getApi(`/api/UnitOfMeasure/GetConvertedUomValue/${actualCount || 0}/${selectedUnit}/${defaultUnit}`);
        // const response = await getApi(`/api/UnitOfMeasure/GetConvertedUomValue/${actualCount || 0}/${defaultUnit}/${selectedUnit}`);
        if (response?.status === 200) {
            const expectedQuantityNum = Number(expectedQuantity.replace(/[^0-9.]/g, ''));
            const actualCountNum = Number(response?.data?.toFixed(2));
            let result = actualCountNum - expectedQuantityNum

            return `${result >= 0 ? '(+)' : '(-)'} ${Math.abs(result)?.toFixed(2)}`;
            // return actualCountNum - expectedQuantityNum;
        } else {
            const expectedQuantityNum = Number(expectedQuantity.replace(/[^0-9.]/g, ''));
            const actualCountNum = Number(actualCount);

            let result = actualCountNum - expectedQuantityNum

            return `${result >= 0 ? '(+)' : '(-)'} ${Math.abs(result)?.toFixed(2)}`;
        }
    }

    const convertUnit = async (selectedUnit) => {
        setLoading(true)
        try {
            // const response = await getApi(`/api/UnitOfMeasure/GetConvertedUomValue/${actualCount || 0}/${selectedOldUnit || defaultUnit}/${selectedUnit}`);
            const response = await getApi(`/api/UnitOfMeasure/GetConvertedUomValue/${actualCount || 0}/${selectedUnit}/${selectedOldUnit || defaultUnit}`);
            // setSelectedOldUnit(selectedUnit)
            // const response = await getApi(`/api/UnitOfMeasure/GetConvertedUomValue/${actualCount || 0}/${"Kilogram (Kg)"}/${selectedUnit}`);
            if (response?.status === 200 && response?.data !== undefined) {
                setActualCount(response?.data?.toFixed(2))
                // const calclulatedVariance = await calclulateVariance(expectedQuantity, response?.data?.toFixed(2), selectedUnit)
                const calclulatedVariance = await calclulateVariance(expectedQuantity, response?.data?.toFixed(2), selectedOldUnit || defaultUnit)

                setVariance(`${calclulatedVariance} ${extractBracketValue(defaultUnit)}`)
                setTotalItemsReceived(parseFloat(calclulatedVariance.replace(/\(\+\) |\(-\) /, '')))
            } else {
                setActualCount(actualCount)
                const calclulatedVariance = await calclulateVariance(expectedQuantity, actualCount, uom)

                setVariance(`${calclulatedVariance} ${extractBracketValue(defaultUnit)}`)
                setTotalItemsReceived(parseFloat(actualCount.replace(/\(\+\) |\(-\) /, '')))
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        getAllStorageRooms()
    }, [props?.route?.params?.barcode])

    useEffect(() => {
        if (uomList.length > 0 && !uomList?.find((item) => item?.UOM === uom)) {
            setUomList((pre) => [...pre, {
                "UomId": null,
                "UOM": uom,
                "Type": null,
                "UnitAbbreviation": null,
                "Weight": null
            }])
        }
    }, [uom])

    const uomType = uomList.find((item) => item.UOM === uom)?.Type

    const styles = StyleSheet.create({
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
        },
        buttonText: {
            color: 'white',
            fontSize: 16,
        },
        container: {
            flexGrow: 1,
            padding: 20,
            backgroundColor: '#f0f0f6',
        },
        card: {
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 20,
            marginBottom: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 3,
        },
        headtitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'left',
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderColor: "#e8e8e8",
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
        },
        label: {
            fontSize: 16,
            marginBottom: 5,
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 5,
            marginBottom: 20,
        },
        textArea: {
            height: 100,
            textAlignVertical: 'top',
            marginBottom: 5,
            borderWidth: 1,
            borderColor: noteErr ? "red" : "#ccc"
        },
        saveButton: {
            backgroundColor: '#2C77F4',
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 20
        },
        saveButtonText: {
            color: '#fff',
            fontSize: 16,
        },
        loadercontainer: {
            flex: 1,
            justifyContent: 'center',
        },
        horizontal: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: 10,
        },
    });

    return (

        <ScrollView contentContainerStyle={styles.container} onTouchStart={resetTimer}>
            <CustomAlert visible={alertVisible} onClose={() => setAlertVisible(false)} />
            <VisibleAlert visible={visible} onClose={() => setVisible(false)} />
            {loading === true ?
                <View style={[styles.loadercontainer, styles.horizontal]}>
                    <ActivityIndicator size="extralarge" />
                </View> :
                <View style={styles.card}>
                    <Text style={styles.headtitle}>
                        <Image source={require('../assets/images/loc.png')} style={{ width: 20, paddingRight: 10 }} />
                        <Text style={{ marginLeft: 10 }}>Variance</Text>
                    </Text>
                    <Text style={styles.title}>Barcode no: {props?.route?.params?.barcode}</Text>
                    <Text style={styles.label}>Storage area:</Text>
                    <View style={{
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 5,
                        marginBottom: 20,
                    }}>
                        <Picker
                            selectedValue={storageArea || "Select_Storege_Area"}
                            onValueChange={(itemValue, itemIndex) => {
                                fetchInventoryData(itemValue)
                            }
                            }
                            style={{
                                height: 50,
                                width: '100%',
                            }}
                            Icon={() => {
                                return <Icon name="chevron-down" size={20} color="gray" />;
                            }}
                        >
                            <Picker.Item label="Select Storege Area" value="Select_Storege_Area" enabled={false} color="black" fontWeight="bold" style={{ fontWeight: "bold" }} />
                            {
                                storageRoomList?.length > 0 && storageRoomList?.map((item, i) => (

                                    <Picker.Item key={i} value={item?.StorageRoomId} label={item?.StorageRoomName} color="#4d4b4b" />

                                ))
                            }
                        </Picker>
                    </View>
                    <Text style={styles.label}>Inventory Name:</Text>
                    <TextInput
                        style={styles.input}
                        editable={false}
                        value={inventoryName}
                        onChangeText={setInventoryName}
                    />

                    <Text style={styles.label}>Expected Quantity:</Text>
                    <TextInput
                        style={styles.input}
                        value={expectedQuantity || null}
                        editable={false}
                        onChangeText={setExpectedQuantity}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Actual Quantity:</Text>
                    <TextInput
                        style={styles.input}
                        value={actualCount}
                        // onChangeText={setActualCount}
                        onChangeText={async (e) => {
                            if (e >= 0) {
                                setActualCount(e)
                                const calclulatedVariance = await calclulateVariance(expectedQuantity, e, uom)
                                setVariance(`${calclulatedVariance} ${extractBracketValue(defaultUnit)}`)
                                setTotalItemsReceived(parseFloat(calclulatedVariance.replace(/\(\+\) |\(-\) /, '')))
                                // setVariance(`${adjustedVariance} ${extractBracketValue(uom)}`)
                            }
                        }}

                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>UOM:</Text>
                    <View style={{
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 5,
                        marginBottom: 20,
                    }}>
                        <Picker
                            selectedValue={uom || "Select UOM"}
                            onValueChange={(itemValue, itemIndex) => {
                                convertUnit(itemValue)
                                // setUom(itemValue)
                            }
                            }
                            style={{
                                height: 50,
                                width: '100%',
                            }}
                        >
                            <Picker.Item label={"Select UOM"} value={"Select UOM"} enabled={false} style={{ fontWeight: "bold" }} />
                            {
                                uomList.filter((item) => item?.Type === uomType)?.length > 0 && uomList.filter((item) => item?.Type === uomType)?.map((item, i) => (
                                    <Picker.Item key={i} value={item?.UOM} label={item?.UOM} />
                                ))
                            }
                        </Picker>
                    </View>
                    <Text style={styles.label}>Variance:</Text>
                    <TextInput
                        style={styles.input}
                        value={variance}
                        onChangeText={setVariance}
                        editable={false}
                        keyboardType="numeric"
                    />
                    <View style={{ flexDirection: "row" }}>

                        <Text style={styles.label}>Notes</Text>
                        {/* <Text style={[styles.label, { color: "red" }]}>* </Text> */}
                        <Text style={styles.label}>:</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />

                    {/* <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                    {noteErr &&
                        <Text style={[{ color: "red" }]}>Please enter notes</Text>
                    } */}
                    <TouchableOpacity style={styles.saveButton} onPress={() => { handleSave(); setType("save") }} >

                        <Text style={styles.saveButtonText}>SAVE</Text>

                    </TouchableOpacity>
                </View>}
            {
                type !== "save" &&
                <ConfirmLeavePrompt
                    navigation={navigation}
                    message="Are you sure you want to exit? "
                />
            }
        </ScrollView>
    );
};



const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 5,
        borderColor: '#ccc',
        borderRadius: 5,
        color: 'black',
        paddingRight: 30,
        marginBottom: 20,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 5,
        borderColor: '#ccc',
        borderRadius: 5,
        color: 'black',
        paddingRight: 30,
        marginBottom: 20,
    },
});

export default VarianceForm;
