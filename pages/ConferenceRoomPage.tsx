
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  Send, 
  Users, 
  Settings,
  ShieldCheck,
  Bot,
  Volume2,
  VolumeX,
  Paperclip,
  ImageIcon,
  Smile,
  Download,
  File as FileIcon,
  X,
  Maximize2,
  Minimize2,
  MessageSquare,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface ChatItem {
  id: string;
  user: string;
  text: string;
  time: string;
  isAi: boolean;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

const EMOJIS = ['😊', '😂', '👋', '👍', '🔥', '🤔', '🙌', '💡', '📚', '🎯', '✅', '❌'];

const ConferenceRoomPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { conferences, addNotification } = useAppContext();
  const navigate = useNavigate();
  
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [outputMuted, setOutputMuted] = useState(false);
  const [message, setMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  
  // Chat view states
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isChatWide, setIsChatWide] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    { id: '1', user: 'Système', text: 'Bienvenue dans la conférence sécurisée.', time: 'Initial', isAi: false }
  ]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const conf = conferences.find(c => c.id === id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatVisible]);

  useEffect(() => {
    if (isAuthorized && camOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isAuthorized, camOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: micOn 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erreur caméra:", err);
      setCamOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleJoin = () => {
    if (passwordInput === (conf?.passwordHash || 'admin')) {
      setIsAuthorized(true);
    } else {
      addNotification("Mot de passe incorrect.", "alert");
    }
  };

  const askGemini = async (userPrompt: string) => {
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tu es un assistant universitaire intelligent nommé ChronoNexus AI présent dans une conférence de cours. 
        L'utilisateur dit : "${userPrompt}". 
        Réponds de manière concise, polie et utile pour un étudiant.`,
      });
      
      const aiText = response.text || "Désolé, je rencontre une difficulté technique.";
      
      setChatHistory(prev => [...prev, {
        id: Date.now().toString() + "-ai",
        user: 'Nexus AI',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: true
      }]);
    } catch (err) {
      console.error("Gemini Error:", err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    
    const userMsg = message;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatHistory(prev => [...prev, {
      id: Date.now().toString(),
      user: user?.firstName || 'Moi',
      text: userMsg,
      time: timestamp,
      isAi: false,
      type: 'text'
    }]);
    
    setMessage('');
    setShowEmojis(false);

    if (userMsg.toLowerCase().includes('ai') || userMsg.toLowerCase().includes('aide') || userMsg.includes('?')) {
      await askGemini(userMsg);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = fileType === 'image' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      addNotification(`Fichier trop volumineux. Max: ${fileType === 'image' ? '10Mo' : '5Mo'}`, 'alert');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        user: user?.firstName || 'Moi',
        text: fileType === 'image' ? 'Image envoyée' : `Fichier: ${file.name}`,
        time: timestamp,
        isAi: false,
        type: fileType,
        fileUrl: reader.result as string,
        fileName: file.name
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  if (!isAuthorized) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès Sécurisé</h2>
          <p className="text-slate-500 mb-6">Veuillez entrer le mot de passe de la conférence pour rejoindre.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg text-slate-900"
            placeholder="Mot de passe"
          />
          <button 
            onClick={handleJoin}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
          >
            Rejoindre la session
          </button>
        </div>
      </div>
    );
  }

  const videoSpan = !isChatVisible ? 'lg:col-span-4' : isChatWide ? 'lg:col-span-2' : 'lg:col-span-3';
  const chatSpan = isChatWide ? 'lg:col-span-2' : 'lg:col-span-1';

  return (
    <div className="h-full flex flex-col gap-4 animate-in slide-in-from-bottom duration-500 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{conf?.name || 'Conférence Privée'}</h1>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              En direct • {Math.floor(Math.random() * 5) + 2} participants
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isChatVisible && (
            <button 
              onClick={() => setIsChatVisible(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"
            >
              <MessageSquare size={16} /> Chat
            </button>
          )}
          <button className="p-2 text-slate-400 hover:bg-white rounded-lg"><Users size={20} /></button>
          <button className="p-2 text-slate-400 hover:bg-white rounded-lg"><Settings size={20} /></button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        <div className={`${videoSpan} bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border-2 border-slate-800 transition-all duration-500`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {camOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted={outputMuted} 
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="text-white text-center">
                <div className="w-24 h-24 bg-indigo-600/20 border-2 border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-indigo-400">
                  {user?.firstName.charAt(0)}
                </div>
                <p className="text-slate-400">Caméra désactivée</p>
              </div>
            )}
          </div>
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/10 shadow-lg">
              {user?.firstName} {user?.lastName}
            </div>
            {outputMuted && (
              <div className="bg-red-500/80 backdrop-blur-md px-3 py-2 rounded-xl text-white text-[10px] font-black uppercase flex items-center gap-1.5 border border-red-400 shadow-lg">
                <VolumeX size={14} /> Casque Muet
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-2xl">
            <button 
              onClick={() => setMicOn(!micOn)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
            >
              {micOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button 
              onClick={() => setCamOn(!camOn)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${camOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
            >
              {camOn ? <VideoIcon size={22} /> : <VideoOff size={22} />}
            </button>
            <button 
              onClick={() => setOutputMuted(!outputMuted)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${!outputMuted ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-amber-500 text-white'}`}
            >
              {!outputMuted ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            <button 
              onClick={() => navigate('/conferences')}
              className="px-6 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all font-bold gap-2"
            >
              <PhoneOff size={20} />
              Quitter
            </button>
          </div>
        </div>

        {isChatVisible && (
          <div className={`${chatSpan} bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative transition-all duration-500 animate-in slide-in-from-right-4`}>
            <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsChatVisible(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                  <ChevronRight size={20} />
                </button>
                <span>Discussion</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                  <Bot size={12} /> IA
                </div>
              </div>
              <button onClick={() => setIsChatWide(!isChatWide)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                {isChatWide ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {chatHistory.map((chat) => (
                <div key={chat.id} className={`${chat.user === 'Système' ? 'text-center' : ''}`}>
                  {chat.user === 'Système' ? (
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider font-bold">{chat.text}</span>
                  ) : (
                    <div className={`max-w-[90%] ${chat.user === user?.firstName ? 'ml-auto text-right' : ''}`}>
                      <p className={`text-[10px] font-black mb-1 flex items-center gap-1 ${chat.user === user?.firstName ? 'justify-end text-slate-400' : 'text-indigo-500'}`}>
                        {chat.isAi && <Bot size={10} />}
                        {chat.user} • {chat.time}
                      </p>
                      <div className={`p-3 rounded-2xl inline-block text-sm leading-relaxed shadow-sm ${
                          chat.user === user?.firstName ? 'bg-indigo-600 text-white rounded-tr-none' : chat.isAi ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tl-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {chat.type === 'text' && chat.text}
                        {chat.type === 'image' && chat.fileUrl && <img src={chat.fileUrl} alt="Partage" className="max-w-full rounded-lg cursor-zoom-in" onClick={() => window.open(chat.fileUrl)} />}
                        {chat.type === 'file' && (
                          <div className="flex items-center gap-2">
                            <FileIcon size={14} /> 
                            <span className="truncate max-w-[120px]">{chat.fileName}</span>
                            <a href={chat.fileUrl} download={chat.fileName} className="text-indigo-600"><Download size={14} /></a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isAiThinking && <div className="flex items-center gap-2 text-slate-400 italic text-[10px] animate-pulse"><Bot size={14} /> L'IA réfléchit...</div>}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                 <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                 <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'file')} />
                 <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600"><ImageIcon size={18} /></button>
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600"><Paperclip size={18} /></button>
                 <button type="button" onClick={() => setShowEmojis(!showEmojis)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600"><Smile size={18} /></button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Posez une question à l'IA..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 shadow-inner"
                />
                <button type="submit" className="absolute right-1.5 top-1.5 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-all" disabled={!message.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConferenceRoomPage;
