import { io } from "socket.io-client";
import axios from "axios";

// Configuration
const SERVER_URL = "wss://api-dev.tradelocker.com";
const NAMESPACE = "/streams-api";
const DEVELOPER_API_KEY = "<tl-xyz>"; // add your developer api key
const HANDSHAKE_PATH = "/streams-api/socket.io";

// add user credentials
const user = {
  email: "<tl-test-email>",
  password: "<tl-test-password>",
  server: "<brand>",
};

async function fetchAccessToken(user) {
  const data = {
    email: user.email,
    password: user.password,
    server: user.server,
  };
  console.log(data);
  const response = await axios
    .post(
      "https://stg.tradelocker.com/backend-api/auth/jwt/accounts/tokens",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .catch((error) => {
      console.error("Error fetching access token:", error.message);
      console.error(error);
      process.exit(1);
    });

  const tokens = response.data.data;
  const userToken = tokens[0]; // get first acc
  return {
    token: userToken.accessToken,
    accountId: userToken.accountId,
    brandId: userToken.brandId,
  };
}

const socketIoEvents = {
  STREAM: "stream",
  SUBSCRIPTIONS: "subscriptions",
  CONNECTION: "connection",
};

const actions = {
  SUBSCRIBE: "SUBSCRIBE",
  UNSUBSCRIBE: "UNSUBSCRIBE",
};

// Create a connection to the Socket.IO server
const socket = io(SERVER_URL + NAMESPACE, {
  path: HANDSHAKE_PATH, // Custom handshake path
  transports: ["websocket"], // Use websocket transport
  extraHeaders: {
    "developer-api-key": DEVELOPER_API_KEY, // Add custom API key header
  },
});

// SocketIO event listeners
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  console.log(`Socket ID: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected: ", reason);
});

socket.on("error", (error) => {
  console.log("error: ", error);
});

// Tradelocker Streams API event listeners
socket.on(socketIoEvents.SUBSCRIPTIONS, (data) => {
  console.log(socketIoEvents.SUBSCRIPTIONS, data);
});

socket.on(socketIoEvents.STREAM, (data) => {
  console.log(socketIoEvents.STREAM, data);
});

socket.on(socketIoEvents.CONNECTION, (data) => {
  console.error(socketIoEvents.CONNECTION, data);
});

// subscribe to users updates
const result = await fetchAccessToken(user);

socket.emit(socketIoEvents.SUBSCRIPTIONS, {
  action: actions.SUBSCRIBE,
  token: result.token,
  brandId: user.server,
  accountId: result.accountId,
});

// unsubscribe after 30 seconds
setTimeout(() => {
  socket.emit(socketIoEvents.SUBSCRIPTIONS, {
    action: actions.UNSUBSCRIBE,
    brandId: result.brandId,
    accountId: result.accountId,
  });
  socket.disconnect();
}, 30000);
