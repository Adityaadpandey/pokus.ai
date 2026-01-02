"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle2, RefreshCw, Send, Terminal } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'agent' | 'system' | 'error' | 'log';
  content: string;
  agentName?: string;
  logType?: string;
}

export function AgentChat() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          setMessages(prev => [...prev, { role: 'agent', content: data.content }]);
        } else if (data.type === 'system') {
          setMessages(prev => [...prev, { role: 'system', content: data.content }]);
        } else if (data.type === 'error') {
            setMessages(prev => [...prev, { role: 'error', content: data.content }]);
        } else if (data.type === 'log') {
            setMessages(prev => [...prev, {
                role: 'log',
                content: data.content,
                agentName: data.agentName,
                logType: data.logType
            }]);
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected) return;

    const message = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    socket.send(JSON.stringify({ type: 'chat', content: message }));
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const resetConversation = () => {
      if (!socket || !isConnected) return;
      socket.send(JSON.stringify({ type: 'reset' }));
      setMessages([]);
  }

  // Helper to group logs if they are sequential (optional optimization, but let's keep it simple first)

  return (
    <Card className="w-full max-w-4xl mx-auto h-[750px] flex flex-col shadow-2xl border-t-0 rounded-xl overflow-hidden bg-background">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-6 border-b bg-muted/30">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
                <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
                <CardTitle className="text-lg font-semibold tracking-tight">Pokus Assistant</CardTitle>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs text-muted-foreground font-medium">{isConnected ? 'System Online' : 'Offline'}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Collapsible open={isLogsOpen} onOpenChange={setIsLogsOpen}>
                <CollapsibleTrigger asChild>

                </CollapsibleTrigger>
            </Collapsible>
           <Button variant="outline" size="sm" className="h-8 w-8 p-0 ml-1" onClick={resetConversation} title="Reset">
               <RefreshCw className="w-3.5 h-3.5" />
           </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="flex flex-col p-6 gap-6 max-w-3xl mx-auto">
             {messages.length === 0 && (
                 <div className="text-center text-muted-foreground mt-32 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                     <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
                        <Terminal className="w-8 h-8 opacity-40" />
                     </div>
                     <h3 className="font-semibold text-lg text-foreground mb-1">Welcome back</h3>
                     <p className="max-w-xs mx-auto">I'm ready to help you with your tasks. What's on your mind?</p>
                 </div>
             )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'log' ? (
                     <Collapsible open={isLogsOpen} className={`${isLogsOpen ? 'block' : 'hidden'} w-full animate-in fade-in slide-in-from-left-2 duration-300`}>
                        <div className="w-full pl-3 ml-2 border-l-[1.5px] border-dashed border-zinc-300 dark:border-zinc-700 py-1 my-0.5 group hover:border-primary/50 transition-colors">
                             <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 mb-0.5 font-mono uppercase tracking-wider">
                                <Activity className="w-3 h-3 text-primary/70" />
                                <span className={msg.agentName ? 'text-primary/90 font-semibold' : ''}>{msg.agentName || 'System'}</span>
                                <span className="opacity-30">•</span>
                                <span>{msg.logType}</span>
                             </div>
                             <div className="text-[11px] text-muted-foreground font-mono pl-5 leading-relaxed break-words">
                                 {msg.content}
                             </div>
                        </div>
                    </Collapsible>
                ) : (
                    <div
                      className={`max-w-[85%] rounded-[1.25rem] px-6 py-4 shadow-sm transition-all ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : msg.role === 'system'
                          ? 'bg-muted/50 mx-auto text-muted-foreground text-xs font-medium py-1 px-3 rounded-full flex items-center gap-2 shadow-none border max-w-fit'
                          : msg.role === 'error'
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-md'
                          : 'bg-card border shadow-sm rounded-bl-sm dark:bg-zinc-800/80'
                      }`}
                    >
                      {msg.role === 'system' && <CheckCircle2 className="w-3 h-3" />}
                      {msg.role === 'user' || msg.role === 'system' || msg.role === 'error' ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-headings:font-semibold">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({node, inline, className, children, ...props}: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                      <div className="rounded-md overflow-hidden my-4 border">
                                          <div className="bg-muted px-4 py-1.5 text-xs text-muted-foreground font-mono border-b flex items-center justify-between">
                                              <span>{match[1]}</span>
                                          </div>
                                          <SyntaxHighlighter
                                            {...props}
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ margin: 0, borderRadius: 0 }}
                                          >
                                            {String(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                                      </div>
                                    ) : (
                                      <code {...props} className={className}>
                                        {children}
                                      </code>
                                    )
                                  }
                                }}
                              >
                                  {msg.content}
                              </ReactMarkdown>
                          </div>
                      )}
                    </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 bg-background border-t">
        <div className="flex w-full gap-3 relative max-w-4xl mx-auto">
          <Input
            className="flex-1 bg-muted/30 border-input/60 focus-visible:ring-primary/20 transition-all h-12 pl-4 rounded-xl shadow-inner"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!isConnected}
          />
          <Button onClick={sendMessage} disabled={!isConnected} className="h-12 w-12 rounded-xl shrink-0 shadow-sm" size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
