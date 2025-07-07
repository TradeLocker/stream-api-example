import { io } from "socket.io-client";
import axios from "axios";

import {
  AccountStatusMessageSchema,
  ClosePositionMessageSchema,
  OpenOrderMessageSchema,
  PositionMessageSchema,
  PropertyMessageSchema,
  TypedMessageSchema,
} from "./schemas/stream.schema.js";

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

const schemas = {
  AccountStatus: AccountStatusMessageSchema,
  ClosePosition: ClosePositionMessageSchema,
  OpenOrder: OpenOrderMessageSchema,
  Position: PositionMessageSchema,
  Property: PropertyMessageSchema,
};

socket.on(socketIoEvents.STREAM, (event) => {
  const typedMessageResult = TypedMessageSchema.safeParse(event);
  if (typedMessageResult.success) {
    const type = typedMessageResult.data.type;
    if (!schemas[type]) {
      console.error(`Unknown event type: ${type}`);
      return;
    }

    const { data, success, error } = schemas[type].safeParse(event);
    if (success) {
      console.log(`Event: ${type} >`);
      console.log(data);
      return;
    } else {
      console.error(`Invalid data for event type ${type}:`, error);
      return;
    }
  }

  console.error("Unknown event type or invalid data:", event);
});

socket.on(socketIoEvents.CONNECTION, (data) => {
  console.error(socketIoEvents.CONNECTION, data);
});

// subscribe to users updates
const result = await fetchAccessToken(user);

socket.emit(
  socketIoEvents.SUBSCRIPTIONS,
  {
    action: actions.SUBSCRIBE,
    token: result.token,
  },
  (res) => {
    console.log(`Action '${actions.SUBSCRIBE}' response:`, res);
  }
);

// unsubscribe after 30 seconds
// setTimeout(() => {
//   socket.emit(
//     socketIoEvents.SUBSCRIPTIONS,
//     {
//       action: actions.UNSUBSCRIBE,
//       brandId: result.brandId,
//       accountId: result.accountId,
//     },
//     (r) => {
//       console.log(`Action ${actions.UNSUBSCRIBE} response:`, res);
//     }
//   );
//   socket.disconnect();
// }, 30000 * 100000000000);

// Gracefully handle termination signals (e.g., Ctrl+C)
process.on("SIGINT", () => {
  console.log("Received SIGINT. Disconnecting...");
  disconnect();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Disconnecting...");
  disconnect();
  process.exit(0);
});

const disconnect = () => {
  console.log("Unsubscribe...");

  socket.emit(
    socketIoEvents.SUBSCRIPTIONS,
    {
      action: actions.UNSUBSCRIBE,
      brandId: result.brandId,
      accountId: result.accountId,
    },
    (res) => {
      console.log(`Action ${actions.UNSUBSCRIBE} response:`, res);
    }
  );

  socket.disconnect();
  process.exit(0);
};

// Gracefully handle termination signals (e.g., Ctrl+C)
process.on("SIGINT", () => {
  console.log("Received SIGINT. Disconnecting...");
  disconnect();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Disconnecting...");
  disconnect();
  process.exit(0);
});
