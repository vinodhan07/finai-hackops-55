import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { 
  Plus, 
  Calendar, 
  Bell, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Reminder {
  id: number;
  title: string;
  description: string | null;
  amount: number | null;
  due_date: string;
  category: string | null;
  priority: string | null;
  completed: boolean | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const categories = [
  "utilities",
  "insurance", 
  "subscriptions",
  "rent",
  "loan",
  "tax",
  "maintenance",
  "other"
];

const priorities = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const Reminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    amount: "",
    due_date: "",
    category: "utilities",
    priority: "medium"
  });

  const fetchReminders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.due_date || !user) return;
    
    try {
      const reminderData = {
        title: newReminder.title,
        description: newReminder.description || null,
        amount: newReminder.amount ? parseFloat(newReminder.amount) : null,
        due_date: newReminder.due_date,
        category: newReminder.category,
        priority: newReminder.priority,
        user_id: user.id,
        completed: false
      };

      const { data, error } = await supabase
        .from('reminders')
        .insert([reminderData])
        .select()
        .single();

      if (error) throw error;

      setReminders([...reminders, data]);
      setNewReminder({
        title: "",
        description: "",
        amount: "",
        due_date: "",
        category: "utilities",
        priority: "medium"
      });
      setIsDialogOpen(false);
      toast.success('Reminder created successfully!');
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    }
  };

  const handleDeleteReminder = async (reminderId: number) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(reminders.filter(reminder => reminder.id !== reminderId));
      toast.success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const markAsCompleted = async (reminderId: number) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ completed: true })
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(reminders.map(r =>
        r.id === reminderId
          ? { ...r, completed: true }
          : r
      ));
      toast.success('Reminder marked as completed');
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const getStatusColor = (completed: boolean | null, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (completed) return 'bg-success-light text-budget-good border-budget-good';
    if (daysUntilDue < 0) return 'bg-destructive/10 text-destructive border-destructive';
    if (daysUntilDue <= 3) return 'bg-warning-light text-budget-warning border-budget-warning';
    return 'bg-muted text-muted-foreground border-muted-foreground';
  };

  const getStatusText = (completed: boolean | null, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (completed) return 'Completed';
    if (daysUntilDue < 0) return `Overdue by ${Math.abs(daysUntilDue)} days`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    if (daysUntilDue <= 7) return `Due in ${daysUntilDue} days`;
    return `Due in ${daysUntilDue} days`;
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case 'utilities': return '⚡';
      case 'insurance': return '🛡️';
      case 'subscriptions': return '📱';
      case 'rent': return '🏠';
      case 'loan': return '🏦';
      case 'tax': return '📄';
      case 'maintenance': return '🔧';
      default: return '📋';
    }
  };

  const totalUpcoming = reminders
    .filter(r => !r.completed && r.amount)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const dueSoon = reminders.filter(r => {
    const today = new Date();
    const due = new Date(r.due_date);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return !r.completed && daysUntilDue <= 7;
  }).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reminders</h1>
            <p className="text-muted-foreground">Manage your upcoming tasks and bills</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Pay electricity bill"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Additional details"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹) - Optional</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1200"
                    value={newReminder.amount}
                    onChange={(e) => setNewReminder({ ...newReminder, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newReminder.due_date}
                    onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newReminder.priority} onValueChange={(value) => setNewReminder({ ...newReminder, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newReminder.category} onValueChange={(value) => setNewReminder({ ...newReminder, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center gap-2">
                            {getCategoryIcon(cat)}
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddReminder} className="w-full gradient-primary">
                  Create Reminder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{totalUpcoming.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Pending payments</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Due Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-warning">{dueSoon}</div>
              <p className="text-xs text-muted-foreground">Within 7 days</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-vivid">{reminders.length}</div>
              <p className="text-xs text-muted-foreground">Active reminders</p>
            </CardContent>
          </Card>
        </div>

        {/* Reminders List */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Bell className="w-5 h-5 mr-2 text-budget-warning" />
              Your Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your reminders...</p>
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reminders yet. Create your first reminder to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getCategoryIcon(reminder.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-card-foreground">{reminder.title}</h3>
                          <Badge className={`text-xs ${getStatusColor(reminder.completed, reminder.due_date)}`}>
                            {getStatusText(reminder.completed, reminder.due_date)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(reminder.due_date).toLocaleDateString()}
                          </p>
                          {reminder.priority && (
                            <Badge variant="outline" className="text-xs">
                              {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} Priority
                            </Badge>
                          )}
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {reminder.amount && (
                        <div className="text-right">
                          <p className="font-bold text-card-foreground">₹{reminder.amount.toLocaleString()}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        {!reminder.completed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsCompleted(reminder.id)}
                            className="text-budget-good hover:text-budget-good"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-destructive mr-2" />
                                Delete Reminder
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{reminder.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Reminder
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reminders;