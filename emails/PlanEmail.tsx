import { Text, Img, Container, Section, Hr, Link, Head, Row, Column } from '@react-email/components';
import * as React from 'react';
import Email from '@/components/email';

const currentYear = new Date().getFullYear();

export const PlanEmail = ({ plan, invoiceUrl, price, endDate }: { plan: string, invoiceUrl: string, price: number, endDate: string | undefined }) => (

  <Email>
    <Head>
      <title>Your {plan} plan is ready</title>
    </Head>
    <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Img src={'https://vthchdyzjobsniwywuxy.supabase.co/storage/v1/object/public/assets/logo.png'} alt="Videatly Logo" width={144} height={144} style={{ margin: '0 auto' }} />
      </Section>
      
      <Section style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937', fontFamily: 'sans-serif' }}>
        Your {plan} plan is ready!
        </Text>
        
        <Text style={{ fontSize: '16px', marginBottom: '24px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          Thank you for subscribing to the {plan} plan!
        </Text>
        
        <Text style={{ fontSize: '16px', marginBottom: '24px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          You can view your invoice here: <Link href={invoiceUrl} style={{ color: '#2563eb', textDecoration: 'none', fontFamily: 'sans-serif' }}>
            click me
          </Link>
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '24px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          Your subscription will end on {endDate}
        </Text>
       
        <Text style={{ fontSize: '16px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          You have spent {price / 100}€
        </Text>
        
        <Hr style={{ margin: '24px 0', borderColor: '#d1d5db' }} />
        
        <Text style={{ fontSize: '16px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          Thanks,<br />
          The Videatly Team
        </Text>
      </Section>
      
      <Section style={{ marginTop: '32px', textAlign: 'center' }}>
        <Text style={{ fontSize: '12px', color: '#6b7280' }}>© {currentYear} Videatly. All rights reserved.</Text>
      </Section>
    </Container>
  </Email>
);

export default PlanEmail; 