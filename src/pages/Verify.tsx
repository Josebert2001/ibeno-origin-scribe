import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
            Certificate Verification Portal
          </h1>
          <p className="text-green-600 dark:text-green-400 mt-2">
            Ibeno Local Government - Certificate of Origin
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Verify Certificate
            </CardTitle>
            <CardDescription>
              Enter the certificate ID or scan the QR code to verify authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="cert-id">Certificate ID</Label>
                <Input
                  id="cert-id"
                  placeholder="Enter certificate ID (e.g., PNG 000725 1)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <Button 
                onClick={() => handleVerify()} 
                disabled={loading}
                className="mt-6"
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>

            {searched && certificate && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Certificate Details</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(certificate.status)}
                      <Badge className={getStatusColor(certificate.status)}>
                        {certificate.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Certificate Number
                      </Label>
                      <p className="font-mono text-sm">{certificate.certificate_number}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Date of Issuance
                      </Label>
                      <p>{format(new Date(certificate.date_issued), "PPP")}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Bearer Name
                      </Label>
                      <p className="font-medium">{certificate.bearer_name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Native Of
                      </Label>
                      <p>{certificate.native_of}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Village
                      </Label>
                      <p>{certificate.village}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Issuing Authority
                      </Label>
                      <p>Ibeno Local Government</p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Security Features
                    </Label>
                    <p className="text-sm">
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
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <XCircle className="h-12 w-12 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-700">
                      Certificate Not Found
                    </h3>
                    <p className="text-muted-foreground">
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