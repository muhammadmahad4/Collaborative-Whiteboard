/////////////////VARIABLE DECLARATIONS//////////////////////////////////////

const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

const usersList = document.getElementById("usersList");

const eraseAllButton = document.getElementById("eraseButton");
const eraseMineButton = document.getElementById("eraseMineButton");
const textToolButton = document.getElementById("textToolButton");
const rectToolButton = document.getElementById("rectToolButton");
const circleToolButton = document.getElementById("circleToolButton");
const lineToolButton = document.getElementById("lineToolButton");
const saveButton = document.getElementById("saveButton");
const themeButton = document.getElementById("themeButton");

const chatMessages = document.getElementById("chatMessages");
const chatMessageInput = document.getElementById("chatMessageInput");
const sendChatButton = document.getElementById("sendChatButton");

const timerDiv = document.getElementById("timer");

const brushSizeInput = document.getElementById("brushSize");
const brushSizeButton = document.getElementById("brushSizeButton");
const brushSizeLabel = document.getElementById("brushSizeLabel");
//////////////////////////////////////////////////////////////////////////

///////////////////VARIABLE INITISLIZATION//////////////////////////////////

let activeUsers = {};
//GENERARATION OF RANDOM COLOR:
const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

let isLineToolActive = false;
let isTextToolActive = false;
let isRectToolActive = false;
let isCircleToolActive = false;


canvas.width = window.innerWidth - 500; // Account for sidebar width
canvas.height = window.innerHeight;
let brushSize = 2;
let drawing = false;
let prevX = 0;
let prevY = 0;

let currentTool = "draw"; // Default tool is draw
let startX = 0;
let startY = 0;
let ws;

let userName = prompt("Enter your name:") || "Anonymous";
///////////////////////////////////////////////////////////////////////////


/////////////////////////FUNCTIONS//////////////////////////////////////////
// Initialize WebSocket connection
function connectWebSocket() {
  ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => {
    console.log("WebSocket connected");
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
      } 
      else if (parsedMessage.type === "draw") {
        const drawEvent = parsedMessage.data;
        drawFromServer(drawEvent.x, drawEvent.y, drawEvent.prevX, drawEvent.prevY, drawEvent.color, drawEvent.size);
      } 
      else if (parsedMessage.type === "text") {
        const textEvent = parsedMessage.data;
        drawText(textEvent.x, textEvent.y, textEvent.text, textEvent.color);
      } 
      else if (parsedMessage.type === "rect") {
        const rectEvent = parsedMessage.data;
        drawRect(rectEvent.x, rectEvent.y, rectEvent.width, rectEvent.height, rectEvent.color);
      } 
      else if (parsedMessage.type === "circle") {
        const circleEvent = parsedMessage.data;
        drawCircle(circleEvent.x, circleEvent.y, circleEvent.radius, circleEvent.color);
      } 
      else if (parsedMessage.type === "line") {
        const lineEvent = parsedMessage.data;
        drawLineFromServer(lineEvent.startX, lineEvent.startY, lineEvent.endX, lineEvent.endY, lineEvent.color, lineEvent.size);
      } 
      else if (parsedMessage.type === "users") {
        activeUsers = parsedMessage.data;
        updateUsersList();
      } 
      else if (parsedMessage.type === "erase") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }  
      else if (parsedMessage.type === "chat") {
        displayChatMessage(parsedMessage.data.userName, parsedMessage.data.message);
      } 
      else if (parsedMessage.type === "timer") {
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

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}

function draw(x, y, prevX, prevY, color, size) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size; 
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
}

function drawFromServer(x, y, prevX, prevY, color, size) {
  draw(x, y, prevX, prevY, color, size);
}


function drawLineFromServer(startX, startY, endX, endY, color, size) {
  drawLine(startX, startY, endX, endY, color, size);
}


function drawText(x, y, text, color) {
  ctx.fillStyle = color;
  ctx.font = "16px Arial";
  ctx.fillText(text, x, y);
}


function drawRect(x, y, width, height, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}


function drawCircle(x, y, radius, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
}


function drawLine(startX, startY, endX, endY, color, size) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}


function updateUsersList() {
  usersList.innerHTML = "";
  Object.values(activeUsers).forEach((user) => {
    const li = document.createElement("li");
    li.innerHTML = `<span style="background-color: ${user.color}; width: 20px; height: 20px; display: inline-block; border-radius: 50%; margin-right: 10px;"></span>${user.name}`;
    usersList.appendChild(li);
  });
}


function displayChatMessage(userName, message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = `${userName}: ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
}

///////////////////////////////////////////////////////////////////////////////


//////////////////////EVENT LISTENERS//////////////////////////////////////
brushSizeInput.addEventListener("input", (e) => {
  brushSize = e.target.value;
});
brushSizeButton.addEventListener("click", () => {
  const isVisible = brushSizeInput.style.display === "block";
  brushSizeInput.style.display = isVisible ? "none" : "block";
  brushSizeLabel.style.display = isVisible ? "none" : "block";
});

sendChatButton.addEventListener("click", () => {
  const message = chatMessageInput.value.trim();
  if (message) {
    const chatMessage = { type: "chat", data: { userName, message } };
    ws.send(JSON.stringify(chatMessage));
    chatMessageInput.value = ""; 
  }
});

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  if (isTextToolActive) return;
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

    const data = { type: "draw", data: { x, y, prevX, prevY, color, size: brushSize } };
    ws.send(JSON.stringify(data));

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

    const rectData = { type: "rect", data: { x: startX, y: startY, width, height, color, size: brushSize } };
    ws.send(JSON.stringify(rectData));

  } 
  else if (currentTool === "circle") {
    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
    drawCircle(startX, startY, radius, color);

    const circleData = { type: "circle", data: { x: startX, y: startY, radius, color, size: brushSize } };
    ws.send(JSON.stringify(circleData));

  } 
  else if (currentTool === "line") {
    drawLine(startX, startY, x, y, color);

    const lineData = { type: "line", data: { startX, startY, endX: x, endY: y, color, size: brushSize } };
    ws.send(JSON.stringify(lineData));

  }
});


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

  }
});


saveButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "whiteboard.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

eraseAllButton.addEventListener("click", () => {
  ws.send(JSON.stringify({ type: "erase" }));
});


eraseMineButton.addEventListener("click", () => {
  ws.send(JSON.stringify({ type: "eraseMine" }));
});

/////////////////////////////////////////////////////////////////////////////


// Start WebSocket connection
connectWebSocket();