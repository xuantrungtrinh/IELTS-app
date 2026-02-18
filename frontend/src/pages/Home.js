import API_BASE_URL from "../config";
import { useEffect, useState } from "react";

function Home() {
    const READ_ONLY_MODE = true;

    const STUDY_STORAGE_KEY = "ielts_study_progress";

    // ✅ 1. STATE PHẢI NẰM Ở ĐÂY
    const [vocab, setVocab] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    const [editingId, setEditingId] = useState(null); // openId = id của vocab đang mở answer, null = tất cả đang ẩn.
    const [openId, setOpenId] = useState(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [editAnswer, setEditAnswer] = useState("");

    const [topic, setTopic] = useState("");
    const [editTopic, setEditTopic] = useState("");

    const [search, setSearch] = useState("");

    const [mode, setMode] = useState("list");
    const [showAnswer, setShowAnswer] = useState(false);

    const [studyNotice, setStudyNotice] = useState("");
    const [studyFinished, setStudyFinished] = useState(false);

    const [studyQueue, setStudyQueue] = useState([]);

    const [studyStarted, setStudyStarted] = useState(false);

    const [initialTotal, setInitialTotal] = useState(0); // ⭐ TỔNG BAN ĐẦU

    const current = studyQueue[0];
    // ===== STUDY PROGRESS (derived, không phải state) =====
    const total = studyStarted ? initialTotal : 0;
    const learned = studyStarted
      ? Math.max(0, initialTotal - studyQueue.length)
      : 0;

    const progressPercent =
      total === 0 ? 0 : Math.round((learned / total) * 100);

  // Hết 1.

    const handleTopicChange = (e) => {
    setTopic(e.target.value);
    setPage(1); // rất quan trọng: đổi topic → quay về page 1
    };


    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const res = await fetch(`${API_BASE_URL}/vocab`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question,
            answer: answer,
            topic: topic
          })
        });

        if (!res.ok) {
          throw new Error("Failed to create vocab");
        }

        const newVocab = await res.json();

        setVocab([...vocab, newVocab]);
        setQuestion("");
        setAnswer("");
      } catch (err) {
        alert(err.message);
      }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditQuestion(item.question);
        setEditAnswer(item.answer);
        setEditTopic(item.topic || "");
    };

    const saveEdit = async (id) => {
      try {
        const res = await fetch(`${API_BASE_URL}/vocab/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: editQuestion,
            answer: editAnswer,
            topic: editTopic
          })
        });

        if (!res.ok) {
          throw new Error("Failed to update vocab");
        }

        const updated = await res.json();

        setVocab(vocab.map(v =>
          v.id === id ? updated : v
        ));

        setEditingId(null);
      } catch (err) {
        alert(err.message);
      }
    };

    const handleDelete = async (id) => {
      try {
        const res = await fetch(`${API_BASE_URL}/vocab/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete vocab");
        }

        // update UI không cần reload
        setVocab(vocab.filter((item) => item.id !== id));
      } catch (err) {
        alert(err.message);
      }
    };

  // ✅ 2. useEffect PHẢI NẰM TRONG function App
  useEffect(() => {
    const fetchVocab = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((r) => setTimeout(r, 1000)); // 1s delay

        let url = `${API_BASE_URL}/vocab?page=${page}&limit=${LIMIT}`;
        if (topic) {
          url += `&topic=${encodeURIComponent(topic)}`;
        }

        if (search) {
          url += `&q=${encodeURIComponent(search)}`;
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to fetch vocab");
        }

        const data = await res.json();
        setVocab(data.items);
        setTotalPages(data.pages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVocab();
  }, [page, topic, search]);

    // 🔄 RESTORE study progress on reload
    useEffect(() => {
      const saved = localStorage.getItem(STUDY_STORAGE_KEY);
      if (!saved) return;

      try {
        const data = JSON.parse(saved);

        if (data.studyQueue && data.studyQueue.length > 0) {
          setMode("study");
          setStudyQueue(data.studyQueue);

          setInitialTotal(
            data.initialTotal ?? data.studyQueue.length
          ); // ⭐⭐⭐ QUAN TRỌNG ⭐⭐⭐

          setStudyStarted(true);
          setShowAnswer(false);
          setStudyFinished(false);
          setStudyNotice("");
        }
      } catch (e) {
        console.error("Failed to restore study progress");
      }
    }, []);

    useEffect(() => {
      if (mode === "study" && !studyStarted) {
        const shuffled = [...vocab].sort(() => Math.random() - 0.5);
        setInitialTotal(shuffled.length);

        setStudyQueue(shuffled);
        setShowAnswer(false);
        setStudyFinished(false);
        setStudyNotice("");
        setStudyStarted(true);
      }
    }, [mode, vocab, studyStarted]);

    useEffect(() => {
      if (
        studyStarted &&
        studyQueue.length === 0 &&
        mode === "study"
      ) {
        setStudyFinished(true);
        setStudyNotice("🎉 All vocab remembered!");
      }
    }, [studyQueue, mode, studyStarted]);

    // 💾 SAVE study progress
    useEffect(() => {
      if (!studyStarted) return;

      const data = {
        studyQueue,
        studyStarted,
        initialTotal
      };

      localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(data));
    }, [studyQueue, studyStarted, initialTotal]);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (mode !== "study") return;

        if (["Space", "Enter"].includes(e.code)) {
          e.preventDefault();
        }

        // ===== ENTER: Start over =====
        if (e.code === "Enter" && studyFinished) {
          const reshuffled = [...vocab].sort(() => Math.random() - 0.5);
          setStudyQueue(reshuffled);
          setInitialTotal(reshuffled.length);
          setShowAnswer(false);
          setStudyFinished(false);
          setStudyNotice("");
          return;
        }

        // ===== SPACE =====
        if (e.code === "Space") {
          if (studyFinished) return;

          // Khi answer CHƯA hiện → Space = Show answer
          if (!showAnswer) {
            setShowAnswer(true);
            return;
          }

          // Khi answer ĐÃ hiện → Space KHÔNG làm gì
          return;
        }

        // ===== Remembered =====
        if (e.code === "Digit1" && showAnswer && !studyFinished) {
          const nextQueue = studyQueue.slice(1);

          setStudyQueue(nextQueue);
          setShowAnswer(false);

          if (nextQueue.length === 0) {
            setStudyFinished(true);
            setStudyNotice("🎉 All vocab remembered!");
          }
        }

        // ===== Forgot =====
        if (e.code === "Digit2" && showAnswer && !studyFinished) {
          setStudyQueue([...studyQueue.slice(1), studyQueue[0]]);
          setShowAnswer(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
      mode,
      showAnswer,
      studyFinished,
      studyQueue,
      vocab
    ]);

  // ✅ 3. RETURN PHẢI Ở CUỐI function App
  return (
      <div style={{ padding: "20px" }}>
        <h1>IELTS Vocab</h1>

        {mode === "study" && studyStarted && (
          <div style={{ margin: "16px 0" }}>
            <div
              style={{
                height: "10px",
                background: "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "#22c55e",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <div style={{ marginTop: "6px", fontSize: "14px", color: "#555" }}>
              {learned} / {total} learned ({progressPercent}%)
            </div>
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <button
            onClick={() => setMode("list")}
            disabled={mode === "list"}
          >
            List Mode
          </button>

          <button
            onClick={() => setMode("study")}
            disabled={mode === "study"}
            style={{ marginLeft: "8px" }}
          >
            Study Mode
          </button>
        </div>


        <input
          type="text"
          placeholder="Search vocab..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // rất quan trọng
          }}
          style={{ marginRight: "10px" }}
        />

        <label>
          Topic:&nbsp;
          <select value={topic} onChange={handleTopicChange}>
            <option value="">All</option>
            <option value="Travel">Travel</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Environment">Environment</option>
          </select>
        </label>

        <hr />

        {mode === "list" && (
            <>
                {loading && <p>Loading vocab...</p>}

                {error && <p style={{ color: "red" }}>Error: {error}</p>}

                {!loading && !error && (
                  <ul>
                    {vocab.map((item) => (
        //              <li key={item.id}>
        //                <strong>{item.question}</strong> — {item.answer}
        //
        //                <button
        //                    style={{ marginLeft: "10px" }}
        //                    onClick={() => handleDelete(item.id)}
        //                  >
        //                    ❌
        //                  </button>
        //
        //              </li>
                        <li key={item.id}>
                          {editingId === item.id ? (
                            <>
                              <input
                                value={editQuestion}
                                onChange={(e) => setEditQuestion(e.target.value)}
                              />

                              <input
                                value={editAnswer}
                                onChange={(e) => setEditAnswer(e.target.value)}
                              />

                                <select
                                  value={editTopic}
                                  onChange={(e) => setEditTopic(e.target.value)}
                                >
                                  <option value="">Topic</option>
                                  <option value="Travel">Travel</option>
                                  <option value="Education">Education</option>
                                  <option value="Technology">Technology</option>
                                  <option value="Environment">Environment</option>
                                </select>

                              <button style={{ marginLeft: "10px" }} onClick={() => saveEdit(item.id)}>💾 Save</button>
                              <button onClick={() => setEditingId(null)}>❌ Cancel</button>
                            </>
                          ) : (
                            <>
                              <div
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    setOpenId(openId === item.id ? null : item.id)
                                  }
                                >
                                  <strong>{item.question}</strong>

                                  {openId === item.id && (
                                    <div style={{ marginTop: "5px", color: "#333" }}>
                                      {item.answer}
                                    </div>
                                  )}
                                </div>
                              {!READ_ONLY_MODE && (
                                <>
                                  <button style={{ marginLeft: "10px" }} onClick={() => startEdit(item)}>✏ Edit</button>
                                  <button onClick={() => handleDelete(item.id)}>🗑 Delete</button>
                                </>
                              )}
                            </>
                          )}

                          <div style={{ fontSize: "12px", color: "#666" }}>
                              {item.topic}
                          </div>

                        </li>

                    ))}
                  </ul>
                )}

                <div style={{ marginTop: "20px" }}>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    ⬅ Prev
                  </button>

                  <span style={{ margin: "0 10px" }}>
                    Page {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next ➡
                  </button>
                </div>

            </>
        )}

        {mode === "study" && (
          <div style={{ marginTop: "20px" }}>
            {vocab.length === 0 ? (
              <p>No vocab to study.</p>
            ) : (
              <>
                <h2>Study Mode</h2>

                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: "20px",
                    borderRadius: "8px",
                    maxWidth: "500px"
                  }}
                >
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                      {current?.question}
                    </div>

                    {showAnswer && (
                      <div style={{ marginTop: "12px", color: "#333" }}>
                        {current?.answer}
                      </div>
                    )}

                  <div style={{ marginTop: "16px" }}>
                    {!studyFinished && !showAnswer && (
                      <button onClick={() => setShowAnswer(true)}>
                        Show answer
                      </button>
                    )}

                    {showAnswer && !studyFinished && (
                      <div style={{ marginTop: "12px" }}>
                        <button
                          onClick={() => {
                            setStudyQueue(studyQueue.slice(1));
                            setShowAnswer(false);
                          }}
                        >
                          ✅ Remembered
                        </button>

                        <button
                          style={{ marginLeft: "8px" }}
                          onClick={() => {
                            setStudyQueue([...studyQueue.slice(1), studyQueue[0]]);
                            setShowAnswer(false);
                          }}
                        >
                          🔁 Forgot
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {studyNotice && (
                  <div
                    style={{
                      marginTop: "12px",
                      color: "green",
                      fontSize: "14px"
                    }}
                  >
                    {studyNotice}
                  </div>
                )}

                {studyFinished && (
                  <button
                      style={{ marginTop: "8px" }}
                      onClick={() => {
                        localStorage.removeItem(STUDY_STORAGE_KEY);

                        setStudyStarted(false);

                        const reshuffled = [...vocab].sort(() => Math.random() - 0.5);

                        setStudyQueue(reshuffled);   // ⭐ QUAN TRỌNG NHẤT
                        setInitialTotal(reshuffled.length); // ⭐ RESET TOTAL
                        setShowAnswer(false);
                        setStudyFinished(false);
                        setStudyNotice("");
                      }}
                    >
                      🔁 Start over
                    </button>
                )}

                {studyFinished && (
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                    Press <b>Enter</b> to start over
                  </div>
                )}

                <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                  Remaining: {studyQueue.length}
                </div>
              </>
            )}
          </div>
        )}

        {!READ_ONLY_MODE && (
            <>
                <hr />

                <h2>Add new vocab</h2>

                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />

                  <br />

                  <input
                    type="text"
                    placeholder="Answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />

                  <br />

                  <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                      <option value="">Topic</option>
                      <option value="Travel">Travel</option>
                      <option value="Education">Education</option>
                      <option value="Technology">Technology</option>
                  </select>

                  <button type="submit">Add vocab</button>
                </form>
            </>
        )}
      </div>
    );
}

export default Home;
