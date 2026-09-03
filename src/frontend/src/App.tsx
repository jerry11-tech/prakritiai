import { Layout } from "./components/Layout";
import { ExpertDashboard } from "./components/expert/ExpertDashboard";
import { ResearchDashboard } from "./components/research/ResearchDashboard";
import { About } from "./components/sections/About";
import { CTA } from "./components/sections/CTA";
import { Demo } from "./components/sections/Demo";
import { Features } from "./components/sections/Features";
import { Hero } from "./components/sections/Hero";
import { HowItWorks } from "./components/sections/HowItWorks";
import { RecommendationsSection } from "./components/sections/Recommendations";
import { TechStack } from "./components/sections/TechStack";

export default function App() {
  return (
    <Layout>
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Demo />
      <ExpertDashboard />
      <ResearchDashboard />
      <RecommendationsSection />
      <TechStack />
      <CTA />
    </Layout>
  );
}
