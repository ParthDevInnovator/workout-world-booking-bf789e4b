import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <div className="animate-fade-in-up flex flex-col items-center">
        <h1 className="font-display text-[160px] leading-none tracking-wider text-[#c8f04b] sm:text-[220px]">
          404
        </h1>
        <p className="mt-4 text-lg text-[#888] sm:text-xl">Page not found</p>
        <Link
          to="/"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-[#c8f04b] px-10 font-display text-xl tracking-wider text-black transition hover:opacity-90 active:scale-[0.97]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
