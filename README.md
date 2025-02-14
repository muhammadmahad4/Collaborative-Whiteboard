# Interactive WhiteBoard

Interactive whiteboard is an application that allows multiple users to draw, chat, and collaborate in real-time. The application supports various drawing tools, including freehand drawing, rectangles, circles, and lines. Users can also change the brush size, save their drawings, and switch between light and dark themes.

## Features

- Real-time drawing and collaboration
- Multiple drawing tools: Freehand, Rectangle, Circle, Line, Text
- Adjustable brush size
- Save drawings as images
- Light and dark theme support
- Real-time chat
- Timer to track session duration

## Technologies Used

- HTML, CSS, JavaScript
- WebSocket for real-time communication
- Node.js for the backend server

## Getting Started

### Prerequisites

- Node.js installed on your machine

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/muhammadmahad4/Collaborative-Whiteboard.git
   ```

2. Navigate into the project directory:

   ```bash
   cd Collaborative-Whiteboard
   ```

3. Navigate into the backend directory:

   ```bash
   cd backend
   ```

4. Install the dependencies:

   ```bash
   npm install
   ```

### Running the Application

1. Start the backend server:

   ```bash
   node server.js
   ```

2. Open `index.html` in your web browser.

### Usage

1. Open the application in your web browser.
2. Enter your name when prompted.
3. Use the tools in the sidebar to draw on the whiteboard.
4. Adjust the brush size using the "Change Brush Size" button.
5. Save your drawing using the "Save Image" button.
6. Switch between light and dark themes using the "Change Theme" button.
7. Chat with other users using the chat input at the bottom of the sidebar.
8. View the list of active users in the sidebar.

### File Structure

```
chaos-theory-whiteboard/
├── backend/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
