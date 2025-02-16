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

## Usage Instructions

1. **Open the Application**: 
   - Launch the application in your web browser.

2. **Enter Your Name**: 
   - When prompted, enter your name to identify yourself.

3. **Using the Tools**:
   - **Text Tool**:
     - Click on the "Text Tool" button in the sidebar to activate it.
     - Select any location on the whiteboard where you want to place the text.
     - A prompt will appear asking you to input the text. Type your desired text and click "OK" to place it on the whiteboard.

   - **Rectangle Tool**:
     - Click on the "Rectangle Tool" button in the sidebar to activate it.
     - Click on the whiteboard at the point where you want one corner of the rectangle to be.
     - Hold down the mouse button and drag the mouse to define the rectangle's size. Release the mouse button to complete the shape.

   - **Circle Tool**:
     - Click on the "Circle Tool" button in the sidebar to activate it.
     - Click on the whiteboard to set the center point of the circle.
     - Hold down the mouse button and drag the mouse outward to adjust the radius. Release the mouse button to complete the circle.

4. **Adjusting Brush Size**:
   - Use the "Change Brush Size" button to modify the brush size for free drawing.

5. **Saving Your Drawing**:
   - Click the "Save Image" button to save your drawing as an image file.

6. **Changing Themes**:
   - Switch between light and dark themes by clicking the "Change Theme" button.

7. **Chat with Other Users**:
   - Use the chat input at the bottom of the sidebar to send messages to other users.

8. **View Active Users**:
   - Check the sidebar to see the list of active users currently connected to the whiteboard.

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
