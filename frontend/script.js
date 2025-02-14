const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");
const usersList = document.getElementById("usersList");
const eraseAllButton = document.getElementById("eraseButton");
const eraseMineButton = document.getElementById("eraseMineButton");
const textToolButton = document.getElementById("textToolButton");
const rectToolButton = document.getElementById("rectToolButton");
const circleToolButton = document.getElementById("circleToolButton");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const saveButton = document.getElementById("saveButton");
const themeButton = document.getElementById("themeButton");
const chatMessages = document.getElementById("chatMessages");
const chatMessageInput = document.getElementById("chatMessageInput");
const sendChatButton = document.getElementById("sendChatButton");
const timerDiv = document.getElementById("timer"); // Timer display

// Add this line to get the brush size input element
const brushSizeInput = document.getElementById("brushSize");

// Add these lines to get the brush size button and label elements
const brushSizeButton = document.getElementById("brushSizeButton");
const brushSizeLabel = document.getElementById("brushSizeLabel");

const lineToolButton = document.getElementById("lineToolButton");

let isLineToolActive = false;

// Set canvas dimensions
canvas.width = window.innerWidth - 500; // Account for sidebar width
canvas.height = window.innerHeight;

// Prompt the user for their name
let userName = prompt("Enter your name:") || "Anonymous";

// Generate a random color for the client
const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

let drawing = false;
let prevX = 0;
let prevY = 0;
let isTextToolActive = false;
let isRectToolActive = false;
let isCircleToolActive = false;
let currentTool = "draw"; // Default tool is draw
let startX = 0;
let startY = 0;
let ws;

// Add this line to define the brush size variable
let brushSize = 2;

// Active users
let activeUsers = {};

// Undo and Redo stacks
let historyStack = [];
let redoStack = [];

