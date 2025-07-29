import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Eye,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Printer,
  Loader2
} from "lucide-react";
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
  created_by: string;
  our_ref: string;
  your_ref: string;
  certificate_html_url?: string;
  certificate_pdf_url?: string;
}

const CertificatesDashboard = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCerts, setDownloadingCerts] = useState<Set<string>>(new Set());
  const [printingCerts, setPrintingCerts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Filter certificates based on search and status
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.bearer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.native_of.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200",
          label: "Valid"
        };
      case 'superseded':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
          label: "Superseded"
        };
      case 'revoked':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200",
          label: "Revoked"
        };
      case 'invalid':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200",
          label: "Invalid"
        };
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200",
          label: status
        };
    }
  };

  // Statistics
  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === 'valid').length,
    superseded: certificates.filter(c => c.status === 'superseded').length,
    revoked: certificates.filter(c => c.status === 'revoked').length
  };

  // Handle certificate status change
  const handleStatusChange = async (certId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: newStatus })
        .eq('id', certId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Certificate status updated to ${newStatus}`,
      });

      fetchCertificates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update certificate status",
        variant: "destructive"
      });
    }
  };

  // View certificate (redirect to verification page)
  const handleViewCertificate = (certificateNumber: string) => {
    window.open(`/verify?cert_id=${certificateNumber}`, '_blank');
  };

  // Download certificate as HTML
  const handleDownloadCertificate = async (cert: Certificate) => {
    const certId = cert.certificate_number;
    
    try {
      setDownloadingCerts(prev => new Set(prev).add(certId));
      
      // Check if we have a stored PDF file URL first (priority)
      if (cert.certificate_pdf_url) {
        // Download PDF directly from storage
        window.open(cert.certificate_pdf_url, '_blank');
        toast({
          title: "PDF Download Started",
          description: `Certificate ${certId} PDF is being downloaded from storage.`,
        });
      } else if (cert.certificate_html_url) {
        // Fallback to HTML download from storage
        window.open(cert.certificate_html_url, '_blank');
        toast({
          title: "HTML Download Started", 
          description: `Certificate ${certId} HTML is being downloaded. Use "Print to PDF" to convert.`,
        });
      } else {
        // Fallback: Generate certificate on demand
        const qrCodeData = `${window.location.origin}/verify?cert_id=${certId}`;
        
        const { data, error } = await supabase.functions.invoke('generate-certificate', {
          body: {
            ourRef: cert.our_ref,
            yourRef: cert.your_ref,
            dateIssued: cert.date_issued,
            certificateNumber: cert.certificate_number,
            bearerName: cert.bearer_name,
            nativeOf: cert.native_of,
            village: cert.village,
            qrCodeData
          }
        });

        if (error) throw error;

        // Download the certificate HTML file with improved formatting
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate_${certId}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Download Complete",
          description: `Certificate ${certId} downloaded. Open the file and use your browser's "Print to PDF" feature for best results.`,
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download certificate",
        variant: "destructive"
      });
    } finally {
      setDownloadingCerts(prev => {
        const updated = new Set(prev);
        updated.delete(certId);
        return updated;
      });
    }
  };

  // Print certificate
  const handlePrintCertificate = async (cert: Certificate) => {
    const certId = cert.certificate_number;
    
    try {
      setPrintingCerts(prev => new Set(prev).add(certId));
      
      const qrCodeData = `${window.location.origin}/verify?cert_id=${certId}`;
      
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: {
          ourRef: cert.our_ref,
          yourRef: cert.your_ref,
          dateIssued: cert.date_issued,
          certificateNumber: cert.certificate_number,
          bearerName: cert.bearer_name,
          nativeOf: cert.native_of,
          village: cert.village,
          qrCodeData
        }
      });

      if (error) throw error;

      // Open print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.focus();
        
        printWindow.onload = () => {
          printWindow.print();
        };
        
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      toast({
        title: "Print Ready",
        description: `Certificate ${certId} opened for printing`,
      });
    } catch (error: any) {
      console.error('Print error:', error);
      toast({
        title: "Print Failed",
        description: "Failed to prepare certificate for printing",
        variant: "destructive"
      });
    } finally {
      setPrintingCerts(prev => {
        const updated = new Set(prev);
        updated.delete(certId);
        return updated;
      });
    }
  };

  // Delete certificate
  const handleDeleteCertificate = async (cert: Certificate) => {
    if (!confirm(`Are you sure you want to delete certificate ${cert.certificate_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', cert.id);

      if (error) throw error;

      toast({
        title: "Certificate Deleted",
        description: `Certificate ${cert.certificate_number} has been deleted successfully`,
      });

      fetchCertificates();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete certificate",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.valid}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Valid Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.superseded}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Superseded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.revoked}</p>
                <p className="text-sm text-red-600 dark:text-red-400">Revoked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Certificates Dashboard
          </CardTitle>
          <CardDescription>
            View and manage all issued certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Certificates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, certificate number, village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-40 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="valid">Valid</option>
                <option value="superseded">Superseded</option>
                <option value="revoked">Revoked</option>
                <option value="invalid">Invalid</option>
              </select>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Certificate No.</TableHead>
                  <TableHead>Bearer Name</TableHead>
                  <TableHead>Native Of</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" ? "No certificates match your filters" : "No certificates found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCertificates.map((cert) => {
                    const statusDisplay = getStatusDisplay(cert.status);
                    return (
                      <TableRow key={cert.id} className="hover:bg-muted/25 transition-colors">
                        <TableCell className="font-mono text-sm font-medium">
                          {cert.certificate_number}
                        </TableCell>
                        <TableCell className="font-medium">{cert.bearer_name}</TableCell>
                        <TableCell>{cert.native_of}</TableCell>
                        <TableCell>{cert.village}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(cert.date_issued), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusDisplay.color} variant="outline">
                            {statusDisplay.icon}
                            <span className="ml-1">{statusDisplay.label}</span>
                          </Badge>
                        </TableCell>
                         <TableCell>
                           <div className="flex items-center justify-center gap-1">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleViewCertificate(cert.certificate_number)}
                               className="h-8 w-8 p-0"
                               title="View Certificate"
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDownloadCertificate(cert)}
                               disabled={downloadingCerts.has(cert.certificate_number)}
                               className="h-8 w-8 p-0"
                               title="Download Certificate"
                             >
                               {downloadingCerts.has(cert.certificate_number) ? (
                                 <Loader2 className="h-4 w-4 animate-spin" />
                               ) : (
                                 <Download className="h-4 w-4" />
                               )}
                             </Button>
                             
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handlePrintCertificate(cert)}
                               disabled={printingCerts.has(cert.certificate_number)}
                               className="h-8 w-8 p-0"
                               title="Print Certificate"
                             >
                               {printingCerts.has(cert.certificate_number) ? (
                                 <Loader2 className="h-4 w-4 animate-spin" />
                               ) : (
                                 <Printer className="h-4 w-4" />
                               )}
                             </Button>
                             
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                   <MoreVertical className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem
                                   onClick={() => handleStatusChange(cert.id, 'valid')}
                                   disabled={cert.status === 'valid'}
                                 >
                                   <CheckCircle className="h-4 w-4 mr-2" />
                                   Mark as Valid
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                   onClick={() => handleStatusChange(cert.id, 'revoked')}
                                   disabled={cert.status === 'revoked'}
                                 >
                                   <XCircle className="h-4 w-4 mr-2" />
                                   Mark as Revoked
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                   onClick={() => handleStatusChange(cert.id, 'superseded')}
                                   disabled={cert.status === 'superseded'}
                                 >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Mark as Superseded
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteCertificate(cert)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Certificate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                           </div>
                         </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredCertificates.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredCertificates.length} of {certificates.length} certificates
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificatesDashboard;