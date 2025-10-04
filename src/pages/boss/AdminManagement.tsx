import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Phone, Trash2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
}

const AdminManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all admin users
  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      const adminIds = adminRoles.map(role => role.user_id);
      
      if (adminIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", adminIds)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      return profiles as AdminProfile[];
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (adminData: { email: string; password: string; fullName: string; phoneNumber?: string }) => {
      // Sign up the new admin
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            full_name: adminData.fullName,
            phone_number: adminData.phoneNumber,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: "admin" })
        .eq("user_id", authData.user.id);

      if (roleError) throw roleError;

      return authData.user;
    },
    onSuccess: () => {
      toast({
        title: "Admin Created",
        description: "New admin account has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsCreateDialogOpen(false);
      setEmail("");
      setPassword("");
      setFullName("");
      setPhoneNumber("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: "player" })
        .eq("user_id", adminId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Admin Removed",
        description: "Admin role has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin",
        variant: "destructive",
      });
    },
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    createAdminMutation.mutate({ email, password, fullName, phoneNumber });
  };

  const filteredAdmins = admins?.filter(admin =>
    admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout showBottomNav={false}>
      <PageHeader
        title="Admin Management"
        showBack={true}
        subtitle="Create and manage admin accounts"
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createAdminMutation.isPending}>
                {createAdminMutation.isPending ? "Creating..." : "Create Admin Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAdmins && filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin) => (
              <Card key={admin.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">{admin.full_name}</CardTitle>
                  <Badge variant="secondary">Admin</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      {admin.email}
                    </div>
                    {admin.phone_number && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {admin.phone_number}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAdminMutation.mutate(admin.id)}
                        disabled={deleteAdminMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No admins found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default AdminManagement;
