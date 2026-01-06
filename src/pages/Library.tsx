import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMode } from '@/contexts/ModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  ChevronRight, 
  Search,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BOARDS, GRADES, DEFAULT_SUBJECTS } from '@/lib/demo-data';

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  summary: string;
  key_points: string[];
  subjects: { name: string; icon: string } | null;
}

export default function Library() {
  const { experienceProfile, isGuestMode } = useMode();
  const { user } = useAuth();
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('CBSE');
  const [selectedGrade, setSelectedGrade] = useState('8');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    loadChapters();
  }, [selectedBoard, selectedGrade, selectedSubject]);

  const loadChapters = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('chapters')
        .select('*, subjects(name, icon)')
        .eq('board', selectedBoard as 'CBSE' | 'IGCSE')
        .eq('grade', parseInt(selectedGrade))
        .order('chapter_number');

      const { data } = await query;
      
      let filteredData = data || [];
      
      if (selectedSubject !== 'all') {
        filteredData = filteredData.filter(c => 
          (c.subjects as any)?.name === selectedSubject
        );
      }
      
      setChapters(filteredData as Chapter[]);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
    
    setLoading(false);
  };

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chapter.subjects as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubjectIcon = (subject: string | null | undefined) => {
    if (!subject) return '📖';
    const icons: Record<string, string> = {
      'Mathematics': '📐',
      'English': '📚',
      'Science': '🔬',
      'Computer Science': '💻',
      'Social Studies': '🌍',
    };
    return icons[subject] || '📖';
  };

  // Group chapters by subject
  const chaptersBySubject = filteredChapters.reduce((acc, chapter) => {
    const subject = (chapter.subjects as any)?.name || 'Other';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Content Library</h1>
              <p className="text-muted-foreground">Browse chapters and study materials</p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/notes">
                <FileText className="w-4 h-4" />
                Notes Generator
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {!experienceProfile.reducedChoices && (
            <div className="flex gap-2">
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARDS.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(g => (
                    <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {DEFAULT_SUBJECTS.map(s => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.icon} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </motion.div>

        {/* Chapters */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading chapters...</p>
          </div>
        ) : Object.keys(chaptersBySubject).length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No chapters found</p>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(chaptersBySubject).map(([subject, subjectChapters], sIndex) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + sIndex * 0.05 }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>{getSubjectIcon(subject)}</span>
                  {subject}
                </h2>
                
                <div className="grid gap-3">
                  {subjectChapters.map((chapter, cIndex) => (
                    <Link
                      key={chapter.id}
                      to={`/chapter/${chapter.id}`}
                    >
                      <Card className="card-interactive">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {chapter.chapter_number}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground">{chapter.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {chapter.summary?.substring(0, 80)}...
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
