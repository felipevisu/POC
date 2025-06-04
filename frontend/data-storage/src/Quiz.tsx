import React, {useState, useEffect} from "react";

type Question = {
  id: number;
  text: string;
  options: string[];
  answer: string; // optional for this mock
};

const QUESTIONS: Question[] = [
  {id: 1, text: "Capital of France?", options: ["Paris", "Berlin", "Rome"], answer: "Paris"},
  {id: 2, text: "2 + 2?", options: ["3", "4", "5"], answer: "4"},
  {id: 3, text: "Color of the sky?", options: ["Green", "Blue", "Red"], answer: "Blue"},
  {id: 4, text: "HTML stands for?", options: ["Markup", "Style", "Language"], answer: "Markup"},
  {id: 5, text: "React is a...?", options: ["Library", "Language", "Tool"], answer: "Library"},
];

const STORAGE_KEY = "quiz-progress";

export default function Quiz() {
  const [current, setCurrent] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).current : 0;
  });

  const [answers, setAnswers] = useState<string[]>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).answers : [];
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const {current, answers} = JSON.parse(saved);
      setCurrent(current);
      setAnswers(answers);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({current, answers}));
  }, [current, answers]);

  const handleAnswer = (option: string) => {
    const newAnswers = [...answers, option];
    if (current + 1 < QUESTIONS.length) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
    } else {
      setAnswers(newAnswers);
      alert("Quiz completed! Answers: " + JSON.stringify(newAnswers));
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const q = QUESTIONS[current];

  return (
    <div>
      <h2>Question {current + 1} of {QUESTIONS.length}</h2>
      <p>{q.text}</p>
      {q.options.map((opt) => (
        <button key={opt} onClick={() => handleAnswer(opt)} style={{display: "block", margin: "8px 0"}}>
          {opt}
        </button>
      ))}
    </div>
  );
}
