import PageMetadata from "@/components/PageMetadata";

const Terms = () => {
  return (
    <>
      <PageMetadata 
        title="Terms of Service - ibnOrigin"
        description="The terms and conditions governing the use of ibnOrigin."
        keywords="terms of service, terms, conditions, ibnOrigin"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
        <header className="border-b bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Terms of Service</h1>
            <p className="text-muted-foreground mt-2">Effective date: August 8, 2025</p>
          </div>
        </header>

        <main id="main-content" className="container mx-auto px-4 py-10 space-y-10">
          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using ibnOrigin (the “Service”), you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Use of the Service</h2>
            <ul>
              <li>Only authorized administrators may issue certificates.</li>
              <li>Public users may verify certificates for authenticity.</li>
              <li>You agree not to misuse or attempt to circumvent platform security.</li>
            </ul>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Intellectual Property</h2>
            <p>
              All logos, marks, and content are owned by their respective holders. You may not reproduce or distribute materials without permission.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Disclaimers</h2>
            <p>
              The Service is provided “as is” without warranties of any kind. We do not guarantee error-free or uninterrupted operation.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ibnOrigin shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Service.
            </p>
          </section>

          <section className="prose prose-green max-w-3xl dark:prose-invert">
            <h2>Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use after changes constitutes acceptance of the revised Terms.
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

export default Terms;
