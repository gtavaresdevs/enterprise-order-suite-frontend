import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";

interface ProfileAvatarCardProps {
    firstName: string;
    lastName: string;
    role: string;
    avatarSrc?: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onTriggerUpload: () => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatarCard({
    firstName,
    lastName,
    role,
    avatarSrc,
    fileInputRef,
    onTriggerUpload,
    onUpload,
}: ProfileAvatarCardProps) {
    const displayName = `${firstName} ${lastName}`.trim();
    const initials = (firstName?.[0] || "") + (lastName?.[0] || "");

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
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUpload}
                    />
                </div>

                <div className="flex flex-col items-center gap-0.5 text-center">
                    <p className="text-sm font-semibold text-slate-800">{displayName}</p>
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
                        Upload Photo
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center">
                        JPG, PNG, or GIF · max 4MB
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}