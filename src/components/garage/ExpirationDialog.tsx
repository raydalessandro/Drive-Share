import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import type { Expiration } from "./ExpirationsSection";

interface ExpirationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expiration?: Expiration | null;
  onSave: (expiration: Omit<Expiration, 'id'>) => Promise<void>;
}

export function ExpirationDialog({
  open,
  onOpenChange,
  expiration,
  onSave,
}: ExpirationDialogProps) {
  const [formData, setFormData] = useState<Omit<Expiration, 'id'>>({
    type: 'insurance',
    expiration_date: new Date().toISOString().split('T')[0],
    notes: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expiration) {
      setFormData({
        type: expiration.type,
        expiration_date: expiration.expiration_date.split('T')[0],
        notes: expiration.notes,
      });
    } else {
      setFormData({
        type: 'insurance',
        expiration_date: new Date().toISOString().split('T')[0],
        notes: undefined,
      });
    }
  }, [expiration, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        ...formData,
        expiration_date: new Date(formData.expiration_date).toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving expiration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {expiration ? 'Modifica Scadenza' : 'Nuova Scadenza'}
          </DialogTitle>
          <DialogDescription>
            Registra una scadenza per la tua moto
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo Scadenza *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'insurance' | 'tagliando' | 'revisione') =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insurance">Assicurazione</SelectItem>
                <SelectItem value="tagliando">Tagliando</SelectItem>
                <SelectItem value="revisione">Revisione</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration_date">Data Scadenza *</Label>
            <Input
              id="expiration_date"
              type="date"
              value={formData.expiration_date}
              onChange={(e) =>
                setFormData({ ...formData, expiration_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="Note aggiuntive..."
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value || undefined })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvataggio...' : expiration ? 'Salva Modifiche' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



