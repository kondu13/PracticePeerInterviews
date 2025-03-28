import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Define schemas locally
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  experienceLevel: z.string(),
  skills: z.array(z.string()).default([]),
  targetRole: z.string().optional(),
  bio: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/auth');
  const { toast } = useToast();

  // Get mode from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const defaultMode = urlParams.get('mode') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(defaultMode);
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Login form handling
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  // Register form handling
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      experienceLevel: 'beginner',
      skills: [],
      targetRole: '',
      bio: '',
    },
  });

  function onRegisterSubmit(data: RegisterFormValues) {
    // Remove confirmPassword field before sending to API
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Form Section */}
      <div className="flex-1 p-6 flex flex-col justify-center items-center">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">InterviewPeer</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Practice mock interviews with peers who share your career goals
            </p>
          </div>

          <Tabs 
            defaultValue={activeTab} 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <div className="space-y-4 py-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'Logging in...' : 'Log In'}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab('register')}
                    >
                      Register here
                    </Button>
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <div className="space-y-4 py-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password (min. 6 characters)" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-sm font-medium">Professional Details</h3>
                      <FormField
                        control={registerForm.control}
                        name="experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your experience level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="targetRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Role</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Frontend Developer, Data Scientist" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills (comma-separated)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., JavaScript, React, Node.js" 
                                onChange={(e) => {
                                  const skills = e.target.value
                                    .split(',')
                                    .map(skill => skill.trim())
                                    .filter(Boolean);
                                  field.onChange(skills);
                                }}
                                // Convert array to comma-separated string for display
                                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio (optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself and your interview goals" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab('login')}
                    >
                      Log in here
                    </Button>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-r from-primary to-primary/80 p-10 text-white">
        <div className="max-w-md mx-auto flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">Improve Your Interview Skills</h1>
          <p className="text-lg mb-8">
            Practice with peers who understand your career goals. Give and receive valuable feedback 
            to prepare for your dream job interviews.
          </p>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-white/10 p-2 mt-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Match with peers</h3>
                <p className="text-sm opacity-90">Find partners with similar experience and interests</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-white/10 p-2 mt-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Schedule mock interviews</h3>
                <p className="text-sm opacity-90">Book sessions at times that work for you</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-white/10 p-2 mt-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Get valuable feedback</h3>
                <p className="text-sm opacity-90">Improve with constructive feedback after each session</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}