<!-- 
  Programmed by Emre Can Kuran
  Graduation Projects Showcase Web Application
  Date: 2024-10
  
  This project is designed to dynamically showcase graduation projects from Google Drive,
  with posters and videos organized by academic year. The frontend is built using HTML, 
  Bootstrap, and JavaScript, while Google Apps Script handles backend operations such as 
  fetching files from Google Drive.

  For more information, visit: https://github.com/EmreCanKURAN/GraduationProjectsPortfolio
-->


class GraduationProjectManager {
  // Constructor to initialize the manager with the Google Drive folder ID.
  constructor(folderId) {
    this.folderId = folderId;
    this.mainFolder = DriveApp.getFolderById(folderId); // Main folder in Google Drive
  }

  // Get the available academic years (folders named in YYYY-YYYY format)
  getAvailableYears() {
    const folders = this.mainFolder.getFolders(); // Get all subfolders
    const availableYears = [];

    while (folders.hasNext()) {
      const folder = folders.next();
      const folderName = folder.getName();
      
      // Check if the folder name matches the academic year pattern (e.g., 2021-2022)
      if (folderName.match(/^\d{4}-\d{4}$/)) {
        availableYears.push(folderName); // Add the valid year folder to the list
      }
    }

    return availableYears; // Return the list of available years
  }

  // Get the projects for a specific academic year with optional pagination (start and limit)
  getProjectsForYear(year, start = 0, limit = 10) {
    const yearFolderIterator = this.mainFolder.getFoldersByName(year); // Get the folder for the given year

    // If no folder exists for the year, return an empty list
    if (!yearFolderIterator.hasNext()) {
      Logger.log("Year folder not found: " + year);
      return [];
    }

    const yearFolder = yearFolderIterator.next();
    
    // Get subfolders for posters and videos
    const posterFolder = this.getSubFolderByName(yearFolder, "Posterler");
    const videoFolder = this.getSubFolderByName(yearFolder, "Videolar");

    // Get all files from both subfolders
    const posterFiles = this.getFilesFromFolder(posterFolder);
    const videoFiles = this.getFilesFromFolder(videoFolder);

    // Merge the poster and video files into a list of projects
    return this.mergeProjects(posterFiles, videoFiles).slice(start, start + limit);
  }

  // Helper method to get a subfolder by its name
  getSubFolderByName(parentFolder, subFolderName) {
    const subFolderIterator = parentFolder.getFoldersByName(subFolderName);
    return subFolderIterator.hasNext() ? subFolderIterator.next() : null;
  }

  // Helper method to get all files from a folder
  getFilesFromFolder(folder) {
    if (!folder) return []; // Return an empty list if the folder doesn't exist

    const files = [];
    const fileIterator = folder.getFiles();

    // Iterate through all files and collect their information
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      files.push({
        name: file.getName(), // Original file name
        normalizedName: this.normalizeName(file.getName()), // Normalized name for matching
        url: this.getViewableUrl(file, file.getMimeType()), // Viewable URL based on file type
        fileType: file.getMimeType(), // MIME type (e.g., image/jpeg, video/mp4)
      });
    }
    return files;
  }

  // Merge poster and video files into projects by matching similar names
  mergeProjects(posterFiles, videoFiles) {
    const projects = [];
    const processedNames = new Set(); // To track files that have already been matched

    // Loop through poster files and find matching videos based on name similarity
    posterFiles.forEach((poster) => {
      let bestMatch = null;
      let bestDistance = Number.MAX_SAFE_INTEGER; // Initialize with the maximum possible distance

      // Compare the normalized name of the poster with all video files
      videoFiles.forEach((video) => {
        const distance = this.levenshteinDistance(poster.normalizedName, video.normalizedName); // Levenshtein distance

        // Find the closest match that hasn't been processed yet
        if (distance < bestDistance && !processedNames.has(video.normalizedName)) {
          bestDistance = distance;
          bestMatch = video;
        }
      });

      // If a close enough match is found, combine poster and video into a project
      if (bestMatch && bestDistance <= 3) {
        projects.push({
          name: poster.name,
          posterUrl: poster.url,
          fileType: poster.fileType,
          videoUrl: bestMatch.url,
        });
        processedNames.add(poster.normalizedName); // Mark the poster and video as processed
        processedNames.add(bestMatch.normalizedName);
      } else {
        // If no match is found, add the poster alone as a project
        projects.push({
          name: poster.name,
          posterUrl: poster.url,
          fileType: poster.fileType,
          videoUrl: null,
        });
        processedNames.add(poster.normalizedName);
      }
    });

    // Add any remaining unmatched videos as standalone projects
    videoFiles.forEach((video) => {
      if (!processedNames.has(video.normalizedName)) {
        projects.push({
          name: video.name,
          posterUrl: null,
          fileType: null,
          videoUrl: video.url,
        });
        processedNames.add(video.normalizedName);
      }
    });

    return projects; // Return the list of projects
  }

  // Normalize file names by removing special characters and making them lowercase
  normalizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  // Calculate the Levenshtein distance between two strings (used for name matching)
  levenshteinDistance(a, b) {
    const matrix = [];
    
    // Initialize the matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill the matrix by comparing characters
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) == a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]; // If characters match
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Substitution
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // Insertion or deletion
          );
        }
      }
    }

    return matrix[b.length][a.length]; // Return the final distance
  }

  // Generate a viewable URL for a file based on its type (image, video, PDF)
  getViewableUrl(file, fileType) {
    const fileId = file.getId();
    
    // If the file is an image, return thumbnail and full image URLs
    if (fileType === MimeType.JPEG || fileType === MimeType.PNG || fileType === MimeType.JPG) {
      return {
        thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '?authuser=0',
        fullImage: 'https://drive.google.com/file/d/' + fileId + '/preview'
      };
    
    // If the file is a PDF, return a preview URL
    } else if (fileType === MimeType.PDF) {
      return 'https://drive.google.com/file/d/' + fileId + '/preview';
    
    // If the file is a video, return thumbnail and preview URLs
    } else if (fileType.startsWith('video')) {
      return {
        thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '?authuser=0',
        preview: 'https://drive.google.com/file/d/' + fileId + '/preview'
      };
    
    // Default case, return a generic preview URL
    } else {
      return 'https://drive.google.com/file/d/' + fileId + '/preview';
    }
  }
}
