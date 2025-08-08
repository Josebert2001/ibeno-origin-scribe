import PageMetadata from "@/components/PageMetadata";

const Privacy = () => {
  return (
    <>
      <PageMetadata 
        title="Privacy Policy - ibnOrigin"
        description="Learn how ibnOrigin collects, uses, and protects your data."
        keywords="privacy policy, data protection, ibnOrigin"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
        <header className="border-b bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Privacy Policy</h1>
            <p className="text-muted-foreground mt-2">Effective date: August 8, 2025</p>
          </div>
        </header>

        <main id="main-content" className="container mx-auto px-4 py-10 space-y-10">
          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Introduction</h2>
            <p>
              This Privacy Policy describes how ibnOrigin (the “Service”) collects, uses, and safeguards 
              your information when you use our certificate issuance and verification platform.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Information We Collect</h2>
            <ul>
              <li>Account information (e.g., email) for administrators</li>
              <li>Certificate data (bearer name, native of, village, issuance date)</li>
              <li>Technical data (analytics and performance metrics)</li>
            </ul>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>How We Use Information</h2>
            <ul>
              <li>To generate and verify Certificates of Origin</li>
              <li>To secure and audit administrative access</li>
              <li>To improve reliability, security, and user experience</li>
            </ul>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Data Sharing</h2>
            <p>
              We do not sell personal data. We may share limited data with service providers to operate 
              the platform (e.g., hosting, analytics) under strict confidentiality and security obligations.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Security</h2>
            <p>
              We implement role-based access control, Row Level Security (RLS), and monitoring to protect data. 
              Despite safeguards, no system is entirely secure—use strong passwords and keep credentials safe.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your personal information where applicable. 
              Contact us using the details below.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Contact</h2>
            <p>
              ibnOrigin Support<br />
              Email: contact@example.com
            </p>
          </section>
        </main>
      </div>
    </>
  );
};

export default Privacy;
