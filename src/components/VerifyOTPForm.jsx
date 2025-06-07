import { verifyOTP } from "@/api/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp";

export function VerifyOTPForm({ email, onVerified }) {
    const [otp, setOtp] = useState(""); // Ensure OTP is a string
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.trim(); // No need to join, OTP is already a string

        if (otpString.length !== 6) {
            toast.error("Please enter all 6 digits.");
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(email, otpString);
            toast.success("OTP verified successfully!");
            onVerified();
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Verify OTP</CardTitle>
                <CardDescription>Enter the OTP sent to {email}.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        <div className="grid gap-2 justify-center">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <Button type="submit" className="w-full hover:cursor-pointer" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
