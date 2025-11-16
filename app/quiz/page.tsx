'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: 'What is the time complexity of Bubble Sort in the worst case?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correctAnswer: 2,
    explanation: 'Bubble Sort has O(n²) time complexity in the worst case because it uses nested loops.',
  },
  {
    id: 2,
    question: 'Which algorithm is most efficient for finding the shortest path in a weighted graph?',
    options: ['BFS', 'DFS', 'Dijkstra', 'Bubble Sort'],
    correctAnswer: 2,
    explanation: "Dijkstra's algorithm is specifically designed for finding shortest paths in weighted graphs.",
  },
  {
    id: 3,
    question: 'What type of problem does the 0/1 Knapsack algorithm solve?',
    options: ['Sorting', 'Searching', 'Dynamic Programming', 'Graph Traversal'],
    correctAnswer: 2,
    explanation: 'The 0/1 Knapsack is a classic dynamic programming problem for optimization.',
  },
  {
    id: 4,
    question: 'Which sorting algorithm uses the divide-and-conquer approach?',
    options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
    correctAnswer: 2,
    explanation: 'Merge Sort divides the array into halves, sorts them recursively, and then merges them.',
  },
  {
    id: 5,
    question: 'What is the space complexity of Quick Sort?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 2,
    explanation: 'Quick Sort has O(log n) space complexity due to the recursive call stack.',
  },
];

export default function QuizPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setShowExplanation(false);
  };

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setShowExplanation(false);
  };

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="neon-text-green">Algorithm</span>{' '}
            <span className="neon-text-pink">Quiz</span>
          </h1>
          <p className="text-gray-400 text-lg">Test your knowledge of algorithms and data structures</p>
        </div>

        <div className="glass-card rounded-lg p-8 border border-[#39FF14]/20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold neon-text-blue mb-6">Select Difficulty</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-6 py-4 rounded-lg font-medium capitalize transition-all ${
                  selectedDifficulty === difficulty
                    ? 'bg-[#39FF14] text-black neon-glow-green'
                    : 'bg-[#13131a] text-gray-400 border border-gray-800 hover:border-[#39FF14]/50'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Questions:</span>
              <span className="neon-text-green font-medium">{quizQuestions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Time:</span>
              <span className="neon-text-blue font-medium">Unlimited</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Difficulty:</span>
              <span className="neon-text-pink font-medium capitalize">{selectedDifficulty}</span>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-[#39FF14] to-[#00F0FF] text-black rounded-lg font-bold text-lg hover:neon-glow-green transition-all"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quizQuestions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card rounded-lg p-8 border border-[#39FF14]/20 max-w-2xl mx-auto text-center">
          <Trophy className="w-20 h-20 mx-auto mb-6 neon-text-green" />

          <h2 className="text-4xl font-bold neon-text-green mb-4">Quiz Completed!</h2>

          <div className="mb-8">
            <div className="text-6xl font-bold neon-text-blue mb-2">{percentage}%</div>
            <p className="text-gray-400">
              You got {score} out of {quizQuestions.length} questions correct
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {quizQuestions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer;
              return (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#13131a] border border-gray-800"
                >
                  <span className="text-sm text-gray-400">Question {index + 1}</span>
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-[#39FF14]" />
                  ) : (
                    <XCircle className="w-6 h-6 text-[#FF10F0]" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={restartQuiz}
            className="w-full py-4 bg-gradient-to-r from-[#39FF14] to-[#00F0FF] text-black rounded-lg font-bold hover:neon-glow-green transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const hasAnswered = selectedAnswers[currentQuestion] !== undefined;
  const isCorrect = selectedAnswers[currentQuestion] === question.correctAnswer;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
          <span className="text-sm neon-text-green font-medium">
            {Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#39FF14] to-[#00F0FF] transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-card rounded-lg p-8 border border-[#39FF14]/20">
        <h2 className="text-2xl font-bold neon-text-blue mb-8">{question.question}</h2>

        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === index;
            const isCorrectOption = index === question.correctAnswer;

            let buttonClass = 'w-full p-4 rounded-lg text-left transition-all border-2 ';
            if (hasAnswered) {
              if (isCorrectOption) {
                buttonClass += 'border-[#39FF14] bg-[#39FF14]/10 neon-glow-green';
              } else if (isSelected) {
                buttonClass += 'border-[#FF10F0] bg-[#FF10F0]/10 neon-glow-pink';
              } else {
                buttonClass += 'border-gray-800 bg-[#13131a] opacity-50';
              }
            } else {
              buttonClass += 'border-gray-800 bg-[#13131a] hover:border-[#39FF14]/50 hover:bg-[#39FF14]/5';
            }

            return (
              <button
                key={index}
                onClick={() => !hasAnswered && handleSelectAnswer(index)}
                disabled={hasAnswered}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-100">{option}</span>
                  {hasAnswered && isCorrectOption && (
                    <CheckCircle2 className="w-6 h-6 text-[#39FF14]" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-[#FF10F0]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mb-6 p-4 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30">
            <h3 className="text-sm font-semibold neon-text-blue mb-2">Explanation</h3>
            <p className="text-sm text-gray-300">{question.explanation}</p>
          </div>
        )}

        {hasAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-gradient-to-r from-[#39FF14] to-[#00F0FF] text-black rounded-lg font-bold hover:neon-glow-green transition-all"
          >
            {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'View Results'}
          </button>
        )}
      </div>
    </div>
  );
}
