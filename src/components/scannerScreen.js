import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Dimensions,
  Vibration,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";
import qs from "qs";
import { getStoreData, storeData } from "../services/localStorage";
import { AuthContext } from "../auth/AuthProvider";
import { useNavigation } from "@react-navigation/native";
import { constant } from "../constant";
import axiosInstance from "../services/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function ScannerScreen(props) {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [light, setLight] = useState(false);
  const [data, setData] = useState("");
  const [token, setToken] = useState("");
  const [timezone, setTimezone] = useState("");

  const { signUpUser, tokenGet } = useContext(AuthContext);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  useEffect(() => {
    if (permission?.granted) {
      fetchToken();
    }
  }, [permission]);

  const getTimeZone = async (Timezone, pin) => {
    console.log(Timezone, "Timezone--------------");

    const token = await getStoreData("token");
    try {
      const response = await axiosInstance.get(
        `${constant.baseUrl}/api/Location/GetDateByTimeZoneName?timeZone=${Timezone}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      if (response?.status === 200) {
        await AsyncStorage.setItem("timezone", response?.data);
        const storedTimezone = await AsyncStorage.getItem("timezone");
        setTimezone(storedTimezone);
        signUpUser(pin);
      }
    } catch (err) {
      console.log(err, "err");
    }
  };
  const getLocation = async (locationId, pin) => {
    const token = await getStoreData("token");
    try {
      const response = await axiosInstance.get(
        `${constant.baseUrl}/api/Location/${locationId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
            LocationId: locationId,
          },
        }
      );
      if (response?.status === 200) {
        getTimeZone(response?.data?.Timezone, pin);
      }
    } catch (err) {
      console.error(err, "err");
    } finally {
    }
  };

  const fetchToken = async () => {
    const datas = qs.stringify({
      grant_type: process.env.REACT_APP_AZURE_GRANT_TYPE,
      client_id: process.env.REACT_APP_AZURE_CLIENT_ID,
      client_secret: process.env.REACT_APP_AZURE_CLIENT_SECRET,
      resource: process.env.REACT_APP_AZURE_RESOURCE,
    });
   
    try {
      const response = await axios.post(
        "https://login.microsoftonline.com/56f89eac-5849-472e-bbb0-ec7848e1c4c3/oauth2/token",
        datas,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "Cache-Control": "no-store, no-cache",
          },
        }
      );
      storeData("token", response.data.access_token);
      storeData("token_exp_time", response.data.expires_in);
      // tokenGet("120")
      // tokenGet(response.data.expires_in)
      setToken(response.data.access_token);
    } catch (error) {
      console.error("LLLLLLLLL", error);
    }
  };

  const verifyRegisterPin = async (pin) => {
    try {
      const response = await axiosInstance.get(
        `${constant.baseUrl}/api/AuthorizeExternalDevice/VerifyRegisterPin/${pin}`,
        {
          headers: {
            Authorization: "Bearer " + token,
            // CompanyId: "f604d90",
            LocationId: "5ede13602a12a451b883932d",
          },
        }
      );

      if (response.status === 200) {
        storeData("CompanyId", response?.data?.CompanyId);
        storeData("LocationId", response?.data?.LocationId);
        storeData("barcodeData", pin);
        getLocation(response?.data?.LocationId, pin);
      } else {
        displayAlert("Invalid Register Pin");
      }
    } catch (err) {
      console.log("kkkkkkkkkk", err);
      displayAlert("Invalid Register Pin");
    }
  };

  const animateScanner = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const displayAlert = (msg) => {
    Alert.alert(
      "Error",
      msg,
      [
        {
          text: "Ok",
          onPress: () => {
            setScanned(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBarCodeScanned = ({ type, data }) => {
    Vibration.vibrate();
    setData(data);
    setScanned(true);
    verifyRegisterPin(data);
    animatedValue.stopAnimation();

    setTimeout(() => {
      animateScanner();
    }, 2000);
  };

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
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.8 - 10],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "code39", "code128", "upc_e", "upc_a"],
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
        <View style={styles.overlay}>
          <View style={styles.scanBox}>
            <Animated.View
              style={[styles.scannerLine, { transform: [{ translateY }] }]}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button
              title={`Flash ${light ? "OFF" : "ON"}`}
              iconContainerStyle={styles.iconButtonHomeContainer}
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
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
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
    size: 50,
    color: "white",
  },
  titleButtonHome: {
    fontWeight: "700",
    fontSize: 25,
  },
  buttonHome: {
    backgroundColor: "#0C8E4E",
    borderWidth: 0,
    borderRadius: 30,
    height: 100,
  },
  buttonHomeContainer: {
    width: 200,
    marginHorizontal: 50,
    marginVertical: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    width: width * 0.8,
    height: width * 0.8,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  scannerLine: {
    width: "100%",
    height: 2, // Increased height to look like a bar
    backgroundColor: "black",
    position: "absolute",
    top: 0,
  },
});
