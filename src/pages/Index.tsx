import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Search, FileText, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
                Ibeno Local Government
              </h1>
              <p className="text-green-600 dark:text-green-400">
                Certificate of Origin Portal
              </p>
            </div>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link to="/verify">Verify Certificate</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Admin Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-green-800 dark:text-green-200 mb-6">
            Digital Certificate of Origin
          </h2>
          <p className="text-xl text-green-600 dark:text-green-400 max-w-3xl mx-auto">
            Secure, verifiable, and instant certificate issuance and verification system
            for Ibeno Local Government Area, Akwa Ibom State.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-200">
                Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Each certificate is protected with unique QR codes and digital signatures
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Search className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-200">
                Verifiable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instant verification through our online portal or QR code scanning
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <FileText className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-200">
                Official
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Authorized by Ibeno Local Government for all indigenous verification needs
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Users className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-200">
                Accessible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Available 24/7 for verification by employers, institutions, and agencies
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
              Ready to get started?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="min-w-48">
                <Link to="/verify">
                  <Search className="h-5 w-5 mr-2" />
                  Verify Certificate
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-48">
                <Link to="/auth">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Access
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Unity and Labour - Akwa Ibom State</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
