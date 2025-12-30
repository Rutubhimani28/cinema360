import axios from "axios"
import { constant } from "../constant"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoreData } from "./localStorage";
import axiosInstance from "./axiosInstance";


export const getApi = async (path, id) => {
    const token = await AsyncStorage.getItem('token')
    const locationId = await getStoreData('LocationId')
    const companyId = await getStoreData('CompanyId')
    const userEmail = await getStoreData('userEmail')
    try {
        let result = await axiosInstance.get(constant.baseUrl + path, {
            headers: {
                Authorization: 'Bearer' + ' ' + token,
                UserEmail: userEmail,
                CompanyId: companyId,
                // CompanyId: "f604d90",
                // UserEmail: "chirag.aditri90@gmail.com",
                // LocationId: "5ede13602a12a451b883932d"
                LocationId: locationId
                //                LocationId: "64461bc8f23a19675f1ebd25"

            }
        })
        return result

    } catch (e) {
        console.log(e, "eeeeeeeee")
        return e
    }
}