import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider } from "native-base";
import React, { useContext, useState, useCallback, useEffect, useRef } from "react";
import { StatusBar, View, ScrollView, RefreshControl, Alert, AppState } from "react-native";
import { AuthContext, AuthProvider } from "./src/auth/AuthProvider";
import { navigationRef } from "./src/auth/navigate";
import BeforeLoginHeader from "./src/components/BeforeLoginHeader";
import BarcodeScannerScreen from "./src/components/barcodeScannerScreen";
import Header from "./src/components/header";
import Login from "./src/components/login";
import ScannerScreen from "./src/components/scannerScreen";
import VarianceForm from "./src/components/varianceForm";
import MainScreen from "./src/components/mainScreen";
import TicketDetails from "./src/components/ticketDetails";
import TicketScreen from "./src/components/ticketScreen";
import Footer from "./src/components/footer";
import ConnectivityWrapper from "./src/components/common/ConnectivityWrapper";

const Stack = createNativeStackNavigator();

const Routes = () => {
  const { state, handleSessionTimeout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const timeoutRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const handleTimeout = async () => {
    Alert.alert(
      'Session timed out',
      'Your session has expired. You will be signed out now.',
      [
        {
          text: 'OK',
          onPress: async () => {
            handleSessionTimeout()
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Handle inactivity and token expiration logic
  const resetTimer = () => {
    // console.warn("clickkkkk")
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, 600000); // Set inactivity timeout to 10 minute
  };

  // Monitor app state and reset timer on app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        if (state?.registerUser !== null && state?.loginUser !== null) resetTimer(); // Reset timer when app goes to background/inactive
      }
      appState.current = nextAppState;
    };

    if (state?.registerUser !== null && state?.loginUser !== null) resetTimer(); // Start the timer initially

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.remove();
    };
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetch or API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Wrapper component to include pull-to-refresh
  const ScreenWrapper = ({ children }) => (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {children}
    </ScrollView>
  );

  return (
    <ConnectivityWrapper>
      <NativeBaseProvider ref={navigationRef}>
        <NavigationContainer>
          <Stack.Navigator>
            {state?.registerUser === null ? (
              <>
                <Stack.Screen
                  name="main-screen"
                  options={({ route, navigation }) => ({
                    header: (props) => <Header route={route} navigation={navigation} />,
                  })}
                >
                  {(props) => (
                    <ScreenWrapper>
                      <MainScreen {...props} />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="scan"
                  options={({ route, navigation }) => ({
                    header: (props) => <Header route={route} navigation={navigation} />,
                  })}
                >
                  {(props) => (
                    <ScreenWrapper>
                      <ScannerScreen {...props} />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>
              </>
            ) : state?.loginUser === null ? (
              <Stack.Screen
                name="login"
                options={({ route, navigation }) => ({
                  header: (props) => <Header route={route} navigation={navigation} from="login" />,
                })}
              >
                {(props) => (
                  <ScreenWrapper>
                    <Login {...props} resetTimer={resetTimer} />
                  </ScreenWrapper>
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen
                  name="barcode"
                  options={({ route, navigation }) => ({
                    header: (props) => <Header route={route} navigation={navigation} />,
                  })}
                >
                  {(props) => (
                    <ScreenWrapper>
                      <BarcodeScannerScreen {...props} resetTimer={resetTimer} />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="Form"
                  options={({ route, navigation }) => ({
                    header: (props) => <Header route={route} navigation={navigation} />,
                  })}
                >
                  {(props) => (
                    <ScreenWrapper>
                      <VarianceForm {...props} resetTimer={resetTimer} />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="ticket-details"
                  options={({ route, navigation }) => ({
                    header: (props) => <Header route={route} navigation={navigation} />,
                  })}
                >
                  {(props) => (
                    <ScreenWrapper>
                      <TicketDetails {...props} resetTimer={resetTimer} />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="ticket-screen"
                  options={({ route, navigation }) => ({
                    header: (props) => <Header route={route} navigation={navigation} />,
                  })}
                >
                  {(props) => (
                    <ScreenWrapper>
                      <TicketScreen {...props} resetTimer={resetTimer} />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </ConnectivityWrapper>
  );
};

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        style="light"
        translucent={false}
        backgroundColor="transparent"
      />
      <AuthProvider>
        <Routes />
        <Footer />
      </AuthProvider>
    </View>
  );
}
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { NativeBaseProvider } from "native-base";
// import React, { useContext, useState, useCallback, useRef, useEffect } from "react";
// import { StatusBar, View, ScrollView, RefreshControl, AppState, TouchableWithoutFeedback } from "react-native";
// import { AuthContext, AuthProvider } from "./src/auth/AuthProvider";
// import { navigationRef } from "./src/auth/navigate";
// import BeforeLoginHeader from "./src/components/BeforeLoginHeader";
// import BarcodeScannerScreen from "./src/components/barcodeScannerScreen";
// import Header from "./src/components/header";
// import Login from "./src/components/login";
// import ScannerScreen from "./src/components/scannerScreen";
// import VarianceForm from "./src/components/varianceForm";
// import MainScreen from "./src/components/mainScreen";
// import TicketDetails from "./src/components/ticketDetails";
// import TicketScreen from "./src/components/ticketScreen";
// import Footer from "./src/components/footer";
// import ConnectivityWrapper from "./src/components/common/ConnectivityWrapper";

// // Create the Stack navigator
// const Stack = createNativeStackNavigator();

// // Hook for inactivity timeout
// const useInactivityTimer = (timeoutDuration, onTimeout) => {
//   const timeoutRef = useRef(null);
//   console.warn("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
//   const resetTimer = () => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
//     timeoutRef.current = setTimeout(onTimeout, timeoutDuration);
//   };

//   useEffect(() => {
//     resetTimer(); // Start the timer initially
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, [onTimeout, timeoutDuration]);

//   return resetTimer;
// };

// // Routes Component
// const Routes = ({ resetTimer }) => {
//   const { state } = useContext(AuthContext);
//   const [refreshing, setRefreshing] = useState(false);

//   // Pull-to-refresh handler
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     // Simulate data fetch or API call
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 2000);
//   }, []);

//   // Wrapper component to include pull-to-refresh
//   const ScreenWrapper = ({ children }) => (
//     <ScrollView
//       contentContainerStyle={{ flexGrow: 1 }}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//     >
//       {children}
//     </ScrollView>
//   );

//   return (
//     <ConnectivityWrapper>
//       <NativeBaseProvider ref={navigationRef}>
//         <NavigationContainer>
//           <Stack.Navigator>
//             {state?.registerUser === null ? (
//               <>
//                 <Stack.Screen
//                   name="main-screen"
//                   options={({ route, navigation }) => ({
//                     header: (props) => <Header route={route} navigation={navigation} />,
//                   })}
//                 >
//                   {(props) => (
//                     <ScreenWrapper>
//                       <MainScreen {...props} />
//                     </ScreenWrapper>
//                   )}
//                 </Stack.Screen>

//                 <Stack.Screen
//                   name="scan"
//                   options={({ route, navigation }) => ({
//                     header: (props) => <Header route={route} navigation={navigation} />,
//                   })}
//                 >
//                   {(props) => (
//                     <ScreenWrapper>
//                       <ScannerScreen {...props} />
//                     </ScreenWrapper>
//                   )}
//                 </Stack.Screen>
//               </>
//             ) : state?.loginUser === null ? (
//               <Stack.Screen
//                 name="login"
//                 options={({ route, navigation }) => ({
//                   header: (props) => <Header route={route} navigation={navigation} from="login" />,
//                 })}
//               >
//                 {(props) => (
//                   <ScreenWrapper>
//                     <Login {...props} />
//                   </ScreenWrapper>
//                 )}
//               </Stack.Screen>
//             ) : (
//               <>
//                 <Stack.Screen
//                   name="barcode"
//                   options={({ route, navigation }) => ({
//                     header: (props) => <Header route={route} navigation={navigation} />,
//                   })}
//                 >
//                   {(props) => (
//                     <ScreenWrapper>
//                       <BarcodeScannerScreen {...props} />
//                     </ScreenWrapper>
//                   )}
//                 </Stack.Screen>

//                 <Stack.Screen
//                   name="Form"
//                   options={({ route, navigation }) => ({
//                     header: (props) => <Header route={route} navigation={navigation} />,
//                   })}
//                 >
//                   {(props) => (
//                     <ScreenWrapper>
//                       <VarianceForm {...props} />
//                     </ScreenWrapper>
//                   )}
//                 </Stack.Screen>

//                 <Stack.Screen
//                   name="ticket-details"
//                   options={({ route, navigation }) => ({
//                     header: (props) => <Header route={route} navigation={navigation} />,
//                   })}
//                 >
//                   {(props) => (
//                     <ScreenWrapper>
//                       <TicketDetails {...props} />
//                     </ScreenWrapper>
//                   )}
//                 </Stack.Screen>

//                 <Stack.Screen
//                   name="ticket-screen"
//                   options={({ route, navigation }) => ({
//                     header: (props) => <Header route={route} navigation={navigation} />,
//                   })}
//                 >
//                   {(props) => (
//                     <ScreenWrapper>
//                       <TicketScreen {...props} />
//                     </ScreenWrapper>
//                   )}
//                 </Stack.Screen>
//               </>
//             )}
//           </Stack.Navigator>
//         </NavigationContainer>
//       </NativeBaseProvider>
//     </ConnectivityWrapper>
//   );
// };

// // Main App Component with Global Touch Listener
// export default function App() {
//   const resetTimer = useInactivityTimer(60000, () => {
//     console.log('User session timed out');
//   });

//   return (
//     <TouchableWithoutFeedback onPress={() => console.log("click")}>
//       <View style={{ flex: 1 }}>
//         <StatusBar style="light" translucent={false} backgroundColor="transparent" />
//         <AuthProvider>
//           <Routes resetTimer={resetTimer} />
//           <Footer />
//         </AuthProvider>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }
