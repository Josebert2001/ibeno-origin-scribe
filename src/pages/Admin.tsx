import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, FileText, BarChart3, Shield, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import CertificateForm from "@/components/CertificateForm";
import CertificatesDashboard from "@/components/CertificatesDashboard";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status when user changes
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .eq('role', 'admin')
                .single();
                
              setIsAdmin(!error && !!data);
            } catch (error) {
              console.error('Error checking admin status:', error);
              setIsAdmin(false);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Successfully signed out.",
      });
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-green-600 dark:text-green-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-red-950 dark:via-pink-950 dark:to-orange-950">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-800 dark:text-red-200">Access Denied</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              You don't have admin permissions to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      <header className="border-b bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="ibnOrigin Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-800 dark:text-green-200">
                  ibnOrigin Admin
                </h1>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Certificate of Origin Portal
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <UserIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {user.email}
              </span>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="hover:bg-red-50 hover:border-red-200 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="create" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg h-12">
              <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                <FileText className="h-4 w-4" />
                Create Certificate
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <BarChart3 className="h-4 w-4" />
                View Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg border-b border-green-200 dark:border-green-700">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Issue Certificate of Origin
                  </CardTitle>
                  <CardDescription className="text-base">
                    Fill out the form below to generate a new Certificate of Origin.
                    <span className="text-important font-semibold"> Important: </span>
                    <span className="text-warning">All fields marked with * are required.</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <CertificateForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard">
              <CertificatesDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;