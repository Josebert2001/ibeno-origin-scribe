import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, CheckCircle, XCircle, AlertCircle, Shield, FileText, Calendar, MapPin, User, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Certificate {
  id: string;
  certificate_number: string;
  bearer_name: string;
  native_of: string;
  village: string;
  date_issued: string;
  status: string;
  created_at: string;
}

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if cert_id is in URL params (from QR code scan)
    const certId = searchParams.get('cert_id');
    if (certId) {
      setCertificateId(certId);
      handleVerify(certId);
    }
  }, [searchParams]);

  const handleVerify = async (certId?: string) => {
    const idToSearch = certId || certificateId;
    
    if (!idToSearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter a certificate ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', idToSearch.trim())
        .single();

      if (error || !data) {
        setCertificate(null);
        toast({
          title: "Certificate Not Found",
          description: "No certificate found with this ID",
          variant: "destructive",
        });
      } else {
        setCertificate(data);
        toast({
          title: "Certificate Found",
          description: "Certificate details loaded successfully",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setCertificate(null);
      toast({
        title: "Error",
        description: "Failed to verify certificate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'invalid':
      case 'revoked':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invalid':
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      <header className="border-b bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90">
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Ibeno Local Government Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
                Certificate Verification Portal
              </h1>
            </div>
          </div>
          <p className="text-green-600 dark:text-green-400">
            Ibeno Local Government - Certificate of Origin
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              Verify Certificate
            </CardTitle>
            <CardDescription>
              Enter the certificate ID or scan the QR code to verify authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="cert-id" className="text-sm font-medium mb-2 block">Certificate ID</Label>
                <Input
                  id="cert-id"
                  placeholder="Enter certificate ID (e.g., IBN25 0001)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  className="h-12 border-green-200 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
              <Button 
                onClick={() => handleVerify()} 
                disabled={loading}
                className="mt-6 h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Verify
                  </div>
                )}
              </Button>
            </div>

            {searched && certificate && (
              <>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Certificate Details
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(certificate.status)}
                      <Badge className={`${getStatusColor(certificate.status)} px-3 py-1 text-sm font-medium`}>
                        {certificate.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Certificate Number
                      </Label>
                      <p className="font-mono text-base font-semibold bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                        {certificate.certificate_number}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date of Issuance
                      </Label>
                      <p className="text-base font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                        {format(new Date(certificate.date_issued), "PPP")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Bearer Name
                      </Label>
                      <p className="text-base font-semibold bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                        {certificate.bearer_name}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Native Of
                      </Label>
                      <p className="text-base font-medium bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                        {certificate.native_of}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Village
                      </Label>
                      <p className="text-base font-medium bg-teal-50 dark:bg-teal-900/20 px-3 py-2 rounded-lg">
                        {certificate.village}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Issuing Authority
                      </Label>
                      <p className="text-base font-semibold bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                        Ibeno Local Government
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                    <Label className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4" />
                      Security Features
                    </Label>
                    <p className="text-sm leading-relaxed text-green-700 dark:text-green-300">
                      This certificate is protected by unique QR code verification and digital
                      signatures. The certificate data is stored securely and can be verified
                      at any time using this portal.
                    </p>
                  </div>
                </div>
              </>
            )}

            {searched && !certificate && !loading && (
              <>
                <Separator />
                <div className="text-center space-y-6 py-8">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-red-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                      Certificate Not Found
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      No certificate was found with the provided ID. Please check the ID and try again.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Verify;