import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "@/api/auth";
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
import { toast } from "sonner"

import { Eye, EyeOff } from "lucide-react"; // Import eye icons
import logo from "/images/biglogo.webp";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password must be different from old password!");
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword(oldPassword, newPassword);

      toast.success(response?.message || "Password updated successfully");

      // Reset fields after success
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect after success
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted p-6 md:p-10">
      <a href="#" className="flex items-center gap-2 font-medium ">
        <img src={logo} alt="Logo"  />
      </a>
      <Card className="w-full max-w-lg shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>Update your password securely.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Old Password */}
            <div className="relative">
              <Label htmlFor="old-password" className={`mb-2`}>
                Old Password
              </Label>
              <Input
                id="old-password"
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500 hover:cursor-pointer hover:text-gray-700"
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <Label htmlFor="new-password" className={`mb-2`}>
                New Password
              </Label>
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500 hover:cursor-pointer hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Label htmlFor="confirm-password" className={`mb-2`}>
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500 hover:cursor-pointer hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
