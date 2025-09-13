import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, TrendingUp, Calendar, DollarSign, PiggyBank, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  created_at: string;
  description?: string;
  status?: string;
  tenant_id?: string;
  updated_at?: string;
  user_id?: string;
  // Legacy fields for UI compatibility
  auto_debit?: boolean;
  monthly_contribution?: number;
}

const categories = [
  { value: "emergency", label: "Emergency Fund", icon: "🛡️" },
  { value: "vacation", label: "Vacation", icon: "✈️" },
  { value: "car", label: "Car Purchase", icon: "🚗" },
  { value: "house", label: "House Down Payment", icon: "🏠" },
  { value: "education", label: "Education", icon: "🎓" },
  { value: "retirement", label: "Retirement", icon: "🏖️" },
  { value: "investment", label: "Investment", icon: "📈" },
  { value: "other", label: "Other", icon: "💰" }
];

const Savings = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    target_amount: "",
    target_date: "",
    priority: "medium" as 'high' | 'medium' | 'low',
    category: "emergency",
    auto_debit: false,
    monthly_contribution: ""
  });

  useEffect(() => {
    const fetchSavingsGoals = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching savings goals:', error);
        return;
      }
      
      if (data) {
        setGoals(data.map(goal => ({
          ...goal,
          priority: goal.priority as 'high' | 'medium' | 'low',
          auto_debit: false, // Default value for UI compatibility
          monthly_contribution: 0 // Default value for UI compatibility
        })));
      }
    };
    
    fetchSavingsGoals();
  }, [user]);

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount || !newGoal.target_date || !user) return;
    
    const goalData = {
      user_id: user.id,
      title: newGoal.title,
      target_amount: parseFloat(newGoal.target_amount),
      target_date: newGoal.target_date,
      priority: newGoal.priority,
      category: newGoal.category,
    };

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([goalData])
      .select()
      .single();

    if (error) {
      console.error('Error creating savings goal:', error);
      toast.error('Failed to create savings goal');
      return;
    }

    if (data) {
      setGoals([{
        ...data,
        priority: data.priority as 'high' | 'medium' | 'low',
        auto_debit: false, // Default value for UI compatibility
        monthly_contribution: 0 // Default value for UI compatibility
      }, ...goals]);
      setNewGoal({
        title: "",
        target_amount: "",
        target_date: "",
        priority: "medium",
        category: "emergency",
        auto_debit: false,
        monthly_contribution: ""
      });
      setIsDialogOpen(false);
      toast.success('Savings goal created successfully!');
    }
  };

  const addContribution = async (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = Math.min(goal.current_amount + amount, goal.target_amount);
    
    const { error } = await supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId);

    if (error) {
      console.error('Error updating savings goal:', error);
      toast.error('Failed to add contribution');
      return;
    }

    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, current_amount: newAmount }
        : g
    ));
    toast.success(`₹${amount.toLocaleString()} added to your savings goal!`);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-budget-good';
    if (progress >= 75) return 'text-budget-success';
    if (progress >= 50) return 'text-budget-warning';
    return 'text-budget-danger';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-budget-danger bg-destructive/10';
      case 'medium': return 'text-budget-warning bg-warning-light';
      case 'low': return 'text-budget-good bg-success-light';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const today = new Date();
    const target = new Date(deadline);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 30) return `${diffDays} days left`;
    
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    
    if (months === 1) return `1 month${remainingDays > 0 ? ` ${remainingDays} days` : ''} left`;
    return `${months} months${remainingDays > 0 ? ` ${remainingDays} days` : ''} left`;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : "💰";
  };

  const getTotalSaved = () => goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const getTotalTarget = () => goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const getOverallProgress = () => {
    const total = getTotalTarget();
    const saved = getTotalSaved();
    return total > 0 ? (saved / total) * 100 : 0;
  };

  const achievedGoals = goals.filter(goal => goal.current_amount >= goal.target_amount).length;
  const totalGoals = goals.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">Track and achieve your financial targets</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Emergency Fund"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="target_amount">Target Amount (₹)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    placeholder="100000"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            {cat.icon} {cat.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newGoal.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewGoal({ ...newGoal, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_debit"
                    checked={newGoal.auto_debit}
                    onCheckedChange={(checked) => setNewGoal({ ...newGoal, auto_debit: checked })}
                  />
                  <Label htmlFor="auto_debit">Enable Auto-debit</Label>
                </div>
                {newGoal.auto_debit && (
                  <div>
                    <Label htmlFor="monthly_contribution">Monthly Contribution (₹)</Label>
                    <Input
                      id="monthly_contribution"
                      type="number"
                      placeholder="5000"
                      value={newGoal.monthly_contribution}
                      onChange={(e) => setNewGoal({ ...newGoal, monthly_contribution: e.target.value })}
                    />
                  </div>
                )}
                <Button onClick={handleAddGoal} className="w-full gradient-primary">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground flex items-center">
                <PiggyBank className="w-4 h-4 mr-2 text-savings" />
                Total Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{getTotalSaved().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all goals</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground flex items-center">
                <Target className="w-4 h-4 mr-2 text-primary" />
                Total Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{getTotalTarget().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Combined target</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-accent-vivid" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{getOverallProgress().toFixed(1)}%</div>
              <Progress value={getOverallProgress()} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-budget-good" />
                Achieved Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{achievedGoals}/{totalGoals}</div>
              <p className="text-xs text-muted-foreground">Goals completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const isCompleted = progress >= 100;
            
            return (
              <Card key={goal.id} className="gradient-card shadow-card border-0 overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryIcon(goal.category)}</div>
                      <div>
                        <CardTitle className="text-card-foreground flex items-center space-x-2">
                          <span>{goal.title}</span>
                          {isCompleted && <Trophy className="w-4 h-4 text-budget-good" />}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getPriorityColor(goal.priority)}`}>
                            {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                          </Badge>
                          {goal.auto_debit && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              Auto-debit
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getProgressColor(progress)}`}>
                        {progress.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-card-foreground font-medium">
                        ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{getTimeRemaining(goal.target_date)}</span>
                    </div>
                    {goal.auto_debit && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">₹{goal.monthly_contribution.toLocaleString()}/month</span>
                      </div>
                    )}
                  </div>

                  {!isCompleted && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addContribution(goal.id, 1000)}
                        className="flex-1"
                      >
                        +₹1K
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addContribution(goal.id, 5000)}
                        className="flex-1"
                      >
                        +₹5K
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addContribution(goal.id, 10000)}
                        className="flex-1"
                      >
                        +₹10K
                      </Button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-success-light border border-budget-good rounded-lg p-3 text-center">
                      <Trophy className="w-6 h-6 text-budget-good mx-auto mb-1" />
                      <p className="text-sm font-medium text-budget-good">Goal Achieved! 🎉</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <Card className="gradient-card shadow-card border-0">
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No Savings Goals Yet</h3>
              <p className="text-muted-foreground mb-4">Start building your financial future by creating your first savings goal.</p>
              <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Savings;