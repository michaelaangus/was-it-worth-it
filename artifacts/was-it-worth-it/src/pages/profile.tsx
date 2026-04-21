import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  reflectionWindowDays: z.coerce.number().min(1).max(90),
  emailReminders: z.boolean(),
  inAppReminders: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Profile · Was It Worth It?";
  }, []);

  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      reflectionWindowDays: 14,
      emailReminders: false,
      inAppReminders: true,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        reflectionWindowDays: profile.reflectionWindowDays,
        emailReminders: profile.emailReminders,
        inAppReminders: profile.inAppReminders,
      });
    }
  }, [profile, form]);

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="w-full h-64 rounded-xl" />
      </Layout>
    );
  }

  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate(
      { data },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetProfileQueryKey(), updated);
          toast({ title: "Settings saved" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
      }
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Profile & Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reflection Rules</CardTitle>
            <CardDescription>
              Control how long you wait before reflecting on a purchase. A longer wait helps eliminate buyer's high.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="reflectionWindowDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reflection Window</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select days" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="7">7 Days</SelectItem>
                          <SelectItem value="14">14 Days (Recommended)</SelectItem>
                          <SelectItem value="21">21 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Number of days to wait after a purchase before it's ready for reflection.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  
                  <FormField
                    control={form.control}
                    name="emailReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Reminders</FormLabel>
                          <FormDescription>
                            Get an email when purchases are ready for reflection.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inAppReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">In-App Reminders</FormLabel>
                          <FormDescription>
                            Show notifications within the app dashboard.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full uppercase font-bold tracking-wider" disabled={updateProfile.isPending || !form.formState.isDirty}>
                  {updateProfile.isPending ? "SAVING..." : "SAVE SETTINGS"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
