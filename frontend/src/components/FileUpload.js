import React, { useState, useRef } from 'react';
import './FileUpload.css';

function FileUpload({ saveId, token, onUpload }) {
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const shouldConfirmOverride = saveId || fileName;
    if (shouldConfirmOverride) {
      const confirmed = window.confirm(
        'Uploading a new file will override existing data. Continue?'
      );
      if (!confirmed) {
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
    }

    if (!file.name.endsWith('.sav')) {
      setError('Please upload a .sav file.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    if (saveId) formData.append('save_id', saveId);
    formData.append('file', file);

    try {
      const response = await fetch(process.env.REACT_APP_PROD + '/upload/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail === 'SaveFileError') {
          setError('Invalid or corrupted save file.');
        } else {
          setError('Upload failed.');
        }
      } else {
        onUpload(data);
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="uploadWrapper">
      <label htmlFor="file-upload" className="customUploadButton">
        {isUploading ? 'Uploading...' : 'Choose Save File'}
      </label>
      <input
        ref={inputRef}
        id="file-upload"
        className="fileInputHidden"
        type="file"
        accept=".sav"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {fileName && !isUploading && <div className="fileName">{fileName}</div>}
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
}


export default FileUpload;
