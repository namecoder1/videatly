'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useSupabaseSession } from '@/hooks/use-supabase-session';

declare const google: any;
declare const gapi: any;

declare global {
  interface Window {
    gapi: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const SCOPES =
  'https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly';

interface UserData {
  name?: string;
  email?: string;
  accessToken?: string;
  tokenExpiry?: number;
  refreshToken?: string;
}

interface VideoData {
  id: string;
  title: string;
  publishedAt: string;
  thumbnails?: any;
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    estimatedMinutesWatched: number;
    averageViewDuration: number;
  };
}

interface CachedVideoData {
  videos: VideoData[];
  timestamp: number;
}

export default function YoutubeAnalyticsClient() {
  const { session, loading: sessionLoading, googleTokens } = useSupabaseSession();
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<any>(null);
  const [videoData, setVideoData] = useState<VideoData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Helper function to load cached data
  const loadCachedData = (userEmail: string) => {
    // Try to load cached analytics data
    const storageKey = `yt_analytics_data_${userEmail}`;
    const cachedData = localStorage.getItem(storageKey);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        // Cache valida per 7 giorni
        const sevenDays = 1000 * 60 * 60 * 24 * 7;
        const expired = Date.now() - parsedData.timestamp > sevenDays;
        
        if (!expired) {
          setData(parsedData.data);
        }
      } catch (e) {
        console.warn('Cached analytics data corrupted:', e);
      }
    }

    // Try to load cached video data
    const videoStorageKey = `yt_video_data_${userEmail}`;
    const cachedVideoData = localStorage.getItem(videoStorageKey);
    if (cachedVideoData) {
      try {
        const parsedVideoData = JSON.parse(cachedVideoData) as CachedVideoData;
        // Cache valida per 7 giorni
        const sevenDays = 1000 * 60 * 60 * 24 * 7;
        const expired = Date.now() - parsedVideoData.timestamp > sevenDays;
        
        if (!expired) {
          setVideoData(parsedVideoData.videos);
        }
      } catch (e) {
        console.warn('Cached video data corrupted:', e);
      }
    }
  };

  // Helper function to load Google scripts manually if needed
  const loadGoogleScripts = () => {
    return new Promise<void>((resolve) => {
      // Check if scripts are already loaded
      if (typeof window.gapi !== 'undefined' && typeof google !== 'undefined') {
        resolve();
        return;
      }

      let scriptsLoaded = 0;
      const totalScripts = 2;

      const checkAllLoaded = () => {
        scriptsLoaded++;
        if (scriptsLoaded === totalScripts) {
          console.log('📜 Tutti gli script Google caricati manualmente');
          resolve();
        }
      };

      // Load GAPI if not present
      if (typeof window.gapi === 'undefined') {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = checkAllLoaded;
        gapiScript.onerror = () => {
          console.error('Errore caricamento GAPI script');
          checkAllLoaded();
        };
        document.head.appendChild(gapiScript);
      } else {
        checkAllLoaded();
      }

      // Load Google Identity Services if not present
      if (typeof google === 'undefined') {
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = checkAllLoaded;
        gisScript.onerror = () => {
          console.error('Errore caricamento GIS script');
          checkAllLoaded();
        };
        document.head.appendChild(gisScript);
      } else {
        checkAllLoaded();
      }
    });
  };

  // Load user data from localStorage on component mount
  useEffect(() => {
    if (typeof window === 'undefined' || sessionLoading) return;
    setIsClient(true);

    // Se l'utente è loggato in Supabase, proviamo a facilitare il Single Sign-On
    if (session && session.user.email) {
      console.log('🔑 Utente loggato in Supabase, controllo dati YouTube cached...');
      
      // Controlla se abbiamo già dati YouTube per questo utente
      const userEmail = session.user.email;
      const storageKey = `yt_analytics_data_${userEmail}`;
      const videoStorageKey = `yt_video_data_${userEmail}`;
      const cachedAnalytics = localStorage.getItem(storageKey);
      const cachedVideos = localStorage.getItem(videoStorageKey);
      
      if (cachedAnalytics || cachedVideos) {
        console.log('📊 Trovati dati YouTube cached per questo utente Supabase');
        
        const userDataObj: UserData = {
          name: session.user.user_metadata?.full_name || session.user.email,
          email: userEmail,
          // Non impostiamo accessToken qui perché non lo abbiamo da Supabase
        };
        
        setUserData(userDataObj);
        loadCachedData(userEmail);
        
        // Non fare return qui, continuiamo con l'inizializzazione GAPI per permettere aggiornamenti
      }
    }

    // Fallback: Try to load user data from localStorage
    const savedUserData = localStorage.getItem('yt_user_data');
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData) as UserData;
        
        // Sempre carica i dati dell'utente se esistono (indipendentemente dal token)
        setUserData(parsed);
        
        // Verifica se il token è ancora valido
        const tokenIsValid = parsed.tokenExpiry && Date.now() < parsed.tokenExpiry;
        
        if (tokenIsValid && parsed.accessToken) {
          setAccessToken(parsed.accessToken);
        }
        
        // SEMPRE carica i dati cached se esistenti (indipendentemente dal token)
        loadCachedData(parsed.email || 'unknown');
      } catch (e) {
        console.warn('Cached user data corrupted:', e);
        localStorage.removeItem('yt_user_data');
      }
    }

    const waitForGapi = () =>
      new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
          console.log(`GAPI Tentativo ${attempts + 1}: gapi=`, typeof window.gapi !== 'undefined' ? 'defined' : 'undefined');
          
          if (typeof window.gapi !== 'undefined') {
            clearInterval(interval);
            console.log('✅ GAPI caricato con successo');
            resolve();
          } else if (attempts > 50) { // Aumentato il numero di tentativi
            clearInterval(interval);
            console.error('❌ GAPI not loaded after 50 attempts');
            reject(new Error('gapi not loaded'));
          }
          attempts++;
        }, 500); // Aumentato l'intervallo a 500ms
      });

    const initGapiClient = async () => {
      try {
        await waitForGapi();
        
        await new Promise((resolve) => {
          gapi.load('client', resolve);
        });

        await gapi.client.init({
          apiKey: '',
          discoveryDocs: [
            'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2',
            'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
          ],
        });
        
        // Se abbiamo un token valido, impostalo in gapi.client
        if (accessToken) {
          gapi.client.setToken({ access_token: accessToken });
        }
        
        return true;
      } catch (err) {
        console.error('Failed to initialize GAPI:', err);
        return false;
      }
    };

    const waitForGoogleIdentity = () =>
      new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
          console.log(`Tentativo ${attempts + 1}: google=`, typeof google !== 'undefined' ? 'defined' : 'undefined', 
                     'accounts=', typeof google !== 'undefined' && google.accounts ? 'defined' : 'undefined');
          
          if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
            clearInterval(interval);
            console.log('✅ Google Identity Services caricato con successo');
            resolve();
          } else if (attempts > 50) { // Aumentato il numero di tentativi
            clearInterval(interval);
            console.error('❌ Google Identity Services not loaded after 50 attempts');
            reject(new Error('Google Identity Services not loaded'));
          }
          attempts++;
        }, 500); // Aumentato l'intervallo a 500ms
      });

    const initGIS = async () => {
      try {
        await waitForGoogleIdentity();
        
        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          // Facilitiamo il Single Sign-On se l'utente è già loggato in Supabase
          hint: session?.user?.email || undefined,
          callback: async (response: any) => {
            if (response.error) {
              console.error(response);
              setError('Errore nel login: ' + response.error);
              return;
            }
            
            // Calcola la scadenza del token (1 ora dal rilascio, standard per Google)
            const tokenExpiry = Date.now() + (60 * 60 * 1000);
            
            // Set the access token and configure GAPI client
            setAccessToken(response.access_token);
            gapi.client.setToken({ access_token: response.access_token });
            
            // Get user info
            try {
              const userInfo = await gapi.client.youtube.channels.list({
                mine: true,
                part: 'snippet',
              });
              
              const channelInfo = userInfo.result.items?.[0]?.snippet;
              const userId = userInfo.result.items?.[0]?.id;
              
              if (channelInfo) {
                // Se l'utente è loggato in Supabase, usa quell'email, altrimenti usa i dati YouTube
                const userEmail = session?.user?.email || channelInfo.customUrl || userId || 'unknown';
                const userName = session?.user?.user_metadata?.full_name || channelInfo.title;
                
                const userDataObj: UserData = {
                  name: userName,
                  email: userEmail,
                  accessToken: response.access_token,
                  tokenExpiry: tokenExpiry
                };
                
                // Save to state and localStorage
                setUserData(userDataObj);
                localStorage.setItem('yt_user_data', JSON.stringify(userDataObj));
                
                // Carica i dati cached se esistenti
                loadCachedData(userEmail);
              }
            } catch (err) {
              console.error('Error fetching user info:', err);
            }
          },
        });

        setTokenClient(client);
        
        // Finisci sempre l'inizializzazione - il login silenzioso è opzionale
        setIsInitializing(false);
        
        // Se abbiamo già dei dati utente salvati e non abbiamo un token valido,
        // prova il login silenzioso MA solo se non abbiamo già dati cached
        const savedUserData = localStorage.getItem('yt_user_data');
        if (savedUserData && !accessToken) {
          try {
            const parsedUserData = JSON.parse(savedUserData);
            const hasAnalyticsCache = localStorage.getItem(`yt_analytics_data_${parsedUserData.email}`);
            const hasVideoCache = localStorage.getItem(`yt_video_data_${parsedUserData.email}`);
            
            // Solo se non abbiamo NESSUN dato cached, prova il login silenzioso
            if (!hasAnalyticsCache && !hasVideoCache) {
              console.log('Nessun dato cached trovato, tentativo di login silenzioso...');
              client.requestAccessToken({ prompt: '' });
            } else {
              console.log('Dati cached trovati, login silenzioso non necessario');
            }
          } catch (e) {
            console.error('Error checking cached data:', e);
          }
        }
        
        return client;
      } catch (err) {
        console.error('Failed to initialize GIS:', err);
        setIsInitializing(false);
        return null;
      }
    };

    const initialize = async () => {
      try {
        console.log('🚀 Inizializzazione YouTube Analytics...');
        
        // Prima prova a caricare gli script se non sono disponibili
        await loadGoogleScripts();
        
        // Aspetta un po' per dare tempo agli script di inizializzarsi
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const gapiInitialized = await initGapiClient();
        if (gapiInitialized) {
          console.log('📡 GAPI inizializzato, inizializzazione GIS...');
          await initGIS();
          console.log('✅ Inizializzazione completata con successo');
        } else {
          console.error('❌ Fallimento inizializzazione GAPI');
          setError('Errore durante il caricamento delle API di Google. Riprova più tardi.');
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione:', error);
        setError(`Errore di inizializzazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}. Ricarica la pagina per riprovare.`);
        setIsInitializing(false);
      }
    };

    initialize();
  }, [session, googleTokens, sessionLoading]); // Dipende dalla sessione Supabase

  // Retry function that just reloads the page for simplicity
  const retryInitialization = () => {
    console.log('🔄 Ricaricamento pagina per riprovare inizializzazione...');
    window.location.reload();
  };

  // Define fetchAnalyticsData function outside of the useEffect to reuse it
  const fetchAnalyticsData = async (userEmail: string) => {
    console.log('📊 fetchAnalyticsData avviata per email:', userEmail);
    console.log('🔑 AccessToken disponibile:', !!accessToken);
    console.log('🌐 GAPI client configurato:', !!gapi?.client?.getToken());
    
    if (!userEmail) {
      setError('Informazioni utente non disponibili');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
        try {
      // Verifica che GAPI sia pronto
      if (!gapi || !gapi.client) {
        throw new Error('GAPI client non inizializzato');
      }

      // Assicurati che i token siano configurati in gapi.client
      if (accessToken && !gapi.client.getToken()) {
        console.log('🔐 Configurazione token in GAPI client...');
        gapi.client.setToken({ access_token: accessToken });
      }

      const currentToken = gapi.client.getToken();
      console.log('🎫 Token corrente in GAPI:', currentToken ? 'Presente' : 'Assente');

      if (!currentToken) {
        throw new Error('Token di accesso non configurato in GAPI client');
      }

      console.log('🎯 Recupero informazioni canale...');
      const channelRes = await gapi.client.youtube.channels.list({
        mine: true,
        part: 'id',
      });
      
      console.log('📺 Risposta canale:', channelRes);

      const channelId = channelRes.result.items?.[0]?.id;
      if (!channelId) throw new Error('Nessun canale trovato');
        
      const res = await gapi.client.youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate: '2018-01-01',
        endDate: '2024-12-31',
        metrics: 'views,likes,estimatedMinutesWatched,videos',
        dimensions: 'day',
        sort: 'day',
      });

      console.log(res)

      // Check if we got valid data
      if (!res.result || !res.result.rows || res.result.rows.length === 0) {
        setError('Nessun dato disponibile per il periodo selezionato');
        setIsLoading(false);
        return;
      }

      const storageKey = `yt_analytics_data_${userEmail}`;
      
      // Save to state and localStorage
      setData(res.result);
      localStorage.setItem(storageKey, JSON.stringify({
        data: res.result,
        timestamp: Date.now()
      }));
      
      console.log('✅ Dati salvati con successo:', res.result);
    } catch (err: any) {
      console.error('❌ Errore durante il fetch dei dati:', err);
      setError('Errore durante il fetch dei dati: ' + (err.message || 'errore sconosciuto'));
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per ottenere i dati dei video e le loro analytics
  const fetchVideoAnalyticsData = async (userEmail: string) => {
    if (!userEmail) {
      setError('Informazioni utente non disponibili');
      return;
    }
    
    setIsLoadingVideos(true);
    setError(null);
    
    try {
      // Prima ottieni la lista dei video del canale (ultimi 5)
      const channelRes = await gapi.client.youtube.channels.list({
        mine: true,
        part: 'id',
      });

      const channelId = channelRes.result.items?.[0]?.id;
      if (!channelId) throw new Error('Nessun canale trovato');

      // Assicurati che i token siano configurati in gapi.client
      if (accessToken && !gapi.client.getToken()) {
        gapi.client.setToken({ access_token: accessToken });
      }

      // Ottieni i video del canale
      const videosRes = await gapi.client.youtube.search.list({
        part: 'snippet',
        channelId: channelId,
        order: 'date',
        type: 'video',
        maxResults: 5
      });

      if (!videosRes.result.items || videosRes.result.items.length === 0) {
        setError('Nessun video trovato sul canale');
        setIsLoadingVideos(false);
        return;
      }

      const videos: VideoData[] = [];

      // Per ogni video, ottieni le analytics
      for (const video of videosRes.result.items) {
        try {
          const videoId = video.id.videoId;
          
          // Ottieni analytics per questo video specifico
          const analyticsRes = await gapi.client.youtubeAnalytics.reports.query({
            ids: `channel==${channelId}`,
            startDate: '2018-01-01',
            endDate: '2024-12-31',
            metrics: 'views,likes,comments,estimatedMinutesWatched,averageViewDuration',
            filters: `video==${videoId}`,
          });

          const analytics = analyticsRes.result.rows?.[0] || [0, 0, 0, 0, 0];
          
          const videoData: VideoData = {
            id: videoId,
            title: video.snippet.title,
            publishedAt: video.snippet.publishedAt,
            thumbnails: video.snippet.thumbnails,
            analytics: {
              views: analytics[0] || 0,
              likes: analytics[1] || 0,
              comments: analytics[2] || 0,
              estimatedMinutesWatched: Math.round(analytics[3] || 0),
              averageViewDuration: Math.round(analytics[4] || 0)
            }
          };
          
          videos.push(videoData);
        } catch (videoErr) {
          console.warn(`Errore nel recupero analytics per video ${video.id.videoId}:`, videoErr);
          // Aggiungi il video anche senza analytics
          videos.push({
            id: video.id.videoId,
            title: video.snippet.title,
            publishedAt: video.snippet.publishedAt,
            thumbnails: video.snippet.thumbnails,
            analytics: {
              views: 0,
              likes: 0,
              comments: 0,
              estimatedMinutesWatched: 0,
              averageViewDuration: 0
            }
          });
        }
      }

      const videoStorageKey = `yt_video_data_${userEmail}`;
      
      // Salva i dati nel localStorage
      const cachedData: CachedVideoData = {
        videos: videos,
        timestamp: Date.now()
      };
      
      setVideoData(videos);
      localStorage.setItem(videoStorageKey, JSON.stringify(cachedData));
      
      console.log('✅ Dati video salvati con successo:', videos);
    } catch (err: any) {
      console.error('❌ Errore durante il fetch dei dati video:', err);
      setError('Errore durante il fetch dei dati video: ' + (err.message || 'errore sconosciuto'));
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Funzione per gestire il logout
  const handleLogout = () => {
    // Rimuovi i dati dell'utente dal localStorage
    localStorage.removeItem('yt_user_data');
    
    // Pulisci lo stato
    setAccessToken(null);
    setUserData(null);
    setData(null);
    setVideoData([]);
    
    // Se abbiamo un token client disponibile, inizia una nuova autenticazione
    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  };

  if (!isClient) return null;

  const handleLogin = () => {
    if (!tokenClient) {
      setError('Token client non inizializzato');
      return;
    }
    setIsInitializing(true);
    tokenClient.requestAccessToken();
  };

  const fetchAnalytics = async () => {
    console.log('🔄 fetchAnalytics chiamata, userData:', userData);
    if (!userData?.email) {
      setError('Informazioni utente non disponibili');
      return;
    }
    
    console.log('📊 Inizio caricamento dati canale per:', userData.email);
    await fetchAnalyticsData(userData.email || 'unknown');
  };

  const fetchVideoAnalytics = async () => {
    if (!userData?.email) {
      setError('Informazioni utente non disponibili');
      return;
    }
    
    await fetchVideoAnalyticsData(userData.email || 'unknown');
  };

  // Transform data for the chart (with validation)
  const transformedData = data?.rows?.map((row: any) => {
    // Parse the date from YYYY-MM-DD format
    const dateParts = row[0].split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2]);
    
    // Format the date for display
    const formattedDate = `${day}/${month + 1}`; // Solo giorno e mese per maggiore chiarezza
    
    return {
      rawDate: row[0],
      date: formattedDate,
      month: month + 1,
      year: year,
      views: row[1],
      likes: row[2],
      minutesWatched: Math.round(row[3])
    };
  }) || [];

  // Sort data by date for proper display
  transformedData.sort((a: any, b: any) => {
    const dateA = new Date(a.rawDate);
    const dateB = new Date(b.rawDate);
    return dateA.getTime() - dateB.getTime();
  });

  // Debugging output
  if (process.env.NODE_ENV !== 'production') {
    console.log('RENDER STATE:', { 
      isInitializing, 
      accessToken: !!accessToken, 
      hasSupabaseSession: !!session,
      supabaseUserEmail: session?.user?.email,
      userData: !!userData, 
      hasData: !!data,
      dataRowCount: data?.rows?.length || 0,
      hasVideoData: videoData.length > 0,
      videoCount: videoData.length,
      shouldShowLogin: !userData,
      shouldShowContent: !!userData,
      sessionLoading,
      isIntegratedWithSupabase: session?.user?.email === userData?.email,
      buttonsDisabled: !accessToken,
      showInitialButtons: !data && !videoData.length,
      dateRange: data?.rows ? {
        first: data.rows[0]?.[0],
        last: data.rows[data.rows.length - 1]?.[0]
      } : null
    });
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>YouTube Analytics</CardTitle>
          {userData && (
            <CardDescription className="space-y-1">
              <div>Connesso come: {userData.name}</div>
              {session?.user?.email && session.user.email === userData.email && (
                <div className="text-xs text-green-600">🔗 Integrato con account Supabase</div>
              )}
            </CardDescription>
          )}
        </div>
        {userData && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
            Cambia Account
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isInitializing ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Inizializzazione in corso...</span>
          </div>
        ) : !userData ? (
          <Button onClick={handleLogin} className="w-full md:w-auto">
            {session?.user?.email ? 'Connetti YouTube Analytics' : 'Connettiti con Google'}
          </Button>
        ) : (
          <>
            {!data && !videoData.length && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    {session?.user?.email 
                      ? `Connetti il tuo account YouTube per visualizzare i dati di Analytics.` 
                      : `Non ci sono dati cached. Effettua il login per caricare i dati di YouTube Analytics.`
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => {
                        console.log('🔴 Pulsante "Carica dati canale" cliccato');
                        fetchAnalytics();
                      }}
                      disabled={isLoading || !accessToken}
                      className="w-full md:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Caricamento...
                        </>
                      ) : (
                        'Carica dati canale'
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        console.log('🔵 Pulsante "Carica analytics video" cliccato');
                        fetchVideoAnalytics();
                      }}
                      disabled={isLoadingVideos || !accessToken}
                      className="w-full md:w-auto"
                    >
                      {isLoadingVideos ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Caricamento video...
                        </>
                      ) : (
                        'Carica analytics video'
                      )}
                    </Button>
                  </div>
                  {!accessToken && (
                    <p className="text-sm text-muted-foreground mt-2">
                      (Login YouTube richiesto per aggiornare i dati)
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive mb-3">{error}</p>
                <Button 
                  onClick={retryInitialization}
                  variant="outline"
                  size="sm"
                >
                  Ricarica Pagina
                </Button>
              </div>
            )}

            {data && data.rows && data.rows.length > 0 && (
              <div className="w-full mt-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Card className="flex-1 p-4 text-center">
                    <CardTitle className="text-3xl">
                      {data.rows.reduce((sum: number, row: any) => sum + row[1], 0).toLocaleString()}
                    </CardTitle>
                    <CardDescription>Visualizzazioni Totali</CardDescription>
                  </Card>
                  <Card className="flex-1 p-4 text-center">
                    <CardTitle className="text-3xl">
                      {data.rows.reduce((sum: number, row: any) => sum + row[2], 0).toLocaleString()}
                    </CardTitle>
                    <CardDescription>Like Totali</CardDescription>
                  </Card>
                  <Card className="flex-1 p-4 text-center">
                    <CardTitle className="text-3xl">
                      {Math.round(data.rows.reduce((sum: number, row: any) => sum + row[3], 0)).toLocaleString()}
                    </CardTitle>
                    <CardDescription>Minuti Guardati</CardDescription>
                  </Card>
                </div>
                
                <div className="h-[400px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={transformedData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        interval={transformedData.length > 30 ? Math.ceil(transformedData.length / 15) : 0}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => {
                          const dataPoint = transformedData.find((item: any) => item.date === label);
                          return dataPoint ? `Data: ${dataPoint.rawDate}` : label;
                        }}
                        formatter={(value, name) => {
                          return [value.toLocaleString('it-IT'), name];
                        }}
                      />
                      <Bar dataKey="views" fill="#8884d8" name="Visualizzazioni" />
                      <Bar dataKey="likes" fill="#82ca9d" name="Like" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2 text-center space-y-1">
                  <div>
                    <strong>Dati 2018-2024:</strong> {transformedData.length > 0 ? 
                      `${transformedData[0].rawDate} - ${transformedData[transformedData.length-1].rawDate} (${transformedData.length} giorni)` : 
                      'Nessun dato'}
                  </div>
                  {userData?.email && (() => {
                    const storageKey = `yt_analytics_data_${userData.email}`;
                    const cached = localStorage.getItem(storageKey);
                    if (cached) {
                      try {
                        const parsed = JSON.parse(cached);
                        const lastUpdated = new Date(parsed.timestamp).toLocaleString('it-IT');
                        return <div className="text-xs">📁 Dati cached - Ultimo aggiornamento: {lastUpdated}</div>;
                      } catch (e) {
                        return null;
                      }
                    }
                    return null;
                  })()}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={fetchAnalytics} 
                    variant="outline" 
                    disabled={isLoading || !accessToken}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aggiornamento...
                      </>
                    ) : (
                      'Aggiorna dati canale'
                    )}
                  </Button>
                  
                  <Button 
                    onClick={fetchVideoAnalytics} 
                    variant="outline" 
                    disabled={isLoadingVideos || !accessToken}
                  >
                    {isLoadingVideos ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Caricamento video...
                      </>
                    ) : (
                      'Carica analytics video'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Sezione Video Analytics */}
            {videoData.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Analytics per Video (Ultimi 5)</h3>
                  {userData?.email && (() => {
                    const videoStorageKey = `yt_video_data_${userData.email}`;
                    const cached = localStorage.getItem(videoStorageKey);
                    if (cached) {
                      try {
                        const parsed = JSON.parse(cached);
                        const lastUpdated = new Date(parsed.timestamp).toLocaleString('it-IT');
                        return <div className="text-xs text-muted-foreground">📁 Cache: {lastUpdated}</div>;
                      } catch (e) {
                        return null;
                      }
                    }
                    return null;
                  })()}
                </div>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {videoData.map((video) => (
                    <Card key={video.id} className="p-4">
                      <div className="flex gap-4">
                        {video.thumbnails?.default && (
                          <img 
                            src={video.thumbnails.default.url} 
                            alt={video.title}
                            className="w-20 h-15 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-2 line-clamp-2">
                            {video.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Pubblicato: {new Date(video.publishedAt).toLocaleDateString('it-IT')}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center p-2 bg-muted rounded">
                              <div className="font-semibold">{video.analytics?.views?.toLocaleString() || '0'}</div>
                              <div className="text-muted-foreground">Visualizzazioni</div>
                            </div>
                            <div className="text-center p-2 bg-muted rounded">
                              <div className="font-semibold">{video.analytics?.likes?.toLocaleString() || '0'}</div>
                              <div className="text-muted-foreground">Like</div>
                            </div>
                            <div className="text-center p-2 bg-muted rounded">
                              <div className="font-semibold">{video.analytics?.comments?.toLocaleString() || '0'}</div>
                              <div className="text-muted-foreground">Commenti</div>
                            </div>
                            <div className="text-center p-2 bg-muted rounded">
                              <div className="font-semibold">{video.analytics?.estimatedMinutesWatched?.toLocaleString() || '0'}</div>
                              <div className="text-muted-foreground">Min. guardati</div>
                            </div>
                          </div>
                          
                          {video.analytics && video.analytics.averageViewDuration > 0 && (
                            <div className="mt-2 text-xs text-center p-2 bg-blue-50 rounded">
                              <div className="font-semibold">{Math.round(video.analytics.averageViewDuration / 60)}min {video.analytics.averageViewDuration % 60}s</div>
                              <div className="text-muted-foreground">Durata media visualizzazione</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {data && (!data.rows || data.rows.length === 0) && (
              <p>Nessun dato disponibile per il periodo selezionato.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}