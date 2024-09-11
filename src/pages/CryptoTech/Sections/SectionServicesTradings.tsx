export const SectionServicesTradings = () => {
  return (
    <section className="flex w-full flex-col justify-between gap-6 font-extrabold text-white">
      <div className="animate-pulse-heart absolute -right-24 h-80 w-80 rounded-full bg-gradient-conic-secundary opacity-50 blur-3xl"></div>
      <h2>Cryptocurrency Investments</h2>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <div className="container-services">
          <h5>
            Package
            <strong className="px-1.5 text-strong-primary">Basic</strong>
            Monthly
          </h5>
          <h5>$12,000.00</h5>
          <div className="flex flex-col gap-1.5">
            <p>Free Domain</p>
            <p>Free Hosting</p>
            <p>Simple Application Development</p>
            <p>Process Automation</p>
            <p>Monitoring with Monthly Reports</p>
            <p>Technical Support via Email within 48 hours</p>
            <p>Basic Performance Analysis</p>
            <p>Basic SEO</p>
            <p>Monthly Security Updates with Patches</p>
            <p>Basic UX/UI Analysis and Improvement</p>
            <p>Basic Content Migration</p>
            <p>Integration with 5 APIs and 2 External Services</p>
            <p>Training and Consultancy Scheduled within 5 Days</p>
          </div>
          <button className="button-colorido">Get Now</button>
        </div>
        <div className="container-services">
          <h5>
            Package
            <strong className="px-1.5 text-strong-primary">Intermediate</strong>
            Monthly
          </h5>
          <h5>$20,000.00</h5>
          <div className="flex flex-col gap-1.5">
            <p>Free Domain</p>
            <p>Free Hosting</p>
            <p>Intermediate Application Development</p>
            <p>Process Automation with Employee Assistance</p>
            <p>Monitoring with Weekly Traffic Reports</p>
            <p>Technical Support via Email and WhatsApp within 6 Hours</p>
            <p>Basic Performance Analysis</p>
            <p>Intermediate SEO with Keyword Research</p>
            <p>Biweekly Security Updates with Patches</p>
            <p>Detailed UX/UI Analysis and Improvement</p>
            <p>Basic Content and Database Migrations</p>
            <p>Integration with 20 APIs and 4 External Services</p>
            <p>Training and Consultancy Scheduled within 3 Days</p>
          </div>
          <button className="button-colorido">Get Now</button>
        </div>
        <div className="container-services">
          <h5>
            Package
            <strong className="px-1.5 text-strong-primary">Advanced</strong>
            Monthly
          </h5>
          <h5>$27,000.00</h5>
          <div className="flex flex-col gap-1.5">
            <p>Free Domain with Email</p>
            <p>Free Hosting</p>
            <p>Advanced Application Development</p>
            <p>Process Automation with Internal and External Assistance</p>
            <p>Monitoring with Daily Reports</p>
            <p>Immediate Technical Support via Email and WhatsApp</p>
            <p>Advanced Performance Analysis and Optimization</p>
            <p>SEO with Keyword Research and Monthly Reports</p>
            <p>Daily Security Updates</p>
            <p>UX/UI Analysis and Improvement with Redesign and A/B Testing</p>
            <p>Content, Database, and Services Migration</p>
            <p>Unlimited Integrations and External Services</p>
            <p>Personalized Training and Consultancy</p>
          </div>
          <button className="button-colorido">Get Now</button>
        </div>
      </div>
    </section>
  );
};
