import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload({ saveId, token, onUpload }) {
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    if (saveId) {
      formData.append('save_id', saveId);
    }
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

      if (data.detail === 'SaveFileError') {
        setError('Invalid or corrupted save file.');
      } else {
        onUpload(data);
      }
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  return (
    <div className="uploadWrapper">
      <input
        className="fileInput"
        type="file"
        accept=".sav"
        onChange={handleFileChange}
      />
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
}

export default FileUpload;
