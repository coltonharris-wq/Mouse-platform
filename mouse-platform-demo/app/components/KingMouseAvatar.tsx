'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, ChevronDown, Command, Users, Activity, Zap, Play, Loader2, CheckCircle, ExternalLink, MessageSquare, Plus, Mic, Crown } from 'lucide-react';
import { useEmployees, Employee, EmployeeRole, DeploymentStage } from '../context/EmployeeContext';
import { useWorkHours } from '../context/WorkHoursContext';

// Type declarations for Web Speech API
type SpeechRecognitionType = typeof window.webkitSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: QuickAction[];
  deploymentId?: string;
  employeeId?: string;
  hasImage?: boolean;
  imageUrl?: string;
}

interface QuickAction {
  label: string;
  icon: React.ElementType;
  command: string;
  variant?: 'primary' | 'secondary';
}

const ROLE_QUICK_ACTIONS: Array<{ role: EmployeeRole; label: string; icon: React.ElementType; description: string }> = [
  { role: 'sales', label: 'Deploy Sales Employee', icon: Zap, description: 'Sales Follow-Up Specialist' },
  { role: 'support', label: 'Deploy Support Agent', icon: MessageSquare, description: 'Customer Support Agent' },
  { role: 'developer', label: 'Deploy Developer', icon: Command, description: 'Code Assistant' },
  { role: 'analyst', label: 'Deploy Analyst', icon: Activity, description: 'Data Analyst' },
];

