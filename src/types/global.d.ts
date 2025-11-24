// Driver type
declare interface DriverType {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  currentLat: number;
  currentLng: number;
  rating?: number;
}

// Lodash declarations (if needed)
declare module "lodash" {
  import lodash from "lodash";
  export = lodash;
}
