import React, { useReducer, useCallback, useEffect } from "react";
import SelectField from "./components/Select";
import genres from "./store/genre.json";
import moods from "./store/mood.json";
 
const initialState = {
  genre: "",
  mood: "",
  level: "",
  aiResponses: [],
  loading: false,
  error: null,
  shouldFetch: false,
};
 
function reducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "" };
 
    case "SET_MOOD":
      return { ...state, mood: action.payload };
 
    case "SET_LEVEL":
      return { ...state, level: action.payload };
 
    case "TRIGGER_FETCH":
      return { ...state, shouldFetch: true };
 
    case "FETCH_START":
      return { ...state, loading: true, error: null };
 
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        shouldFetch: false,
        aiResponses: [...state.aiResponses, action.payload],
      };
 
    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        shouldFetch: false,
        error: action.payload,
      };
 
    default:
      return state;
  }
}
 
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { genre, mood, level, aiResponses, loading, error, shouldFetch } =
    state;
 
  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;
 
    dispatch({ type: "FETCH_START" });
 
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      if (!API_KEY) throw new Error("API key not set in .env");
 
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=$%7BAPI_KEY%7D`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                  },
                ],
              },
            ],
          }),
        }
      );
 
      const data = await response.json();
 
      if (!response.ok) {
        throw new Error(data?.error?.message || "Gemini API error");
      }
 
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No recommendation received.";
 
      dispatch({ type: "FETCH_SUCCESS", payload: text });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, [genre, mood, level]);
 
  useEffect(() => {
    if (shouldFetch) {
      fetchRecommendations();
    }
  }, [shouldFetch, fetchRecommendations]);
 
  return (
<section style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
<h2>Book Recommendation Engine</h2>
 
      <SelectField
        placeholder="Select Genre"
        options={genres}
        value={genre}
        onSelect={(value) =>
          dispatch({ type: "SET_GENRE", payload: value })
        }
      />
 
      <SelectField
        placeholder="Select Mood"
        options={moods[genre] || []}
        value={mood}
        onSelect={(value) =>
          dispatch({ type: "SET_MOOD", payload: value })
        }
      />
 
      <SelectField
        placeholder="Select Level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={level}
        onSelect={(value) =>
          dispatch({ type: "SET_LEVEL", payload: value })
        }
      />
 
      <button
        onClick={() => dispatch({ type: "TRIGGER_FETCH" })}
        disabled={loading || !genre || !mood || !level}
        style={{ marginTop: "12px", padding: "8px 16px" }}
>
        {loading ? "Loading..." : "Get Recommendation"}
</button>
 
      {error && (
<p style={{ color: "red", marginTop: "10px" }}>
          Error: {error}
</p>
      )}
 
      <div style={{ marginTop: "20px" }}>
        {aiResponses.map((text, index) => (
<details key={index} style={{ marginBottom: "10px" }}>
<summary>Recommendation {index + 1}</summary>
<p>{text}</p>
</details>
        ))}
</div>
</section>
  );
}


