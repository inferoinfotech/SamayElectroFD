import { useState } from "react";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { VerifyOTPForm } from "@/components/VerifyOTPForm";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";


export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  return (
    <div 
      className="relative flex min-h-svh items-center justify-center bg-muted p-6 md:p-10"
      style={{
        backgroundImage: "url('/images/solar-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay to make content more readable */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 flex w-full flex-col md:flex-row overflow-hidden">
        {/* Left Section - Forms */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center md:p-8 p-4">
          <div className="w-full max-w-sm flex flex-col gap-6 shadow-lg">
            
            {step === 1 && (
              <ForgotPasswordForm
                onOTPSent={(email) => {
                  setEmail(email);
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <VerifyOTPForm email={email} onVerified={() => setStep(3)} />
            )}
            {step === 3 && <ResetPasswordForm email={email} />}
          </div>
        </div>

        {/* Empty right section - maintains layout consistency */}
        <div className="hidden lg:block w-1/2"></div>
      </div>
    </div>
  );
}