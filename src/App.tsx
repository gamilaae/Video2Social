import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Upload, Link as LinkIcon, Loader2, Sparkles, AlertCircle, FileVideo, Globe, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for base64 inline

export default function App() {
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<'english' | 'arabic'>('english');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 20MB limit. Please provide a smaller video or a URL.');
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
      setError(inputType === 'upload' ? 'Please upload a video file.' : 'Please enter a video URL.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemInstruction = `You are an advanced AI assistant specialized in analyzing any video and converting it into high-quality, ready-to-publish social media content. Generate all output in ${language === 'english' ? 'English only' : 'Arabic only'}.

Workflow:
1. VIDEO ANALYSIS: Detect scenes, main message, key ideas, highlights.
2. SHORT SUMMARY: 3–5 sentence summary.
3. KEY INSIGHTS: Extract 5–7 important insights.
4. THREAD FOR X: Hook, 5–7 posts, CTA.
5. LINKEDIN POST: Professional engaging post.
6. TIKTOK / REELS SCRIPTS: 2–3 short scripts.
7. INSTAGRAM CAPTION: Engaging caption.
8. VIRAL HOOKS: 5 hooks for short videos/posts.
9. HASHTAG GENERATOR: 10 relevant hashtags.
10. ADDITIONAL CONTENT IDEAS: 5 extra short content ideas.
11. KEY TAKEAWAYS: 3–5 key takeaways.
12. OPTIONAL STUDY MODE: If educational, 5 flashcards, short study guide, 3 tips.

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

      const response = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents,
        config: { systemInstruction, temperature: 0.7 },
      });

      for await (const chunk of response) {
        setResult((prev) => prev + (chunk.text || ''));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200">
      <header className="pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 p-2.5 rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 leading-none">Video2Social</h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">AI Content Repurposer</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-[2rem] shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-zinc-100 p-6 sm:p-8">
              
              {/* Input Type Toggle */}
              <div className="flex p-1 bg-zinc-100/80 rounded-xl mb-8">
                <button
                  onClick={() => handleInputTypeChange('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${inputType === 'upload' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
                <button
                  onClick={() => handleInputTypeChange('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${inputType === 'url' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Link
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
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Video File</label>
                      <div 
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className={`group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all ${
                          loading 
                            ? 'border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-60' 
                            : file 
                              ? 'border-zinc-900 bg-zinc-50 cursor-pointer' 
                              : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer'
                        }`}
                      >
                        {file ? (
                          <div className="flex flex-col items-center text-center">
                            <div className="bg-zinc-900 p-3 rounded-full mb-3">
                              <FileVideo className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-900 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-zinc-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <div className="bg-zinc-100 group-hover:bg-zinc-200 transition-colors p-4 rounded-full mb-4">
                              <Upload className="w-6 h-6 text-zinc-500 group-hover:text-zinc-700" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-900">Click to upload</p>
                            <p className="text-xs text-zinc-500 mt-1">MP4, MOV up to 20MB</p>
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
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Video URL</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-zinc-400" />
                        </div>
                        <input
                          type="url"
                          value={url}
                          onChange={handleUrlChange}
                          placeholder="https://youtube.com/..."
                          className="block w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-all outline-none"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle */}
              <div className="mt-8">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Output Language</label>
                <div className="flex p-1 bg-zinc-100/80 rounded-xl">
                  <button
                    onClick={() => setLanguage('english')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${language === 'english' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    <Type className="w-4 h-4" />
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('arabic')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${language === 'arabic' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    <Globe className="w-4 h-4" />
                    Arabic
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-800 text-sm overflow-hidden"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}

              <button
                onClick={generateContent}
                disabled={loading || (inputType === 'upload' ? !file : !url)}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-green-500 active:bg-green-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-zinc-100 min-h-[600px] flex flex-col overflow-hidden relative">
              
              {/* Header */}
              <div className="border-b border-zinc-100 p-6 bg-white/50 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Output
                </h2>
                {result && !loading && (
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {language === 'english' ? 'English' : 'Arabic'}
                  </span>
                )}
              </div>
              
              {/* Content Area */}
              <div className="p-8 sm:p-10 flex-grow overflow-auto relative">
                {result ? (
                  <div 
                    dir={language === 'arabic' ? 'rtl' : 'ltr'}
                    className="markdown-body"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result}
                    </ReactMarkdown>
                  </div>
                ) : loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-6 bg-white/80 backdrop-blur-sm z-20">
                    <div className="relative">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-zinc-200 rounded-full blur-xl"
                      ></motion.div>
                      <div className="relative bg-white p-5 rounded-full border border-zinc-100 shadow-xl">
                        <Sparkles className="w-8 h-8 text-zinc-800" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-semibold text-zinc-800">Analyzing video content...</p>
                      <p className="text-sm text-zinc-500">This might take a few moments</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                    <div className="bg-zinc-50 p-6 rounded-full border border-zinc-100">
                      <Sparkles className="w-10 h-10 text-zinc-300" />
                    </div>
                    <p className="text-sm font-medium text-zinc-500">Your generated content will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
