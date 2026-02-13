import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-status-critical/30 to-status-critical/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-status-critical animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-status-critical to-status-critical/70 bg-clip-text text-transparent mb-2">
            404
          </h1>
          <p className="text-2xl font-bold text-foreground mb-2">Page not found</p>
          <p className="text-muted-foreground font-medium mb-8">
            The page <span className="font-mono text-accent">"{location.pathname}"</span> does not exist.
          </p>
          <div className="bg-gradient-to-r from-status-critical/20 to-status-critical/5 rounded-lg p-6 border border-status-critical/30 backdrop-blur-sm mb-8">
            <p className="text-sm font-medium text-foreground">
              Please use the sidebar menu to navigate to the correct page.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-accent to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
