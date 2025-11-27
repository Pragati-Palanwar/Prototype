import React, { useEffect, useState } from "react";

interface EditorProps {
  code: string;
  setCode: (value: string) => void;
  suggestion: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ code, setCode, suggestion, onChange }) => {
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    if (suggestion) {
      setShowSuggestion(true);
    }
  }, [suggestion]);

  const applySuggestion = () => {
    setCode(code + suggestion);
    onChange(code + suggestion);
    setShowSuggestion(false);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: "400px",
          padding: "10px",
          fontFamily: "monospace",
          fontSize: "16px",
        }}
      />

      {/* Suggestion popup */}
      {showSuggestion && (
        <div
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            cursor: "pointer",
          }}
          onClick={applySuggestion}
        >
          💡 {suggestion}
        </div>
      )}
    </div>
  );
};

export default Editor;
