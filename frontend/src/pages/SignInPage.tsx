import { SignInForm } from "@/components/auth/SignInForm";

const SignInPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0 bg-linear-to-t from-muted via-muted to-purple-500">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignInForm />
      </div>
    </div>
  );
};

export default SignInPage;
