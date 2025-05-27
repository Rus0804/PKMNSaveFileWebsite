import React, { useEffect, useState, useCallback } from "react";
import "./HomePage.css";

const API_URL = process.env.REACT_APP_PROD;

function HomePage({ token, onSelectSave }) {
  const [saves, setSaves] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/saves`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error fetching saves");
      }
      const data = await res.json();
      setSaves(data);    
    } catch (err) {
      console.log(err)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSaves();
  }, [fetchSaves]);

  const handleCreateNew = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/saves/new`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      await fetchSaves();
      onSelectSave(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this save?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/saves/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete save");
      await fetchSaves();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id) => {
    const newName = window.prompt("Enter new filename:");
    if (!newName) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/saves/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: newName }),
      });
      if (!res.ok) throw new Error("Failed to rename save");
      await fetchSaves();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (save) => {
    onSelectSave(save);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>Your Save Files</h2>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button className="dismiss-error" onClick={() => setError("")}>×</button>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading saves...</p>
      ) : saves.length === 0 ? (
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
                <button
                  className="load-button"
                  onClick={() => handleLoad(save)}
                  disabled={loading}
                >
                  Load
                </button>
                <button
                  className="rename-button"
                  onClick={() => handleRename(save.id)}
                  disabled={loading}
                >
                  Rename
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(save.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {saves.length >= 5 && !loading && (
        <p className="limit-reached">Save file limit reached (5).</p>
      )}

      <button
        className="create-button"
        onClick={handleCreateNew}
        disabled={loading || saves.length >= 5}
        title={saves.length >= 5 ? "You can only have up to 5 save files." : ""}
      >
        + Create New Save
      </button>

    </div>
  );
}

export default HomePage;
