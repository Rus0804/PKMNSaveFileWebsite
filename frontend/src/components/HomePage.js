import React, { useEffect, useState, useCallback } from "react";
import "./HomePage.css";

function HomePage({ token, onSelectSave }) {
  const [saves, setSaves] = useState([]);
  const [error, setError] = useState("");
  const fetchSaves = useCallback(() => {
    fetch(`${process.env.REACT_APP_PROD}/saves`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Error fetching saves");
        }
        return res.json();
      })
      .then((data) => setSaves(data))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    fetchSaves();
  }, [fetchSaves]);

  const handleCreateNew = () => {
    fetch(process.env.REACT_APP_PROD+"/saves/new", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        fetchSaves(); // Refresh after creation
        onSelectSave(data);
      })
      .catch((err) => setError(err.message));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this save?")) return;
    fetch(`${process.env.REACT_APP_PROD}/saves/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete save");
        fetchSaves(); // Refresh after deletion
      })
      .catch((err) => setError(err.message));
  };

  const handleRename = (id) => {
    const newName = window.prompt("Enter new filename:");
    if (!newName) return;
    fetch(`${process.env.REACT_APP_PROD}/saves/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: newName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to rename save");
        return res.json();
      })
      .then(() => fetchSaves()) 
      .catch((err) => setError(err.message));
  };

  const handleLoad = (save) => {
    onSelectSave(save);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>Your Save Files</h2>
      </div>

      {error && <p className="error-message">{error}</p>}

      {saves.length === 0 ? (
        <p className="no-saves">No saves found. Create one below!</p>
      ) : (
        <ul className="save-list">
          {saves.map((save) => (
            <li key={save.id} className="save-item">
              <div>
                <strong>{save.filename}</strong>
                <div className="timestamp">
                  Updated: {new Date(save.updated_at).toLocaleString()}
                </div>
              </div>
              <div className="action-buttons">
                <button className="load-button" onClick={() => handleLoad(save)}>
                  Load
                </button>
                <button className="rename-button" onClick={() => handleRename(save.id)}>
                  Rename
                </button>
                <button className="delete-button" onClick={() => handleDelete(save.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="create-button" onClick={handleCreateNew}>
        + Create New Save
      </button>
    </div>
  );
}

export default HomePage;
