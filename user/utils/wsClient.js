// MOCK SOCKET (BYPASS SERVER + AUTH + WS)
import { createContext } from "react";

export const SocketContext = createContext({
  on: () => {},
  emit: () => {},
});

// this mock will let components "think" the socket is connected
export const socket = {
  on: (event, callback) => {
    console.log("Mock socket listening:", event);
  },
  emit: (event, data) => {
    console.log("Mock socket emit:", event, data);
  }
};

export default socket;
