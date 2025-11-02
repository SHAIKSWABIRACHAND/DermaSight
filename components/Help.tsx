import React, { useState } from 'react';

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <h2>
        <button
          type="button"
          className="flex justify-between items-center w-full py-5 font-medium text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 px-4 rounded-md"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span>{title}</span>
          <svg
            className={`w-6 h-6 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </h2>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
            <div className="px-5 py-4 text-slate-600 dark:text-slate-400 prose prose-slate dark:prose-invert max-w-none">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

const faqData = [
  {
    title: "What is DermaSight AI?",
    content: "DermaSight AI is an advanced dermatology assistant that uses artificial intelligence to analyze images of skin conditions. It provides a preliminary analysis to help both patients and doctors understand potential skin issues, assess severity, and decide on next steps."
  },
  {
    title: "Is this a replacement for a real doctor?",
    content: "Absolutely not. DermaSight AI is an informational tool, not a diagnostic one. It is designed to assist, not replace, professional medical advice. Always consult a qualified dermatologist for a definitive diagnosis and treatment plan."
  },
  {
    title: "How accurate is the AI analysis?",
    content: "Our AI is trained on a vast dataset of clinical images and is highly accurate in identifying patterns associated with common skin conditions. However, its accuracy can be affected by image quality (lighting, focus, angle). It provides probabilities, not certainties, and should be used as a supportive tool."
  },
  {
    title: "Is my data and image private?",
    content: "Yes. We prioritize your privacy. Images and data are processed securely and are not stored long-term or used for any purpose other than providing your analysis. We do not require personally identifiable information to use the service."
  },
   {
    title: "What kind of photo should I upload for the best results?",
    content: "For the best analysis, please provide a clear, well-focused photo taken in good, natural light. Ensure the area of concern is fully visible. Avoid blurry images, shadows, or photos taken from too far away."
  },
];

const Help: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">Help & FAQ</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Your guide to understanding and using DermaSight AI effectively.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-l-4 border-teal-500 pl-4">How to Use DermaSight AI</h2>
          <ol className="list-decimal list-inside space-y-3 text-slate-600 dark:text-slate-400">
            <li><strong>Select Your Role:</strong> Choose 'Patient' for easy-to-understand results or 'Doctor' for a detailed clinical dashboard.</li>
            <li><strong>Upload Your Image:</strong> Upload a clear, well-lit photo of the skin area you're concerned about.</li>
            <li><strong>Add Optional Details:</strong> Provide a patient name (or leave as 'Anonymous') and any relevant notes, like symptoms or duration.</li>
            <li><strong>Analyze:</strong> Click the 'Analyze' button and let our AI provide a detailed report in seconds.</li>
            <li><strong>Review Results:</strong> Carefully read the generated dashboard, paying attention to probabilities, recommendations, and image quality feedback.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-l-4 border-teal-500 pl-4">Frequently Asked Questions</h2>
          <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md">
            {faqData.map((item, index) => (
              <AccordionItem key={index} title={item.title}>
                <p>{item.content}</p>
              </AccordionItem>
            ))}
          </div>
        </section>

        <section className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-l-4 border-yellow-500 pl-4">AI Capabilities & Limitations</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            DermaSight AI is a powerful tool, but it's important to understand its limitations.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            <li>The AI provides a preliminary analysis, <strong>not a medical diagnosis.</strong></li>
            <li>Results are based on pattern recognition and may not be accurate for rare conditions or atypical presentations.</li>
            <li>Poor image quality will significantly reduce the accuracy of the analysis.</li>
            <li>The AI does not consider medical history, genetics, or other non-visual factors.</li>
            <li><strong>Always consult a healthcare professional</strong> for any medical concerns.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Help;
