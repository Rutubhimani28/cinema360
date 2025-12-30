
// import React, { createContext, useReducer, useEffect, useMemo, useRef, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Alert, AppState } from 'react-native';
// import { navigate } from './navigate'; // Replace with your actual navigation utility

// // Create the AuthContext
// const AuthContext = createContext();

// // Define the initial state
// const initialState = {
//     isLoading: true,
//     isSignout: false,
//     registerUser: null,
//     loginUser: null,
// };

// const useInactivityTimer = (timeoutDuration, onTimeout) => {
//     const timeoutRef = useRef(null);

//     const resetTimer = () => {
//         if (timeoutRef.current) {
//             clearTimeout(timeoutRef.current);
//         }
//         timeoutRef.current = setTimeout(onTimeout, timeoutDuration);
//     };

//     useEffect(() => {
//         resetTimer();

//         return () => {
//             if (timeoutRef.current) {
//                 console.log(timeoutRef.current, "timeoutRef.current)");

//                 clearTimeout(timeoutRef.current);
//             }
//         };
//     }, [onTimeout, timeoutDuration]);

//     return resetTimer;
// };

// // Define the reducer function
// const authReducer = (state, action) => {
//     switch (action.type) {
//         case 'SCANNER_SCREEN':
//             return {
//                 ...state,
//                 registerUser: action.registerUser,
//                 isLoading: false,
//             };
//         case 'BARCODE_SCANNER_SCREEN':
//             return {
//                 ...state,
//                 isSignout: false,
//                 loginUser: action.loginUser,
//             };
//         case 'SIGN_OUT_SCANNER_SCREEN':
//             return {
//                 ...state,
//                 isSignout: true,
//                 registerUser: null,
//             };
//         case 'SIGN_OUT_BARCODE_SCANNER_SCREEN':
//             return {
//                 ...state,
//                 isSignout: true,
//                 loginUser: null,
//             };
//         case 'TOKEN_EXP':
//             return {
//                 ...state,
//                 isSignout: true,
//                 loginUser: null,
//                 registerUser: null,
//             };
//         default:
//             return state;
//     }
// };

// // Define the AuthProvider component
// const AuthProvider = ({ children }) => {
//     const [state, dispatch] = useReducer(authReducer, initialState);
//     const appState = useRef(AppState.currentState);
//     const timerRef = useRef(null);
//     const [remainingTime, setRemainingTime] = useState(null);


//     // Bootstrap the async storage and initial state
//     useEffect(() => {
//         const bootstrapAsync = async () => {
//             try {
//                 const loginUserName = await AsyncStorage.getItem('userName');
//                 const registerBarcode = await AsyncStorage.getItem('barcodeData');

//                 dispatch({ type: 'BARCODE_SCANNER_SCREEN', loginUser: loginUserName });
//                 dispatch({ type: 'SCANNER_SCREEN', registerUser: registerBarcode });

//                 if (registerBarcode) navigate('login');
//                 else navigate('scan');

//                 if (loginUserName) navigate('barcode');
//                 else navigate('login');

//             } catch (e) {
//                 console.error('Error during bootstrap: ', e);
//             }
//         };

//         bootstrapAsync();
//     }, []);

//     // Handle session timeout
//     const handleSessionTimeout = async () => {
//         Alert.alert(
//             'Session timed out',
//             'Your session has expired. You will be signed out now.',
//             [
//                 {
//                     text: 'OK',
//                     onPress: async () => {
//                         await AsyncStorage.removeItem('userName');
//                         dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
//                         navigate('login');
//                     },
//                 },
//             ],
//             { cancelable: false }
//         );
//     };

//     // Handle token expiration logic
//     const handleDecodeToken = async (tokenExpTime) => {

//         const tokenExpirationTimeInMilliseconds = Number(tokenExpTime) * 1000;

//         timerRef.current = setTimeout(() => {
//             Alert.alert(
//                 'Token expired',
//                 'Your token has expired. You will be signed out now.',
//                 [
//                     {
//                         text: 'OK',
//                         onPress: async () => {
//                             await AsyncStorage.clear();
//                             dispatch({ type: 'TOKEN_EXP' });
//                             navigate('main-screen');
//                         },
//                     },
//                 ],
//                 { cancelable: false }
//             );
//         }, tokenExpirationTimeInMilliseconds);
//     };

