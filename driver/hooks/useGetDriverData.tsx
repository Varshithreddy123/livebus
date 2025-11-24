import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";

export const useGetDriverData = () => {
  const [driver, setDriver] = useState<DriverType>();
  const [loading, setLoading] = useState(true);

  const getLoggedInDriverData = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    await axios
      .get(`${process.env.EXPO_PUBLIC_SERVER_URI}/driver/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setDriver(res.data.driver);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    getLoggedInDriverData();
  }, []);

  const refetch = () => {
    setLoading(true);
    getLoggedInDriverData();
  };

  return { loading, driver, refetch };
};
