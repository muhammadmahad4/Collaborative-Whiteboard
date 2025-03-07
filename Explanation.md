### Explanation of Key Parts of the Solution

The Collaborative Whiteboard application is designed to allow multiple users to draw, chat, and collaborate in real-time. Here is a detailed explanation of how the key parts of the solution work together:

#### 1. Frontend (Client-Side)
- The frontend consists of HTML, CSS, and JavaScript files that provide the user interface and handle user interactions. This accounts for the client-side.
- The client establishes a WebSocket connection to the server (localhost:8080).
Code Snippet: `ws = new WebSocket("ws://localhost:8080");`
- Once the client draws something, it sends all the drawing data including the coordinates and the color to the server for synchronization and broadcasting.

FRONT-END FILE STRUCTURE:
- **index.html**: Defines the structure of the web page, including the canvas for drawing, the chat interface, and various buttons for tools and settings.
- **style.css**: Contains styles to make the application visually appealing.
- **script.js**: Handles the logic for drawing on the canvas, sending and receiving messages via WebSocket, and updating the UI based on user actions.

#### 2. Backend (Server-Side)
The backend is built using Node.js and handles real-time communication between clients and WebSocket server. it also stores all previous drawing history to ensure that new connected clients get the previously drawn data by other clients.

BACK-END FILE STRUCTURE:
- **server.js**: Sets up a WebSocket server that listens for connections from clients. It manages the communication between clients, ensuring that drawing actions and chat messages are broadcast to all connected users.

#### 3. WebSocket Communication
 WebSocket enables real-time communication between a client and the server. It allows the server to push data to the client without the client explicitly requesting it. This is helpful especially in broadcasting, when the server sends data to all the connected clients when one client draws, enabling state synchronization.

COMMUNICATION FLOW:
- **Establishing Connection**: When a user opens the application, a WebSocket connection is established between the client and the server, and the current canvas state is sent to the client ensuring that newly connected client has past drawings (state synchronization). Moreover, new client specific variables are initialised in backend as well as im frontend for that particular client eg userid and color. The client can now send messages to server via WebSocket.

Code Snippet: <br>
Server.js:
1. `wss.on("connection", (ws) => {})`
2. `wss.on("join", (ws) => {})`
<br>Script.js:<br>
`ws.onopen = () => {
    console.log("WebSocket connected");
    ws.send(JSON.stringify({ type: "join", data: { name: userName, color } }));
  };`

- **Sending Messages**: When a user performs an action (e.g., drawing on the canvas, sending a chat message), the client sends a message to the server via WebSocket. The server now stores this message into the DrawingHistory array and broadcasts to other connected clients.

Code Example Snippet: 
Script.js:
`ws.send()`

- **Broadcasting Messages**: The server receives the message and broadcasts it to all connected clients, ensuring that everyone sees the same updates in real-time. for this functionality I have created a broadcast function in server side which is called whenever a new message is received from any client. <br>
Code Snippet:<br>
`function broadcast(message) {
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}`

- **State Synchronization**: The server maintains the canvas state, which is an array (DrawingHistory) of all the strokes drawn on the canvas. When a new client connects, the server sends the current DrawingHistory to the client and the client renders all the strokes in DrawingHistory on their local canvas. When the server receives drawing data from a client, it pushes the data to DrawingHistory and broadcasts it to all connected clients.

Giving a summary, let's suppose there are two users A and B. When both the clients initially connect to server, server sends them drawing history to ensure that they contain previously drawn data. Now Suppose, User A draws on the whiteboard. Now user A sends the drawing data to the server. The server then broadcasts this data to all the connected clients (i.e., User B) and so User B is able to see what User A draws. moreover, the server pushes this in DrawingHistory array so that when a new user connects, it can have all the previous drawings.


#### 5. How Drawing logic works:
- **Mouse Down event**: When the user presses the mouse button down on the canvas, the drawing process begins, and the starting coordinates (startX, startY) are recorded, and the drawing variable is set to true to indicate that drawing is in progress.
- **Mouse Move event**: As the user moves the mouse while holding down the button, the current position (x, y) is tracked, and a line is drawn from the previous position (prevX, prevY) to the current position (x, y). The drawing command is sent to the server using WebSocket to synchronize the drawing with other users, while The previous coordinates are updated for the next movement.
- **Mouse Up event**: When the mouse button is released, the drawing stops, and the final position is recorded. Depending on the current tool (line, rectangle, circle, etc.), the appropriate shape is drawn on the canvas, and
the shape's details (like position, size, and color) are sent to the server for synchronization.

#### 6. Handling Network Disruptions
When the network connection is disrupted, the client attempts to reconnect after 1 second. this ensures a smooth user experience. <br>
Code Snippet:<br> `setTimeout(connectWebSocket, 1000);`

#### 7. Chat Functionality
The chat functionality allows users to send and receive messages in real-time.
- When a user sends a chat message, the client sends the message to the server via WebSocket.
- The server receives the chat message and broadcasts it to all connected clients.
- Each client displays the received chat message in the chat interface.




