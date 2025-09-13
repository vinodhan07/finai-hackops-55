import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Gauge, Zap, Droplets, Flame, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Reading {
  id: string;
  reading_type: string;
  meter_number: string | null;
  current_reading: number;
  previous_reading: number;
  consumption: number;
  reading_date: string;
  cost_per_unit: number;
  total_cost: number;
  notes: string | null;
  created_at: string;
}

const readingTypeIcons = {
  electricity: Zap,
  water: Droplets,
  gas: Flame,
  default: Gauge,
};

const readingTypeColors = {
  electricity: "bg-yellow-100 text-yellow-800 border-yellow-200",
  water: "bg-blue-100 text-blue-800 border-blue-200", 
  gas: "bg-orange-100 text-orange-800 border-orange-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function Readings() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [formData, setFormData] = useState({
    reading_type: "",
    meter_number: "",
    current_reading: "",
    previous_reading: "",
    cost_per_unit: "",
    reading_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchReadings();
    }
  }, [user]);

  const fetchReadings = async () => {
    try {
      const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user?.id)
        .order("reading_date", { ascending: false });

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error("Error fetching readings:", error);
      toast.error("Failed to fetch readings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const currentReading = parseFloat(formData.current_reading);
      const previousReading = parseFloat(formData.previous_reading);
      const costPerUnit = parseFloat(formData.cost_per_unit);
      const consumption = currentReading - previousReading;
      const totalCost = consumption * costPerUnit;

      const readingData = {
        user_id: user.id,
        reading_type: formData.reading_type,
        meter_number: formData.meter_number || null,
        current_reading: currentReading,
        previous_reading: previousReading,
        consumption,
        cost_per_unit: costPerUnit,
        total_cost: totalCost,
        reading_date: formData.reading_date,
        notes: formData.notes || null,
      };

      if (editingReading) {
        const { error } = await supabase
          .from("readings")
          .update(readingData)
          .eq("id", editingReading.id);
        if (error) throw error;
        toast.success("Reading updated successfully");
      } else {
        const { error } = await supabase.from("readings").insert([readingData]);
        if (error) throw error;
        toast.success("Reading added successfully");
      }

      setDialogOpen(false);
      setEditingReading(null);
      setFormData({
        reading_type: "",
        meter_number: "",
        current_reading: "",
        previous_reading: "",
        cost_per_unit: "",
        reading_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      fetchReadings();
    } catch (error) {
      console.error("Error saving reading:", error);
      toast.error("Failed to save reading");
    }
  };

  const handleEdit = (reading: Reading) => {
    setEditingReading(reading);
    setFormData({
      reading_type: reading.reading_type,
      meter_number: reading.meter_number || "",
      current_reading: reading.current_reading.toString(),
      previous_reading: reading.previous_reading.toString(),
      cost_per_unit: reading.cost_per_unit.toString(),
      reading_date: reading.reading_date,
      notes: reading.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("readings").delete().eq("id", id);
      if (error) throw error;
      toast.success("Reading deleted successfully");
      fetchReadings();
    } catch (error) {
      console.error("Error deleting reading:", error);
      toast.error("Failed to delete reading");
    }
  };

  const getIcon = (type: string) => {
    const IconComponent = readingTypeIcons[type as keyof typeof readingTypeIcons] || readingTypeIcons.default;
    return <IconComponent className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return readingTypeColors[type as keyof typeof readingTypeColors] || readingTypeColors.default;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading readings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Utility Readings</h1>
            <p className="text-muted-foreground">
              Track your electricity, water, and gas meter readings
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Reading
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingReading ? "Edit Reading" : "Add New Reading"}
                </DialogTitle>
                <DialogDescription>
                  Enter your utility meter reading details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reading_type">Reading Type</Label>
                  <Select
                    value={formData.reading_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, reading_type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reading type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meter_number">Meter Number (Optional)</Label>
                  <Input
                    id="meter_number"
                    value={formData.meter_number}
                    onChange={(e) =>
                      setFormData({ ...formData, meter_number: e.target.value })
                    }
                    placeholder="Enter meter number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="previous_reading">Previous Reading</Label>
                    <Input
                      id="previous_reading"
                      type="number"
                      step="0.01"
                      value={formData.previous_reading}
                      onChange={(e) =>
                        setFormData({ ...formData, previous_reading: e.target.value })
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_reading">Current Reading</Label>
                    <Input
                      id="current_reading"
                      type="number"
                      step="0.01"
                      value={formData.current_reading}
                      onChange={(e) =>
                        setFormData({ ...formData, current_reading: e.target.value })
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                    <Input
                      id="cost_per_unit"
                      type="number"
                      step="0.01"
                      value={formData.cost_per_unit}
                      onChange={(e) =>
                        setFormData({ ...formData, cost_per_unit: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reading_date">Reading Date</Label>
                    <Input
                      id="reading_date"
                      type="date"
                      value={formData.reading_date}
                      onChange={(e) =>
                        setFormData({ ...formData, reading_date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingReading(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingReading ? "Update" : "Add"} Reading
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {readings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Gauge className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No readings yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start tracking your utility consumption by adding your first meter reading.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Reading
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {readings.map((reading) => (
              <Card key={reading.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getTypeColor(reading.reading_type)} border`}>
                      {getIcon(reading.reading_type)}
                      <span className="ml-1 capitalize">{reading.reading_type}</span>
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(reading)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reading.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    {reading.meter_number ? `Meter: ${reading.meter_number}` : `${reading.reading_type} Reading`}
                  </CardTitle>
                  <CardDescription>
                    {new Date(reading.reading_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Reading:</span>
                      <span className="font-medium">{reading.current_reading}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Previous Reading:</span>
                      <span className="font-medium">{reading.previous_reading}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Consumption:</span>
                      <span className="font-medium text-primary">{reading.consumption}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold text-lg">₹{reading.total_cost.toFixed(2)}</span>
                    </div>
                    {reading.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">{reading.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}