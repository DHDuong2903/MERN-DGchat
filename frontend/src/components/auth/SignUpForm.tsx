import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

const signUpSchema = z.object({
  firstName: z.string().min(1, "Please enter your first name"),
  lastName: z.string().min(1, "Please enter your last name"),
  username: z.string().min(3, "Please enter your username"),
  email: z.email("Email is invalid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    const { firstName, lastName, username, email, password } = data;

    // Goi api backend
    await signUp(firstName, lastName, username, email, password);

    navigate("/signin");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <img className="w-16 mx-auto" src="logo.png" alt="logo" />
          <CardTitle className="text-xl">Create DgChat account</CardTitle>
          <CardDescription>Enter your email below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-2">
              <Field>
                <FieldLabel htmlFor="firstName">FirstName</FieldLabel>
                <Input id="firstName" type="text" placeholder="Duong" {...register("firstName")} />
                {errors.firstName && <FieldError>{errors.firstName.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">LastName</FieldLabel>
                <Input id="lastName" type="text" placeholder="Do" {...register("lastName")} />
                {errors.lastName && <FieldError>{errors.lastName.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="username">UserName</FieldLabel>
                <Input id="username" type="text" placeholder="DgChat" {...register("username")} />
                {errors.username && <FieldError>{errors.username.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  Create Account
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="/signin">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
