# Drive Share 🏍️

Una moderna applicazione social per motociclisti costruita con React, Supabase, Zustand e Tailwind CSS. Condividi i tuoi percorsi, gestisci la tua moto e connettiti con altri riders.

**Live Demo**: [drive-share-kappa.vercel.app](https://drive-share-kappa.vercel.app)

## 🌟 Panoramica

Drive Share è un'applicazione completa per la community di motociclisti che permette di:

- 📍 **Condividere percorsi GPX** - Carica e condividi i tuoi percorsi preferiti
- 🏍️ **Gestire il tuo Garage** - Tieni traccia della tua moto, scadenze e manutenzioni
- 📱 **Feed Social** - Scopri percorsi condivisi da altri riders
- 👥 **Sistema Amicizie** - Connettiti con altri motociclisti
- 🗺️ **Mappe Interattive** - Visualizza percorsi su mappe moderne e pulite
- 📊 **Profilo Personale** - Gestisci le informazioni della tua moto e del tuo profilo

## ✨ Funzionalità Principali

### 🏠 Garage
- **Foto Moto** - Carica e visualizza la foto della tua moto
- **Info Moto** - Gestisci nome e dettagli della tua moto
- **Scadenze** - Traccia assicurazione, tagliando e revisione con indicatori visivi
- **Interventi** - Registra manutenzioni personalizzate (gomme, catena, pignone, ecc.)
  - Data intervento
  - Kilometraggio
  - Costo
  - Note
  - Scadenze opzionali

### 📱 Feed Social
- **Feed Generale** - Vedi tutti i percorsi condivisi dalla community
- **Feed Amici** - Visualizza solo i percorsi dei tuoi amici
- **Post con Mappe** - Ogni post mostra il percorso su mappa interattiva
- **Interazioni** - Like, commenti e condivisioni (base implementata)
- **Infinite Scroll** - Caricamento automatico dei post

### 🗺️ Percorsi GPX
- **Upload GPX** - Carica file GPX e visualizza i percorsi
- **Visualizzazione Mappe** - Mappe moderne con CartoDB Positron
- **Dettagli Percorso** - Distanza, punti GPS, descrizione
- **Pubblicazione** - Condividi percorsi nel feed

### 👥 Sistema Amicizie
- **Ricerca Utenti** - Cerca altri riders per username
- **Richieste Amicizia** - Invia e gestisci richieste
- **Real-time Updates** - Notifiche in tempo reale per nuove richieste
- **Profilo Amici** - Visualizza profili e percorsi degli amici

### 👤 Profilo Utente
- **Avatar Personalizzato** - Carica la tua foto profilo
- **Info Moto** - Gestisci foto e nome della moto
- **Statistiche** - Visualizza i tuoi progressi e attività

### 🗺️ Mappe
- **Visualizzazione Moderna** - Tile layer CartoDB Positron
- **Percorsi Dettagliati** - Polilinee con ombre e marker inizio/fine
- **Interattive** - Zoom, pan, popup informativi

## 🏗️ Struttura Database

L'applicazione utilizza le seguenti tabelle e storage buckets:

### Tabelle Principali

#### `profiles`
- `id` (UUID) - Chiave primaria, collegata a auth.users
- `username` (TEXT) - Username univoco
- `email` (TEXT) - Email utente
- `weekly_count` (INTEGER) - Contatore attività settimanale
- `streak_days` (INTEGER) - Giorni di streak
- `last_relapse` (TIMESTAMPTZ) - Ultimo reset attività
- `avatar_url` (TEXT) - URL avatar, collegato a storage bucket
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

#### `friendships`
- `id` (UUID) - Chiave primaria
- `user_id` (UUID) - Richiedente amicizia
- `friend_id` (UUID) - Ricevente amicizia
- `status` (TEXT) - 'pending' o 'accepted'
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

#### `routes`
- `id` (UUID) - Chiave primaria
- `user_id` (UUID) - Proprietario del percorso
- `title` (TEXT) - Titolo del percorso
- `description` (TEXT) - Descrizione
- `distance_km` (NUMERIC) - Distanza in km
- `points` (JSONB) - Coordinate GPS del percorso
- `gpx_url` (TEXT) - URL del file GPX
- `visibility` (TEXT) - 'public' o 'private'
- `is_published` (BOOLEAN) - Se pubblicato nel feed
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

#### `posts`
- `id` (UUID) - Chiave primaria
- `author_id` (UUID) - Autore del post
- `route_id` (UUID) - Percorso associato (opzionale)
- `content` (TEXT) - Contenuto del post
- `type` (TEXT) - Tipo post ('route', 'text', 'image')
- `visibility` (TEXT) - Visibilità ('public', 'friends', 'private')
- `is_public` (BOOLEAN) - Se pubblico
- `likes_count` (INTEGER) - Numero di like
- `comments_count` (INTEGER) - Numero di commenti
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

#### `motorcycles`
- `id` (UUID) - Chiave primaria
- `user_id` (UUID) - Proprietario moto
- `name` (TEXT) - Nome della moto
- `photo_url` (TEXT) - URL foto moto
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

#### `expirations`
- `id` (UUID) - Chiave primaria
- `user_id` (UUID) - Proprietario
- `type` (TEXT) - Tipo scadenza ('insurance', 'tagliando', 'revisione')
- `expiration_date` (TIMESTAMPTZ) - Data scadenza
- `notes` (TEXT) - Note aggiuntive
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

#### `maintenances`
- `id` (UUID) - Chiave primaria
- `user_id` (UUID) - Proprietario
- `type` (TEXT) - Tipo intervento (personalizzabile)
- `date` (TIMESTAMPTZ) - Data intervento
- `expiration_date` (TIMESTAMPTZ) - Scadenza opzionale
- `mileage` (INTEGER) - Kilometraggio
- `cost` (NUMERIC) - Costo
- `notes` (TEXT) - Note
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

### Storage Buckets
- `avatars` - Foto profilo utenti
- `motorcycles` - Foto moto
- `gpx-files` - File GPX caricati

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ o Bun
- Un account Supabase
- Git

### 1. Clona il Repository

```bash
git clone https://github.com/raydalessandro/Drive-Share.git
cd Drive-Share
```

### 2. Installa le Dipendenze

```bash
npm install
# oppure
bun install
```

### 3. Crea un Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Attendi che il progetto sia completamente configurato
3. Prendi nota del tuo project URL e anon public key da Settings > API

### 4. Configura le Variabili d'Ambiente

Crea un file `.env` nella root del progetto:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Configura il Database

Esegui il seguente SQL nell'editor SQL di Supabase per creare tutte le tabelle necessarie:

```sql
-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    weekly_count INTEGER DEFAULT 0 NOT NULL,
    streak_days INTEGER DEFAULT 0 NOT NULL,
    last_relapse TIMESTAMPTZ,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id)
);

-- Create friendships table
CREATE TABLE friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    friend_id UUID REFERENCES profiles(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create routes table
CREATE TABLE routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    distance_km NUMERIC,
    points JSONB,
    gpx_url TEXT,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create posts table
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    content TEXT,
    type TEXT DEFAULT 'route' CHECK (type IN ('route', 'text', 'image')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
    is_public BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create motorcycles table
CREATE TABLE motorcycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create expirations table
CREATE TABLE expirations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('insurance', 'tagliando', 'revisione')),
    expiration_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create maintenances table
CREATE TABLE maintenances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    expiration_date TIMESTAMPTZ,
    mileage INTEGER,
    cost NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
```

### 6. Configura Row Level Security (RLS) Policies

Esegui questi comandi SQL per configurare le policy di sicurezza:

```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable profile search for authenticated users" ON profiles
    FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view friends' profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM friendships 
            WHERE ((user_id = auth.uid() AND friend_id = profiles.id AND status = 'accepted') 
                OR (user_id = profiles.id AND friend_id = auth.uid() AND status = 'accepted'))
        )
    );

-- Friendships policies
CREATE POLICY "Users can view own friendships" ON friendships
    FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendship requests" ON friendships
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update received friendship requests" ON friendships
    FOR UPDATE USING (friend_id = auth.uid());

CREATE POLICY "Users can delete friendships" ON friendships
    FOR DELETE USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Routes policies
CREATE POLICY "Users can view own routes" ON routes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view public routes" ON routes
    FOR SELECT USING (visibility = 'public' AND is_published = true);

CREATE POLICY "Users can create own routes" ON routes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own routes" ON routes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own routes" ON routes
    FOR DELETE USING (user_id = auth.uid());

-- Posts policies
CREATE POLICY "Users can view public posts" ON posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view friends' posts" ON posts
    FOR SELECT USING (
        visibility = 'friends' AND (
            author_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM friendships 
                WHERE ((user_id = auth.uid() AND friend_id = author_id AND status = 'accepted') 
                    OR (user_id = author_id AND friend_id = auth.uid() AND status = 'accepted'))
            )
        )
    );

CREATE POLICY "Users can create own posts" ON posts
    FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (author_id = auth.uid());

-- Motorcycles policies
CREATE POLICY "Users can view own motorcycle" ON motorcycles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own motorcycle" ON motorcycles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own motorcycle" ON motorcycles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own motorcycle" ON motorcycles
    FOR DELETE USING (user_id = auth.uid());

-- Expirations policies
CREATE POLICY "Users can manage own expirations" ON expirations
    FOR ALL USING (user_id = auth.uid());

-- Maintenances policies
CREATE POLICY "Users can manage own maintenances" ON maintenances
    FOR ALL USING (user_id = auth.uid());
```

### 7. Configura Storage Buckets

Crea i seguenti bucket in Supabase Storage:

1. **avatars** - Pubblico, per le foto profilo
2. **motorcycles** - Pubblico, per le foto moto
3. **gpx-files** - Pubblico, per i file GPX

Per ogni bucket, configura le policy:

```sql
-- Policy per avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Policy per motorcycles (stessa struttura)
CREATE POLICY "Users can upload own motorcycle photo" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'motorcycles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own motorcycle photo" ON storage.objects
    FOR UPDATE USING (bucket_id = 'motorcycles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own motorcycle photo" ON storage.objects
    FOR DELETE USING (bucket_id = 'motorcycles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view motorcycle photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'motorcycles');

-- Policy per gpx-files
CREATE POLICY "Users can upload GPX files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'gpx-files');

CREATE POLICY "Anyone can view GPX files" ON storage.objects
    FOR SELECT USING (bucket_id = 'gpx-files');
```

### 8. Configura Database Triggers

Crea i trigger per aggiornare automaticamente `updated_at`:

```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motorcycles_updated_at BEFORE UPDATE ON motorcycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expirations_updated_at BEFORE UPDATE ON expirations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenances_updated_at BEFORE UPDATE ON maintenances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 9. Avvia il Server di Sviluppo

```bash
npm run dev
# oppure
bun dev
```

L'applicazione sarà disponibile su `http://localhost:8080`

### 10. Build per Produzione

```bash
npm run build
```

I file compilati saranno nella cartella `dist/`

## 📱 Pagine dell'Applicazione

- **`/`** - Login
- **`/signup`** - Registrazione
- **`/garage`** - Garage personale (foto moto, scadenze, interventi)
- **`/feed`** - Feed sociale con percorsi condivisi
- **`/routes`** - Gestione percorsi GPX personali
- **`/friends`** - Gestione amicizie
- **`/profile`** - Profilo utente e info moto
- **`/profile/:friendId`** - Profilo di un amico

## 🛠️ Stack Tecnologico

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: Zustand
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (HashRouter per compatibilità file://)
- **Forms**: React Hook Form con validazione Zod
- **Data Fetching**: TanStack Query
- **Mappe**: Leaflet con CartoDB Positron
- **Date Handling**: date-fns

## 📁 Struttura del Progetto

```
src/
├── components/
│   ├── feed/              # Componenti feed (post, header, content, actions)
│   ├── garage/            # Componenti garage (foto moto, scadenze, interventi)
│   ├── avatar/            # Componenti avatar
│   ├── layout/            # Layout principali (MainLayout, AuthLayout)
│   ├── ui/                # Componenti UI shadcn
│   ├── MapView.tsx        # Componente mappa migliorato
│   └── GPXUploader.tsx    # Uploader file GPX
├── hooks/                 # Custom React hooks
├── integrations/
│   └── supabase/          # Client Supabase e types
├── lib/                   # Utility functions
├── pages/                 # Pagine dell'applicazione
│   ├── Garage.tsx         # Garage principale
│   ├── Feed.tsx           # Feed sociale
│   ├── RoutesPage.tsx     # Gestione percorsi
│   ├── Friends.tsx        # Gestione amicizie
│   ├── Profile.tsx        # Profilo utente
│   └── ...
├── stores/                # Zustand stores
│   ├── authStore.ts       # Autenticazione
│   ├── friendsStore.ts    # Amicizie
│   ├── feedStore.ts       # Feed
│   └── garageStore.ts     # Garage
└── App.tsx                # Componente principale
```

## 🔐 Sicurezza

### Row Level Security (RLS)
L'applicazione implementa policy RLS complete per garantire:
- Gli utenti possono vedere e modificare solo i propri profili
- I profili degli amici sono visibili solo agli amici accettati
- Le richieste di amicizia sono validate correttamente
- Tutti gli accessi ai dati sono autenticati
- I percorsi privati sono visibili solo al proprietario

### Autenticazione
- Gestione sessioni sicura tramite Supabase Auth
- Persistenza sessioni al reload della pagina
- Password hashate e salvate in modo sicuro
- Token JWT per autenticazione API

## 🚀 Deployment

### Vercel (Consigliato)

1. Connetti il repository a Vercel
2. Configura le variabili d'ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automatico ad ogni push

### Netlify

1. Connetti il repository a Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configura le variabili d'ambiente

## 📝 Note di Sviluppo

- Il codice è modulare e scalabile
- TypeScript completo per type safety
- Componenti riutilizzabili e ben organizzati
- Gestione errori robusta
- UI moderna e responsive

## 🤝 Contribuire

1. Fai un fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Committa le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è open source e disponibile sotto la [MIT License](LICENSE).

## 🆘 Supporto

Se riscontri problemi:
1. Controlla la console del browser per errori
2. Verifica la configurazione Supabase
3. Assicurati che le policy RLS siano configurate correttamente
4. Verifica che tutte le tabelle richieste esistano
5. Controlla che i bucket storage siano configurati

Per ulteriore aiuto, apri una issue nel repository.

---

**Made with ❤️** per la community dei motociclisti 🏍️
