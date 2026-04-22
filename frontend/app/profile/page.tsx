"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
    const [user, setUser] = useState<{
        name: string;
        email: string;
    } | null>(null);

    useEffect(() => {
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");
        if (name || email) {
            setUser({ name: name || "", email: email || "" });
        }
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="" alt={user.name} />
                            <AvatarFallback className="bg-blue-500 text-white text-2xl font-medium">
                                {getInitials(user.name || user.email)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Họ tên</p>
                        <p className="font-medium">{user.name || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user.email || "Chưa cập nhật"}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
