import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ProjectCard } from "@/components/ProjectCard";
import { apiRequest } from "@/lib/queryClient";

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  framework: string;
  language: string | null;
  status: "draft" | "building" | "ready" | "deployed" | "error" | null;
  sourceCode: unknown;
  deployUrl: string | null;
  isPublic: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Zod schema للنموذج
const createProjectFormSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  framework: z.string().min(1, "الإطار مطلوب"),
  language: z.string().min(1, "اللغة مطلوبة"),
  prompt: z.string().min(1, "الوصف مطلوب"),
  description: z.string().optional(),
});

export type CreateProjectForm = z.infer<typeof createProjectFormSchema>;

export default function Dashboard() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      framework: "react",
      language: "javascript",
      prompt: "",
      description: "",
    },
  });

  // استعلام المشاريع
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/projects");
      const data = await res.json();
      return data.map((p: any) => ({
        ...p,
        description: p.description ?? null,
        language: p.language ?? null,
        status: p.status ?? null,
        deployUrl: p.deployUrl ?? null,
        isPublic: p.isPublic ?? null,
        createdAt: p.createdAt ? new Date(p.createdAt) : null,
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : null,
      }));
    },
    retry: false,
  });

  // إعادة توجيه إذا لم يكن المستخدم مسجّل الدخول
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  // إنشاء مشروع
  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "نجح إنشاء المشروع",
        description: "سيتم إنشاء الكود تلقائياً في الخلفية",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في إنشاء المشروع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // حذف مشروع
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => await apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "تم حذف المشروع بنجاح" });
    },
  });

  const onSubmit: SubmitHandler<CreateProjectForm> = (data) => {
    createProjectMutation.mutate(data);
  };

  // فلترة المشاريع
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading || projectsLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header و Dialog إنشاء المشروع */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> {t("dashboard.new.project")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dashboard.new.project")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.project.name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Framework */}
                <FormField
                  control={form.control}
                  name="framework"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.project.framework")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر إطار العمل" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="react">React</SelectItem>
                            <SelectItem value="vue">Vue.js</SelectItem>
                            <SelectItem value="angular">Angular</SelectItem>
                            <SelectItem value="svelte">Svelte</SelectItem>
                            <SelectItem value="nodejs">Node.js</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.project.language")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر لغة البرمجة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="php">PHP</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Prompt */}
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.project.prompt")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} className={isRTL ? "text-right" : "text-left"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.project.description")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t("button.cancel")}
                  </Button>
                  <Button type="submit" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? t("button.loading") : t("button.create")}
                  </Button>

                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث في المشاريع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
            <SelectItem value="building">جاري الإنشاء</SelectItem>
            <SelectItem value="ready">جاهز</SelectItem>
            <SelectItem value="deployed">منشور</SelectItem>
            <SelectItem value="error">خطأ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onDelete={(id) => deleteProjectMutation.mutate(id)} />
        ))}
      </div>
    </div>
  );
}
