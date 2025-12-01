import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGarageStore } from "@/stores/garageStore";
import MainLayout from "@/components/layout/MainLayout";
import { 
  MotorcyclePhoto, 
  ExpirationsSection, 
  MaintenanceSection,
  ExpirationDialog,
  type Expiration
} from "@/components/garage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Garage = () => {
  const profile = useAuthStore((state) => state.profile);
  const { 
    motorcycle, 
    expirations, 
    maintenances,
    loading,
    loadMotorcycle,
    loadExpirations,
    loadMaintenances,
    addExpiration,
    updateExpiration,
    deleteExpiration,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
  } = useGarageStore();
  const navigate = useNavigate();
  const [expirationDialogOpen, setExpirationDialogOpen] = useState(false);
  const [editingExpiration, setEditingExpiration] = useState<Expiration | null>(null);

  useEffect(() => {
    if (profile) {
      loadMotorcycle();
      loadExpirations();
      loadMaintenances();
    }
  }, [profile, loadMotorcycle, loadExpirations, loadMaintenances]);

  const handlePhotoChange = async (photoUrl: string | null) => {
    try {
      const currentName = motorcycle?.name || '';
      await useGarageStore.getState().updateMotorcycle(currentName, photoUrl);
      // Reload to ensure state is in sync
      await useGarageStore.getState().loadMotorcycle();
    } catch (error) {
      // Error already handled in store
      console.error('Error updating photo:', error);
    }
  };

  const handleAddExpiration = () => {
    setEditingExpiration(null);
    setExpirationDialogOpen(true);
  };

  const handleEditExpiration = (id: string) => {
    const exp = expirations.find(e => e.id === id);
    if (exp) {
      setEditingExpiration(exp);
      setExpirationDialogOpen(true);
    }
  };

  const handleSaveExpiration = async (expiration: Omit<Expiration, 'id'>) => {
    if (editingExpiration) {
      await updateExpiration(editingExpiration.id, expiration);
    } else {
      await addExpiration(expiration);
    }
  };

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p>Caricamento garage...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Il Mio Garage</h1>
            <p className="text-muted-foreground">
              Gestisci la tua moto, scadenze e manutenzioni
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Gestisci Info Moto
          </Button>
        </div>

        {/* Foto Moto */}
        <Card>
          <CardContent className="p-0">
            <MotorcyclePhoto
              photoUrl={motorcycle?.photo_url || null}
              onPhotoChange={handlePhotoChange}
            />
            {motorcycle?.name && (
              <div className="p-6 pt-4">
                <h2 className="text-2xl font-bold text-center">{motorcycle.name}</h2>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scadenze e Interventi */}
        <div className="grid md:grid-cols-2 gap-6">
          <ExpirationsSection
            expirations={expirations}
            onAdd={handleAddExpiration}
            onEdit={handleEditExpiration}
          />

          <ExpirationDialog
            open={expirationDialogOpen}
            onOpenChange={setExpirationDialogOpen}
            expiration={editingExpiration}
            onSave={handleSaveExpiration}
          />

          <MaintenanceSection
            maintenances={maintenances}
            onAdd={addMaintenance}
            onEdit={updateMaintenance}
            onDelete={deleteMaintenance}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Garage;

