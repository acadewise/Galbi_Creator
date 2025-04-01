import { useState } from "react";
import { FAQ } from "@/types";

const faqs: FAQ[] = [
  {
    question: "What AI technology powers the generations?",
    answer: "Galbi Creator uses the latest OpenAI models optimized for both 2D art and 3D model generation. Our technology combines multiple AI approaches for optimal results."
  },
  {
    question: "What file formats are supported for download?",
    answer: "For 2D art, we support PNG, JPG, and SVG formats. For 3D models, we offer OBJ, FBX, GLB, and STL formats suitable for various 3D software and 3D printing."
  },
  {
    question: "Are there any usage limitations?",
    answer: "Free accounts can generate up to 10 images and 5 3D models per day. Premium accounts enjoy unlimited generations and access to higher-quality outputs and additional features."
  }
];

export default function HelpSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };
  
  return (
    <section id="help" className="mt-16 bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold font-poppins mb-6">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">1</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Enter Your Prompt</h3>
          <p className="text-gray-600">Describe what you want to create. Be specific about style, colors, mood, and contents for best results.</p>
        </div>
        
        <div className="p-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">2</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Adjust Settings</h3>
          <p className="text-gray-600">Fine-tune your creation by selecting style, complexity, and other parameters to get exactly what you want.</p>
        </div>
        
        <div className="p-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">3</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Download & Share</h3>
          <p className="text-gray-600">Once generated, download your creations in multiple formats or share them directly with others.</p>
        </div>
      </div>
      
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <button 
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="font-medium">{faq.question}</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className={`mt-2 ${openFaqIndex === index ? '' : 'hidden'}`}>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
