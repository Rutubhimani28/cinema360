


// export default MainScreen
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { AuthContext } from '../auth/AuthProvider';
import { storeData } from '../services/localStorage';


function MainScreen() {
    const navigation = useNavigation();

    const handleInventoryredirect = () => {
        navigation?.navigate('scan')
        storeData("type", "inventory")
    }
    const handleTicketdirect = () => {
        navigation?.navigate('scan')
        storeData("type", "ticket")
    }
    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity style={styles.saveButton} onPress={() => handleInventoryredirect()}>
                    <Text style={styles.saveButtonText} >Inventory</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={() => handleTicketdirect()} >
                    <Text style={styles.saveButtonText}>Ticket Check-in</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
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
    saveButton: {
        backgroundColor: '#2C77F4',
        padding: 15,
        borderRadius: 5,
        paddingHorizontal: 20,
        marginVertical: 10,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: "bold"
    },
});


export default MainScreen
