import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { NotesDisplay } from '@/components/NotesDisplay';
import { useMode } from '@/contexts/ModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type DetailLevel = 'brief' | 'standard' | 'comprehensive';

interface Notes {
  keyPoints: string[];
  mainThemes: string[];
  importantDetails: string[];
  actionItems: string[];
}

interface SummarizeResult {
  summary: string;
  notes: Notes;
}

export default function NotesGenerator() {
  const navigate = useNavigate();
  const { experienceProfile, preferences } = useMode();
  
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('standard');

  const handleFileContent = (content: string, name: string) => {
    setFileContent(content);
    setFileName(name);
    setResult(null);
    setError(null);
  };

  const processContent = async (level: DetailLevel = detailLevel) => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    setError(null);
    setDetailLevel(level);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            content: fileContent,
            detailLevel: level,
            modes: preferences.selectedModes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process content');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process content');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setFileContent(null);
    setFileName('');
    setResult(null);
    setError(null);
  };

  const detailLevels: { value: DetailLevel; label: string; description: string }[] = [
    { value: 'brief', label: 'Brief', description: 'Quick overview' },
    { value: 'standard', label: 'Standard', description: 'Balanced detail' },
    { value: 'comprehensive', label: 'Comprehensive', description: 'Deep analysis' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className={cn(experienceProfile.largeButtons && 'h-12 w-12')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Notes Generator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* File Upload */}
          <Card>
            <CardContent className="pt-6">
              <FileUpload
                onFileContent={handleFileContent}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>

          {/* Process Button & Detail Level */}
          <AnimatePresence>
            {fileContent && !result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Detail Level Selection */}
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose detail level:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {detailLevels.map((level) => (
                        <Button
                          key={level.value}
                          variant={detailLevel === level.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDetailLevel(level.value)}
                          className="flex-1 min-w-[100px]"
                        >
                          <div className="text-center">
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs opacity-70">{level.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Process Button */}
                <Button
                  onClick={() => processContent()}
                  disabled={isProcessing}
                  className={cn(
                    'w-full gap-2',
                    experienceProfile.largeButtons && 'h-14 text-lg'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Summary & Notes
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => processContent()}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-muted-foreground">
                  Analyzing your content...
                </p>
                <p className="text-sm text-muted-foreground/60">
                  This may take a few seconds
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Regenerate Options */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-sm text-muted-foreground">
                        Regenerate with different detail:
                      </p>
                      <div className="flex gap-2">
                        {detailLevels.map((level) => (
                          <Button
                            key={level.value}
                            variant={detailLevel === level.value ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => processContent(level.value)}
                            disabled={isProcessing}
                          >
                            {level.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <NotesDisplay
                  summary={result.summary}
                  notes={result.notes}
                  fileName={fileName}
                />

                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="w-full"
                >
                  Upload Another File
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
