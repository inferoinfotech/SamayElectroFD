import { sendOTP } from "@/api/auth";
import { useState } from "react";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "/images/biglogo.webp";

export function ForgotPasswordForm({ onOTPSent }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await sendOTP(email);
            toast.success("OTP sent successfully!");
            onOTPSent(email);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="text-center ">
            <a href="#" className="flex items-center justify-center gap-2 font-medium">
              <img src={logo} alt="Logo" width={300} />
            </a>
                <CardTitle className="text-xl">Forgot Password</CardTitle>
                <CardDescription>Enter your email to receive an OTP.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full hover:cursor-pointer" disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
