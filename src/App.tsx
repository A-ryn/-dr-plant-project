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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-green-100">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-green-900 uppercase">DR PLANT</span>
          </div>
          {image && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-green-600 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Upload & Preview */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Consult <span className="text-green-600">DR PLANT.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-md">
                Upload a photo and describe your concerns. Get expert Kerala-specific plant health advice instantly.
              </p>
            </div>

            {!image ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all duration-300"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-green-100 transition-all duration-300">
                  <Upload className="text-slate-400 group-hover:text-green-600 w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900">Click or drag to upload</p>
                  <p className="text-sm text-slate-400">PNG, JPG or WebP up to 10MB</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                  <img src={image} alt="Preview" className="w-full aspect-square object-cover" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="userMessage" className="text-sm font-bold text-slate-700 ml-1">
                    Describe symptoms or ask a question (Optional)
                  </label>
                  <textarea
                    id="userMessage"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="e.g., The leaves are turning yellow from the edges. Is this overwatering?"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none h-24 text-sm"
                  />
                </div>

                {/* Display Preferences */}
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Display Preferences</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'health', label: 'Health Dashboard' },
                      { id: 'careGuide', label: 'Soil & Climate Grid' },
                      { id: 'watering', label: 'Watering Frequency' },
                      { id: 'climate', label: 'Ideal Climate' },
                      { id: 'fertilizers', label: 'Organic Fertilizers' },
                      { id: 'remedies', label: 'Remedies & Care' },
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          onClick={() => toggleOption(opt.id as keyof typeof displayOptions)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            displayOptions[opt.id as keyof typeof displayOptions] 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'bg-white border-slate-300 group-hover:border-green-400'
                          }`}
                        >
                          {displayOptions[opt.id as keyof typeof displayOptions] && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-semibold transition-colors ${
                          displayOptions[opt.id as keyof typeof displayOptions] ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {!isAnalyzing && !result && !error && (
                  <button
                    onClick={analyze}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Leaf className="w-5 h-5" />
                    Analyze with DR PLANT
                  </button>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center"
                >
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-600/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Analyzing Sample...</h3>
                    <p className="text-slate-500 animate-pulse">Identifying plant and checking for diseases</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Dashboard Header */}
                  {displayOptions.health && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">Plant Health Dashboard</h2>
                        <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-sm font-bold ${getStatusColor(result.healthStatus)}`}>
                          {getStatusIcon(result.healthStatus)}
                          {result.healthStatus}
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Identified Plant</p>
                        <p className="text-3xl font-black text-slate-900">{result.plantName}</p>
                        {result.diseaseName && (
                          <div className="mt-4 flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-semibold">Detected: {result.diseaseName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* User Question Answer */}
                  {result.userQuestionAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-green-600 rounded-3xl text-white shadow-lg shadow-green-100"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Expert Consultation Answer</p>
                      <p className="text-lg font-medium leading-relaxed italic">"{result.userQuestionAnswer}"</p>
                    </motion.div>
                  )}

                  {/* Care Guide Grid */}
                  {displayOptions.careGuide && result.careGuide && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                          <Sprout className="text-orange-600 w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Soil</p>
                        <p className="text-sm font-semibold text-slate-700">{result.careGuide.soil}</p>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                          <Thermometer className="text-blue-600 w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Temp</p>
                        <p className="text-sm font-semibold text-slate-700">{result.careGuide.temperature}</p>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                          <Droplets className="text-indigo-600 w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Monsoon</p>
                        <p className="text-sm font-semibold text-slate-700">{result.careGuide.monsoon}</p>
                      </div>
                    </div>
                  )}

                  {/* New Structured Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Watering Section */}
                    {displayOptions.watering && (
                      <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-3">
                        <div className="flex items-center gap-3 text-blue-700">
                          <Droplets className="w-6 h-6" />
                          <h3 className="font-bold text-lg">Watering Frequency</h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{result.wateringFrequency}</p>
                      </div>
                    )}

                    {/* Climate Section */}
                    {displayOptions.climate && (
                      <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-3xl space-y-3">
                        <div className="flex items-center gap-3 text-orange-700">
                          <Thermometer className="w-6 h-6" />
                          <h3 className="font-bold text-lg">Ideal Climate</h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{result.idealClimate}</p>
                      </div>
                    )}
                  </div>

                  {/* Fertilizers Section */}
                  {displayOptions.fertilizers && (
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3 text-slate-700">
                        <Sprout className="w-6 h-6" />
                        <h3 className="font-bold text-lg">Best Organic Fertilizers</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.bestFertilizers.map((fert, i) => (
                          <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600">
                            {fert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remedies Section (Conditional) */}
                  {displayOptions.remedies && result.remedies && result.remedies.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="text-green-600 w-5 h-5" />
                        {result.diseaseName ? `Remedies for ${result.diseaseName}` : 'Organic Care & Maintenance'}
                      </h3>
                      <ul className="space-y-3">
                        {result.remedies.map((remedy, i) => (
                          <motion.li 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-start gap-3 p-4 bg-green-50/50 border border-green-100 rounded-2xl text-slate-700 text-sm"
                          >
                            <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            {remedy}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-[40px]"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Leaf className="text-slate-200 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300">Awaiting Analysis</h3>
                  <p className="text-slate-400 mt-2 max-w-xs">
                    Your plant health report will appear here once you upload and analyze a photo.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-100 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-400 font-medium">
            © 2026 DR PLANT. Empowering local farmers with AI.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Organic First</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Kerala Specific</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
