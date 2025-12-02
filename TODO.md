# TODO List for Ridewave App Updates

## Completed Tasks
- [x] Set Amrita School of Engineering, Amritapuri, Kerala, India as default current location for ride calculations
  - Modified `user/screens/rideplan/rideplan.screen.tsx` to remove user location fetching and keep default Amrita coordinates (9.0825, 76.4910)
  - Updated toast message to inform users about using default location when permission is not granted

## Pending Tasks
- [ ] Test the location fix in the app to ensure calculations start from Amrita coordinates
- [ ] Verify that distance calculations and route planning work correctly with the fixed location
- [ ] Update any documentation or user guides to reflect the default location behavior
