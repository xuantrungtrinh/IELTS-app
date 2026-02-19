import { useState } from "react";
import { useParams } from "react-router-dom";

export default function LessonScreen() {
  const { unit, module, lesson } = useParams();

  // Hardcode demo data trước
  const questions = [
    {
      question: "I will call you when I ___ home.",
      options: ["get", "will get", "got", "getting"],
      correct: 0,
      explanation: "Time clauses use present simple for future meaning.",
      xp: 10
    },
    {
      question: "She ___ to school every day.",
      options: ["go", "goes", "went", "going"],
      correct: 1,
      explanation: "He/She/It + verb + s.",
      xp: 10
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [xpEarned, setXpEarned] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (selected === null) return;

    setShowFeedback(true);

    if (selected === currentQuestion.correct) {
      setXpEarned(xpEarned + currentQuestion.xp);
    } else {
      setHearts(hearts - 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("Lesson Complete! XP: " + xpEarned);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>

      {/* Progress bar */}
      <div style={{ background: "#eee", height: 10, borderRadius: 5 }}>
        <div
          style={{
            width: `${progress}%`,
            background: "#58cc02",
            height: "100%",
            borderRadius: 5
          }}
        />
      </div>

      <p>❤️ {hearts} | ⭐ {xpEarned}</p>

      <h3>{currentQuestion.question}</h3>

      {currentQuestion.options.map((option, index) => {
        let bg = "#fff";

        if (showFeedback) {
          if (index === currentQuestion.correct) bg = "#c8f7c5";
          else if (index === selected) bg = "#f7c5c5";
        } else if (index === selected) {
          bg = "#dbeafe";
        }

        return (
          <button
            key={index}
            onClick={() => setSelected(index)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 10,
              background: bg,
              border: "1px solid #ccc",
              borderRadius: 8,
              cursor: "pointer"
            }}
            disabled={showFeedback}
          >
            {option}
          </button>
        );
      })}

      {!showFeedback ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          style={{ padding: 10, marginTop: 10 }}
        >
          Check
        </button>
      ) : (
        <>
          <p><strong>{selected === currentQuestion.correct ? "Correct!" : "Wrong!"}</strong></p>
          <p>{currentQuestion.explanation}</p>
          <button onClick={handleNext} style={{ padding: 10 }}>
            Next
          </button>
        </>
      )}
    </div>
  );
}
