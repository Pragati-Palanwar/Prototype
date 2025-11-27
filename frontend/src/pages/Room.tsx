import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useWebsocket from "../hooks/useWebsocket";
import axios from "axios";
import "./Room.css";

const SERVER_BASE = "http://localhost:8000";

const Room: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const ws = useWebsocket(id || "", (msg) => {
    if (msg.type === "init") {
      setCode(msg.code || "");
      setIsConnected(true);
    } else if (msg.type === "update") {
      setCode(msg.code || "");
    }
  });

  const cursorRef = useRef<number>(0);
  const typingTimer = useRef<any>(null);

  useEffect(() => {
    // request initial persisted code if needed (optional)
  }, []);

  const sendUpdate = (newCode: string) => {
    if (!id) return;
    ws.send(JSON.stringify({ type: "update", code: newCode, cursor: cursorRef.current }));
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setCode(v);
    // update cursor position
    cursorRef.current = e.target.selectionStart;
    // send over websocket
    sendUpdate(v);
    // debounce autocomplete
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(async () => {
      try {
        const res = await axios.post(`${SERVER_BASE}/autocomplete`, {
          code: v,
          cursorPosition: cursorRef.current,
          language: "python"
        });
        setSuggestion(res.data.suggestion);
      } catch (err) {
        console.error("autocomplete error", err);
      }
    }, 600);
  };

  const acceptSuggestion = () => {
    if (!suggestion) return;
    // insert suggestion at cursor
    const pos = cursorRef.current || code.length;
    const newCode = code.slice(0, pos) + suggestion + code.slice(pos);
    setCode(newCode);
    sendUpdate(newCode);
    setSuggestion(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      if (suggestion) {
        e.preventDefault();
        acceptSuggestion();
      }
    }
  };

  const copyRoomId = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="room-container">
      <div className="room-header">
        <div className="room-info">
          <h2>Coding Session</h2>
          <div className="room-id-section">
            <span className="room-label">Room ID:</span>
            <code className="room-id">{id}</code>
            <button 
              className="copy-btn" 
              onClick={copyRoomId}
              title="Copy room ID"
            >
              {copied ? "✓ Copied" : "📋"}
            </button>
          </div>
        </div>
        <div className="room-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? "Connected" : "Connecting..."}</span>
        </div>
      </div>

      <div className="room-content">
        <div className="editor-panel">
          <div className="panel-header">
            <h3>💻 Code Editor</h3>
            <span className="char-count">{code.length} characters</span>
          </div>
          <textarea
            value={code}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="code-editor"
            placeholder="Start typing your code here..."
          />
        </div>

        <div className="suggestion-panel">
          <div className="panel-header">
            <h3>✨ AI Suggestions</h3>
          </div>
          <div className="suggestion-box">
            {suggestion ? (
              <>
                <pre className="suggestion-text">{suggestion}</pre>
                <button 
                  className="accept-btn"
                  onClick={acceptSuggestion}
                >
                  Accept (Tab)
                </button>
              </>
            ) : (
              <div className="no-suggestion">
                <p>💡 Keep typing to get suggestions</p>
              </div>
            )}
          </div>
          <div className="suggestion-footer">
            <p>Press <kbd>Tab</kbd> to accept suggestion</p>
          </div>
        </div>
      </div>

      <div className="room-footer">
        <button className="btn-back" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default Room;
