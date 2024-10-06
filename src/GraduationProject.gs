class GraduationProjectManager {
  constructor(folderId) {
    this.folderId = folderId;
    this.mainFolder = DriveApp.getFolderById(folderId);
  }

  getAvailableYears() {
    const folders = this.mainFolder.getFolders();
    const availableYears = [];

    while (folders.hasNext()) {
      const folder = folders.next();
      const folderName = folder.getName();
      if (folderName.match(/^\d{4}-\d{4}$/)) {
        availableYears.push(folderName);
      }
    }

    return availableYears;
  }

  getProjectsForYear(year, start = 0, limit = 10) {
    const yearFolderIterator = this.mainFolder.getFoldersByName(year);
    if (!yearFolderIterator.hasNext()) {
      Logger.log("Year folder not found: " + year);
      return [];
    }
    const yearFolder = yearFolderIterator.next();

    const posterFolder = this.getSubFolderByName(yearFolder, "Posterler");
    const videoFolder = this.getSubFolderByName(yearFolder, "Videolar");

    const posterFiles = this.getFilesFromFolder(posterFolder);
    const videoFiles = this.getFilesFromFolder(videoFolder);

    return this.mergeProjects(posterFiles, videoFiles).slice(start, start + limit);
  }

  getSubFolderByName(parentFolder, subFolderName) {
    const subFolderIterator = parentFolder.getFoldersByName(subFolderName);
    return subFolderIterator.hasNext() ? subFolderIterator.next() : null;
  }

  getFilesFromFolder(folder) {
    if (!folder) return [];

    const files = [];
    const fileIterator = folder.getFiles();
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      files.push({
        name: file.getName(),
        normalizedName: this.normalizeName(file.getName()),
        url: this.getViewableUrl(file, file.getMimeType()),
        fileType: file.getMimeType(),
      });
    }
    return files;
  }

  mergeProjects(posterFiles, videoFiles) {
    const projects = [];
    const processedNames = new Set();

    posterFiles.forEach((poster) => {
      let bestMatch = null;
      let bestDistance = Number.MAX_SAFE_INTEGER;

      videoFiles.forEach((video) => {
        const distance = this.levenshteinDistance(poster.normalizedName, video.normalizedName);
        if (distance < bestDistance && !processedNames.has(video.normalizedName)) {
          bestDistance = distance;
          bestMatch = video;
        }
      });

      if (bestMatch && bestDistance <= 3) {
        projects.push({
          name: poster.name,
          posterUrl: poster.url,
          fileType: poster.fileType,
          videoUrl: bestMatch.url,
        });
        processedNames.add(poster.normalizedName);
        processedNames.add(bestMatch.normalizedName);
      } else {
        projects.push({
          name: poster.name,
          posterUrl: poster.url,
          fileType: poster.fileType,
          videoUrl: null,
        });
        processedNames.add(poster.normalizedName);
      }
    });

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

    return projects;
  }

  normalizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) == a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  getViewableUrl(file, fileType) {
    const fileId = file.getId();
    if (fileType === MimeType.JPEG || fileType === MimeType.PNG || fileType === MimeType.JPG) {
      return {
        thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '?authuser=0',
        fullImage: 'https://drive.google.com/file/d/' + fileId + '/preview'
      };
    } else if (fileType === MimeType.PDF) {
      return 'https://drive.google.com/file/d/' + fileId + '/preview';
    } else if (fileType.startsWith('video')) {
      return {
        thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '?authuser=0',
        preview: 'https://drive.google.com/file/d/' + fileId + '/preview'
      };
    } else {
      return 'https://drive.google.com/file/d/' + fileId + '/preview';
    }
  }
}
