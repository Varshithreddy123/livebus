# TODO: Fix MapViewDirections ZERO_RESULTS Error and Update WebSocket IP

## MapViewDirections Fixes
- [ ] Add coordinate validation utility function
- [ ] Update user/screens/rideplan/rideplan.screen.tsx - add validation and error handling
- [ ] Update user/screens/ride-details/ride-details.screen.tsx - add validation and error handling
- [ ] Update driver/screens/home/home.screen.tsx - add validation and error handling
- [ ] Update driver/screens/ride-details/ride-details.screen.tsx - add validation and error handling

## WebSocket IP Updates
- [ ] Update driver/screens/home/home.screen.tsx WebSocket URL to use 10.30.255.94
- [ ] Update user/screens/rideplan/rideplan.screen.tsx WebSocket URL to use 10.30.255.94
- [ ] Ensure environment variable is set for user app WebSocket URL

## Testing
- [ ] Test location permissions and coordinate fetching
- [ ] Verify MapViewDirections renders correctly with valid coordinates
- [ ] Test WebSocket connection on physical device
- [ ] Check console for any remaining errors