//     // Memoized context values
//     const authContext = useMemo(() => ({
//         signOutBarCode: async () => {
//             clearTimeout(timerRef.current);
//             await AsyncStorage.removeItem('userName');
//             await AsyncStorage.removeItem('expirationTime');
//             dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
//             navigate('login');
//         },
//         signInUser: async (data) => {
//             await AsyncStorage.setItem('userName', data);
//             dispatch({ type: 'BARCODE_SCANNER_SCREEN', loginUser: data });
//             navigate('barcode');
//         },
//         signUpUser: async (data) => {
//             await AsyncStorage.setItem('barcodeData', data);
//             dispatch({ type: 'SCANNER_SCREEN', registerUser: data });
//             navigate('login');
//         },
//         signOutScanner: async () => {
//             clearTimeout(timerRef.current);
//             await AsyncStorage.removeItem('barcodeData');
//             dispatch({ type: 'SIGN_OUT_SCANNER_SCREEN' });
//             navigate('main-screen');
//         },
//         tokenGet: async (data) => {
//             // handleDecodeToken(data);
//         },
//         tokenEXP: async () => {
//             clearTimeout(timerRef.current);
//             await AsyncStorage.clear();
//             dispatch({ type: 'TOKEN_EXP' });
//             navigate('main-screen');
//         },
//     }), []);

//     const logout = async () => {
//         // clearTimeout(timerRef.current);
//         // await AsyncStorage.removeItem('userName');
//         // await AsyncStorage.removeItem('expirationTime');
//         // dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
//         // navigate('login');
//         handleSessionTimeout();
//     }
//     const onInactivity = () => {
//         logout()
//     };
//     const resetTimer = useInactivityTimer(600000, onInactivity);


//     return (
//         <AuthContext.Provider
//             onTouchStart={resetTimer}
//             onTouchMove={resetTimer}
//             value={{ state, ...authContext }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export { AuthProvider, AuthContext };
// import React, { createContext, useReducer, useEffect, useMemo, useRef } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Alert, AppState, View } from 'react-native';
// import { navigate } from './navigate'; // Replace with your actual navigation utility

// // Create the AuthContext
// const AuthContext = createContext();

// // Define the initial state
// const initialState = {
//     isLoading: true,
//     isSignout: false,
//     registerUser: null,
//     loginUser: null,
// };

// // Custom hook for inactivity timer
// const useInactivityTimer = (timeoutDuration, onTimeout) => {
//     const timeoutRef = useRef(null);
//     const appState = useRef(AppState.currentState);
//     console.warn("hiiiiiiiiii")
//     const resetTimer = () => {
//         if (timeoutRef.current) {
//             clearTimeout(timeoutRef.current);
//         }
//         timeoutRef.current = setTimeout(onTimeout, timeoutDuration);
//     };

//     useEffect(() => {
//         const handleAppStateChange = (nextAppState) => {
//             if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
//                 resetTimer(); // Reset timer if app goes to background/inactive
//             }
//             appState.current = nextAppState;
//         };

//         resetTimer(); // Start the timer initially

//         // Add the listener for app state changes
//         const subscription = AppState.addEventListener('change', handleAppStateChange);

//         return () => {
//             if (timeoutRef.current) {
//                 clearTimeout(timeoutRef.current);
//             }
//             subscription.remove();
//         };
//     }, [onTimeout, timeoutDuration]);

//     return resetTimer;
// };

