import { useState } from 'react';
import { Copy, Download, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Notes {
  keyPoints: string[];
  mainThemes: string[];
  importantDetails: string[];
  actionItems: string[];
}

interface NotesDisplayProps {
  summary: string;
  notes: Notes;
  fileName: string;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

function NotesSection({ 
  title, 
  items, 
  defaultOpen = true 
}: { 
  title: string; 
  items: string[]; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent/50 transition-colors">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{items.length} items</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2 pl-4 pr-2 pb-3"
        >
          {items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-2 text-sm text-muted-foreground"
            >
              <span className="text-primary mt-1">•</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function NotesDisplay({ summary, notes, fileName }: NotesDisplayProps) {
  const formatNotesForExport = (): string => {
    let content = `# Notes from ${fileName}\n\n`;
    content += `## Summary\n\n${summary}\n\n`;
    
    if (notes.keyPoints.length > 0) {
      content += `## Key Points\n\n`;
      notes.keyPoints.forEach(point => {
        content += `- ${point}\n`;
      });
      content += '\n';
    }
    
    if (notes.mainThemes.length > 0) {
      content += `## Main Themes\n\n`;
      notes.mainThemes.forEach(theme => {
        content += `- ${theme}\n`;
      });
      content += '\n';
    }
    
    if (notes.importantDetails.length > 0) {
      content += `## Important Details\n\n`;
      notes.importantDetails.forEach(detail => {
        content += `- ${detail}\n`;
      });
      content += '\n';
    }
    
    if (notes.actionItems.length > 0) {
      content += `## Action Items\n\n`;
      notes.actionItems.forEach(item => {
        content += `- [ ] ${item}\n`;
      });
    }
    
    return content;
  };

  const handleDownload = () => {
    const content = formatNotesForExport();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${fileName.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const allNotesText = formatNotesForExport();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Summary</CardTitle>
            <CopyButton text={summary} label="Copy" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </CardContent>
      </Card>

      {/* Detailed Notes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Detailed Notes</CardTitle>
            <div className="flex gap-2">
              <CopyButton text={allNotesText} label="Copy All" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <NotesSection title="Key Points" items={notes.keyPoints} />
          <NotesSection title="Main Themes" items={notes.mainThemes} />
          <NotesSection title="Important Details" items={notes.importantDetails} defaultOpen={false} />
          <NotesSection title="Action Items" items={notes.actionItems} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
