import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    setLocation("/dashboard");
    return null;
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 md:px-6 md:py-4">
        <div className="container mx-auto flex max-w-screen-xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M10 16l-6-6 6-6" />
              <path d="M20 10v4a2 2 0 0 1-2 2H8" />
            </svg>
            <span className="text-xl font-bold">MockMate</span>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/auth">
              <button className="rounded-md border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
                Sign in
              </button>
            </Link>
            <Link to="/auth">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-primary/5 to-white">
        <div className="container mx-auto flex max-w-screen-xl flex-col items-center justify-center px-4 py-12 md:flex-row md:py-24">
          <div className="mb-10 md:mb-0 md:w-1/2">
            <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Practice Mock Interviews with Peers
            </h1>
            <p className="mb-6 text-lg text-gray-600">
              Enhance your interviewing skills through peer interactions and personalized feedback.
              Connect with professionals in your field for realistic interview practice.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Link to="/auth">
                <button className="rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90">
                  Get Started
                </button>
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="relative rounded-lg bg-white p-6 shadow-lg">
              <div className="absolute -left-3 -top-3 rounded-full bg-primary p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="mb-3 mt-2 text-xl font-bold">
                Get feedback from peers in your industry
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 mt-1 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Match with professionals at your experience level</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 mt-1 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Practice both technical and behavioral interviews</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 mt-1 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Schedule sessions at times that work for you</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 md:py-24">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Our platform makes it easy to connect with peers and practice your interviewing skills
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                1
              </div>
              <h3 className="mb-3 text-xl font-bold">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and tell us about your experience level, skills, and what types of interviews you want to practice.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                2
              </div>
              <h3 className="mb-3 text-xl font-bold">Match with Peers</h3>
              <p className="text-gray-600">
                Browse available peers or let our system match you with someone who aligns with your goals and schedule.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                3
              </div>
              <h3 className="mb-3 text-xl font-bold">Practice & Improve</h3>
              <p className="text-gray-600">
                Conduct mock interviews, receive feedback, and improve your skills through repeated practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-12 text-white">
        <div className="container mx-auto max-w-screen-xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to ace your next interview?</h2>
          <Link to="/auth">
            <button className="rounded-md bg-white px-6 py-3 font-medium text-primary hover:bg-gray-100">
              Start practicing today
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-2 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M10 16l-6-6 6-6" />
                <path d="M20 10v4a2 2 0 0 1-2 2H8" />
              </svg>
              <span className="text-lg font-bold">MockMate</span>
            </div>
            <div className="text-center text-sm text-gray-500 md:text-right">
              © {new Date().getFullYear()} MockMate. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}