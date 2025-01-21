import React, { useState } from "react";
import WeeklyCalendar, { CalendarEvent } from "../components/WeeklyCalendar";

const events: CalendarEvent[] = [
  {
    id: 1,
    title: "Team Meeting",
    startTime: "09:00",
    endTime: "10:30",
    day: "Monday",
    color: "bg-blue-100",
  },
  {
    id: 2,
    title: "Lunch with Client",
    startTime: "12:00",
    endTime: "13:30",
    day: "Tuesday",
    color: "bg-purple-100",
  },
  {
    id: 3,
    title: "Project Review",
    startTime: "14:00",
    endTime: "15:00",
    day: "Wednesday",
    color: "bg-green-100",
  },
  {
    id: 4,
    title: "Training Session",
    startTime: "11:00",
    endTime: "12:30",
    day: "Thursday",
    color: "bg-orange-100",
  },
  {
    id: 5,
    title: "Weekly Sync",
    startTime: "15:30",
    endTime: "16:30",
    day: "Friday",
    color: "bg-sky-100",
  },
  {
    id: 6,
    title: "Code Review",
    startTime: "10:30",
    endTime: "11:30",
    day: "Monday",
    color: "bg-yellow-100",
  },
  {
    id: 7,
    title: "Design Workshop",
    startTime: "13:00",
    endTime: "14:30",
    day: "Monday",
    color: "bg-pink-100",
  },
  {
    id: 8,
    title: "Client Call",
    startTime: "15:00",
    endTime: "16:00",
    day: "Monday",
    color: "bg-indigo-100",
  },
  {
    id: 9,
    title: "Sprint Planning",
    startTime: "09:30",
    endTime: "11:00",
    day: "Tuesday",
    color: "bg-emerald-100",
  },
  {
    id: 10,
    title: "Team Building",
    startTime: "14:00",
    endTime: "17:00",
    day: "Tuesday",
    color: "bg-cyan-100",
  },
  {
    id: 11,
    title: "Bug Triage",
    startTime: "09:00",
    endTime: "10:00",
    day: "Wednesday",
    color: "bg-violet-100",
  },
  {
    id: 12,
    title: "Stakeholder Update",
    startTime: "11:30",
    endTime: "12:30",
    day: "Wednesday",
    color: "bg-rose-100",
  },
  {
    id: 13,
    title: "Product Demo",
    startTime: "16:00",
    endTime: "17:00",
    day: "Wednesday",
    color: "bg-amber-100",
  },
  {
    id: 14,
    title: "1:1 with Manager",
    startTime: "09:30",
    endTime: "10:00",
    day: "Thursday",
    color: "bg-lime-100",
  },
  {
    id: 15,
    title: "Tech Talk",
    startTime: "13:00",
    endTime: "14:00",
    day: "Thursday",
    color: "bg-teal-100",
  },
  {
    id: 16,
    title: "Architecture Review",
    startTime: "15:00",
    endTime: "16:30",
    day: "Thursday",
    color: "bg-fuchsia-100",
  },
  {
    id: 17,
    title: "Stand-up",
    startTime: "09:00",
    endTime: "09:30",
    day: "Friday",
    color: "bg-blue-100",
  },
  {
    id: 18,
    title: "Documentation",
    startTime: "10:00",
    endTime: "12:00",
    day: "Friday",
    color: "bg-purple-100",
  },
  {
    id: 19,
    title: "Retrospective",
    startTime: "13:00",
    endTime: "14:30",
    day: "Friday",
    color: "bg-green-100",
  },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const questions = [
  {
    id: 1,
    question: "How many total events are scheduled for Monday?",
    answer: "4",
  },
  {
    id: 2,
    question: "Which day has the longest single event (in hours)?",
    answer: "Tuesday",
  },
  {
    id: 3,
    question: "How many events start at 9:00 AM across all days?",
    answer: "3",
  },
  {
    id: 4,
    question: "What is the duration of the Team Building event (in hours)?",
    answer: "3",
  },
  {
    id: 5,
    question: "How many 30-minute events are there in total?",
    answer: "2",
  },
];

const CalendarComprehension: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState("");

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const checkAnswers = () => {
    const allCorrect = questions.every(
      (q) => answers[q.id]?.trim().toLowerCase() === q.answer.toLowerCase()
    );
    if (allCorrect) {
      setMessage(
        "Congratulations! All answers are correct! The password is: calendar_master"
      );
    } else {
      setMessage("Some answers are incorrect. Please try again.");
    }
    setShowResults(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Calendar Comprehension Challenge
      </h1>

      <WeeklyCalendar events={events} days={days} startHour={9} endHour={18} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Answer these questions about the calendar:
        </h2>

        {questions.map((q) => (
          <div key={q.id} className="mb-6">
            <p className="text-lg mb-2">{q.question}</p>
            <input
              type="text"
              className={`w-full p-2 border rounded-lg ${
                showResults &&
                answers[q.id]?.trim().toLowerCase() !== q.answer.toLowerCase()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={answers[q.id] || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleAnswerChange(q.id, e.target.value)
              }
            />
            {showResults &&
              answers[q.id]?.trim().toLowerCase() !==
                q.answer.toLowerCase() && (
                <p className="text-red-500 text-sm mt-1">Incorrect answer</p>
              )}
          </div>
        ))}

        <button
          onClick={checkAnswers}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Check Answers
        </button>

        {message && (
          <p
            className={`mt-4 ${
              message.includes("Congratulations")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default CalendarComprehension;
