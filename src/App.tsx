import { useState, useEffect } from 'react';
import rawData from './data/data.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Flame, BookOpen, Clock, Lightbulb, Languages, Sun, Moon } from 'lucide-react';

interface DevotionalData {
  date: string;
  verse: {
    reference: string;
    text: string;
  };
  commentary: string;
  history: string;
  takeaways: string[];
  isRawMode: boolean;
  theme?: {
    name: string;
    theme: string;
    border: string;
    text: string;
  };
  wordStudy?: {
    originalWord: string;
    transliteration: string;
    language: string;
    definition: string;
  };
}

const data = rawData as unknown as DevotionalData;

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [isReflected, setIsReflected] = useState(() => {
    return localStorage.getItem('lastReflectedDate') === new Date().toDateString();
  });

  const [streak, setStreak] = useState(() => {
    const today = new Date().toDateString();
    const lastReflectedDate = localStorage.getItem('lastReflectedDate');
    const currentStreak = parseInt(localStorage.getItem('streak') || '0', 10);

    if (lastReflectedDate === today) {
      return currentStreak;
    } else if (lastReflectedDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastReflectedDate === yesterday.toDateString()) {
        return currentStreak;
      } else {
        localStorage.setItem('streak', '0');
        return 0;
      }
    }
    return 0;
  });

  const handleReflect = () => {
    if (isReflected) return;

    const today = new Date().toDateString();
    let currentStreak = parseInt(localStorage.getItem('streak') || '0', 10);
    
    currentStreak += 1;
    setStreak(currentStreak);
    setIsReflected(true);
    
    localStorage.setItem('streak', currentStreak.toString());
    localStorage.setItem('lastReflectedDate', today);
  };

  // Safe checks for the new JSON schema (with fallback supports)
  const theme = data.theme || {
    name: "Default Grace",
    theme: "from-primary/10 via-blue-500/5 to-transparent dark:from-primary/20 dark:via-blue-500/10 dark:to-transparent",
    border: "border-primary/15 dark:border-primary/20",
    text: "text-primary font-semibold"
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex justify-center items-start pt-12 sm:pt-24 font-sans">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 pb-2 animate-gradient">
              Godly Encouragement
            </h1>
            <p className="text-muted-foreground font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-border bg-card/50 hover:bg-accent text-foreground transition-all duration-300"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            
            <div className="flex items-center space-x-1 text-orange-500 font-semibold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              <Flame size={18} />
              <span>{streak} Day Streak</span>
            </div>
          </div>
        </div>

        {/* Verse Card (applying dynamic theme gradients) */}
        <Card className={`border-primary/20 shadow-xl shadow-primary/5 glass-card relative overflow-hidden bg-gradient-to-br ${theme.theme}`}>
          <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.border}`} />
          <CardHeader>
            <CardTitle className={`text-xl flex items-center space-x-2 ${theme.text}`}>
              <BookOpen size={20} />
              <span>{data.verse.reference} (ESV)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-2xl font-serif italic text-foreground leading-relaxed">
              "{data.verse.text}"
            </blockquote>
          </CardContent>
        </Card>

        {/* Actionable Takeaways */}
        {data.takeaways && data.takeaways.length > 0 && (
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2 text-blue-500">
                <Lightbulb size={20} />
                <span>AI Takeaways</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start space-x-3 text-muted-foreground">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Original language Word Study Card */}
        {data.wordStudy && data.wordStudy.originalWord && (
          <Card className="border-border bg-card/50 backdrop-blur-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${theme.theme}`} />
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Languages size={18} className="text-blue-500" />
                  <span>Original Word Study ({data.wordStudy.language})</span>
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded-full border border-border bg-card/80 text-muted-foreground">
                  Lexicon
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-serif text-foreground font-semibold">
                  {data.wordStudy.originalWord}
                </span>
                <span className="text-sm italic text-muted-foreground">
                  ({data.wordStudy.transliteration})
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {data.wordStudy.definition}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Commentary & History */}
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-muted-foreground flex items-center space-x-2">
                <span>Commentary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {data.commentary}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-muted-foreground flex items-center space-x-2">
                <Clock size={16} />
                <span>Historical Context</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {data.history}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reflection Action */}
        <div className="pt-8 pb-12 flex justify-center">
          <Button 
            size="lg" 
            className={`rounded-full px-8 py-6 text-lg transition-all duration-300 shadow-xl ${isReflected ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 hover:-translate-y-1'}`}
            onClick={handleReflect}
            disabled={isReflected}
          >
            {isReflected ? (
              <>
                <CheckCircle className="mr-2 h-6 w-6" />
                Reflected Today
              </>
            ) : (
              <>
                <Circle className="mr-2 h-6 w-6" />
                Mark as Reflected
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pb-8">
          <Separator className="mb-4 opacity-50" />
          <p>Godly Encouragement Dashboard • Auto-generated daily</p>
          {data.isRawMode && (
            <p className="text-orange-500 mt-2 font-medium flex items-center justify-center space-x-1">
              <span>⚠️ Served in Offline/Raw Mode</span>
            </p>
          )}
        </footer>

      </div>
    </div>
  );
}

export default App;