// Realistic Human Avatar Component with CSS Animations
function HumanAvatar({ isSpeaking, size = 'normal', showGestures = true }: { isSpeaking?: boolean; size?: 'small' | 'normal' | 'large'; showGestures?: boolean }) {
  const sizeClasses = { 
    small: 'w-10 h-10', 
    normal: 'w-14 h-14', 
    large: 'w-20 h-20' 
  };
  
  const [isBlinking, setIsBlinking] = useState(false);
  const [isGesturing, setIsGesturing] = useState(false);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Random blink animation
  useEffect(() => {
    const scheduleBlink = () => {
      const randomDelay = 2000 + Math.random() * 4000; // 2-6 seconds
      blinkTimeoutRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, randomDelay);
    };
    
    scheduleBlink();
    
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, []);

  // Occasional hand gesture
  useEffect(() => {
    if (!showGestures) return;
    
    const scheduleGesture = () => {
      const randomDelay = 8000 + Math.random() * 7000; // 8-15 seconds
      gestureTimeoutRef.current = setTimeout(() => {
        setIsGesturing(true);
        setTimeout(() => setIsGesturing(false), 2000);
        scheduleGesture();
      }, randomDelay);
    };
    
    scheduleGesture();
    
    return () => {
      if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
    };
  }, [showGestures]);

  return (
    <div className={`relative group ${sizeClasses[size]}`}>
      {/* Speaking glow effect */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 bg-blue-500/30 animate-speaking-pulse rounded-full" />
          <div className="absolute -inset-3 bg-blue-400/20 animate-ping rounded-full" />
        </>
      )}
      
      {/* Main avatar container */}
      <div 
        className={`
          relative w-full h-full rounded-full overflow-hidden 
          shadow-lg border-2 border-white
          animate-breathe
          group-hover:animate-head-tilt
          transition-transform duration-300
          ${isSpeaking ? 'animate-speaking-pulse' : ''}
        `}
      >
        {/* Professional photo */}
        <img 
          src="/avatars/professional-avatar.jpg" 
          alt="King AI Assistant"
          className={`
            w-full h-full object-cover object-top
            ${isBlinking ? 'animate-blink' : ''}
          `}
        />
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
        
        {/* Speaking mouth overlay */}
        {isSpeaking && (
          <div className="avatar-mouth speaking" />
        )}
      </div>
      
      {/* Hand gesture emoji overlay */}
      {isGesturing && !isSpeaking && (
        <div className="absolute -bottom-1 -right-1 text-lg animate-hand-gesture">
          👋
        </div>
      )}
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <div className="flex gap-0.5 items-end h-3">
            <span className="sound-wave-bar" style={{ animationDelay: '0s' }} />
            <span className="sound-wave-bar" style={{ animationDelay: '0.1s' }} />
            <span className="sound-wave-bar" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
      
      {/* Status indicator when not speaking */}
      {!isSpeaking && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

export default function KingMouseAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm King 👑\n\nYour AI workforce orchestrator. I can deploy AI employees to help grow your business. What would you like to do?",
      timestamp: new Date(),
      actions: [
        { label: 'Deploy Sales Employee', icon: Zap, command: '/deploy sales', variant: 'primary' },
        { label: 'Deploy Support Agent', icon: MessageSquare, command: '/deploy support', variant: 'primary' },
        { label: 'View My Employees', icon: Users, command: '/employees' },
        { label: 'Check Hours Balance', icon: Activity, command: '/hours' },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showDeploymentProgress, setShowDeploymentProgress] = useState(false);
  const [activeDeploymentRole, setActiveDeploymentRole] = useState<EmployeeRole | null>(null);
  const [chattingWithEmployee, setChattingWithEmployee] = useState<Employee | null>(null);
  const [employeeMessageInput, setEmployeeMessageInput] = useState('');
  const [isEmployeeTyping, setIsEmployeeTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { employees, isDeploying, deploymentProgress, deploymentStages, startDeployment, sendMessageToEmployee } = useEmployees();
  const { balance } = useWorkHours();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isEmployeeTyping]);

  useEffect(() => {
    if (!isDeploying && activeDeploymentRole && deploymentProgress === 100) {
      const deployedEmployee = employees[employees.length - 1];
      if (deployedEmployee && deployedEmployee.status === 'idle') {
        setShowDeploymentProgress(false);
        setActiveDeploymentRole(null);
        setMessages(prev => [...prev, {
          id: `deploy-success-${Date.now()}`,
          role: 'assistant',
          content: `✅ **Employee Deployed!**\n\nMeet **${deployedEmployee.name}** ${deployedEmployee.personality.avatar} — your new ${deployedEmployee.roleDisplay}.\n\n🎯 **Skills:** ${deployedEmployee.skills.slice(0, 3).join(', ')}\n💬 **Style:** ${deployedEmployee.personality.style}\n🖥️ **VM:** ${deployedEmployee.vmId}\n\nYou can chat with ${deployedEmployee.name} or view their dashboard to assign tasks.`,
          timestamp: new Date(),
          actions: [
            { label: `Chat with ${deployedEmployee.name}`, icon: MessageSquare, command: `/chat ${deployedEmployee.id}`, variant: 'primary' },
            { label: 'View Dashboard', icon: ExternalLink, command: '/dashboard' },
          ],
          employeeId: deployedEmployee.id,
        }]);
      }
    }
  }, [isDeploying, deploymentProgress, activeDeploymentRole, employees]);

  useEffect(() => {
    if (isTyping || isEmployeeTyping) {
      setIsSpeaking(true);
    } else {
      const timer = setTimeout(() => setIsSpeaking(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isTyping, isEmployeeTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue || (selectedImage ? '📷 Image uploaded' : ''),
      timestamp: new Date(),
      hasImage: !!selectedImage,
      imageUrl: selectedImage || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);
    setIsSpeaking(true);
    await processCommand(inputValue.trim().toLowerCase());
  };

  const processCommand = async (input: string) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('deploy') || lowerInput.includes('hire') || lowerInput.includes('create')) {
      let role: EmployeeRole | null = null;
      if (lowerInput.includes('sales')) role = 'sales';
      else if (lowerInput.includes('support')) role = 'support';
      else if (lowerInput.includes('developer') || lowerInput.includes('code')) role = 'developer';
      else if (lowerInput.includes('analyst') || lowerInput.includes('data')) role = 'analyst';
      if (role) {
        await initiateDeployment(role);
        return;
      }
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'What type of employee would you like to deploy?',
          timestamp: new Date(),
          actions: ROLE_QUICK_ACTIONS.map(r => ({ label: r.label, icon: r.icon, command: `/deploy ${r.role}`, variant: 'primary' })),
        }]);
        setIsTyping(false);
        setIsSpeaking(false);
      }, 500);
      return;
    }
    if (lowerInput.includes('employees') || lowerInput.includes('team') || lowerInput.includes('staff')) {
      setTimeout(() => {
        if (employees.length === 0) {
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: "You don't have any employees yet. Would you like to deploy one?",
            timestamp: new Date(),
            actions: [
              { label: 'Deploy Sales Employee', icon: Zap, command: '/deploy sales', variant: 'primary' },
              { label: 'Deploy Support Agent', icon: MessageSquare, command: '/deploy support', variant: 'primary' },
            ],
          }]);
        } else {
          const employeeList = employees.map(e => `• ${e.personality.avatar} **${e.name}** (${e.roleDisplay}) — ${e.status === 'idle' ? '🟢 Available' : e.status === 'working' ? '🔵 Working' : '🟡 Paused'}`).join('\n');
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Your AI Workforce (${employees.length} employees):\n\n${employeeList}\n\nClick on any employee to chat with them or assign tasks.`,
            timestamp: new Date(),
            actions: employees.slice(0, 3).map(e => ({ label: `Chat with ${e.name}`, icon: MessageSquare, command: `/chat ${e.id}` })),
          }]);
        }
        setIsTyping(false);
        setIsSpeaking(false);
      }, 800);
      return;
    }
    if (lowerInput.includes('hours') || lowerInput.includes('balance') || lowerInput.includes('credits')) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `💼 **Work Hours Balance**\n\nYou have **${balance.toFixed(1)}** work hours remaining.\n\n**Costs:**\n• Deploy employee: 1 hour\n• 1 hour runtime: 1 hour\n• Message King: 0.1 hours\n\nNeed more hours? Visit the billing page to purchase.`,
          timestamp: new Date(),
          actions: [
            { label: 'Purchase Hours', icon: Zap, command: '/buy' },
            { label: 'View Usage', icon: Activity, command: '/usage' },
          ],
        }]);
        setIsTyping(false);
        setIsSpeaking(false);
      }, 600);
      return;
    }
    if (lowerInput.startsWith('/chat') || lowerInput.includes('chat with')) {
      const employeeId = lowerInput.replace('/chat', '').replace('chat with', '').trim();
      const employee = employees.find(e => e.id === employeeId || e.name.toLowerCase().includes(employeeId) || employeeId.includes(e.id));
      if (employee) {
        setChattingWithEmployee(employee);
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `You're now chatting with **${employee.name}** ${employee.personality.avatar}\n\n_${employee.personality.greeting}_\n\n**Communication style:** ${employee.personality.style}\n**Skills:** ${employee.skills.join(', ')}\n\nType your message below to assign tasks or ask questions.`,
            timestamp: new Date(),
            actions: [
              { label: 'Back to King', icon: MessageCircle, command: '/back' },
              { label: 'View Dashboard', icon: ExternalLink, command: '/dashboard' },
            ],
          }]);
          setIsTyping(false);
          setIsSpeaking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I couldn't find that employee. Here are your available employees:",
            timestamp: new Date(),
            actions: employees.map(e => ({ label: `Chat with ${e.name}`, icon: MessageSquare, command: `/chat ${e.id}` })),
          }]);
          setIsTyping(false);
          setIsSpeaking(false);
        }, 500);
      }
      return;
    }
    if (lowerInput.includes('/back') || lowerInput.includes('back to king')) {
      setChattingWithEmployee(null);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm back! How can I help you today?",
          timestamp: new Date(),
          actions: [
            { label: 'Deploy Employee', icon: Bot, command: '/deploy' },
            { label: 'View Employees', icon: Users, command: '/employees' },
            { label: 'Check Hours', icon: Activity, command: '/hours' },
          ],
        }]);
        setIsTyping(false);
        setIsSpeaking(false);
      }, 300);
      return;
    }
    if (lowerInput.includes('help') || lowerInput === '/help') {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `**King Commands:**\n\n🚀 **Deployment**\n• "Deploy sales employee" or "/deploy sales"\n• "Hire support agent" or "/deploy support"\n• "Create developer" or "/deploy developer"\n• "Deploy analyst" or "/deploy analyst"\n\n👥 **Management**\n• "View my employees" or "/employees"\n• "Chat with [employee name]" or "/chat [id]"\n• "Check hours" or "/hours"\n\nJust ask me naturally — I'm here to help!`,
          timestamp: new Date(),
          actions: [
            { label: 'Deploy Sales', icon: Zap, command: '/deploy sales', variant: 'primary' },
            { label: 'Deploy Support', icon: MessageSquare, command: '/deploy support', variant: 'primary' },
          ],
        }]);
        setIsTyping(false);
        setIsSpeaking(false);
      }, 500);
      return;
    }
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I can help you deploy AI employees, manage your workforce, and check your account. Try asking me to:\n\n• Deploy a sales or support employee\n• Show your current employees\n• Check your work hours balance\n• Chat with one of your employees\n\nOr type **/help** for all commands.",
        timestamp: new Date(),
        actions: [
          { label: 'Deploy Employee', icon: Bot, command: '/deploy' },
          { label: 'View Employees', icon: Users, command: '/employees' },
          { label: 'Help', icon: Command, command: '/help' },
        ],
      }]);
      setIsTyping(false);
      setIsSpeaking(false);
    }, 800);
  };

  const initiateDeployment = async (role: EmployeeRole) => {
    const roleLabels: Record<EmployeeRole, string> = {
      sales: 'Sales Follow-Up Specialist',
      support: 'Customer Support Agent',
      developer: 'Code Assistant',
      analyst: 'Data Analyst',
      custom: 'Custom Agent',
    };
    const roleDisplayName = roleLabels[role];
    if (!roleDisplayName) {
      setMessages((prev) => [...prev, {
        id: `deploy-error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Invalid Role**\n\nPlease select a valid role: sales, support, developer, or analyst.`,
        timestamp: new Date(),
        actions: ROLE_QUICK_ACTIONS.map(r => ({ label: r.label, icon: r.icon, command: `/deploy ${r.role}`, variant: 'primary' })),
      }]);
      setIsTyping(false);
      setIsSpeaking(false);
      return;
    }
    setActiveDeploymentRole(role);
    setShowDeploymentProgress(true);
    setMessages((prev) => [...prev, {
      id: `deploy-start-${Date.now()}`,
      role: 'assistant',
      content: `🚀 **Starting Deployment**\n\nI'll deploy a **${roleDisplayName}** for you. This will take about 3 minutes.\n\n⏳ Creating VM...\n⏳ Installing Mouse AI...\n⏳ Configuring agent...\n⏳ Connecting to your dashboard...\n⏳ Activating employee...`,
      timestamp: new Date(),
    }]);
    setIsTyping(false);
    setIsSpeaking(false);
    try {
      await startDeployment(role);
    } catch (error: any) {
      setShowDeploymentProgress(false);
      setActiveDeploymentRole(null);
      setMessages((prev) => [...prev, {
        id: `deploy-error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Deployment Failed**\n\n${error.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date(),
        actions: [
          { label: 'Try Again', icon: Play, command: `/deploy ${role}`, variant: 'primary' },
          { label: 'Check Hours', icon: Activity, command: '/hours' },
        ],
      }]);
      setIsSpeaking(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.command);
    if (action.command.startsWith('/deploy')) {
      const roleMatch = action.command.match(/\/deploy\s+(\w+)/);
      const role = roleMatch ? roleMatch[1] as EmployeeRole : null;
      if (role && ['sales', 'support', 'developer', 'analyst', 'custom'].includes(role)) {
        initiateDeployment(role);
      } else {
        processCommand(action.command);
      }
    } else if (action.command.startsWith('/chat')) {
      processCommand(action.command);
    } else {
      handleSendMessage();
    }
  };

  const handleEmployeeMessageSend = async () => {
    if (!employeeMessageInput.trim() || !chattingWithEmployee) return;
    const userMsg: Message = {
      id: `emp-msg-${Date.now()}`,
      role: 'user',
      content: employeeMessageInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setEmployeeMessageInput('');
    setIsEmployeeTyping(true);
    setIsSpeaking(true);
    try {
      const response = await sendMessageToEmployee(chattingWithEmployee.id, userMsg.content);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `emp-reply-${Date.now()}`,
          role: 'assistant',
          content: `${chattingWithEmployee.personality.avatar} **${chattingWithEmployee.name}:**\n\n${response}\n\n_${chattingWithEmployee.personality.signature}_`,
          timestamp: new Date(),
        }]);
        setIsEmployeeTyping(false);
        setIsSpeaking(false);
      }, 1000);
    } catch (error) {
      setIsEmployeeTyping(false);
      setIsSpeaking(false);
      setMessages(prev => [...prev, {
        id: `emp-error-${Date.now()}`,
        role: 'assistant',
        content: `${chattingWithEmployee.personality.avatar} **${chattingWithEmployee.name}** is currently unavailable. Please try again later.`,
        timestamp: new Date(),
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chattingWithEmployee) {
        handleEmployeeMessageSend();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
          if (interimTranscript) {
            setInputValue(interimTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setRecordingError('Microphone access denied. Please allow microphone permissions.');
          } else if (event.error === 'no-speech') {
            setRecordingError('No speech detected. Please try again.');
          } else {
            setRecordingError(`Speech recognition error: ${event.error}`);
          }
          stopRecording();
        };

        recognitionRef.current.onend = () => {
          if (isRecording) {
            // Auto-send if we have a transcript
            if (transcript.trim()) {
              setInputValue(transcript.trim());
              setTimeout(() => {
                handleSendMessage();
              }, 100);
            }
            stopRecording();
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, transcript]);

  const startRecording = async () => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      setIsRecording(true);
      setRecordingError(null);
      setTranscript('');
      setInputValue('');

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start visualization
      visualizeAudio();
    } catch (err) {
      setRecordingError('Microphone access denied. Please allow microphone permissions in your browser.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setAudioLevel(0);
  };

  const cancelRecording = () => {
    stopRecording();
    setTranscript('');
    setInputValue('');
    setRecordingError(null);
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setAudioLevel(average);
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 group">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20" />
          <div className="relative hover:scale-110 transition-transform duration-300">
            <HumanAvatar isSpeaking={false} size="normal" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Your AI Assistant
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${isMinimized ? 'w-72' : 'w-[420px] h-[650px]'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {chattingWithEmployee ? (
              <>
                <div className="relative">
                  <span className="text-2xl">{chattingWithEmployee.personality.avatar}</span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold">{chattingWithEmployee.name}</h3>
                  <p className="text-xs text-blue-200">{chattingWithEmployee.roleDisplay}</p>
                </div>
              </>
            ) : (
              <>
                <HumanAvatar isSpeaking={isSpeaking} size="small" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold">King</h3>
                    <Crown className="w-4 h-4 text-yellow-400" />
                  </div>
                  <p className="text-xs text-blue-200">Your AI Assistant</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronDown className={`w-5 h-5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Deployment Progress Overlay */}
            {showDeploymentProgress && isDeploying && (
              <div className="absolute inset-0 bg-white z-10 flex flex-col">
                <div className="flex-1 p-6 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Deploying Employee...</h3>
                  <p className="text-sm text-gray-500 mb-6 text-center">This will take about 3 minutes<br/>Please do not close this window</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div className="bg-blue-700 h-2 rounded-full transition-all duration-500" style={{ width: `${deploymentProgress}%` }} />
                  </div>
                  <div className="w-full space-y-3">
                    {deploymentStages.map((stage, idx) => (
                      <DeploymentStageItem key={stage.name} stage={stage} index={idx} />
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button onClick={() => { setShowDeploymentProgress(false); setActiveDeploymentRole(null); }} className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm">
                    Hide Progress (deployment continues in background)
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="h-[460px] overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <HumanAvatar isSpeaking={false} size="small" />
                        <span className="text-xs text-gray-500 font-medium">King</span>
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl ${message.role === 'user' ? 'bg-blue-700 text-white rounded-br-md' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'}`}>
                      {message.hasImage && message.imageUrl && (
                        <div className="mb-2">
                          <img src={message.imageUrl} alt="Uploaded" className="max-w-full rounded-lg max-h-32 object-cover" />
                        </div>
                      )}
                      <p className="whitespace-pre-line text-sm" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>') }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {message.actions && message.role === 'assistant' && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.actions.map((action) => (
                          <button key={action.command} onClick={() => handleQuickAction(action)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${action.variant === 'primary' ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-700'}`}>
                            <action.icon className="w-3 h-3" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(isTyping || isEmployeeTyping) && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Photo Upload and Mic */}
            <div className="p-4 bg-white border-t border-gray-200">
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <img src={selectedImage} alt="Selected" className="h-16 w-16 object-cover rounded-lg" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                </div>
              )}
              
              {/* Recording Error Message */}
              {recordingError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <span className="text-red-500">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{recordingError}</p>
                    <button 
                      onClick={() => setRecordingError(null)}
                      className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              
              {/* Recording Visual Feedback */}
              {isRecording && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Recording...
                    </span>
                    <button
                      onClick={cancelRecording}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Cancel
                    </button>
                  </div>
                  {/* Sound Wave Visualization */}
                  <div className="flex items-center justify-center gap-1 h-8">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(8, Math.min(32, (audioLevel / 255) * 32 * (0.5 + Math.random() * 0.5)))}px`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-red-600 text-center mt-2">
                    Speak now... Click mic to stop
                  </p>
                </div>
              )}
              
              {chattingWithEmployee ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={employeeMessageInput}
                    onChange={(e) => setEmployeeMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${chattingWithEmployee.name}...`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleEmployeeMessageSend}
                    disabled={!employeeMessageInput.trim()}
                    className="p-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Upload photo"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleMicClick}
                    className={`p-2 rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-blue-700 hover:bg-blue-50'}`}
                    title={isRecording ? 'Stop recording' : 'Voice input'}
                  >
                    <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isRecording ? 'Listening...' : 'Ask King anything...'}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                    disabled={isRecording}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() && !selectedImage}
                    className="p-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {!chattingWithEmployee && ROLE_QUICK_ACTIONS.slice(0, 2).map((action) => (
                  <button
                    key={action.role}
                    onClick={() => initiateDeployment(action.role)}
                    disabled={isDeploying}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <action.icon className="w-3 h-3" />
                    {action.label.replace('Deploy ', '')}
                  </button>
                ))}
                {!chattingWithEmployee && (
                  <button onClick={() => processCommand('/employees')} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors">
                    <Users className="w-3 h-3" />
                    View Team
                  </button>
                )}
                {!chattingWithEmployee && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
                    <Zap className="w-3 h-3" />
                    {balance.toFixed(1)}h
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600">👋 Click to expand and chat with {chattingWithEmployee ? chattingWithEmployee.name : 'King'}!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DeploymentStageItem({ stage, index }: { stage: DeploymentStage; index: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
        stage.status === 'completed' ? 'bg-green-500 text-white' :
        stage.status === 'in_progress' ? 'bg-blue-700 text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        {stage.status === 'completed' ? (
          <CheckCircle className="w-4 h-4" />
        ) : stage.status === 'in_progress' ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          index + 1
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${
            stage.status === 'completed' ? 'text-green-700' :
            stage.status === 'in_progress' ? 'text-blue-700 font-medium' :
            'text-gray-500'
          }`}>
            {stage.message}
          </span>
          {stage.status === 'in_progress' && (
            <span className="text-xs text-gray-400">{stage.progress}%</span>
          )}
        </div>
        {stage.status === 'in_progress' && (
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div className="bg-blue-700 h-1 rounded-full transition-all duration-300" style={{ width: `${stage.progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
