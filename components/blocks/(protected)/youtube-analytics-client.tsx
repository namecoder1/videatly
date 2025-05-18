'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

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
  accessToken?: string; // Aggiunto per memorizzare il token
  tokenExpiry?: number; // Scadenza del token
}

export default function YoutubeAnalyticsClient() {
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Load user data from localStorage on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsClient(true);

    // Try to load user data from localStorage
    const savedUserData = localStorage.getItem('yt_user_data');
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData) as UserData;
        
        // Verifica se il token è ancora valido (non scaduto)
        const tokenIsValid = parsed.tokenExpiry && Date.now() < parsed.tokenExpiry;
        
        if (tokenIsValid && parsed.accessToken) {
          setUserData(parsed);
          setAccessToken(parsed.accessToken);
          
          // Try to load cached data for this user
          const storageKey = `yt_analytics_data_${parsed.email}`;
          const cachedData = localStorage.getItem(storageKey);
          if (cachedData) {
            try {
              const parsedData = JSON.parse(cachedData);
              const twelveHours = 1000 * 60 * 60 * 12;
              const expired = Date.now() - parsedData.timestamp > twelveHours;
              
              if (!expired) {
                setData(parsedData.data);
              }
            } catch (e) {
              console.warn('Cached analytics data corrupted:', e);
            }
          }
        } else {
          // Token scaduto o non presente, rimuovi i dati utente
          console.log('Token expired or missing, clearing user data');
          localStorage.removeItem('yt_user_data');
        }
      } catch (e) {
        console.warn('Cached user data corrupted:', e);
        localStorage.removeItem('yt_user_data');
      }
    }

    const waitForGapi = () =>
      new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
          if (typeof window.gapi !== 'undefined') {
            clearInterval(interval);
            resolve();
          } else if (attempts > 20) { // Increased timeout attempts
            clearInterval(interval);
            reject(new Error('gapi not loaded'));
          }
          attempts++;
        }, 200);
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
          if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
            clearInterval(interval);
            resolve();
          } else if (attempts > 20) { // Increased timeout attempts
            clearInterval(interval);
            reject(new Error('Google Identity Services not loaded'));
          }
          attempts++;
        }, 200);
      });

    const initGIS = async () => {
      try {
        await waitForGoogleIdentity();
        
        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (response: any) => {
            if (response.error) {
              console.error(response);
              setError('Errore nel login: ' + response.error);
              setIsInitializing(false);
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
                const userDataObj: UserData = {
                  name: channelInfo.title,
                  email: channelInfo.customUrl || userId || 'unknown',
                  accessToken: response.access_token,
                  tokenExpiry: tokenExpiry
                };
                
                // Save to state and localStorage
                setUserData(userDataObj);
                localStorage.setItem('yt_user_data', JSON.stringify(userDataObj));
                
                // Check for cached data specific to this user
                const storageKey = `yt_analytics_data_${userDataObj.email}`;
                const cached = localStorage.getItem(storageKey);
                
                if (cached) {
                  try {
                    const parsed = JSON.parse(cached);
                    const twelveHours = 1000 * 60 * 60 * 12;
                    const expired = Date.now() - parsed.timestamp > twelveHours;
                    
                    if (!expired) {
                      setData(parsed.data);
                    } else {
                      // If data expired, fetch new data automatically
                      fetchAnalyticsData(userDataObj.email || 'unknown');
                    }
                  } catch (e) {
                    console.warn('Cached data corrupted, ignoring it.');
                  }
                } else {
                  // No cached data, fetch automatically
                  fetchAnalyticsData(userDataObj.email || 'unknown');
                }
              }
            } catch (err) {
              console.error('Error fetching user info:', err);
            }
            
            setIsInitializing(false);
          },
        });

        setTokenClient(client);
        
        // Se non abbiamo già un token valido, facciamo un tentativo di login silenzioso
        if (!accessToken) {
          try {
            client.requestAccessToken({ prompt: '' });
          } catch (e) {
            console.error('Silent login failed:', e);
            setIsInitializing(false);
          }
        } else {
          setIsInitializing(false);
        }
        
        return client;
      } catch (err) {
        console.error('Failed to initialize GIS:', err);
        setIsInitializing(false);
        return null;
      }
    };

    const initialize = async () => {
      const gapiInitialized = await initGapiClient();
      if (gapiInitialized) {
        await initGIS();
      } else {
        setError('Errore durante il caricamento delle API di Google');
        setIsInitializing(false);
      }
    };

    initialize();
  }, [accessToken]); // Dipendenza modificata per reagire ai cambiamenti del token

  // Define fetchAnalyticsData function outside of the useEffect to reuse it
  const fetchAnalyticsData = async (userEmail: string) => {
    if (!userEmail) {
      setError('Informazioni utente non disponibili');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const channelRes = await gapi.client.youtube.channels.list({
        mine: true,
        part: 'id',
      });

      const channelId = channelRes.result.items?.[0]?.id;
      if (!channelId) throw new Error('Nessun canale trovato');
      

      const res = await gapi.client.youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate: '2018-01-01',
        endDate: '2024-12-31',
        metrics: 'views,likes,estimatedMinutesWatched',
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

  // Funzione per gestire il logout
  const handleLogout = () => {
    // Rimuovi i dati dell'utente dal localStorage
    localStorage.removeItem('yt_user_data');
    
    // Pulisci lo stato
    setAccessToken(null);
    setUserData(null);
    setData(null);
    
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
    if (!userData?.email) {
      setError('Informazioni utente non disponibili');
      return;
    }
    
    // Assicurati che userData.email sia una stringa
    await fetchAnalyticsData(userData.email || 'unknown');
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
      userData, 
      hasData: !!data,
      dataRowCount: data?.rows?.length || 0,
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
            <CardDescription>
              Connesso come: {userData.name}
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
        ) : !accessToken ? (
          <Button onClick={handleLogin} className="w-full md:w-auto">
            Connettiti con Google
          </Button>
        ) : (
          <>
            {!data && (
              <Button 
                onClick={fetchAnalytics}
                disabled={isLoading}
                className="w-full md:w-auto mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  'Carica dati Analytics'
                )}
              </Button>
            )}

            {error && <p className="text-destructive mt-3">{error}</p>}

            {data && data.rows && data.rows.length > 0 ? (
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
                        // Mostra più date per una migliore visibilità
                        interval={transformedData.length > 30 ? Math.ceil(transformedData.length / 15) : 0}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => {
                          // Find the corresponding data point to display the full date
                          const dataPoint = transformedData.find((item: any) => item.date === label);
                          return dataPoint ? `Data: ${dataPoint.rawDate}` : label;
                        }}
                        formatter={(value, name) => {
                          // Format values with thousand separators
                          return [value.toLocaleString('it-IT'), name];
                        }}
                      />
                      <Bar dataKey="views" fill="#8884d8" name="Visualizzazioni" />
                      <Bar dataKey="likes" fill="#82ca9d" name="Like" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2 text-center">
                  <strong>Dati 2018:</strong> {transformedData.length > 0 ? 
                    `${transformedData[0].rawDate} - ${transformedData[transformedData.length-1].rawDate} (${transformedData.length} giorni)` : 
                    'Nessun dato'}
                </div>

                <Button 
                  onClick={fetchAnalytics} 
                  variant="outline" 
                  className="mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aggiornamento...
                    </>
                  ) : (
                    'Aggiorna dati'
                  )}
                </Button>
              </div>
            ) : data ? (
              <p>Nessun dato disponibile per il periodo selezionato.</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}