// // Define the reducer function
// const authReducer = (state, action) => {
//     switch (action.type) {
//         case 'SCANNER_SCREEN':
//             return {
//                 ...state,
//                 registerUser: action.registerUser,
//                 isLoading: false,
//             };
//         case 'BARCODE_SCANNER_SCREEN':
//             return {
//                 ...state,
//                 isSignout: false,
//                 loginUser: action.loginUser,
//             };
//         case 'SIGN_OUT_SCANNER_SCREEN':
//             return {
//                 ...state,
//                 isSignout: true,
//                 registerUser: null,
//             };
//         case 'SIGN_OUT_BARCODE_SCANNER_SCREEN':
//             return {
//                 ...state,
//                 isSignout: true,
//                 loginUser: null,
//             };
//         case 'TOKEN_EXP':
//             return {
//                 ...state,
//                 isSignout: true,
//                 loginUser: null,
//                 registerUser: null,
//             };
//         default:
//             return state;
//     }
// };

// // Define the AuthProvider component
// const AuthProvider = ({ children }) => {
//     const [state, dispatch] = useReducer(authReducer, initialState);
//     const timerRef = useRef(null);

//     // Bootstrap the async storage and initial state
//     useEffect(() => {
//         const bootstrapAsync = async () => {
//             try {
//                 const loginUserName = await AsyncStorage.getItem('userName');
//                 const registerBarcode = await AsyncStorage.getItem('barcodeData');

//                 dispatch({ type: 'BARCODE_SCANNER_SCREEN', loginUser: loginUserName });
//                 dispatch({ type: 'SCANNER_SCREEN', registerUser: registerBarcode });

//                 if (registerBarcode) navigate('login');
//                 else navigate('scan');

//                 if (loginUserName) navigate('barcode');
//                 else navigate('login');
//             } catch (e) {
//                 console.error('Error during bootstrap: ', e);
//             }
//         };

//         bootstrapAsync();
//     }, []);

//     // Handle session timeout
//     const handleSessionTimeout = async () => {
//         Alert.alert(
//             'Session timed out',
//             'Your session has expired. You will be signed out now.',
//             [
//                 {
//                     text: 'OK',
//                     onPress: async () => {
//                         await AsyncStorage.removeItem('userName');
//                         dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
//                         navigate('login');
//                     },
//                 },
//             ],
//             { cancelable: false }
//         );
//     };

//     // Handle inactivity and token expiration logic
//     const logout = async () => {
//         if (timerRef.current) {
//             clearTimeout(timerRef.current);
//         }
//         handleSessionTimeout();
//     };

//     const resetTimer = useInactivityTimer(30000, logout); // 10 minutes inactivity logout

//     // Memoized context values
//     const authContext = useMemo(() => ({
//         signOutBarCode: async () => {
//             clearTimeout(timerRef.current);
//             await AsyncStorage.removeItem('userName');
//             await AsyncStorage.removeItem('expirationTime');
//             dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
//             navigate('login');
//         },
//         signInUser: async (data) => {
//             await AsyncStorage.setItem('userName', data);
//             dispatch({ type: 'BARCODE_SCANNER_SCREEN', loginUser: data });
//             navigate('barcode');
//         },
//         signUpUser: async (data) => {
//             await AsyncStorage.setItem('barcodeData', data);
//             dispatch({ type: 'SCANNER_SCREEN', registerUser: data });
//             navigate('login');
//         },
//         signOutScanner: async () => {
//             clearTimeout(timerRef.current);
//             await AsyncStorage.removeItem('barcodeData');
//             dispatch({ type: 'SIGN_OUT_SCANNER_SCREEN' });
//             navigate('main-screen');
//         },
//         tokenGet: async (data) => {
//             // handleDecodeToken(data);
//         },
//         tokenEXP: async () => {
//             clearTimeout(timerRef.current);
//             await AsyncStorage.clear();
//             dispatch({ type: 'TOKEN_EXP' });
//             navigate('main-screen');
//         },
//     }), []);

//     return (
//         // Add onTouchStart to the View to capture all touch events
//         <View style={{ flex: 1 }} onTouchStart={() => console.warn("clickkkkk")}>
//             <AuthContext.Provider value={{ state, ...authContext }}>
//                 {children}
//             </AuthContext.Provider>
//         </View>
//     );
// };

// export { AuthProvider, AuthContext };
import React, { createContext, useReducer, useEffect, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AppState, View } from 'react-native';
import { navigate } from './navigate'; // Replace with your actual navigation utility

// Create the AuthContext
const AuthContext = createContext();

