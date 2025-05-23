const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

// Show selected files inside the dropzone below instructions
function showFilesInDropzone(files) {
  let existingList = dropzone.querySelector('.selected-files');
  if (existingList) existingList.remove();

  const list = document.createElement('div');
  list.className = 'selected-files';

  for (let i = 0; i < files.length; i++) {
    const fileName = document.createElement('div');
    fileName.textContent = files[i].name;
    list.appendChild(fileName);
  }

  dropzone.appendChild(list);
}

// Add a file entry to the previous requests in localStorage
function saveFileToLocalStorage(name, url) {
  let savedFiles = JSON.parse(localStorage.getItem('previousFiles') || '[]');

  // Avoid duplicates by name (optional)
  if (!savedFiles.find(f => f.name === name)) {
    savedFiles.push({ name, url });
    localStorage.setItem('previousFiles', JSON.stringify(savedFiles));
  }
}

// Create an anchor element for a file
function createFileLink(name, url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.textContent = name;
  a.addEventListener('click', () => {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  return a;
}

// Load saved files from localStorage and render them
function loadPreviousFiles() {
  let savedFiles = JSON.parse(localStorage.getItem('previousFiles') || '[]');
  fileList.innerHTML = '';
  savedFiles.forEach(file => {
    // Since we stored blob URLs only temporarily, recreate a dummy link using data: URL
    // But we can’t persist blob URLs over reloads, so instead:
    // We'll create links without real URLs (could be improved with server storage)
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = file.name + ' (download unavailable)';
    a.style.cursor = 'default';
    fileList.appendChild(a);
  });
}

// Add new files to the previous requests section and localStorage
function addFilesToList(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const url = URL.createObjectURL(file);
    const a = createFileLink(file.name, url);

    fileList.appendChild(a);

    // Save name only, URL can't persist blob after reload; 
    // Could improve with backend or base64 encoding if needed.
    saveFileToLocalStorage(file.name, url);
  }
}

// Dragover visual effect
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  fileInput.files = e.dataTransfer.files;
  showFilesInDropzone(e.dataTransfer.files);
  addFilesToList(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  showFilesInDropzone(fileInput.files);
  addFilesToList(fileInput.files);
});

document.getElementById('uploadForm').addEventListener('submit', (e) => {
  e.preventDefault();
  // No alert or backend handling yet
});

// On page load, populate previous requests from localStorage
loadPreviousFiles();