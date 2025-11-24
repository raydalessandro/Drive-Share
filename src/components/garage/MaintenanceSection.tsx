import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  Gauge,
  Euro
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface Maintenance {
  id: string;
  type: string; // Tipo intervento personalizzato
  date: string;
  expiration_date?: string | null;
  mileage: number | null;
  cost: number | null;
  notes?: string | null;
}

interface MaintenanceSectionProps {
  maintenances: Maintenance[];
  onAdd: (maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  onEdit: (id: string, maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const commonTypes = [
  'Cambio gomme',
  'Catena',
  'Pignone',
  'Filtro olio',
  'Filtro aria',
  'Pastiglie freni',
  'Liquido freni',
  'Batteria',
  'Candele',
  'Altro',
];

export function MaintenanceSection({
  maintenances,
  onAdd,
  onEdit,
  onDelete,
}: MaintenanceSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Maintenance, 'id'>>({
    type: '',
    date: new Date().toISOString().split('T')[0],
    expiration_date: null,
    mileage: null,
    cost: null,
    notes: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (maintenance?: Maintenance) => {
    if (maintenance) {
      setEditingId(maintenance.id);
      setFormData({
        type: maintenance.type,
        date: maintenance.date.split('T')[0],
        expiration_date: maintenance.expiration_date ? maintenance.expiration_date.split('T')[0] : null,
        mileage: maintenance.mileage,
        cost: maintenance.cost,
        notes: maintenance.notes || null,
      });
    } else {
      setEditingId(null);
      setFormData({
        type: '',
        date: new Date().toISOString().split('T')[0],
        expiration_date: null,
        mileage: null,
        cost: null,
        notes: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        expiration_date: formData.expiration_date 
          ? new Date(formData.expiration_date).toISOString() 
          : null,
      };

      if (editingId) {
        await onEdit(editingId, submitData);
      } else {
        await onAdd(submitData);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving maintenance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedMaintenances = [...maintenances].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-red-600" />
          Interventi
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Modifica Intervento' : 'Nuovo Intervento'}
              </DialogTitle>
              <DialogDescription>
                Registra un intervento di manutenzione per la tua moto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo Intervento *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilometraggio</Label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="0"
                      value={formData.mileage || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        mileage: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Costo (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cost || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        cost: e.target.value ? parseFloat(e.target.value) : null 
                      })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration_date">Scadenza (opzionale)</Label>
                <Input
                  id="expiration_date"
                  type="date"
                  value={formData.expiration_date || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    expiration_date: e.target.value || null 
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Se inserita, questa scadenza apparirà nella sezione Scadenze
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  placeholder="Note aggiuntive sull'intervento..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.type || !formData.date}>
                  {isSubmitting ? 'Salvataggio...' : editingId ? 'Salva Modifiche' : 'Aggiungi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sortedMaintenances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nessun intervento registrato</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi primo intervento
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMaintenances.map((maintenance) => (
              <div
                key={maintenance.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-semibold">
                      {maintenance.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(maintenance.date), "d MMM yyyy", { locale: it })}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {maintenance.mileage && (
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {maintenance.mileage.toLocaleString()} km
                      </span>
                    )}
                    {maintenance.cost && (
                      <span className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        €{maintenance.cost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {maintenance.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {maintenance.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(maintenance)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(maintenance.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

