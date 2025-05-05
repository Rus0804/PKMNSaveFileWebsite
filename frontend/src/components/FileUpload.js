import React, { useState } from 'react';

function FileUpload({ saveId, token, onUpload }) {
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null); 
    const formData = new FormData();
    if (saveId){    
      formData.append('save_id', saveId);
    }
    formData.append('file', file);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    try {
      const response = await fetch(process.env.REACT_APP_PROD+'/upload/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.detail === "SaveFileError") {
        setError("Invalid or corrupted save file.");
      } else {
        onUpload(data); // Normal data processing
      }
    } catch (err) {
      setError("Could not connect to server.");
    }
  };

  return (
    <div>
      <input type="file" accept=".sav" onChange={handleFileChange} />
      {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
    </div>
  );
}

export default FileUpload;
