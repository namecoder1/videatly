'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'
import { MessageSquareShare, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { githubIcon, instagramIcon, linkedinIcon, redditIcon } from '@/assets/home'
import Image from 'next/image'
import { useDictionary } from '@/app/context/dictionary-context'


type ReferenceSource = 'github' | 'linkedin' | 'instagram' | 'reddit';

const whyOptions = [
  'youtuber',
  'videomaker',
  'content creator',
  'marketing specialist',
  'influencer',
  'video editor',
];

const ThankYouPage = ({ searchParams } : {
  searchParams: { email: string }
}) => {
  const dict = useDictionary()

  // Decode the email parameter to handle URL encoding
  const email = searchParams.email ? decodeURIComponent(searchParams.email) : '';
  
  useEffect(() => {
    console.log('Thank you page received email:', email);
  }, [email]);
  
  const [referenceSource, setReferenceSource] = useState<ReferenceSource>('github');
  const [reasonValue, setReasonValue] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [userId, setUserId] = useState<string>('');
  const [userFetched, setUserFetched] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [alreadyUpdated, setAlreadyUpdated] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!email) {
        setFetchError('No email provided');
        setUserFetched(true);
        return;
      }

      try {
        // Use await with createClient like in hero.tsx
        const supabase = await createClient();
        const { data, error } = await supabase.from('lead_users').select('*').eq('email', email).single();
        
        if (error) {
          console.error('Error fetching user:', error);
          setFetchError(error.message);
        } else if (data) {
          console.log('Found user:', data);
          setUserId(data.id);
          setUserData(data);
          
          // Check if the user has already updated their preferences
          if (data.referenced_from || data.why_field) {
            console.log('User has already updated their preferences');
            setAlreadyUpdated(true);
            // Pre-fill form with existing data
            if (data.referenced_from) {
              setReferenceSource(data.referenced_from as ReferenceSource);
            }
            if (data.why_field) {
              setReasonValue(typeof data.why_field === 'string' ? data.why_field : '');
            }
          }
        } else {
          setFetchError('User not found');
        }
      } catch (err) {
        console.error('Exception fetching user:', err);
        setFetchError('An unexpected error occurred');
      } finally {
        setUserFetched(true);
      }
    };
    
    fetchUser();
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Prevent re-submission if already updated
    if (alreadyUpdated) {
      console.log('Form already submitted successfully');
      return;
    }
    
    setSubmitStatus('loading');
    
    console.log('Email from URL:', email);
    console.log('User ID:', userId);
    console.log('Submitting data:', {
      referenced_from: referenceSource,
      why_field: reasonValue
    });
    
    if (!email) {
      console.error('No email provided in URL parameters');
      setSubmitStatus('error');
      return;
    }
    
    if (!userId) {
      console.error('No user ID available for update');
      setSubmitStatus('error');
      return;
    }
    
    try {
      // Create client like in hero.tsx with await
      console.log('Starting update process...');
      const supabase = await createClient();
      
      // Get current data first to confirm we can access the record
      const { data: userData, error: fetchError } = await supabase
        .from('lead_users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching user before update:', fetchError);
        setSubmitStatus('error');
        return;
      }
      
      console.log('Current user data:', userData);
      
      // Perform the update - now with reason as string, not array
      console.log('Sending update with data:', {
        referenced_from: referenceSource,
        why_field: reasonValue
      });
      
      const { data, error } = await supabase
        .from('lead_users')
        .update({
          referenced_from: referenceSource,
          why_field: reasonValue
        })
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error('Update failed:', error);
        setSubmitStatus('error');
        return;
      }
      
      console.log('Update successful:', data);
      
      // Verify the update worked
      const { data: verifyData, error: verifyError } = await supabase
        .from('lead_users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (verifyError) {
        console.error('Error verifying update:', verifyError);
      } else {
        console.log('User data after update:', verifyData);
        setUserData(verifyData);
      }
      
      setSubmitStatus('success');
      setAlreadyUpdated(true);
    } catch (err) {
      console.error('Exception updating user:', err);
      setSubmitStatus('error');
    }
  }
  
  // Show different content based on user state
  const renderContent = () => {
    // Error fetching user
    if (fetchError) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {fetchError}. Please try registering again from the home page.
          </AlertDescription>
        </Alert>
      );
    }
    
    // User not found
    if (userFetched && !userId) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>User Not Found</AlertTitle>
          <AlertDescription>
            We couldn't find your registration. Please try registering again from the homepage.
          </AlertDescription>
        </Alert>
      );
    }
    
    // Already updated successfully
    if (alreadyUpdated && submitStatus === 'success') {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative my-8 w-24 pt-8">
            <div className="absolute inset-0 w-24 flex items-center justify-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl mt-5 font-semibold text-gray-900 mb-3">{dict.thankYou.title}</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            {dict.thankYou.description}
          </p>

          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <MessageSquareShare className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-700">{dict.thankYou.howYouFoundUs}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm text-gray-700 text-sm transition-all duration-300 hover:scale-105 border border-gray-100">
                    {referenceSource === 'github' && <Image src={githubIcon} alt="GitHub" className="h-5 w-5" />} 
                    {referenceSource === 'linkedin' && <Image src={linkedinIcon} alt="LinkedIn" className="h-5 w-5" />} 
                    {referenceSource === 'instagram' && <Image src={instagramIcon} alt="Instagram" className="h-5 w-5" />} 
                    {referenceSource === 'reddit' && <Image src={redditIcon} alt="Reddit" className="h-5 w-5" />} 
                    <span className="capitalize font-medium">{referenceSource}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-700">{dict.thankYou.form.yourCreatorProfile}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl shadow-sm text-gray-700 text-sm font-medium transition-all duration-300 hover:scale-105 border border-gray-100">
                    {reasonValue ? reasonValue.charAt(0).toUpperCase() + reasonValue.slice(1) : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-2">{dict.thankYou.next.title}</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-2">
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-gray-600 text-sm">{dict.thankYou.next.steps[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-gray-600 text-sm">{dict.thankYou.next.steps[1]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-gray-600 text-sm">{dict.thankYou.next.steps[2]}</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <a href="https://github.com/videatly" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Image src={githubIcon} alt="GitHub" className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com/company/videatly" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Image src={linkedinIcon} alt="LinkedIn" className="h-6 w-6" />
              </a>
              <a href="https://instagram.com/videatly" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Image src={instagramIcon} alt="Instagram" className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    // Standard form
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-left mb-8">
          <h3 className='font-raleway font-bold text-2xl mb-2'>{dict.thankYou.form.title}</h3>
          <p className="text-gray-500 text-sm">{dict.thankYou.form.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-medium mb-3 text-gray-900">{dict.thankYou.form.howYouFoundUs}</h2>
            </div>
            <RadioGroup
              value={referenceSource}
              onValueChange={(value) => setReferenceSource(value as ReferenceSource)}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {([
                { value: 'github', icon: githubIcon, label: 'GitHub' },
                { value: 'linkedin', icon: linkedinIcon, label: 'LinkedIn' },
                { value: 'instagram', icon: instagramIcon, label: 'Instagram' },
                { value: 'reddit', icon: redditIcon, label: 'Reddit' },
              ] as const).map(({ value, icon, label }) => (
                <div
                  key={value}
                  className={`relative group border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 
                    ${referenceSource === value 
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/30 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  tabIndex={0}
                  aria-checked={referenceSource === value}
                  role="radio"
                  onClick={() => setReferenceSource(value as ReferenceSource)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setReferenceSource(value as ReferenceSource); }}
                >
                  <div className={`p-2 rounded-lg transition-colors duration-200 ${
                    referenceSource === value ? 'bg-primary/20' : 'bg-gray-50 group-hover:bg-primary/10'
                  }`}>
                    <Image src={icon} alt={label} className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-200 ${
                    referenceSource === value ? 'text-primary font-semibold' : 'text-gray-700 group-hover:text-primary'
                  }`}>{label}</span>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-base font-medium mb-3 text-gray-900">{dict.thankYou.form.yourCreatorProfile}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {whyOptions.map((item) => (
                <div
                  key={item}
                  className={`relative group border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 
                    ${reasonValue === item 
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  tabIndex={0}
                  aria-checked={reasonValue === item}
                  role="radio"
                  onClick={() => setReasonValue(item)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setReasonValue(item); }}
                >
                  <div className={`p-2 rounded-lg transition-colors duration-200 ${
                    reasonValue === item ? 'bg-primary/20' : 'bg-gray-50 group-hover:bg-primary/10'
                  }`}>
                    <CheckCircle2 className={`h-5 w-5 transition-colors duration-200 ${
                      reasonValue === item ? 'text-primary scale-110' : 'text-gray-500 group-hover:text-primary'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium capitalize transition-colors duration-200 ${
                    reasonValue === item ? 'text-primary font-semibold' : 'text-gray-700 group-hover:text-primary'
                  }`}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-800 bg-gray-900"
              disabled={submitStatus === 'loading' || !userFetched || !userId || alreadyUpdated || !reasonValue}
            >
              {submitStatus === 'loading' ? <Loader2 className="animate-spin h-4 w-4" /> : null}
              {submitStatus === 'loading' ? dict.thankYou.form.submitLoading : alreadyUpdated ? dict.thankYou.form.submitSuccess : dict.thankYou.form.submit}
            </Button>
          </div>
          
          {submitStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{dict.thankYou.form.submitError}</AlertTitle>
              <AlertDescription>
                {dict.thankYou.form.submitErrorDescription}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    );
  };

  return (
    <section className='flex flex-col items-center justify-center min-h-[85vh] px-4 my-8'>
      <Card className="w-full max-w-2xl shadow-md border border-gray-200">
        <CardContent className={`pt-4 p-6 rounded-3xl ${alreadyUpdated && submitStatus === 'success' ? 'bg-gray-50' : ''}`}>
          {renderContent()}
        </CardContent>
      </Card>
    </section>
  )
}

export default ThankYouPage