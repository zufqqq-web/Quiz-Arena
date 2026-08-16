import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz } from './types';
import { storage } from './utils/storage';
import { HomePage } from './components/Home/HomePage';
import { QuizLibrary } from './components/Library/QuizLibrary';
import { QuizEditor } from './components/Builder/QuizEditor';
import { HostView } from './components/Host/HostView';
import { PlayerView } from './components/Player/PlayerView';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { screenVariants } from './utils/motionVariants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';


// 1. Home Page Route Component
function HomeRoute() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => storage.getQuizzes());

  useEffect(() => {
    storage.syncWithServer().then((list) => {
      if (list && list.length > 0) {
        setQuizzes(list);
      }
    });
  }, []);

  const refreshList = () => {
    setQuizzes(storage.getQuizzes());
  };

  const handleCreateNewQuiz = () => {
    const newQuiz = storage.createNewQuizTemplate();
    storage.saveQuiz(newQuiz);
    navigate(`/editor/${newQuiz.id}`);
  };

  const handleOpenLibrary = () => {
    navigate('/library');
  };

  const handleHostQuiz = (quiz: Quiz) => {
    navigate(`/host/${quiz.id}`);
  };

  const handleEditQuiz = (quizId: string) => {
    navigate(`/editor/${quizId}`);
  };

  const handleJoinAsPlayer = (pin?: string) => {
    if (pin && pin.trim()) {
      navigate(`/player/${pin.trim()}`);
    } else {
      navigate('/player');
    }
  };

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <HomePage
        quizzes={quizzes}
        onCreateNewQuiz={handleCreateNewQuiz}
        onOpenLibrary={handleOpenLibrary}
        onHostQuiz={handleHostQuiz}
        onEditQuiz={handleEditQuiz}
        onJoinAsPlayer={handleJoinAsPlayer}
        onRefreshList={refreshList}
      />
    </motion.div>
  );
}

// 2. Library Route Component
function LibraryRoute() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => storage.getQuizzes());

  useEffect(() => {
    storage.syncWithServer().then((list) => {
      if (list && list.length > 0) {
        setQuizzes(list);
      }
    });
  }, []);

  const refreshList = () => {
    setQuizzes(storage.getQuizzes());
  };

  const handleCreateNewQuiz = () => {
    const newQuiz = storage.createNewQuizTemplate();
    storage.saveQuiz(newQuiz);
    navigate(`/editor/${newQuiz.id}`);
  };

  const handleHostQuiz = (quiz: Quiz) => {
    navigate(`/host/${quiz.id}`);
  };

  const handleEditQuiz = (quizId: string) => {
    navigate(`/editor/${quizId}`);
  };

  const handleJoinAsPlayer = (pin?: string) => {
    if (pin && pin.trim()) {
      navigate(`/player/${pin.trim()}`);
    } else {
      navigate('/player');
    }
  };

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <QuizLibrary
        quizzes={quizzes}
        onSelectQuizToHost={handleHostQuiz}
        onEditQuiz={handleEditQuiz}
        onCreateNewQuiz={handleCreateNewQuiz}
        onJoinAsPlayer={handleJoinAsPlayer}
        onRefreshList={refreshList}
        onBackToHome={() => navigate('/')}
      />
    </motion.div>
  );
}

// 3. Editor Route Component
function EditorRoute() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  if (!quizId) {
    return <Navigate to="/library" replace />;
  }

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <QuizEditor
        quizId={quizId}
        onBack={() => navigate('/library')}
        onLaunchQuiz={(quiz) => {
          navigate(`/host/${quiz.id}`);
        }}
      />
    </motion.div>
  );
}

// 4. Host Route Component
function HostRoute() {
  const { quizOrRoomId } = useParams<{ quizOrRoomId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!quizOrRoomId) {
      navigate('/library');
      return;
    }

    // 1. Check if active room exists with this PIN or quiz ID
    const activeRoom = storage.getActiveRoom();
    if (activeRoom && (activeRoom.roomCode === quizOrRoomId || activeRoom.quiz.id === quizOrRoomId)) {
      setQuiz(activeRoom.quiz);
      return;
    }

    // 2. Check in saved quizzes
    const all = storage.getQuizzes();
    const found = all.find((q) => q.id === quizOrRoomId);
    if (found) {
      setQuiz(found);
      return;
    }

    // 3. If numeric PIN provided directly or not found, fallback to first quiz or template
    if (all.length > 0) {
      setQuiz(all[0]);
    } else {
      const demo = storage.createNewQuizTemplate();
      storage.saveQuiz(demo);
      setQuiz(demo);
    }
  }, [quizOrRoomId, navigate]);

  const { t } = useLanguage();

  if (!quiz) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">
        {t('common.loading')}
      </div>
    );
  }

  const initialCode = /^\d{4,8}$/.test(quizOrRoomId || '') ? quizOrRoomId : undefined;

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <HostView
        quiz={quiz}
        initialRoomCode={initialCode}
        onExit={() => navigate('/')}
      />
    </motion.div>
  );
}

// 5. Player Route Component
function PlayerRoute() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <PlayerView
        initialPin={pin || ''}
        onExit={() => navigate('/')}
      />
    </motion.div>
  );
}

function AnimatedAppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/library" element={<LibraryRoute />} />
        <Route path="/editor/:quizId" element={<EditorRoute />} />
        <Route path="/host/:quizOrRoomId" element={<HostRoute />} />
        <Route path="/player" element={<PlayerRoute />} />
        <Route path="/player/:pin" element={<PlayerRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-slate-800 selection:text-white">
              <AnimatedAppRoutes />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}


