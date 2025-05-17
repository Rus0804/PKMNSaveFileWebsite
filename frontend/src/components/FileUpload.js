import React, { useState, useRef, useEffect } from 'react';
import './FileUpload.css';

function FileUpload({ saveId, token, onUpload, saveData }) {
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  // Clear file input and file name when saveData is cleared externally
  useEffect(() => {
    if (!saveData) {
      if (inputRef.current) inputRef.current.value = '';
      setFileName(null);
    }
  }, [saveData]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const shouldConfirmOverride = saveData || fileName;
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
    if (saveId) {
      formData.append('save_id', saveId)
      formData.append('old_data', saveData)
    };
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
        if (inputRef.current) inputRef.current.value = '';
        setFileName(null);
      } else {
        if (!data || Object.keys(data).length === 0) {
          setError('No data returned from server.');
          if (inputRef.current) inputRef.current.value = '';
          setFileName(null);
        } else {
          onUpload(data);
        }
      }
    } catch (err) {
      setError('Could not connect to server.');
      if (inputRef.current) inputRef.current.value = '';
      setFileName(null);
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
      {fileName && !isUploading && (
        <div className="fileName">{fileName}</div>
      )}
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
}

export default FileUpload;
