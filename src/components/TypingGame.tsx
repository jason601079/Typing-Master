import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Zap, Target, Clock } from "lucide-react";

interface GameStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
}

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Technology is best when it brings people together.",
  "Innovation distinguishes between a leader and a follower.",
  "The only way to do great work is to love what you do.",
  "Stay hungry, stay foolish, and never stop learning.",
  "Code is poetry written in logic and creativity.",
  "Every expert was once a beginner who never gave up.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Success is not final, failure is not fatal, it is the courage to continue that counts.",
  "Programming is the art of telling another human what one wants the computer to do."
];

const TypingGame = () => {
  const [sentence, setSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stats, setStats] = useState<GameStats>({ wpm: 0, accuracy: 100, errors: 0, timeElapsed: 0 });
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("typeRacerHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const getRandomSentence = () => {
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  const initializeGame = useCallback(() => {
    const newSentence = getRandomSentence();
    setSentence(newSentence);
    setUserInput("");
    setCurrentIndex(0);
    setGameStarted(false);
    setGameFinished(false);
    setStartTime(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0, timeElapsed: 0 });
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const calculateStats = useCallback((input: string, elapsed: number) => {
    const wordsTyped = input.trim().split(' ').length;
    const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
    
    let errors = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== sentence[i]) errors++;
    }
    
    const accuracy = input.length > 0 ? Math.round(((input.length - errors) / input.length) * 100) : 100;
    
    return { wpm, accuracy, errors, timeElapsed: elapsed };
  }, [sentence]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Prevent backspaces - only allow forward typing
    if (value.length < userInput.length) {
      return;
    }
    
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    if (value.length <= sentence.length) {
      setUserInput(value);
      setCurrentIndex(value.length);

      const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
      const newStats = calculateStats(value, elapsed);
      setStats(newStats);

      if (value === sentence) {
        setGameFinished(true);
        if (newStats.wpm > highScore) {
          setHighScore(newStats.wpm);
          localStorage.setItem("typeRacerHighScore", newStats.wpm.toString());
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent backspace, delete, and arrow keys
    if (e.key === 'Backspace' || e.key === 'Delete' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
        e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
  };

  const renderText = () => {
    return sentence.split('').map((char, index) => {
      let className = "char-pending";
      
      if (index < userInput.length) {
        className = userInput[index] === char ? "char-correct" : "char-error";
      } else if (index === currentIndex) {
        className = "char-current";
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Type Racer
          </h1>
          <p className="text-muted-foreground">Type the text below as fast and accurately as possible</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">WPM</p>
                <p className="text-2xl font-bold text-primary">{stats.wpm}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-accent">{stats.accuracy}%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-2xl font-bold">{stats.timeElapsed.toFixed(1)}s</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
            <div>
              <p className="text-sm text-muted-foreground">High Score</p>
              <p className="text-2xl font-bold text-yellow-400">{highScore} WPM</p>
            </div>
          </Card>
        </div>

        {/* Typing Area */}
        <Card className="p-8 bg-card/30 backdrop-blur border-primary/20">
          <div className="space-y-6">
            <div className="typing-text p-6 bg-background/20 rounded-lg border border-primary/10">
              {renderText()}
            </div>
            
            <textarea
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={gameFinished}
              placeholder={gameStarted ? "" : "Start typing to begin..."}
              className="w-full h-32 p-4 bg-background/50 border border-primary/20 rounded-lg 
                       font-mono text-lg resize-none focus:outline-none focus:ring-2 
                       focus:ring-primary/50 focus:border-primary/50 transition-all"
              autoFocus
            />
          </div>
        </Card>

        {/* Game Finished */}
        {gameFinished && (
          <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary">Game Complete!</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Final WPM</p>
                <p className="text-xl font-bold text-primary">{stats.wpm}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-xl font-bold text-accent">{stats.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-xl font-bold text-destructive">{stats.errors}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-xl font-bold">{stats.timeElapsed.toFixed(1)}s</p>
              </div>
            </div>
            {stats.wpm === highScore && (
              <p className="text-yellow-400 font-semibold">🎉 New High Score!</p>
            )}
          </Card>
        )}

        {/* Restart Button */}
        <div className="text-center">
          <Button 
            onClick={initializeGame}
            variant="outline"
            size="lg"
            className="glow-primary hover:glow-primary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Text
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TypingGame;