// Initialize WebSocket connection
function connectWebSocket() {
  ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => {
    console.log("WebSocket connected");
    // Send user info to the server
    ws.send(JSON.stringify({ type: "join", data: { name: userName, color } }));
  };

  ws.onmessage = async (event) => {
    let message;

    // Handle Blob or string data
    if (event.data instanceof Blob) {
      message = await event.data.text();
    } else {
      message = event.data;
    }

    try {
      const parsedMessage = JSON.parse(message);

      // Handle different message types
      if (parsedMessage.type === "history") {
        // Render the entire drawing history
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        parsedMessage.data.forEach((event) => {
          if (event.type === "draw") {
            drawFromServer(event.x, event.y, event.prevX, event.prevY, event.color, event.size);
          } else if (event.type === "text") {
            drawText(event.x, event.y, event.text, event.color);
          } else if (event.type === "rect") {
            drawRect(event.x, event.y, event.width, event.height, event.color);
          } else if (event.type === "circle") {
            drawCircle(event.x, event.y, event.radius, event.color);
          } else if (event.type === "line") {
            drawLineFromServer(event.startX, event.startY, event.endX, event.endY, event.color, event.size);
          }
        });
      } else if (parsedMessage.type === "draw") {
        // Render a single drawing event
        const drawEvent = parsedMessage.data;
        drawFromServer(drawEvent.x, drawEvent.y, drawEvent.prevX, drawEvent.prevY, drawEvent.color, drawEvent.size);
      } else if (parsedMessage.type === "text") {
        // Render a single text event
        const textEvent = parsedMessage.data;
        drawText(textEvent.x, textEvent.y, textEvent.text, textEvent.color);
      } else if (parsedMessage.type === "rect") {
        // Render a single rectangle event
        const rectEvent = parsedMessage.data;
        drawRect(rectEvent.x, rectEvent.y, rectEvent.width, rectEvent.height, rectEvent.color);
      } else if (parsedMessage.type === "circle") {
        // Render a single circle event
        const circleEvent = parsedMessage.data;
        drawCircle(circleEvent.x, circleEvent.y, circleEvent.radius, circleEvent.color);
      } else if (parsedMessage.type === "line") {
        // Render a single line event
        const lineEvent = parsedMessage.data;
        drawLineFromServer(lineEvent.startX, lineEvent.startY, lineEvent.endX, lineEvent.endY, lineEvent.color, lineEvent.size);
      } else if (parsedMessage.type === "users") {
        // Update the active users list
        activeUsers = parsedMessage.data;
        updateUsersList();
      } else if (parsedMessage.type === "erase") {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (parsedMessage.type === "undo") {
        // Handle undo event
        historyStack.pop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        historyStack.forEach((event) => {
          if (event.type === "draw") {
            drawFromServer(event.data.x, event.data.y, event.data.prevX, event.data.prevY, event.data.color, event.data.size);
          } else if (event.type === "text") {
            drawText(event.data.x, event.data.y, event.data.text, event.data.color);
          } else if (event.type === "rect") {
            drawRect(event.data.x, event.data.y, event.data.width, event.data.height, event.data.color);
          } else if (event.type === "circle") {
            drawCircle(event.data.x, event.data.y, event.data.radius, event.data.color);
          } else if (event.type === "line") {
            drawLineFromServer(event.data.startX, event.data.startY, event.data.endX, event.data.endY, event.data.color, event.data.size);
          }
        });
      } else if (parsedMessage.type === "redo") {
        // Handle redo event
        const lastUndoneEvent = redoStack.pop();
        historyStack.push(lastUndoneEvent);
        if (lastUndoneEvent.type === "draw") {
          drawFromServer(
            lastUndoneEvent.data.x,
            lastUndoneEvent.data.y,
            lastUndoneEvent.data.prevX,
            lastUndoneEvent.data.prevY,
            lastUndoneEvent.data.color,
            lastUndoneEvent.data.size
          );
        } else if (lastUndoneEvent.type === "text") {
          drawText(lastUndoneEvent.data.x, lastUndoneEvent.data.y, lastUndoneEvent.data.text, lastUndoneEvent.data.color);
        } else if (lastUndoneEvent.type === "rect") {
          drawRect(lastUndoneEvent.data.x, lastUndoneEvent.data.y, lastUndoneEvent.data.width, lastUndoneEvent.data.height, lastUndoneEvent.data.color);
        } else if (lastUndoneEvent.type === "circle") {
          drawCircle(lastUndoneEvent.data.x, lastUndoneEvent.data.y, lastUndoneEvent.data.radius, lastUndoneEvent.data.color);
        } else if (lastUndoneEvent.type === "line") {
          drawLineFromServer(lastUndoneEvent.data.startX, lastUndoneEvent.data.startY, lastUndoneEvent.data.endX, lastUndoneEvent.data.endY, lastUndoneEvent.data.color, lastUndoneEvent.data.size);
        }
      } else if (parsedMessage.type === "chat") {
        // Display a chat message
        displayChatMessage(parsedMessage.data.userName, parsedMessage.data.message);
      } else if (parsedMessage.type === "timer") {
        // Update the timer display
        timerDiv.textContent = `Timer: ${formatTime(parsedMessage.data)}`;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected. Reconnecting...");
    setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
  };
}

// Update the timer display
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}

// Draw on canvas
function draw(x, y, prevX, prevY, color, size) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size; // Use the brush size from the drawing data
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
}

// Add this event listener to update the brush size when the slider value changes
brushSizeInput.addEventListener("input", (e) => {
  brushSize = e.target.value;
});

// Add this event listener to toggle the visibility of the brush size slider
brushSizeButton.addEventListener("click", () => {
  const isVisible = brushSizeInput.style.display === "block";
  brushSizeInput.style.display = isVisible ? "none" : "block";
  brushSizeLabel.style.display = isVisible ? "none" : "block";
});


// Handle drawing from server
function drawFromServer(x, y, prevX, prevY, color, size) {
  draw(x, y, prevX, prevY, color, size);
}

// Handle line drawing from server
function drawLineFromServer(startX, startY, endX, endY, color, size) {
  drawLine(startX, startY, endX, endY, color, size);
}

// Draw text on canvas
function drawText(x, y, text, color) {
  ctx.fillStyle = color;
  ctx.font = "16px Arial";
  ctx.fillText(text, x, y);
}

// Draw rectangle on canvas
function drawRect(x, y, width, height, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

// Draw circle on canvas
function drawCircle(x, y, radius, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

// Draw line on canvas
function drawLine(startX, startY, endX, endY, color, size) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

// Update the active users list in the sidebar
function updateUsersList() {
  usersList.innerHTML = "";
  Object.values(activeUsers).forEach((user) => {
    const li = document.createElement("li");
    li.innerHTML = `<span style="background-color: ${user.color}; width: 20px; height: 20px; display: inline-block; border-radius: 50%; margin-right: 10px;"></span>${user.name}`;
    usersList.appendChild(li);
  });
}

// Display chat messages
function displayChatMessage(userName, message) {
  messageElement.textContent = `${userName}: ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
}

// Handle sending chat messages
sendChatButton.addEventListener("click", () => {
  const message = chatMessageInput.value.trim();
  if (message) {
    const chatMessage = { type: "chat", data: { userName, message } };
    ws.send(JSON.stringify(chatMessage));
    chatMessageInput.value = ""; // Clear input
  }
});

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  if (isTextToolActive) return; // Skip drawing if text tool is active
  drawing = true;
  startX = e.clientX - canvas.offsetLeft;
  startY = e.clientY;
  prevX = startX;
  prevY = startY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing || isTextToolActive) return;

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY;

  if (currentTool === "draw") {
    draw(x, y, prevX, prevY, color);

    // Send drawing data to server
    const data = { type: "draw", data: { x, y, prevX, prevY, color, size: brushSize } };
    ws.send(JSON.stringify(data));

    // Push the event to the history stack
    historyStack.push({ type: "draw", data: { x, y, prevX, prevY, color, size: brushSize } });
    redoStack = []; // Clear redo stack when a new action is performed

    prevX = x;
    prevY = y;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!drawing) return;
  drawing = false;

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY;

  if (currentTool === "rect") {
    const width = x - startX;
    const height = y - startY;
    drawRect(startX, startY, width, height, color);

    // Send rectangle data to server
    const rectData = { type: "rect", data: { x: startX, y: startY, width, height, color, size: brushSize } };
    ws.send(JSON.stringify(rectData));

    // Push the event to the history stack
    historyStack.push({ type: "rect", data: { x: startX, y: startY, width, height, color, size: brushSize } });
    redoStack = []; // Clear redo stack when a new action is performed
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
    drawCircle(startX, startY, radius, color);

    // Send circle data to server
    const circleData = { type: "circle", data: { x: startX, y: startY, radius, color, size: brushSize } };
    ws.send(JSON.stringify(circleData));

    // Push the event to the history stack
    historyStack.push({ type: "circle", data: { x: startX, y: startY, radius, color, size: brushSize } });
    redoStack = []; // Clear redo stack when a new action is performed
  } else if (currentTool === "line") {
    drawLine(startX, startY, x, y, color);

    // Send line data to server
    const lineData = { type: "line", data: { startX, startY, endX: x, endY: y, color, size: brushSize } };
    ws.send(JSON.stringify(lineData));

    // Push the event to the history stack
    historyStack.push({ type: "line", data: { startX, startY, endX: x, endY: y, color, size: brushSize } });
    redoStack = []; // Clear redo stack when a new action is performed
  }
});

// Text tool functionality
textToolButton.addEventListener("click", () => {
  isTextToolActive = !isTextToolActive;
  isRectToolActive = false;
  isCircleToolActive = false;
  isLineToolActive = false;
  currentTool = isTextToolActive ? "text" : "draw";
  textToolButton.style.backgroundColor = isTextToolActive ? "#000000" : "";
  rectToolButton.style.backgroundColor = "";
  circleToolButton.style.backgroundColor = "";
  lineToolButton.style.backgroundColor = "";
});
// Line tool functionality
lineToolButton.addEventListener("click", () => {
  isLineToolActive = !isLineToolActive;
  isTextToolActive = false;
  isRectToolActive = false;
  isCircleToolActive = false;
  currentTool = isLineToolActive ? "line" : "draw";
  lineToolButton.style.backgroundColor = isLineToolActive ? "#000000" : "";
  textToolButton.style.backgroundColor = "";
  rectToolButton.style.backgroundColor = "";
  circleToolButton.style.backgroundColor = "";
});

// Rectangle tool functionality
rectToolButton.addEventListener("click", () => {
  isRectToolActive = !isRectToolActive;
  isTextToolActive = false;
  isLineToolActive = false;
  isCircleToolActive = false;
  currentTool = isRectToolActive ? "rect" : "draw";
  rectToolButton.style.backgroundColor = isRectToolActive ? "#000000" : "";
  textToolButton.style.backgroundColor = "";
  circleToolButton.style.backgroundColor = "";
  lineToolButton.style.backgroundColor = "";
});

// Circle tool functionality
circleToolButton.addEventListener("click", () => {
  isCircleToolActive = !isCircleToolActive;
  isTextToolActive = false;
  isLineToolActive = false;
  isRectToolActive = false;
  currentTool = isCircleToolActive ? "circle" : "draw";
  circleToolButton.style.backgroundColor = isCircleToolActive ? "#000000" : "";
  textToolButton.style.backgroundColor = "";
  rectToolButton.style.backgroundColor = "";
  lineToolButton.style.backgroundColor = "";
});

canvas.addEventListener("click", (e) => {
  if (!isTextToolActive) return;

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY;

  const text = prompt("Enter your text:");
  if (text) {
    drawText(x, y, text, color);
    const textData = {
      type: "text",
      data: { x, y, text, color },
    };
    ws.send(JSON.stringify(textData));

    // Push the event to the history stack
    historyStack.push({ type: "text", data: { x, y, text, color } });
    redoStack = []; // Clear redo stack when a new action is performed
  }
});

// Save Image button functionality
saveButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "whiteboard.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// Theme button functionality
themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Erase All button functionality
eraseAllButton.addEventListener("click", () => {
  ws.send(JSON.stringify({ type: "erase" }));
});

// Erase Mine button functionality
eraseMineButton.addEventListener("click", () => {
  ws.send(JSON.stringify({ type: "eraseMine" }));
});

// Start WebSocket connection
connectWebSocket();