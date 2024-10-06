# GraduationProjectsPortfolio
This project provides a dynamic and elegant way to display university graduation projects using **Google Drive** for storage and **Google Apps Script** for the backend. The frontend is an HTML file that integrates Bootstrap for responsive design, and the entire application can be embedded into a webpage via an iframe or can be redirected.

## Key Features:
- **Organized by Academic Year**: Projects are grouped by academic year, with easy navigation to select and view each year’s projects.
- **Dynamic Project Display**: Each project can have a poster (PDF or image) and a video, displayed with a sleek interface.
- **Google Drive Integration**: Projects (posters and videos) are stored in Google Drive, and the app fetches them dynamically.
- **Infinite Scroll**: As users scroll, more projects are loaded automatically, providing a smooth browsing experience.
- **Responsive Design**: Built with Bootstrap, the interface adapts to different screen sizes and devices.
- **Modal Previews**: Users can preview project posters and videos directly within the app using modal windows.
  
This project is ideal for showcasing student work, academic portfolios, or any collection of multimedia projects. It is designed to be embedded easily into any university website or portfolio page.

## Technologies Used:
- **Google Apps Script**: Backend logic to fetch project data from Google Drive.
- **HTML/CSS/JavaScript**: Frontend for displaying project information.
- **Bootstrap**: For responsive design and UI components.
- **Google Drive API**: For accessing and displaying files stored in Google Drive.

## Installation and Setup Guide

### Step 1: Clone or Download the Project
1. **Clone the repository**:
   Open a terminal and use the following command to clone the project:
   ```bash
   git clone https://github.com/your-username/your-repository-name.git
   ```

   Alternatively, you can **download** the project as a ZIP file and extract it on your machine.

### Step 2: Set Up Google Apps Script
1. **Create a new Google Apps Script project**:
   - Go to [Google Apps Script](https://script.google.com/) and click on `New Project`.
   
2. **Copy script files**:
   - Open the `Code.gs` file from the repository and paste the contents into your new Google Apps Script project.

### Step 3: Set Up Google Drive Folder
1. **Create a main folder in Google Drive**:
   - Organize your projects by year, with each year having its own subfolders for `Posterler` (Posters) and `Videolar` (Videos).
   
2. **Copy the Google Drive folder ID**:
   - In Google Drive, open your main folder.
   - From the URL, copy the folder ID (the long string after `/folders/`).
   - Paste this ID in the constructor of the `GraduationProjectManager` class in the script.

### Step 4: Set Permissions
1. **Enable Google Drive API**:
   - In Google Apps Script, go to `Resources` > `Advanced Google Services`.
   - Enable the **Google Drive API** by toggling the switch to ON.
   - Click on `Google Cloud Platform` and enable the Drive API in the Cloud Console.

2. **Update project permissions**:
   - In the Apps Script editor, go to `File` > `Project Properties`.
   - Click on `Scopes` and ensure that you have permission to access Google Drive files.

### Step 5: Set Up HTML Interface
1. **Copy HTML content**:
   - Open the `index.html` file in the repository and paste the contents into a new HTML file within your Apps Script project.

2. **Configure the iframe**:
   - Embed the Apps Script project in your website using an iframe.
   - After deploying the project as a web app, copy the deployment URL.
   - Add this URL to your website using an iframe, for example:
     ```html
     <iframe src="https://script.google.com/macros/s/your-deployment-id/exec" width="100%" height="800px"></iframe>
     ```

### Step 6: Deployment
1. **Deploy the project**:
   - In Google Apps Script, go to `Deploy` > `Test Deployments` > `Deploy as web app`.
   - Set access to `Anyone, even anonymous` if the project is publicly accessible.
   
2. **Copy the web app URL**:
   - Use the provided URL to embed the app into your university webpage or share it directly with users.

### Step 7: Testing and Usage
1. **Load the app**:
   - Once embedded, the app will display available academic years and showcase graduation projects.
   - Users can scroll through the projects and view details, posters, and videos dynamically.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
