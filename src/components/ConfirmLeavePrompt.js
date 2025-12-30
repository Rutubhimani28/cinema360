// import React, { useEffect } from 'react';
// import { Alert } from 'react-native';
// import { useIsFocused } from '@react-navigation/native';

// const ConfirmLeavePrompt = ({ navigation, message, onConfirm }) => {
//     const isFocused = useIsFocused();

//     useEffect(() => {
//         if (isFocused) {
//             const unsubscribe = navigation.addListener('beforeRemove', (e) => {
//                 e.preventDefault();
//                 Alert.alert(
//                     'Conformation',
//                     message,
//                     [
//                         { text: "No", style: 'cancel', onPress: () => { } },
//                         {
//                             text: 'Yes', style: 'destructive', onPress: () => {
//                                 onConfirm ? onConfirm() : navigation.dispatch(e.data.action);
//                             }
//                         },
//                     ]
//                 );
//             });

//             return unsubscribe;
//         }
//     }, [isFocused, navigation, message, onConfirm]);

//     return null;
// };

// export default ConfirmLeavePrompt;
import React, { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const ConfirmLeavePrompt = ({ message, onConfirm }) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    useEffect(() => {
        const backAction = () => {
            if (isFocused) {
                Alert.alert(
                    '',
                    message,
                    [
                        { text: 'No', style: 'cancel', onPress: () => { } },
                        {
                            text: 'Yes',
                            style: 'destructive',
                            onPress: () => {
                                onConfirm ? onConfirm() : navigation.goBack();
                            },
                        },
                    ],
                );
                return true; // Prevent default back action
            }
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [isFocused, navigation, message, onConfirm]);

    return null;
};

export default ConfirmLeavePrompt;
