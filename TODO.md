# Backend URL Fix for Real Device Connectivity

## Completed Tasks
- [x] Update user/app.json to set EXPO_PUBLIC_SERVER_URI to "http://10.113.22.129:8080"
- [x] Update user/screens/rideplan/rideplan.screen.tsx to hardcode WebSocket URL to "ws://10.113.22.129:8080" for real devices

## Pending Tasks
- [ ] Restart the Expo app to pick up new environment variables
- [ ] Test backend reachability from phone browser at http://10.113.22.129:8080/api/v1/server-ip
- [ ] Verify WebSocket connection in the app logs
- [ ] Test driver data loading and ride planning features
