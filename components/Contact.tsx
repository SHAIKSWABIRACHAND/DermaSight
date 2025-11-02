import React from 'react';
import { MailIcon } from './icons';

const Contact: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">Contact Us</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          We're here to help. Reach out with any questions or feedback.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-lg shadow-md grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Get in Touch</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            If you have questions about our service, need technical assistance, or want to provide feedback, please use the contact information below. Our team will get back to you as soon as possible.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MailIcon className="h-6 w-6 text-teal-500" />
              <a href="mailto:support@dermasight.ai" className="text-slate-700 dark:text-slate-200 hover:text-teal-500">
                support@dermasight.ai
              </a>
            </div>
             <div className="flex items-center space-x-3">
              <span className="text-teal-500 font-bold text-lg">P:</span>
              <span className="text-slate-700 dark:text-slate-200">
                (555) 123-4567
              </span>
            </div>
             <div className="flex items-start space-x-3">
              <span className="text-teal-500 font-bold text-lg">A:</span>
              <span className="text-slate-700 dark:text-slate-200">
                123 Health Tech Ave, Suite 100, San Francisco, CA 94105
              </span>
            </div>
          </div>
        </div>
         <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Feedback Form</h2>
             <form className="space-y-4">
                 <div>
                     <label htmlFor="name" className="sr-only">Name</label>
                     <input type="text" id="name" placeholder="Your Name" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-teal-500 focus:border-teal-500 text-slate-800 dark:text-slate-100" />
                 </div>
                 <div>
                     <label htmlFor="email" className="sr-only">Email</label>
                     <input type="email" id="email" placeholder="Your Email" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-teal-500 focus:border-teal-500 text-slate-800 dark:text-slate-100" />
                 </div>
                 <div>
                     <label htmlFor="message" className="sr-only">Message</label>
                     <textarea id="message" rows={5} placeholder="Your Message" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-teal-500 focus:border-teal-500 text-slate-800 dark:text-slate-100"></textarea>
                 </div>
                 <button type="submit" className="w-full py-2 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                     Send Message
                 </button>
             </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
