import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (e) {
        console.error('Failed to save the data to the storage', e);
    }
};
export const getStoreData = async (key) => {
    try {
        if (!key) {
            console.log("key not found")
        }
        return await AsyncStorage.getItem(key);
    } catch (e) {
        console.error('Failed to get the data to the storage', e);
    }
};