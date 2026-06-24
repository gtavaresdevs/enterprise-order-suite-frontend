import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";

interface ProfileAvatarCardProps {
    name: string;
    role: string;
    avatarSrc?: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onTriggerUpload: () => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatarCard({
    name,
    role,
    avatarSrc,
    fileInputRef,
    onTriggerUpload,
    onUpload,
}: ProfileAvatarCardProps) {
    // Compute initials for the AvatarFallback
    const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <Card className="border-slate-100">
            <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="relative group">
                    <Avatar className="w-24 h-24 border-2 border-slate-200">
                        <AvatarImage src={avatarSrc} className="object-cover" />
                        <AvatarFallback className="text-3xl font-bold bg-slate-100 text-slate-400">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        size="icon"
                        onClick={onTriggerUpload}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-950 border-2 border-white text-slate-50 hover:bg-slate-800 shadow-md"
                    >
                        <Camera className="w-3.5 h-3.5" />
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUpload}
                    />
                </div>

                <div className="flex flex-col items-center gap-0.5 text-center">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                    <Badge variant="outline" className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 border-emerald-100 px-2 py-0.5 rounded-[8px] gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                    </Badge>
                </div>

                <div className="w-full flex flex-col gap-2">
                    <Button
                        variant="outline"
                        className="w-full h-8 rounded-[8px] border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        onClick={onTriggerUpload}
                    >
                        Upload new photo
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center">
                        JPG, PNG, or GIF · max 4MB
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}