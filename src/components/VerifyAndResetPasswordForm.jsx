import { verifyOtpAndResetPassword } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function VerifyAndResetPasswordForm({ email }) {
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await verifyOtpAndResetPassword(email, otp, password);
            toast.success("Password reset successful! Redirecting...");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            toast.error("Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Verify OTP & Reset Password</CardTitle>
                <CardDescription>Enter the OTP and set a new password.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="otp">OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full hover:cursor-pointer" disabled={loading}>
                            {loading ? "Processing..." : "Reset Password"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
