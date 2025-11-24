declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country_code: string;
  token?: string;
}

export interface DriverType {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country_code: string;
  vehicle_type: string;
  vehicle_number: string;
  vehicle_model: string;
  license_number: string;
  rate: string;
}

export {};
