// Footer.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Footer = () => {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by</Text>
            <Image
                source={require('../assets/images/c360newlogo.png')}
                style={styles.logo}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        width: '100%',
        padding: 5,
        flexDirection: "row",
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
    },
    footerText: {
        fontSize: 14,
        color: '#333',
        fontWeight: "bold"
    },
    logo: {
        width: 120,
        height: 40,
        resizeMode: "cover",
        marginLeft: 6
    },
});

export default Footer;
