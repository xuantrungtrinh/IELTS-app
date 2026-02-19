import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import correctSound from "../assets/sounds/correct.mp3";
import wrongSound from "../assets/sounds/wrong.mp3";
import lessonendSound from "../assets/sounds/end_lesson.mp3";

export default function LessonScreen() {
  const { unit, module, lesson } = useParams();

  useEffect(() => {
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        setVoices(allVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

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
  const [voices, setVoices] = useState([]);
  const playSound = (soundFile) => {
      const audio = new Audio(soundFile);
      audio.volume = 0.8;
      audio.play();
  };
  const speak = (text, type = "question") => {
      if (!text) return;

      window.speechSynthesis.cancel();

      let cleanedText = text.replace(/___/g, ",");
      cleanedText = cleanedText.replace(/[^a-zA-Z,\s]/g, " ");
      cleanedText = cleanedText.replace(/\s+/g, " ").trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);

      utterance.lang = "en-US";
      utterance.rate = 0.95;

      // 🔹 Pick female voice if available
      const femaleVoice = voices.find(
        (voice) =>
          voice.lang.includes("en") &&
          voice.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else if (voices.length > 0) {
        // fallback random English voice
        const englishVoices = voices.filter(v => v.lang.includes("en"));
        if (englishVoices.length > 0) {
          utterance.voice =
            englishVoices[Math.floor(Math.random() * englishVoices.length)];
        }
      }

      window.speechSynthesis.speak(utterance);
  };
  const [isLessonComplete, setIsLessonComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  useEffect(() => {
      if (!currentQuestion) return;
      speak(currentQuestion.question);
  }, [currentIndex]);

  const handleSubmit = () => {
    if (selected === null) return;

    setShowFeedback(true);

    if (selected === currentQuestion.correct) {
      playSound(correctSound);
      setXpEarned(xpEarned + currentQuestion.xp);
    } else {
      playSound(wrongSound);
      setHearts(hearts - 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      playSound(lessonendSound);
      setIsLessonComplete(true);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (isLessonComplete) {
      return (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h2>🎉 Lesson Complete!</h2>
          <p>XP Earned: {xpEarned}</p>
          <p>❤️ Hearts left: {hearts}</p>
        </div>
      );
    }

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

      <p style={{ fontSize: 12, color: "gray" }}>
      Unit {unit} | Module {module} | Lesson {lesson}
      </p>
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
            onClick={() => {
              setSelected(index);
              speak(option, "option");
            }}
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