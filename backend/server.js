const WebSocket = require("ws");

////////////////////////VARIABLES////////////////////////
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map(); // Store clients with unique userIds
const activeUsers = {};
let drawingHistory = []; // Store all drawing and text events
let redoStack = []; // Store undone events for redo
let timerInterval;
let timer = 0;
let userIdCounter = 1;

wss.on("connection", (ws) => {
  const userId = `user${userIdCounter++}`;
  clients.set(ws, userId);

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    if (message.type === "join") {
      activeUsers[userId] = { name: message.data.name, color: message.data.color };
      ws.send(JSON.stringify({ type: "history", data: drawingHistory }));
      broadcast({ type: "users", data: activeUsers });

      if (!timerInterval) {
        timerInterval = setInterval(() => {
          timer++;
          broadcast({ type: "timer", data: timer });
        }, 1000);
      }
    } 
    else if (message.type === "draw") {
      const drawEvent = { ...message.data, userId, type: "draw" };
      drawingHistory.push(drawEvent);
      broadcast({ type: "draw", data: message.data });
    } else if (message.type === "text") {
      const textEvent = { ...message.data, userId, type: "text" };
      drawingHistory.push(textEvent);
      broadcast({ type: "text", data: textEvent });
    } else if (message.type === "rect") {
      const rectEvent = { ...message.data, userId, type: "rect" };
      drawingHistory.push(rectEvent);
      broadcast({ type: "rect", data: rectEvent });
    } else if (message.type === "circle") {
      const circleEvent = { ...message.data, userId, type: "circle" };
      drawingHistory.push(circleEvent);
      broadcast({ type: "circle", data: circleEvent });
    } else if (message.type === "line") {
      const lineEvent = { ...message.data, userId, type: "line" };
      drawingHistory.push(lineEvent);
      broadcast({ type: "line", data: lineEvent });
    } else if (message.type === "erase") {
      drawingHistory = [];
      broadcast({ type: "erase" });
    } else if (message.type === "eraseMine") {
      drawingHistory = drawingHistory.filter((event) => event.userId !== userId);
      broadcast({ type: "history", data: drawingHistory });
    } else if (message.type === "chat") {
      broadcast({ type: "chat", data: { userName: activeUsers[userId].name, message: message.data.message } });
    } 
  });

  ws.on("close", () => {
    delete activeUsers[userId];
    clients.delete(ws);
    broadcast({ type: "users", data: activeUsers });

    // Stop the timer if no clients are connected
    if (clients.size === 0 && timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      timer = 0;
    }
  });
});

function broadcast(message) {
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

console.log("Server running on ws://localhost:8080");