import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const certificateSchema = z.object({
  bearerName: z.string().min(2, "Bearer name must be at least 2 characters"),
  nativeOf: z.string().min(2, "Native of must be at least 2 characters"),
  village: z.string().min(2, "Village must be at least 2 characters"),
  dateIssued: z.date({
    required_error: "Date is required",
  }),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

const CertificateForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      bearerName: "",
      nativeOf: "",
      village: "",
      dateIssued: new Date(),
    },
  });

  const onSubmit = async (data: CertificateFormData) => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to create certificates",
          variant: "destructive",
        });
        return;
      }

      // Generate reference numbers and certificate number
      const { data: ourRefData, error: ourRefError } = await supabase.rpc('generate_our_ref');
      const { data: yourRefData, error: yourRefError } = await supabase.rpc('generate_your_ref');
      const { data: certNumberData, error: certNumberError } = await supabase.rpc('generate_certificate_number');

      if (ourRefError || yourRefError || certNumberError) {
        throw new Error("Failed to generate reference numbers");
      }

      // Create QR code data (URL for verification)
      const qrCodeData = `${window.location.origin}/verify?cert_id=${certNumberData}`;

      // Insert certificate into database
      const { data: certificate, error: insertError } = await supabase
        .from('certificates')
        .insert({
          our_ref: ourRefData,
          your_ref: yourRefData,
          date_issued: format(data.dateIssued, 'yyyy-MM-dd'),
          certificate_number: certNumberData,
          bearer_name: data.bearerName,
          native_of: data.nativeOf,
          village: data.village,
          qr_code_data: qrCodeData,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Success",
        description: `Certificate ${certNumberData} created successfully!`,
      });

      // Reset form
      form.reset();

    } catch (error: any) {
      console.error('Certificate creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create certificate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bearerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bearer Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter full name of bearer"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Full name of the person receiving the certificate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateIssued"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Issuance</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date when the certificate is being issued
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nativeOf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Native Of (City/Town)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter city or town of origin"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  City or town where the bearer is from
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="village"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Village</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter village name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Specific village within the city/town
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading ? "Creating..." : "Generate Certificate"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CertificateForm;