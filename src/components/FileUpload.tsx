import { useState, useCallback } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  isProcessing: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['.txt', '.md', '.pdf'];

export function FileUpload({ onFileContent, isProcessing, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(extension)) {
      return 'Only .txt, .md, and .pdf files are accepted';
    }
    
    return null;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (extension === '.pdf') {
      // For PDF, we'll read as text - basic extraction
      // In production, you'd use a proper PDF parser
      const text = await file.text();
      // Try to extract readable text, fallback to raw
      return text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim() || 
        'PDF content could not be extracted. Please try a .txt or .md file.';
    }
    
    return await file.text();
  };

  const handleFile = useCallback(async (selectedFile: File) => {
    setError(null);
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setFile(selectedFile);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 100);
    
    try {
      const content = await extractTextFromFile(selectedFile);
      clearInterval(interval);
      setUploadProgress(100);
      onFileContent(content, selectedFile.name);
    } catch (err) {
      clearInterval(interval);
      setError('Failed to read file content');
      setFile(null);
    }
  }, [onFileContent]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200',
                isDragging
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50',
                error && 'border-destructive bg-destructive/5'
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                <Upload className={cn(
                  'w-10 h-10 mb-3 transition-colors',
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                )} />
                <p className="mb-2 text-sm text-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  .txt, .md, or .pdf (max 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.pdf"
                onChange={handleInputChange}
                disabled={isProcessing}
              />
            </label>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-accent/50 rounded-xl border border-border"
          >
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {uploadProgress < 100 && (
                <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
