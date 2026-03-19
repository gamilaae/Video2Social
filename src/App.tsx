import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Upload, Link as LinkIcon, Loader2, Sparkles, AlertCircle, FileVideo, Globe, Type,
  Video, FileText, Lightbulb, Twitter, Linkedin, Smartphone, Instagram, Zap, Hash, 
  PlusCircle, Key, BookOpen, ChevronDown, Copy, Check, Moon, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for base64 inline

const translations = {
  english: {
    appTitle: "Video2Social",
    appSubtitle: "AI Content Repurposer",
    uploadTab: "Upload",
    linkTab: "Link",
    videoFileLabel: "Video File",
    videoUrlLabel: "Video URL",
    clickToUpload: "Click to upload",
    fileSizeLimit: "MP4, MOV up to 20MB",
    urlPlaceholder: "https://youtube.com/...",
    outputLanguageLabel: "Output Language",
    englishBtn: "English",
    arabicBtn: "Arabic",
    generateBtn: "Generate Content",
    analyzing: "Analyzing...",
    analyzingTitle: "Analyzing video content...",
    analyzingDesc: "This might take a few moments",
    emptyStateText: "Your generated content will appear here",
    outputHeader: "Output",
    copyBtn: "Copy",
    copiedBtn: "Copied ✅",
    snapshotTitle: "Content Snapshot",
    topicLabel: "Topic",
    goalLabel: "Goal",
    errorFileSize: "File size exceeds 20MB limit. Please provide a smaller video or a URL.",
    errorNoFile: "Please upload a video file.",
    errorNoUrl: "Please enter a video URL.",
    errorGeneric: "An error occurred while generating content.",
    headings: {
      snapshot: "Snapshot",
      videoAnalysis: "Video Analysis",
      shortSummary: "Short Summary",
      keyInsights: "Key Insights",
      threadForX: "Thread for X",
      linkedinPost: "LinkedIn Post",
      tiktokScripts: "TikTok / Reels Scripts",
      instagramCaption: "Instagram Caption",
      viralHooks: "Viral Hooks",
      hashtags: "Hashtags",
      additionalIdeas: "Additional Content Ideas",
      keyTakeaways: "Key Takeaways",
      studyMode: "Study Mode"
    }
  }
};

const getIconForSection = (title: string) => {
  const t = title.toLowerCase();
  const h = translations.english.headings;
  if (t.includes('video') || t.includes(h.videoAnalysis.toLowerCase())) return Video;
  if (t.includes('summary') || t.includes(h.shortSummary.toLowerCase())) return FileText;
  if (t.includes('insight') || t.includes(h.keyInsights.toLowerCase())) return Lightbulb;
  if (t.includes('thread') || t.includes('x') || t.includes(h.threadForX.toLowerCase())) return Twitter;
  if (t.includes('linkedin') || t.includes(h.linkedinPost.toLowerCase())) return Linkedin;
  if (t.includes('tiktok') || t.includes('reel') || t.includes('script') || t.includes(h.tiktokScripts.toLowerCase())) return Smartphone;
  if (t.includes('instagram') || t.includes(h.instagramCaption.toLowerCase())) return Instagram;
  if (t.includes('hook') || t.includes(h.viralHooks.toLowerCase())) return Zap;
  if (t.includes('hashtag') || t.includes(h.hashtags.toLowerCase())) return Hash;
  if (t.includes('additional') || t.includes('idea') || t.includes(h.additionalIdeas.toLowerCase())) return PlusCircle;
  if (t.includes('takeaway') || t.includes(h.keyTakeaways.toLowerCase())) return Key;
  if (t.includes('study') || t.includes(h.studyMode.toLowerCase())) return BookOpen;
  return FileText;
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const t = translations.english;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      {copied ? t.copiedBtn : t.copyBtn}
    </button>
  );
};

