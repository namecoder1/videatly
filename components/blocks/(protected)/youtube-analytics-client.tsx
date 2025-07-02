"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Heart,
  Loader2,
  LogOut,
  MessageCircle,
  Eye,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { UserData, VideoData, CachedVideoData } from "@/types/types";
import { loadCachedData, loadGoogleScripts } from "@/lib/utils";
import Image from "next/image";

declare const google: any;
declare const gapi: any;

declare global {
  interface Window {
    gapi: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const SCOPES =
  "https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly";



export default function YoutubeAnalyticsClient() {
  const {
    session,
    loading: sessionLoading,
    googleTokens,
  } = useSupabaseSession();
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



  // Load user data from localStorage on component mount
  useEffect(() => {
    if (typeof window === "undefined" || sessionLoading) return;
    setIsClient(true);

    // Se l'utente è loggato in Supabase, proviamo a facilitare il Single Sign-On
    if (session && session.user.email) {
      console.log(
        "🔑 Utente loggato in Supabase, controllo dati YouTube cached..."
      );

      // Controlla se abbiamo già dati YouTube per questo utente
      const userEmail = session.user.email;
      const storageKey = `yt_analytics_data_${userEmail}`;
      const videoStorageKey = `yt_video_data_${userEmail}`;
      const cachedAnalytics = localStorage.getItem(storageKey);
      const cachedVideos = localStorage.getItem(videoStorageKey);

      if (cachedAnalytics || cachedVideos) {
        console.log(
          "📊 Trovati dati YouTube cached per questo utente Supabase"
        );

        const userDataObj: UserData = {
          name: session.user.user_metadata?.full_name || session.user.email,
          email: userEmail,
          // Non impostiamo accessToken qui perché non lo abbiamo da Supabase
        };

        setUserData(userDataObj);
        loadCachedData(userEmail, setData, setVideoData);

        // Non fare return qui, continuiamo con l'inizializzazione GAPI per permettere aggiornamenti
      }
    }

    // Fallback: Try to load user data from localStorage
    const savedUserData = localStorage.getItem("yt_user_data");
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData) as UserData;

        // Sempre carica i dati dell'utente se esistono (indipendentemente dal token)
        setUserData(parsed);

        // Verifica se il token è ancora valido
        const tokenIsValid =
          parsed.tokenExpiry && Date.now() < parsed.tokenExpiry;

        if (tokenIsValid && parsed.accessToken) {
          setAccessToken(parsed.accessToken);
        }

        // SEMPRE carica i dati cached se esistenti (indipendentemente dal token)
        loadCachedData(parsed.email || "unknown", setData, setVideoData);
      } catch (e) {
        console.warn("Cached user data corrupted:", e);
        localStorage.removeItem("yt_user_data");
      }
    }

    const waitForGapi = () =>
      new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
          console.log(
            `GAPI Tentativo ${attempts + 1}: gapi=`,
            typeof window.gapi !== "undefined" ? "defined" : "undefined"
          );

          if (typeof window.gapi !== "undefined") {
            clearInterval(interval);
            console.log("✅ GAPI caricato con successo");
            resolve();
          } else if (attempts > 50) {
            // Aumentato il numero di tentativi
            clearInterval(interval);
            console.error("❌ GAPI not loaded after 50 attempts");
            reject(new Error("gapi not loaded"));
          }
          attempts++;
        }, 500); // Aumentato l'intervallo a 500ms
      });

    const initGapiClient = async () => {
      try {
        await waitForGapi();

        await new Promise((resolve) => {
          gapi.load("client", resolve);
        });

        await gapi.client.init({
          apiKey: "",
          discoveryDocs: [
            "https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2",
            "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
          ],
        });

        // Se abbiamo un token valido, impostalo in gapi.client
        if (accessToken) {
          gapi.client.setToken({ access_token: accessToken });
        }

        return true;
      } catch (err) {
        console.error("Failed to initialize GAPI:", err);
        return false;
      }
    };

    const waitForGoogleIdentity = () =>
      new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
          console.log(
            `Tentativo ${attempts + 1}: google=`,
            typeof google !== "undefined" ? "defined" : "undefined",
            "accounts=",
            typeof google !== "undefined" && google.accounts
              ? "defined"
              : "undefined"
          );

          if (
            typeof google !== "undefined" &&
            google.accounts &&
            google.accounts.oauth2
          ) {
            clearInterval(interval);
            console.log("✅ Google Identity Services caricato con successo");
            resolve();
          } else if (attempts > 50) {
            // Aumentato il numero di tentativi
            clearInterval(interval);
            console.error(
              "❌ Google Identity Services not loaded after 50 attempts"
            );
            reject(new Error("Google Identity Services not loaded"));
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
              setError("Errore nel login: " + response.error);
              return;
            }

            // Calcola la scadenza del token (1 ora dal rilascio, standard per Google)
            const tokenExpiry = Date.now() + 60 * 60 * 1000;

            // Set the access token and configure GAPI client
            setAccessToken(response.access_token);
            gapi.client.setToken({ access_token: response.access_token });

            // Get user info
            try {
              const userInfo = await gapi.client.youtube.channels.list({
                mine: true,
                part: "snippet",
              });

              const channelInfo = userInfo.result.items?.[0]?.snippet;
              const userId = userInfo.result.items?.[0]?.id;

              if (channelInfo) {
                // Se l'utente è loggato in Supabase, usa quell'email, altrimenti usa i dati YouTube
                const userEmail =
                  session?.user?.email ||
                  channelInfo.customUrl ||
                  userId ||
                  "unknown";
                const userName =
                  session?.user?.user_metadata?.full_name || channelInfo.title;

                const userDataObj: UserData = {
                  name: userName,
                  email: userEmail,
                  accessToken: response.access_token,
                  tokenExpiry: tokenExpiry,
                };

                // Save to state and localStorage
                setUserData(userDataObj);
                localStorage.setItem(
                  "yt_user_data",
                  JSON.stringify(userDataObj)
                );

                // Carica i dati cached se esistenti
                loadCachedData(userEmail, setData, setVideoData);
              }
            } catch (err) {
              console.error("Error fetching user info:", err);
            }
          },
        });

        setTokenClient(client);

        // Finisci sempre l'inizializzazione - il login silenzioso è opzionale
        setIsInitializing(false);

        // Se abbiamo già dei dati utente salvati e non abbiamo un token valido,
        // prova il login silenzioso MA solo se non abbiamo già dati cached
        const savedUserData = localStorage.getItem("yt_user_data");
        if (savedUserData && !accessToken) {
          try {
            const parsedUserData = JSON.parse(savedUserData);
            const hasAnalyticsCache = localStorage.getItem(
              `yt_analytics_data_${parsedUserData.email}`
            );
            const hasVideoCache = localStorage.getItem(
              `yt_video_data_${parsedUserData.email}`
            );

            // Solo se non abbiamo NESSUN dato cached, prova il login silenzioso
            if (!hasAnalyticsCache && !hasVideoCache) {
              console.log(
                "Nessun dato cached trovato, tentativo di login silenzioso..."
              );
              client.requestAccessToken({ prompt: "" });
            } else {
              console.log(
                "Dati cached trovati, login silenzioso non necessario"
              );
            }
          } catch (e) {
            console.error("Error checking cached data:", e);
          }
        }

        return client;
      } catch (err) {
        console.error("Failed to initialize GIS:", err);
        setIsInitializing(false);
        return null;
      }
    };

    const initialize = async () => {
      try {
        console.log("🚀 Inizializzazione YouTube Analytics...");

        // Prima prova a caricare gli script se non sono disponibili
        await loadGoogleScripts(google, setData, setVideoData);

        // Aspetta un po' per dare tempo agli script di inizializzarsi
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const gapiInitialized = await initGapiClient();
        if (gapiInitialized) {
          console.log("📡 GAPI inizializzato, inizializzazione GIS...");
          await initGIS();
          console.log("✅ Inizializzazione completata con successo");
        } else {
          console.error("❌ Fallimento inizializzazione GAPI");
          setError(
            "Errore durante il caricamento delle API di Google. Riprova più tardi."
          );
          setIsInitializing(false);
        }
      } catch (error) {
        console.error("❌ Errore durante l'inizializzazione:", error);
        setError(
          `Errore di inizializzazione: ${error instanceof Error ? error.message : "Errore sconosciuto"}. Ricarica la pagina per riprovare.`
        );
        setIsInitializing(false);
      }
    };

    initialize();
  }, [session, googleTokens, sessionLoading]); // Dipende dalla sessione Supabase

  // Retry function that just reloads the page for simplicity
  const retryInitialization = () => {
    console.log("🔄 Ricaricamento pagina per riprovare inizializzazione...");
    window.location.reload();
  };

  // Define fetchAnalyticsData function outside of the useEffect to reuse it
  const fetchAnalyticsData = async (userEmail: string) => {
    console.log("📊 fetchAnalyticsData avviata per email:", userEmail);
    console.log("🔑 AccessToken disponibile:", !!accessToken);
    console.log("🌐 GAPI client configurato:", !!gapi?.client?.getToken());

    if (!userEmail) {
      setError("Informazioni utente non disponibili");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verifica che GAPI sia pronto
      if (!gapi || !gapi.client) {
        throw new Error("GAPI client non inizializzato");
      }

      // Assicurati che i token siano configurati in gapi.client
      if (accessToken && !gapi.client.getToken()) {
        console.log("🔐 Configurazione token in GAPI client...");
        gapi.client.setToken({ access_token: accessToken });
      }

      const currentToken = gapi.client.getToken();
      console.log(
        "🎫 Token corrente in GAPI:",
        currentToken ? "Presente" : "Assente"
      );

      if (!currentToken) {
        throw new Error("Token di accesso non configurato in GAPI client");
      }

      console.log("🎯 Recupero informazioni canale...");
      const channelRes = await gapi.client.youtube.channels.list({
        mine: true,
        part: "id",
      });

      console.log("📺 Risposta canale:", channelRes);

      const channelId = channelRes.result.items?.[0]?.id;
      if (!channelId) throw new Error("Nessun canale trovato");

      const res = await gapi.client.youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate: "2018-01-01",
        endDate: "2024-12-31",
        metrics: "views,likes,estimatedMinutesWatched,videos",
        dimensions: "day",
        sort: "day",
      });

      console.log(res);

      // Check if we got valid data
      if (!res.result || !res.result.rows || res.result.rows.length === 0) {
        setError("Nessun dato disponibile per il periodo selezionato");
        setIsLoading(false);
        return;
      }

      const storageKey = `yt_analytics_data_${userEmail}`;

      // Save to state and localStorage
      setData(res.result);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          data: res.result,
          timestamp: Date.now(),
        })
      );

      console.log("✅ Dati salvati con successo:", res.result);
    } catch (err: any) {
      console.error("❌ Errore durante il fetch dei dati:", err);
      setError(
        "Errore durante il fetch dei dati: " +
          (err.message || "errore sconosciuto")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per ottenere i dati dei video e le loro analytics
  const fetchVideoAnalyticsData = async (userEmail: string) => {
    if (!userEmail) {
      setError("Informazioni utente non disponibili");
      return;
    }

    setIsLoadingVideos(true);
    setError(null);

    try {
      // Prima ottieni la lista dei video del canale (ultimi 5)
      const channelRes = await gapi.client.youtube.channels.list({
        mine: true,
        part: "id",
      });

      const channelId = channelRes.result.items?.[0]?.id;
      if (!channelId) throw new Error("Nessun canale trovato");

      // Assicurati che i token siano configurati in gapi.client
      if (accessToken && !gapi.client.getToken()) {
        gapi.client.setToken({ access_token: accessToken });
      }

      // Ottieni i video del canale
      const videosRes = await gapi.client.youtube.search.list({
        part: "snippet",
        channelId: channelId,
        order: "date",
        type: "video",
        maxResults: 5,
      });

      if (!videosRes.result.items || videosRes.result.items.length === 0) {
        setError("Nessun video trovato sul canale");
        setIsLoadingVideos(false);
        return;
      }

      const videos: VideoData[] = [];

      // Per ogni video, ottieni le analytics
      for (const video of videosRes.result.items) {
        try {
          const videoId = video.id.videoId;

          // Ottieni analytics per questo video specifico
          const analyticsRes = await gapi.client.youtubeAnalytics.reports.query(
            {
              ids: `channel==${channelId}`,
              startDate: "2018-01-01",
              endDate: "2024-12-31",
              metrics:
                "views,likes,comments,estimatedMinutesWatched,averageViewDuration",
              filters: `video==${videoId}`,
            }
          );

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
              averageViewDuration: Math.round(analytics[4] || 0),
            },
          };

          videos.push(videoData);
        } catch (videoErr) {
          console.warn(
            `Errore nel recupero analytics per video ${video.id.videoId}:`,
            videoErr
          );
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
              averageViewDuration: 0,
            },
          });
        }
      }

      const videoStorageKey = `yt_video_data_${userEmail}`;

      // Salva i dati nel localStorage
      const cachedData: CachedVideoData = {
        videos: videos,
        timestamp: Date.now(),
      };

      setVideoData(videos);
      localStorage.setItem(videoStorageKey, JSON.stringify(cachedData));

      console.log("✅ Dati video salvati con successo:", videos);
    } catch (err: any) {
      console.error("❌ Errore durante il fetch dei dati video:", err);
      setError(
        "Errore durante il fetch dei dati video: " +
          (err.message || "errore sconosciuto")
      );
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Funzione per gestire il logout
  const handleLogout = () => {
    // Rimuovi i dati dell'utente dal localStorage
    localStorage.removeItem("yt_user_data");

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
      setError("Token client non inizializzato");
      return;
    }
    setIsInitializing(true);
    tokenClient.requestAccessToken();
  };

  const fetchAnalytics = async () => {
    console.log("🔄 fetchAnalytics chiamata, userData:", userData);
    if (!userData?.email) {
      setError("Informazioni utente non disponibili");
      return;
    }

    console.log("📊 Inizio caricamento dati canale per:", userData.email);
    await fetchAnalyticsData(userData.email || "unknown");
  };

  const fetchVideoAnalytics = async () => {
    if (!userData?.email) {
      setError("Informazioni utente non disponibili");
      return;
    }

    await fetchVideoAnalyticsData(userData.email || "unknown");
  };

  // Transform data for the chart (with validation)
  const transformedData =
    data?.rows?.map((row: any) => {
      // Parse the date from YYYY-MM-DD format
      const dateParts = row[0].split("-");
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
        minutesWatched: Math.round(row[3]),
      };
    }) || [];

  // Sort data by date for proper display
  transformedData.sort((a: any, b: any) => {
    const dateA = new Date(a.rawDate);
    const dateB = new Date(b.rawDate);
    return dateA.getTime() - dateB.getTime();
  });

  // Debugging output
  if (process.env.NODE_ENV !== "production") {
    console.log("RENDER STATE:", {
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
      dateRange: data?.rows
        ? {
            first: data.rows[0]?.[0],
            last: data.rows[data.rows.length - 1]?.[0],
          }
        : null,
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
              {session?.user?.email &&
                session.user.email === userData.email && (
                  <div className="text-xs text-green-600">
                    🔗 Integrato con account Supabase
                  </div>
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
            {session?.user?.email
              ? "Connetti YouTube Analytics"
              : "Connettiti con Google"}
          </Button>
        ) : (
          <>
            {!data && !videoData.length && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    {session?.user?.email
                      ? `Connetti il tuo account YouTube per visualizzare i dati di Analytics.`
                      : `Non ci sono dati cached. Effettua il login per caricare i dati di YouTube Analytics.`}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => {
                        console.log(
                          '🔴 Pulsante "Carica dati canale" cliccato'
                        );
                        fetchAnalytics();
                      }}
                      disabled={isLoading || !accessToken}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Caricamento...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Carica dati canale
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => {
                        console.log(
                          '🔵 Pulsante "Carica analytics video" cliccato'
                        );
                        fetchVideoAnalytics();
                      }}
                      disabled={isLoadingVideos || !accessToken}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoadingVideos ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Caricamento video...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Carica analytics video
                        </>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
                    <div className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-blue-500 rounded-full">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                        {data.rows
                          .reduce((sum: number, row: any) => sum + row[1], 0)
                          .toLocaleString()}
                      </CardTitle>
                      <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                        Visualizzazioni Totali
                      </CardDescription>
                    </div>
                  </Card>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-900 border-red-200 dark:border-red-800">
                    <div className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-red-500 rounded-full">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                        {data.rows
                          .reduce((sum: number, row: any) => sum + row[2], 0)
                          .toLocaleString()}
                      </CardTitle>
                      <CardDescription className="text-red-600 dark:text-red-400 font-medium">
                        Like Totali
                      </CardDescription>
                    </div>
                  </Card>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 border-orange-200 dark:border-orange-800">
                    <div className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-orange-500 rounded-full">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-2">
                        {Math.round(
                          data.rows.reduce(
                            (sum: number, row: any) => sum + row[3],
                            0
                          )
                        ).toLocaleString()}
                      </CardTitle>
                      <CardDescription className="text-orange-600 dark:text-orange-400 font-medium">
                        Minuti Guardati
                      </CardDescription>
                    </div>
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
                        interval={
                          transformedData.length > 30
                            ? Math.ceil(transformedData.length / 15)
                            : 0
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(label) => {
                          const dataPoint = transformedData.find(
                            (item: any) => item.date === label
                          );
                          return dataPoint
                            ? `Data: ${dataPoint.rawDate}`
                            : label;
                        }}
                        formatter={(value, name) => {
                          return [value.toLocaleString("it-IT"), name];
                        }}
                      />
                      <Bar
                        dataKey="views"
                        fill="#8884d8"
                        name="Visualizzazioni"
                      />
                      <Bar dataKey="likes" fill="#82ca9d" name="Like" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-sm text-muted-foreground mt-2 text-center space-y-1">
                  <div>
                    <strong>Dati 2018-2024:</strong>{" "}
                    {transformedData.length > 0
                      ? `${transformedData[0].rawDate} - ${transformedData[transformedData.length - 1].rawDate} (${transformedData.length} giorni)`
                      : "Nessun dato"}
                  </div>
                  {userData?.email &&
                    (() => {
                      const storageKey = `yt_analytics_data_${userData.email}`;
                      const cached = localStorage.getItem(storageKey);
                      if (cached) {
                        try {
                          const parsed = JSON.parse(cached);
                          const lastUpdated = new Date(
                            parsed.timestamp
                          ).toLocaleString("it-IT");
                          return (
                            <div className="text-xs">
                              📁 Dati cached - Ultimo aggiornamento:{" "}
                              {lastUpdated}
                            </div>
                          );
                        } catch (e) {
                          return null;
                        }
                      }
                      return null;
                    })()}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    onClick={fetchAnalytics}
                    variant="outline"
                    disabled={isLoading || !accessToken}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aggiornamento...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Aggiorna dati canale
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={fetchVideoAnalytics}
                    variant="outline"
                    disabled={isLoadingVideos || !accessToken}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 text-purple-700 hover:text-purple-800 transition-all duration-200"
                  >
                    {isLoadingVideos ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Caricamento video...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Carica analytics video
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Sezione Video Analytics */}
            {videoData.length > 0 && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <BarChart3 className="h-7 w-7 text-blue-600" />
                    Analytics per Video
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <span className="text-sm text-muted-foreground px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Ultimi 5 video
                    </span>
                    {userData?.email &&
                      (() => {
                        const videoStorageKey = `yt_video_data_${userData.email}`;
                        const cached = localStorage.getItem(videoStorageKey);
                        if (cached) {
                          try {
                            const parsed = JSON.parse(cached);
                            const lastUpdated = new Date(
                              parsed.timestamp
                            ).toLocaleString("it-IT");
                            return (
                              <div className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-1">
                                📁 {lastUpdated}
                              </div>
                            );
                          } catch (e) {
                            return null;
                          }
                        }
                        return null;
                      })()}
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  {videoData.map((video, index) => (
                    <Card
                      key={video.id}
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                    >
                      <div className="p-6">
                        <div className="flex gap-4 mb-4">
                          {video.thumbnails?.default && (
                            <div className="relative flex-shrink-0">
                              <Image
                                src={video.thumbnails.default.url}
                                alt={video.title}
                                width={120}
                                height={90}
                                className="w-[120px] h-[90px] object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]"
                              />
                              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                                #{index + 1}
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base mb-2 line-clamp-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                              {video.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(video.publishedAt).toLocaleDateString(
                                  "it-IT"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className=" p-3 rounded-lg flex items-center gap-2">
                            <Eye className="h-4 w-4 mr-1" />
                            {video.analytics?.views?.toLocaleString() || "0"}
                            <p className="text-xs opacity-90">Visualizzazioni</p>
                          </div>
                          <div className=" p-3 rounded-lg flex items-center gap-2">
                            <Heart className="h-4 w-4 mr-1" />
                            {video.analytics?.likes?.toLocaleString() || "0"}
                            <p className="text-xs opacity-90">Like</p>
                          </div>
                          <div className=" p-3 rounded-lg flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 mr-1" />
                              {video.analytics?.comments?.toLocaleString() ||
                              "0"}
                            <p className="text-xs opacity-90">Commenti</p>
                          </div>
                          <div className=" p-3 rounded-lg flex items-center gap-2">
                            <Clock className="h-4 w-4 mr-1" />
                              {video.analytics?.estimatedMinutesWatched?.toLocaleString() ||
                              "0"}
                            <p className="text-xs opacity-90">Min. guardati</p>
                          </div>
                        </div>

                        {video.analytics &&
                          video.analytics.averageViewDuration > 0 && (
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border border-indigo-200 dark:border-indigo-800 p-3 rounded-lg text-center">
                              <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {Math.round(
                                  video.analytics.averageViewDuration / 60
                                )}
                                min {video.analytics.averageViewDuration % 60}s
                              </div>
                              <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                Durata media visualizzazione
                              </div>
                            </div>
                          )}
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
