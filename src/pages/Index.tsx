import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Search, FileText, Users, ArrowRight, CheckCircle, Clock, Globe } from "lucide-react";
import PageMetadata from "@/components/PageMetadata";
import { analytics } from "@/utils/analytics";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

const Index = () => {
  usePerformanceMonitoring();

  useEffect(() => {
    analytics.page('Home');
  }, []);

  return (
    <>
      <PageMetadata 
        title="ibnOrigin - Digital Certificate of Origin Portal"
        description="Official digital certificate of origin verification system for Ibeno Local Government Area, Akwa Ibom State. Secure, verifiable, and instant certificate issuance."
        keywords="Ibeno, certificate, origin, verification, government, digital, secure, official, Akwa Ibom"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img 
                    src="/logo.png?v=2" 
                    alt="ibnOrigin Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-200">
                    ibnOrigin
                  </h1>
                  <p className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">
                    Ibeno Local Government
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-500">
                    Certificate of Origin Portal
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button asChild variant="ghost" className="hover:bg-green-50 dark:hover:bg-green-900/20 text-sm sm:text-base">
                <Link to="/verify" className="flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Verify Certificate</span>
                  <span className="sm:hidden">Verify</span>
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-sm sm:text-base">
                <Link to="/auth" className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Portal</span>
                  <span className="sm:hidden">Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="container mx-auto px-4">
        {/* Enhanced Hero */}
        <section className="py-12 sm:py-16 md:py-20 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              Official Government Portal
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-800 dark:text-green-200 mb-4 md:mb-6 leading-tight">
              Digital Certificate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                of Origin
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-green-600 dark:text-green-400 max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-4">
              Secure, verifiable, and instant certificate issuance and verification system
              for Ibeno Local Government Area, Akwa Ibom State.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 md:mb-16 px-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                <Link to="/verify" className="flex items-center justify-center gap-2">
                  <Search className="w-4 md:w-5 h-4 md:h-5" />
                  Verify Certificate
                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-green-200 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20 text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                <Link to="/auth" className="flex items-center justify-center gap-2">
                  <Shield className="w-4 md:w-5 h-4 md:h-5" />
                  Admin Access
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-200 mb-2">100%</h3>
              <p className="text-green-600 dark:text-green-400">Secure & Verified</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-200 mb-2">24/7</h3>
              <p className="text-green-600 dark:text-green-400">Always Available</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                <Globe className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Global</h3>
              <p className="text-green-600 dark:text-green-400">Recognition</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 md:py-16 px-4">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
              Why Choose Our Platform?
            </h3>
            <p className="text-base md:text-lg text-green-600 dark:text-green-400 max-w-2xl mx-auto">
              Experience the future of certificate management with our advanced digital platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg md:text-xl">
                  Secure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm md:text-base leading-relaxed">
                  Each certificate is protected with unique QR codes and digital signatures for maximum security
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Search className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg md:text-xl">
                  Verifiable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm md:text-base leading-relaxed">
                  Instant verification through our online portal or QR code scanning technology
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg md:text-xl">
                  Official
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm md:text-base leading-relaxed">
                  Authorized by Ibeno Local Government for all indigenous verification needs
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg md:text-xl">
                  Accessible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm md:text-base leading-relaxed">
                  Available 24/7 for verification by employers, institutions, and agencies worldwide
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 px-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to get started?
            </h3>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-green-100">
              Join thousands who trust our secure certificate platform
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50 shadow-lg text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                <Link to="/verify" className="flex items-center justify-center gap-2">
                  <Search className="w-4 md:w-5 h-4 md:h-5" />
                  Verify Certificate
                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-green-600 hover:bg-white hover:text-green-600 text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                <Link to="/auth" className="flex items-center justify-center gap-2">
                  <Shield className="w-4 md:w-5 h-4 md:h-5" />
                  Admin Access
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-12 text-center border-t border-green-200 dark:border-green-800 px-4">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png?v=2" 
                alt="ibnOrigin Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-green-800 dark:text-green-200 text-sm md:text-base">
              ibnOrigin
            </span>
          </div>
          <p className="text-green-600 dark:text-green-400 mb-2">
            Ibeno Local Government Area
          </p>
          <p className="text-sm text-green-500 dark:text-green-500">
            Certificate of Origin Portal
          </p>
        </footer>
      </main>
      </div>
    </>
  );
};

export default Index;