import { Bot, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useHomeData } from "../hooks/useHomeData";
import { useChatAssistant } from "../hooks/useChatAssistant";

export function ChatAssistant() {
    const { chatMessages } = useHomeData();
    const { chatInput, setChatInput, handleSend } = useChatAssistant();

    return (
        <section>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Setup Assistant
                    </h2>

                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-[8px]">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                    </span>
                </div>

                <Bot className="w-4 h-4 text-slate-300" />
            </div>

            {/* Card */}
            <Card className="bg-white rounded-[8px] border border-slate-100 flex flex-col overflow-hidden shadow-none h-[420px]">

                {/* HEADER (FIXED) */}
                <CardHeader className="px-4 py-3 border-b border-slate-100 flex flex-row items-center gap-2.5 bg-slate-50/60 space-y-0">
                    <Avatar className="w-7 h-7 rounded-[8px]">
                        <AvatarFallback className="bg-slate-950">
                            <Bot className="w-3.5 h-3.5 text-slate-100" />
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <p className="text-xs font-semibold text-slate-700">
                            Claude Code Assistant
                        </p>
                        <p className="text-[10px] text-slate-400">
                            Routing & page configuration engine
                        </p>
                    </div>
                </CardHeader>

                {/* CONTENT (FIXED) */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="px-4 py-4 space-y-3">

                            {chatMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2.5 ${msg.role === "user"
                                            ? "flex-row-reverse"
                                            : "flex-row"
                                        }`}
                                >
                                    <Avatar className="w-6 h-6 mt-0.5">
                                        {msg.role === "assistant" ? (
                                            <AvatarFallback className="bg-slate-950">
                                                <Bot className="w-3 h-3 text-slate-100" />
                                            </AvatarFallback>
                                        ) : (
                                            <AvatarFallback className="bg-slate-200 text-[9px] font-bold text-slate-600">
                                                AW
                                            </AvatarFallback>
                                        )}
                                    </Avatar>

                                    <div
                                        className={`max-w-[78%] rounded-[8px] px-3 py-2 ${msg.role === "assistant"
                                                ? "bg-slate-50 border border-slate-100 text-slate-700"
                                                : "bg-slate-950 text-slate-50"
                                            }`}
                                    >
                                        <p className="text-xs leading-relaxed">
                                            {msg.text}
                                        </p>
                                        <p
                                            className={`text-[10px] mt-1 font-mono ${msg.role === "assistant"
                                                    ? "text-slate-400"
                                                    : "text-slate-500"
                                                }`}
                                        >
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            <div className="flex gap-2.5">
                                <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-slate-950">
                                        <Bot className="w-3 h-3 text-slate-100" />
                                    </AvatarFallback>
                                </Avatar>

                                <div className="bg-slate-50 border border-slate-100 rounded-[8px] px-3 py-2.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>

                        </div>
                    </ScrollArea>
                </CardContent>

                {/* FOOTER */}
                <CardFooter className="px-3 py-3 border-t border-slate-100 bg-slate-50/40">
                    <div className="flex w-full items-center gap-2">
                        <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Send a message..."
                            className="flex-1 h-8 px-3 rounded-[8px] border-slate-200 bg-white text-xs text-slate-700 placeholder-slate-400 shadow-none focus-visible:ring-2 focus-visible:ring-slate-950/10 focus-visible:border-slate-300"
                        />

                        <Button
                            onClick={handleSend}
                            size="icon"
                            className="w-8 h-8 rounded-[8px] bg-slate-950 border border-slate-800 text-slate-50 hover:bg-slate-800 transition-colors flex-shrink-0"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardFooter>

            </Card>
        </section>
    );
}