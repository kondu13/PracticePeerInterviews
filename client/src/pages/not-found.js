import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="mb-4 text-6xl font-extrabold text-primary">404</h1>
      <h2 className="mb-6 text-3xl font-bold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link to="/">
        <button className="rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90">
          Go back home
        </button>
      </Link>
    </div>
  );
}