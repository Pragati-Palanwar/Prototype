import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateRoom.css";

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("http://localhost:8000/rooms");
      const roomId = res.data.roomId;
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create room. Is backend running at http://localhost:8000?");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    const id = (document.getElementById("joinId") as HTMLInputElement).value.trim();
    if (id) {
      navigate(`/room/${id}`);
    } else {
      setError("Please enter a room ID");
    }
  };

  return (
    <div className="create-room-container">
      <div className="create-room-card">
        <div className="card-header">
          <h2>Welcome to CodeSync</h2>
          <p>Start collaborating with your team in real-time</p>
        </div>

        <div className="card-content">
          {error && <div className="error-message">{error}</div>}

          <div className="action-section">
            <div className="action-item">
              <div className="action-icon">✨</div>
              <h3>Create New Room</h3>
              <p>Start a fresh coding session</p>
              <button 
                className="btn btn-primary" 
                onClick={createRoom}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Room"}
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="action-item">
              <div className="action-icon">🔗</div>
              <h3>Join Existing Room</h3>
              <p>Enter a room ID to join</p>
              <div className="input-group">
                <input 
                  id="joinId" 
                  className="input-field"
                  placeholder="Enter room ID..." 
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                />
                <button 
                  className="btn btn-secondary" 
                  onClick={joinRoom}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <p>💡 Tip: Share your room ID with teammates to collaborate together</p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
