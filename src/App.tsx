import { useState, useEffect } from 'react';
import { Quiz } from './types';
import { storage } from './utils/storage';
import { QuizLibrary } from './components/Library/QuizLibrary';
import { QuizEditor } from './components/Builder/QuizEditor';
import { HostView } from './components/Host/HostView';
import { PlayerView } from './components/Player/PlayerView';

type AppView = 'library' | 'editor' | 'host' | 'player';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [activeHostQuiz, setActiveHostQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => storage.getQuizzes());
  const [playerPin, setPlayerPin] = useState<string>('');

  const refreshQuizList = () => {
    setQuizzes(storage.getQuizzes());
  };

  const handleCreateNewQuiz = () => {
    const newQuiz = storage.createNewQuizTemplate();
    storage.saveQuiz(newQuiz);
    setSelectedQuizId(newQuiz.id);
    setCurrentView('editor');
    refreshQuizList();
  };

  const handleEditQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView('editor');
  };

  const handleHostQuiz = (quiz: Quiz) => {
    setActiveHostQuiz(quiz);
    setCurrentView('host');
  };

  const handleJoinAsPlayer = (pin?: string) => {
    setPlayerPin(pin || '');
    setCurrentView('player');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-slate-800 selection:text-white">
      {currentView === 'library' && (
        <QuizLibrary
          quizzes={quizzes}
          onSelectQuizToHost={handleHostQuiz}
          onEditQuiz={handleEditQuiz}
          onCreateNewQuiz={handleCreateNewQuiz}
          onJoinAsPlayer={handleJoinAsPlayer}
          onRefreshList={refreshQuizList}
        />
      )}

      {currentView === 'editor' && selectedQuizId && (
        <QuizEditor
          quizId={selectedQuizId}
          onBack={() => {
            setCurrentView('library');
            refreshQuizList();
          }}
          onLaunchQuiz={(quiz) => {
            setActiveHostQuiz(quiz);
            setCurrentView('host');
          }}
        />
      )}

      {currentView === 'host' && activeHostQuiz && (
        <HostView
          quiz={activeHostQuiz}
          onExit={() => {
            setCurrentView('library');
            refreshQuizList();
          }}
        />
      )}

      {currentView === 'player' && (
        <PlayerView
          initialPin={playerPin}
          onExit={() => {
            setCurrentView('library');
            refreshQuizList();
          }}
        />
      )}
    </div>
  );
}
