import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { ConverterWidget } from "@/components/converter-widget"
import { AIChatWidget } from "@/components/ai-chat-widget"
import { ConvertersGrid } from "@/components/converters-grid"
import { PopularConverters } from "@/components/popular-converters"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  //make false for maintanace mode
   if(true){
  return (
   
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ConverterWidget />
        {/* <AIChatWidget /> */}
        {/* <ConvertersGrid /> */}
        {/* <PopularConverters /> */}
        {/* <FeaturesSection /> */}
      </main>
      <Footer />
    </div>
  )
  }else{

  }
}
