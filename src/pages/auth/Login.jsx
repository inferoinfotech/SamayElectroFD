import { LoginForm } from "@/components/LoginForm";


export default function LoginPage() {
  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-muted p-6 md:p-10"
      style={{
        backgroundImage: "url('/images/solar-bg.webp')", // Replace with your solar-themed image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 flex w-full flex-col md:flex-row overflow-hidden">
        {/* Left Section - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center md:p-8 p-4 ">
         
          <LoginForm />
        </div>

        {/* Empty right section - removed the image but maintains layout */}
        <div className="hidden lg:block w-1/2"></div>
      </div>
    </div>
  );
}