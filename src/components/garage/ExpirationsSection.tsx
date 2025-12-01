import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  Plus,
  Edit
} from "lucide-react";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface Expiration {
  id: string;
  type: 'insurance' | 'tagliando' | 'revisione';
  expiration_date: string;
  notes?: string;
}

interface ExpirationsSectionProps {
  expirations: Expiration[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
}

const expirationLabels = {
  insurance: 'Assicurazione',
  tagliando: 'Tagliando',
  revisione: 'Revisione',
};

const expirationColors = {
  insurance: 'bg-blue-100 text-blue-700 border-blue-200',
  tagliando: 'bg-green-100 text-green-700 border-green-200',
  revisione: 'bg-orange-100 text-orange-700 border-orange-200',
};

export function ExpirationsSection({ 
  expirations, 
  onAdd,
  onEdit 
}: ExpirationsSectionProps) {
  const getExpirationStatus = (date: string) => {
    const expirationDate = new Date(date);
    const daysUntil = differenceInDays(expirationDate, new Date());
    
    if (isPast(expirationDate) && !isToday(expirationDate)) {
      return { status: 'expired', days: Math.abs(daysUntil), color: 'destructive' };
    }
    if (isToday(expirationDate)) {
      return { status: 'today', days: 0, color: 'destructive' };
    }
    if (daysUntil <= 30) {
      return { status: 'warning', days: daysUntil, color: 'default' };
    }
    return { status: 'ok', days: daysUntil, color: 'secondary' };
  };

  const sortedExpirations = [...expirations].sort((a, b) => 
    new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-red-600" />
          Scadenze
        </CardTitle>
        {onAdd && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sortedExpirations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nessuna scadenza registrata</p>
            {onAdd && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi prima scadenza
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedExpirations.map((exp) => {
              const status = getExpirationStatus(exp.expiration_date);
              const expirationDate = new Date(exp.expiration_date);
              
              return (
                <div
                  key={exp.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    status.status === 'expired' && "bg-red-50 border-red-200",
                    status.status === 'today' && "bg-red-50 border-red-200",
                    status.status === 'warning' && "bg-yellow-50 border-yellow-200",
                    status.status === 'ok' && "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-lg",
                      expirationColors[exp.type]
                    )}>
                      {status.status === 'expired' || status.status === 'today' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {expirationLabels[exp.type]}
                        </p>
                        <Badge variant={status.color as any} className="text-xs">
                          {status.status === 'expired' && 'Scaduta'}
                          {status.status === 'today' && 'Oggi'}
                          {status.status === 'warning' && `${status.days} giorni`}
                          {status.status === 'ok' && 'OK'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(expirationDate, "d MMMM yyyy", { locale: it })}
                        {status.status === 'expired' && ` (${status.days} giorni fa)`}
                        {status.status === 'warning' && ` (tra ${status.days} giorni)`}
                      </p>
                      {exp.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {exp.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(exp.id)}
                      className="ml-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



