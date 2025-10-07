import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CircleAlert as AlertCircle, Mail, Lock, User, Phone, Sparkles, LogIn, UserPlus, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import ffbArenaLogo from "@/assets/ffb-arena-logo.jpg";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(50),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const { user, signIn, signUp, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Signup form state
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // Check for password recovery token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsPasswordRecovery(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isPasswordRecovery) {
      navigate("/");
    }
  }, [user, navigate, isPasswordRecovery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    setLoading(true);

    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });
      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setLoginErrors(errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    setLoading(true);

    try {
      const validated = signupSchema.parse({
        fullName,
        email: signupEmail,
        phoneNumber,
        password: signupPassword,
        confirmPassword,
      });

      const { error } = await signUp(
        validated.email,
        validated.password,
        validated.fullName,
        validated.phoneNumber || undefined
      );

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account Exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
        // Clear form
        setFullName("");
        setSignupEmail("");
        setPhoneNumber("");
        setSignupPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setSignupErrors(errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      z.string().email().parse(resetEmail);
      setLoading(true);
      const { error } = await resetPassword(resetEmail);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Sent",
          description: "Check your email for password reset instructions.",
        });
        setResetEmailSent(true);
        setResetEmail("");
      }
    } catch (error) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your password has been updated successfully!",
        });
        setIsPasswordRecovery(false);
        setNewPassword("");
        setConfirmNewPassword("");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(signupPassword);
  const strengthColors = ["bg-destructive", "bg-destructive", "bg-accent", "bg-secondary", "bg-secondary"];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  // If in password recovery mode, show update password form
  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border">
          <div className="text-center mb-8">
            <img
              src={ffbArenaLogo}
              alt="FFB ARENA"
              className="w-20 h-20 rounded-xl object-cover mx-auto mb-4 shadow-lg"
            />
            <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">Reset Password</h1>
            <p className="text-muted-foreground font-inter">Enter your new password</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            <Button type="submit" variant="premium" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse delay-1000 opacity-25"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-2000 opacity-20"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-secondary/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce delay-1100"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] animate-pulse"></div>
        
        {/* Moving Gradient Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-accent/30 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent animate-pulse delay-1500"></div>
      </div>

      {/* Main Card with Enhanced Animations */}
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl relative z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg blur-sm -z-10 animate-pulse"></div>
        
        <div className="text-center mb-8 space-y-4">
          {/* Animated Logo */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            <img
              src={ffbArenaLogo}
              alt="FFB ARENA"
              className="w-20 h-20 rounded-xl object-cover mx-auto relative z-10 shadow-2xl transform transition-transform duration-300 hover:scale-110 hover:rotate-3"
            />
          </div>
          
          {/* Animated Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-in slide-in-from-top-2 duration-1000">
              FFB ARENA
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1 animate-in slide-in-from-left-4 duration-1000 delay-300"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1 animate-in slide-in-from-right-4 duration-1000 delay-300"></div>
            </div>
            <p className="text-muted-foreground font-inter animate-in fade-in-0 duration-1000 delay-500 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              Your Premier Tournament Platform
              <Sparkles className="w-4 h-4 text-secondary animate-pulse delay-500" />
            </p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full animate-in fade-in-0 duration-1000 delay-700">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="login" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {showForgotPassword ? (
              <div className="space-y-4">
                {resetEmailSent && (
                  <Alert className="border-secondary/20 bg-secondary/5">
                    <AlertCircle className="h-4 w-4 text-secondary" />
                    <AlertDescription className="text-sm">
                      Password reset email sent! Please check your inbox. If you don't see it, check your spam or junk folder.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                      setResetEmailSent(false);
                    }}
                    disabled={loading}
                  >
                    {resetEmailSent ? "Back to Login" : "Cancel"}
                  </Button>
                  {!resetEmailSent && (
                    <Button
                      type="button"
                      variant="premium"
                      className="flex-1"
                      onClick={handleForgotPassword}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                  <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-100">
                    <Label htmlFor="login-email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`transition-all duration-300 focus:scale-[1.02] hover:shadow-md ${loginErrors.email ? "border-destructive animate-pulse" : "focus:border-primary"}`}
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-destructive animate-in slide-in-from-left-2 duration-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {loginErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-200">
                    <Label htmlFor="login-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`transition-all duration-300 focus:scale-[1.02] hover:shadow-md pr-10 ${loginErrors.password ? "border-destructive animate-pulse" : "focus:border-primary"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-sm text-destructive animate-in slide-in-from-left-2 duration-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {loginErrors.password}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-secondary hover:text-secondary/80 transition-all duration-200 hover:translate-x-1 animate-in fade-in-0 duration-500 delay-300 flex items-center gap-1"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetEmail(loginEmail);
                    }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Forgot Password?
                  </Button>

                  <Button 
                    type="submit" 
                    variant="premium" 
                    className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Logging in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Login
                      </div>
                    )}
                  </Button>
                </form>
              </>
            )}
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-100">
                <Label htmlFor="full-name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name *
                </Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`transition-all duration-300 focus:scale-[1.02] hover:shadow-md ${signupErrors.fullName ? "border-destructive animate-pulse" : "focus:border-primary"}`}
                />
                {signupErrors.fullName && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-2 duration-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {signupErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-200">
                <Label htmlFor="signup-email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email *
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={`transition-all duration-300 focus:scale-[1.02] hover:shadow-md ${signupErrors.email ? "border-destructive animate-pulse" : "focus:border-primary"}`}
                />
                {signupErrors.email && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-2 duration-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {signupErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-300">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`transition-all duration-300 focus:scale-[1.02] hover:shadow-md ${signupErrors.phoneNumber ? "border-destructive animate-pulse" : "focus:border-primary"}`}
                  maxLength={10}
                />
                {signupErrors.phoneNumber && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-2 duration-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {signupErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-400">
                <Label htmlFor="signup-password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={`transition-all duration-300 focus:scale-[1.02] hover:shadow-md pr-10 ${signupErrors.password ? "border-destructive animate-pulse" : "focus:border-primary"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupPassword && (
                  <div className="space-y-1 animate-in fade-in-0 duration-300">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "Enter a password"}
                    </p>
                  </div>
                )}
                {signupErrors.password && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-2 duration-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {signupErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-500">
                <Label htmlFor="confirm-password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Confirm Password *
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`transition-all duration-300 focus:scale-[1.02] hover:shadow-md ${signupErrors.confirmPassword ? "border-destructive animate-pulse" : "focus:border-primary"}`}
                />
                {signupErrors.confirmPassword && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-2 duration-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {signupErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                variant="premium" 
                className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </div>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground animate-in fade-in-0 duration-500 delay-700">
                By signing up, you agree to our Terms & Conditions
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
