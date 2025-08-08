import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageMetadata from "@/components/PageMetadata";
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <PageMetadata 
        title="Page Not Found - ibnOrigin"
        description="The page you are looking for does not exist on ibnOrigin."
        keywords="404, not found, ibnOrigin"
      />
      <main id="main-content" className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
          <a href="/" className="text-primary underline">
            Return to Home
          </a>
        </div>
      </main>
    </>
  );
};

export default NotFound;
