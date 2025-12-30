import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    buttonContainer: {
        alignSelf: 'flex-end',
        marginTop: 60,
    },
    inventory: {
        marginTop: 40,
        width: '100%',
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
    },
    buttonContainer2: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});

export const barCodeScannerStyle = StyleSheet.create({
    containe: {
        flexDirection: "column",
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    scannerContainer: {
        height: 250,
        width: '100%',
        marginTop: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tapAgain: {
        height: 100,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        height: 200,
        width: 200
    },
    scanButton: {
        position: 'absolute',
        bottom: 20,
        padding: 10,
        backgroundColor: '#fff',
    },
    scanButtonText: {
        fontSize: 16,
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },

    scaneBarcodeButton: {
        padding: 10,
        paddingVertical: 15,
        paddingHorizontal: 105,
        backgroundColor: '#e8e8e8',
        borderRadius: 5,
        marginLeft: 10,
        marginTop: 60,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    barcodeWrapper: {
        marginTop: 120,
        borderTopWidth: 1,
        borderColor: "#e8e8e8",
        paddingTop: 40,
        marginHorizontal: 15
    },
    scaneBarcodeButtonText: {
        color: '#000',
        fontSize: 16,
        // fontFamily: "Lexend-regular"
    },

    label: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: "center",
        // fontFamily: "Lexend-regular",
        color: "#827F7F"
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#2C77F4',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        // marginHorizontal: 15,
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 100,
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
    navcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 10,
        width: 420
    }
});