// Define the initial state
const initialState = {
    isLoading: true,
    isSignout: false,
    registerUser: null,
    loginUser: null,
};

// Define the reducer function
const authReducer = (state, action) => {
    switch (action.type) {
        case 'SCANNER_SCREEN':
            return {
                ...state,
                registerUser: action.registerUser,
                isLoading: false,
            };
        case 'BARCODE_SCANNER_SCREEN':
            return {
                ...state,
                isSignout: false,
                loginUser: action.loginUser,
            };
        case 'SIGN_OUT_SCANNER_SCREEN':
            return {
                ...state,
                isSignout: true,
                registerUser: null,
            };
        case 'SIGN_OUT_BARCODE_SCANNER_SCREEN':
            return {
                ...state,
                isSignout: true,
                loginUser: null,
            };
        case 'TOKEN_EXP':
            return {
                ...state,
                isSignout: true,
                loginUser: null,
                registerUser: null,
            };
        default:
            return state;
    }
};

// Define the AuthProvider component
const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const timeoutRef = useRef(null);
    const appState = useRef(AppState.currentState);

    // Bootstrap the async storage and initial state
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const loginUserName = await AsyncStorage.getItem('userName');
                const registerBarcode = await AsyncStorage.getItem('barcodeData');

                dispatch({ type: 'BARCODE_SCANNER_SCREEN', loginUser: loginUserName });
                dispatch({ type: 'SCANNER_SCREEN', registerUser: registerBarcode });

                if (registerBarcode) navigate('login');
                else navigate('scan');

                if (loginUserName) navigate('barcode');
                else navigate('login');
            } catch (e) {
                console.error('Error during bootstrap: ', e);
            }
        };

        bootstrapAsync();
    }, []);

    // Handle session timeout
    const handleSessionTimeout = async () => {
        Alert.alert(
            'Session timed out',
            'Your session has expired. You will be signed out now.',
            [
                {
                    text: 'OK',
                    onPress: async () => {
                        await AsyncStorage.removeItem('userName');
                        dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
                        navigate('login');
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // Handle inactivity and token expiration logic
    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            // handleSessionTimeout();
        }, 30000); // Set inactivity timeout to 30 seconds
    };

    // Monitor app state and reset timer on app state changes
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                resetTimer(); // Reset timer when app goes to background/inactive
            }
            appState.current = nextAppState;
        };

        resetTimer(); // Start the timer initially

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            subscription.remove();
        };
    }, []);

    // Memoized context values
    const authContext = useMemo(() => ({
        signOutBarCode: async () => {
            clearTimeout(timeoutRef.current);
            await AsyncStorage.removeItem('userName');
            await AsyncStorage.removeItem('expirationTime');
            dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
            navigate('login');
        },
        signInUser: async (data) => {
            await AsyncStorage.setItem('userName', data);
            dispatch({ type: 'BARCODE_SCANNER_SCREEN', loginUser: data });
            navigate('barcode');
        },
        signUpUser: async (data) => {
            await AsyncStorage.setItem('barcodeData', data);
            dispatch({ type: 'SCANNER_SCREEN', registerUser: data });
            navigate('login');
        },
        signOutScanner: async () => {
            clearTimeout(timeoutRef.current);
            await AsyncStorage.removeItem('barcodeData');
            dispatch({ type: 'SIGN_OUT_SCANNER_SCREEN' });
            navigate('main-screen');
        },
        tokenGet: async (data) => {
            // handleDecodeToken(data);
        },
        tokenEXP: async () => {
            clearTimeout(timeoutRef.current);
            await AsyncStorage.clear();
            dispatch({ type: 'TOKEN_EXP' });
            navigate('main-screen');
        },
        handleSessionTimeout: async () => {
            await AsyncStorage.removeItem('userName');
            dispatch({ type: 'SIGN_OUT_BARCODE_SCANNER_SCREEN' });
            navigate('login');
        }
    }), []);

    return (
        <View style={{ flex: 1 }} >
            <AuthContext.Provider value={{ state, ...authContext }}>
                {children}
            </AuthContext.Provider>
        </View>
    );
};

export { AuthProvider, AuthContext };
