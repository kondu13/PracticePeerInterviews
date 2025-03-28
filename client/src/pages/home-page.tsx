import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
              Practice Interviews
            </span>
            <br /> With Peers Who Share Your Goals
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Connect with peers, practice interview scenarios, and improve your skills through
            real feedback. Book mock interviews with others in your field.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="text-lg px-8 py-6 h-auto" 
              size="lg"
              asChild
            >
              <Link href={user ? "/dashboard" : "/auth?mode=register"}>
                {user ? "Go to Dashboard" : "Join Now"}
              </Link>
            </Button>
            {!user && (
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 h-auto"
                size="lg"
                asChild
              >
                <Link href="/auth">
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A simple process to find peers, schedule interviews, and improve your skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Profile
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sign up and build your profile with your skills, experience level, and target roles. Help us match you with compatible peers.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Match With Peers
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Send match requests to peers with similar interests or accept requests from others. Find the perfect interview partner.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Schedule Interviews
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Book interview slots, add meeting details, and prepare for your mock interviews. Practice makes perfect!
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Real Practice, Real Improvement
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="flex-shrink-0 h-6 w-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Realistic Interview Practice:</strong> Experience authentic interview scenarios with peers who understand your industry.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 h-6 w-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Mutual Feedback:</strong> Give and receive constructive feedback to identify areas for improvement.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 h-6 w-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Flexible Scheduling:</strong> Book interviews when it's convenient for you.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 h-6 w-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Build Your Network:</strong> Connect with others in your field and expand your professional network.
                </p>
              </li>
            </ul>
            <div className="mt-8">
              <Button asChild>
                <Link href={user ? "/dashboard" : "/auth?mode=register"}>
                  {user ? "Go to Dashboard" : "Get Started"}
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=2070" 
              alt="Two people in an interview" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto bg-primary text-white rounded-xl p-10 shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join our community of job seekers helping each other improve through practice and feedback.
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="text-primary"
              asChild
            >
              <Link href={user ? "/dashboard" : "/auth?mode=register"}>
                {user ? "Go to Dashboard" : "Start Practicing Today"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">InterviewPeer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Practice Mock Interviews with Peers
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} InterviewPeer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}