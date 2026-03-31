import React, { useState, useRef } from 'react';
import { Upload, Leaf, AlertCircle, CheckCircle2, AlertTriangle, Thermometer, Droplets, Sprout, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzePlantImage, PlantAnalysis } from './services/geminiService';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Display Preferences State
  const [displayOptions, setDisplayOptions] = useState({
    health: true,
    careGuide: true,
    watering: true,
    climate: true,
    fertilizers: true,
    remedies: true,
  });

  const toggleOption = (option: keyof typeof displayOptions) => {
    setDisplayOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const analyze = async () => {
    if (!image || !file) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzePlantImage(image, file.type, userMessage);
      if (analysis.error) {
        setError(analysis.error);
        setResult(null);
      } else {
        setResult(analysis);
      }
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setFile(null);
    setUserMessage('');
    setResult(null);
    setError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy': return <CheckCircle2 className="w-5 h-5" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5" />;
      case 'Critical': return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-green-100 overflow-x-hidden">
      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-green-50/50 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[30%] h-[30%] bg-blue-50/30 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/60 backdrop-blur-xl z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 group-hover:rotate-12 transition-transform duration-300">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">DR PLANT</span>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em]">Kerala Edition</span>
            </div>
          </div>
          {image && (
            <button 
              onClick={reset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start New
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Title & Description */}
        <div className="space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
            <Sprout className="w-3 h-3" /> AI-Powered Agriculture
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Consult <span className="text-green-600">DR PLANT.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl font-medium">
            Upload a photo and describe your concerns. Get expert Kerala-specific plant health advice instantly.
          </p>
        </div>

        <div className="space-y-16">
          {/* Section 1: Upload & Preview */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upload & Context</h2>
            </div>
            
            {!image ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-200 rounded-[40px] p-16 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all duration-500 bg-white shadow-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="relative w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center group-hover:scale-110 group-hover:bg-green-100 transition-all duration-500 shadow-inner">
                  <Upload className="text-slate-400 group-hover:text-green-600 w-10 h-10" />
                </div>
                <div className="text-center relative">
                  <p className="font-black text-xl text-slate-900 tracking-tight">Drop your plant photo here</p>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">Click to browse (JPG, PNG, WebP)</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="relative rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white group">
                  <img src={image} alt="Preview" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <label htmlFor="userMessage" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Additional Context (Optional)
                    </label>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">{userMessage.length}/500</span>
                  </div>
                  <textarea
                    id="userMessage"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value.slice(0, 500))}
                    placeholder="Describe symptoms, age of plant, or specific questions..."
                    className="w-full p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all resize-none h-40 text-sm font-medium leading-relaxed"
                  />
                </div>

                {!isAnalyzing && !result && !error && (
                  <button
                    onClick={analyze}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-6 rounded-[32px] transition-all shadow-2xl shadow-green-200 active:scale-[0.98] flex items-center justify-center gap-4 text-xl group"
                  >
                    <Leaf className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Start Expert Analysis
                  </button>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-red-50 border border-red-100 rounded-[32px] flex items-start gap-5 text-red-700 shadow-sm"
              >
                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-black uppercase text-xs tracking-wider">Analysis Error</p>
                  <p className="text-sm font-bold leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Section 2: Display Preferences */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Report Settings</h2>
            </div>

            <div className="p-8 bg-white border border-slate-100 rounded-[40px] space-y-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="relative space-y-1">
                <h3 className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em]">Configuration</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight">Preferences</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 relative">
                {[
                  { id: 'health', label: 'Health Dashboard', desc: 'Condition summary' },
                  { id: 'careGuide', label: 'Growth Metrics', desc: 'Soil & monsoon data' },
                  { id: 'watering', label: 'Watering Plan', desc: 'Hydration schedule' },
                  { id: 'climate', label: 'Climate Data', desc: 'Optimal environment' },
                  { id: 'fertilizers', label: 'Organic Feed', desc: 'Natural recommendations' },
                  { id: 'remedies', label: 'Remedies', desc: 'Organic care steps' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id as keyof typeof displayOptions)}
                    className={`flex items-center gap-4 p-3.5 rounded-[24px] border text-left transition-all duration-300 group ${
                      displayOptions[opt.id as keyof typeof displayOptions]
                      ? 'bg-green-50/50 border-green-200 shadow-sm'
                      : 'bg-transparent border-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      displayOptions[opt.id as keyof typeof displayOptions] 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                      : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100'
                    }`}>
                      {displayOptions[opt.id as keyof typeof displayOptions] ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-sm font-black tracking-tight transition-colors ${displayOptions[opt.id as keyof typeof displayOptions] ? 'text-slate-900' : 'text-slate-400'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tip */}
            <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Pro Tip</span>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-80">
                For best results, ensure the plant is well-lit and the affected area is clearly visible in the frame.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Results */}
        <div className="relative pt-16 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">3</div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Analysis Report</h2>
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="flex flex-col items-center justify-center gap-8 py-20 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center">
                      <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Processing Sample...</h3>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-bounce" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Consulting expert database</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {/* Dashboard Header */}
                  {displayOptions.health && (
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">Health Report Summary</p>
                          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard</h2>
                        </div>
                        <div className={`w-fit px-6 py-2.5 rounded-[20px] border-2 flex items-center gap-3 text-sm font-black shadow-lg ${getStatusColor(result.healthStatus)}`}>
                          {getStatusIcon(result.healthStatus)}
                          <span className="uppercase tracking-widest">{result.healthStatus}</span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 relative p-10 bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden group">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-700" />
                          <div className="relative z-10 space-y-6">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-3">Identified Species</p>
                              <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{result.plantName}</p>
                            </div>
                            
                            {result.diseaseName && (
                              <div className="flex items-center gap-4 p-5 bg-red-50/50 rounded-[28px] border border-red-100 w-fit">
                                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-200">
                                  <AlertCircle className="text-white w-6 h-6" />
                                </div>
                                <div className="pr-4">
                                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">Condition Detected</p>
                                  <p className="text-lg font-black text-red-700 tracking-tight">{result.diseaseName}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Stats Column */}
                        <div className="space-y-4">
                          <div className="p-6 bg-slate-900 rounded-[32px] text-white flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-8">
                              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Verified</span>
                            </div>
                            <div>
                              <p className="text-2xl font-black tracking-tight mb-1">Expert AI</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Analysis Confidence: 98%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Question Answer */}
                  {result.userQuestionAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative p-8 bg-green-600 rounded-[40px] text-white shadow-2xl shadow-green-200 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <Leaf className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Expert Consultation</p>
                        </div>
                        <p className="text-xl font-bold leading-relaxed italic">"{result.userQuestionAnswer}"</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Care Guide Grid */}
                  {displayOptions.careGuide && result.careGuide && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-5 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                          <Sprout className="text-orange-600 w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Soil</p>
                        <p className="text-xs font-bold text-slate-700 leading-tight">{result.careGuide.soil}</p>
                      </div>
                      <div className="p-5 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                          <Thermometer className="text-blue-600 w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Temp</p>
                        <p className="text-xs font-bold text-slate-700 leading-tight">{result.careGuide.temperature}</p>
                      </div>
                      <div className="p-5 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                          <Droplets className="text-indigo-600 w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Monsoon</p>
                        <p className="text-xs font-bold text-slate-700 leading-tight">{result.careGuide.monsoon}</p>
                      </div>
                    </div>
                  )}

                  {/* New Structured Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Watering Section */}
                    {displayOptions.watering && (
                      <div className="p-8 bg-blue-50/30 border border-blue-100 rounded-[32px] space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                          <Droplets className="w-16 h-16 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-3 text-blue-700">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Droplets className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-black text-lg tracking-tight">Watering Plan</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">{result.wateringFrequency}</p>
                      </div>
                    )}

                    {/* Climate Section */}
                    {displayOptions.climate && (
                      <div className="p-8 bg-orange-50/30 border border-orange-100 rounded-[32px] space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                          <Thermometer className="w-16 h-16 text-orange-600" />
                        </div>
                        <div className="flex items-center gap-3 text-orange-700">
                          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <Thermometer className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-black text-lg tracking-tight">Ideal Climate</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">{result.idealClimate}</p>
                      </div>
                    )}
                  </div>

                  {/* Fertilizers Section */}
                  {displayOptions.fertilizers && (
                    <div className="p-8 bg-white border border-slate-100 rounded-[32px] space-y-6 shadow-sm">
                      <div className="flex items-center gap-3 text-slate-900">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                          <Sprout className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-lg tracking-tight">Organic Feed Recommendations</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.bestFertilizers.map((fert, i) => (
                          <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black text-slate-600 uppercase tracking-wider hover:bg-green-50 hover:border-green-100 hover:text-green-600 transition-colors cursor-default">
                            {fert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remedies Section (Conditional) */}
                  {displayOptions.remedies && result.remedies && result.remedies.length > 0 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                          <CheckCircle2 className="text-green-600 w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em]">Action Plan</p>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {result.diseaseName ? `Treatment for ${result.diseaseName}` : 'Care & Maintenance'}
                          </h3>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {result.remedies.map((remedy, i) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-start gap-6 p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:border-green-200 hover:shadow-md transition-all group"
                          >
                            <div className="w-8 h-8 bg-slate-50 text-slate-400 group-hover:bg-green-600 group-hover:text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 transition-all duration-300">
                              {i + 1}
                            </div>
                            <p className="text-slate-600 text-base font-medium leading-relaxed">{remedy}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center py-24 px-12 bg-white border border-slate-100 rounded-[64px] shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 opacity-50" />
                  <div className="relative mb-10">
                    <div className="w-32 h-32 bg-slate-50 rounded-[40px] shadow-xl shadow-slate-200/50 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <Leaf className="text-green-600 w-14 h-14 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-green-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-green-200 animate-bounce">
                      <Sprout className="text-white w-7 h-7" />
                    </div>
                  </div>
                  <div className="relative space-y-4">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Ready for Analysis</h3>
                    <p className="text-slate-400 max-w-[320px] text-lg leading-relaxed font-medium mx-auto">
                      Upload a photo of your plant to generate a comprehensive health and care report.
                    </p>
                  </div>
                  <div className="mt-12 flex gap-3 relative">
                    <div className="w-2 h-2 rounded-full bg-green-200 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-20 border-t border-slate-100 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="text-white w-3.5 h-3.5" />
              </div>
              <span className="font-black text-sm tracking-tighter text-slate-900 uppercase">DR PLANT</span>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              © 2026. Empowering local farmers with AI.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Built for</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Kerala Agriculture</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Standard</span>
              <span className="text-xs font-black text-green-600 uppercase tracking-widest">Organic First</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
