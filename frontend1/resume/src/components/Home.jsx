import { useRef } from 'react';
import Hero from './Hero';
import TrustedPartners from './TrustedPartners';
import About from './About';
import Stats from './Stats';
import PlatformModules from './PlatformModules';
import FAQ from './FAQ';

function Home() {
  const sectionRef = useRef(null);

  return (
    <div className="bg-black">
      <Hero />
      <TrustedPartners />
      
      <section id="about" ref={sectionRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen min-h-screen w-full overflow-hidden bg-black">
          {/* Tiled background */}
          <div
            className="absolute inset-0 bg-top bg-repeat"
            style={{
              backgroundImage: "url('/gotbackground.png')",
              backgroundSize: "400px 400px",
            }}
          />

          {/* Dark overlays */}
          <div className="absolute inset-0 bg-black/80 sm:bg-black/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.85)_100%)]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
            {/* About Content */}
            <div className="w-full max-w-6xl">
              <About sectionRef={sectionRef} />
            </div>

            {/* Stats */}
            <div className="w-full">
              <Stats />
            </div>
          </div>
        </div>
      </section>

      <PlatformModules />
      <FAQ />
    </div>
  );
}

export default Home;
