import Layout from "@/components/Layout";
import { Zap } from "lucide-react";

export default function Placeholder({ title, description }) {
  return (
    <Layout>
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Zap className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground font-medium mb-8">
            {description}
          </p>
          <div className="bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg p-6 border border-accent/30 backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              This page is ready to be built! Continue prompting with specific features and details you'd like to see implemented.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