const Accordion = ({ title, content, defaultOpen = false }: { title: string, content: string, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = getIconForSection(title);
  
  return (
    <div className="mb-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-lg text-start">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-700"
          >
            <div className="p-6">
              <div className="flex justify-end mb-4">
                <CopyButton text={content} />
              </div>
              <div className="markdown-body" dir="auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SnapshotCard = ({ content }: { content: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isManualExpanded, setIsManualExpanded] = useState(false);
  const [expandScrollY, setExpandScrollY] = useState(0);
  const t = translations.english;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 150);
      
      if (isManualExpanded && Math.abs(currentY - expandScrollY) > 50) {
        setIsManualExpanded(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isManualExpanded, expandScrollY]);

  const isMinimized = isScrolled && !isManualExpanded;

  const handleExpand = () => {
    setIsManualExpanded(true);
    setExpandScrollY(window.scrollY);
  };

  const lines = content.split('\n');
  const data: Record<string, string> = {};
  let hasData = false;
  lines.forEach(line => {
    const match = line.match(/^-\s*(.*?):\s*(.*)$/);
    if (match) {
      data[match[1].trim().toLowerCase()] = match[2].trim();
      hasData = true;
    }
  });

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-slate-900 dark:text-white shadow-md mb-8 sticky top-4 z-50">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          {t.snapshotTitle}
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // Map English keys to localized keys for display
  const displayData: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key.includes('topic') || key.includes('الموضوع')) displayData[t.topicLabel] = value;
    else if (key.includes('goal') || key.includes('الهدف')) displayData[t.goalLabel] = value;
    else displayData[key] = value;
  });

  return (
    <motion.div 
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md mb-8 sticky top-4 z-50 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleExpand}
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center gap-6 flex-1 overflow-hidden">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-slate-900 dark:text-white">{t.headings.snapshot}</span>
              </div>
              
              <div className="flex items-center gap-4 flex-1 min-w-0 text-sm">
                {displayData[t.topicLabel] && (
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">{t.topicLabel}:</span>
                    <span className="text-slate-900 dark:text-white font-semibold truncate" dir="auto">{displayData[t.topicLabel]}</span>
                  </div>
                )}
                {displayData[t.topicLabel] && displayData[t.goalLabel] && (
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                )}
                {displayData[t.goalLabel] && (
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">{t.goalLabel}:</span>
                    <span className="text-slate-900 dark:text-white font-semibold truncate" dir="auto">{displayData[t.goalLabel]}</span>
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                {t.snapshotTitle}
              </h2>
              {isScrolled && (
                <button 
                  onClick={() => setIsManualExpanded(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-slate-400 rotate-180" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(data).map(([key, value]) => {
                // Determine localized label
                let localizedKey = key;
                if (key.includes('topic') || key.includes('الموضوع')) localizedKey = t.topicLabel;
                else if (key.includes('goal') || key.includes('الهدف')) localizedKey = t.goalLabel;
                else if (key.includes('tone') || key.includes('النبرة')) localizedKey = 'Tone';
                else if (key.includes('platform') || key.includes('المنصات')) localizedKey = 'Platforms';

                return (
                  <div key={key} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4">
                    <p className="text-indigo-600 dark:text-indigo-400 text-xs uppercase font-bold tracking-wider mb-1">{localizedKey}</p>
                    <p className="font-medium text-slate-900 dark:text-white" dir="auto">{value}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function App() {
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<'english' | 'arabic'>('english');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations.english;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = language === 'arabic' ? 'ar' : 'en';
  }, [language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(t.errorFileSize);
        setFile(null);
      } else {
        setFile(selectedFile);
        setError('');
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (e.target.value) {
      setError('');
    }
  };

  const handleInputTypeChange = (type: 'upload' | 'url') => {
    setInputType(type);
    setError('');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const generateContent = async () => {
    const activeInput = inputType === 'upload' ? file : url;
    if (!activeInput) {
      setError(inputType === 'upload' ? t.errorNoFile : t.errorNoUrl);
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const h = translations['english'].headings;
      const systemInstruction = `You are an advanced AI assistant specialized in analyzing any video and converting it into high-quality, ready-to-publish social media content. Generate the content in ${language === 'english' ? 'English' : 'Arabic'}. IMPORTANT: Keep all section headings and the Snapshot labels (Topic, Tone, Platforms, Goal) in English. Only translate the actual content inside each section.

Workflow & Required Headings:
You MUST use exactly these headings (starting with ##):

## ${h.snapshot}
- Topic: [Topic]
- Tone: [Tone]
- Platforms: [Platforms]
- Goal: [Goal]

## ${h.videoAnalysis}
[Content]

## ${h.shortSummary}
[Content]

## ${h.keyInsights}
[Content]

## ${h.threadForX}
[Content]

## ${h.linkedinPost}
[Content]

## ${h.tiktokScripts}
[Content]

## ${h.instagramCaption}
[Content]

## ${h.viralHooks}
[Content]

## ${h.hashtags}
[Content]

## ${h.additionalIdeas}
[Content]

## ${h.keyTakeaways}
[Content]

## ${h.studyMode}
[Content]

OUTPUT FORMAT:
- Clear headings and bullet points.
- Concise, engaging, readable.
- Optimized for social media.

TONE:
- Creative, engaging, practical, optimized for viral content.`;

      let contents: any;

      if (inputType === 'upload' && file) {
        const base64Data = await fileToBase64(file);
        contents = {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: "Please analyze this video and generate the social media content as instructed." }
          ],
        };
      } else if (inputType === 'url' && url) {
        contents = {
          parts: [
            { text: `Please analyze the video at this URL and generate the social media content as instructed: ${url}` }
          ],
        };
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents, systemInstruction }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setResult(data.text || '');
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED'))) {
        setError("You have exceeded your Gemini API quota. Please check your plan and billing details, or try again later.");
      } else {
        setError(err.message || t.errorGeneric);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseContent = (text: string) => {
    const sections: { title: string, content: string }[] = [];
    const parts = text.split(/^##\s+/m);
    
    parts.forEach(part => {
      if (!part.trim()) return;
      const lines = part.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      sections.push({ title, content });
    });
    return sections;
  };

  const sections = parseContent(result);
  const snapshotSection = sections.find(s => s.title.toLowerCase().includes('snapshot') || s.title.includes(t.headings.snapshot));
  const otherSections = sections.filter(s => !s.title.toLowerCase().includes('snapshot') && !s.title.includes(t.headings.snapshot));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-indigo-200 dark:selection:bg-indigo-900">
      <header className="pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">{t.appTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{t.appSubtitle}</p>
          </div>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 transition-colors">
              
              {/* Input Type Toggle */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-8">
                <button
                  onClick={() => handleInputTypeChange('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${inputType === 'upload' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <Upload className="w-4 h-4" />
                  {t.uploadTab}
                </button>
                <button
                  onClick={() => handleInputTypeChange('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${inputType === 'url' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <LinkIcon className="w-4 h-4" />
                  {t.linkTab}
                </button>
              </div>

              {/* Input Area */}
              <div className="min-h-[160px]">
                <AnimatePresence mode="wait">
                  {inputType === 'upload' ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t.videoFileLabel}</label>
                      <div 
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className={`group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all ${
                          loading 
                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60' 
                            : file 
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 cursor-pointer' 
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                        }`}
                      >
                        {file ? (
                          <div className="flex flex-col items-center text-center">
                            <div className="bg-indigo-600 p-3 rounded-full mb-3">
                              <FileVideo className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px]" dir="ltr">{file.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1" dir="ltr">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <div className="bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors p-4 rounded-full mb-4">
                              <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.clickToUpload}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1" dir="ltr">{t.fileSizeLimit}</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="video/mp4,video/quicktime"
                        className="hidden"
                        disabled={loading}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="url"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t.videoUrlLabel}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={url}
                          onChange={handleUrlChange}
                          placeholder={t.urlPlaceholder}
                          dir="ltr"
                          className="block w-full ps-11 pe-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all outline-none text-slate-900 dark:text-white"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle */}
              <div className="mt-8">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t.outputLanguageLabel}</label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <button
                    onClick={() => setLanguage('english')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${language === 'english' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <Type className="w-4 h-4" />
                    {t.englishBtn}
                  </button>
                  <button
                    onClick={() => setLanguage('arabic')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${language === 'arabic' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <Globe className="w-4 h-4" />
                    {t.arabicBtn}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-start gap-3 text-red-800 dark:text-red-400 text-sm overflow-hidden"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}

              <button
                onClick={generateContent}
                disabled={loading || (inputType === 'upload' ? !file : !url)}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-green-500 active:bg-green-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t.generateBtn}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8">
            <div className="min-h-[600px] flex flex-col relative">
              
              {result ? (
                <div className="space-y-4">
                  {snapshotSection && (
                    <SnapshotCard content={snapshotSection.content} />
                  )}
                  
                  {otherSections.map((section, index) => (
                    <Accordion 
                      key={index} 
                      title={section.title} 
                      content={section.content} 
                      defaultOpen={index === 0} 
                    />
                  ))}
                </div>
              ) : loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 rounded-[2rem]">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-indigo-200 dark:bg-indigo-900/50 rounded-full blur-xl"
                    ></motion.div>
                    <div className="relative bg-white dark:bg-slate-800 p-5 rounded-full border border-slate-100 dark:border-slate-700 shadow-xl">
                      <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{t.analyzingTitle}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.analyzingDesc}</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-full border border-slate-100 dark:border-slate-700">
                    <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.emptyStateText}</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
