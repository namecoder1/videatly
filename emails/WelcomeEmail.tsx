import { Text, Img, Container, Section, Hr, Link, Head, Row, Column } from '@react-email/components';
import * as React from 'react';
import Email from '@/components/email';

const currentYear = new Date().getFullYear();

export const WelcomeEmail = () => (

  <Email>
    <Head>
      <title>Welcome to Videatly</title>
    </Head>
    <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Img src={'https://vthchdyzjobsniwywuxy.supabase.co/storage/v1/object/public/assets/logo.png'} alt="Videatly Logo" width={144} height={144} style={{ margin: '0 auto' }} />
      </Section>
      
      <Section style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937', fontFamily: 'sans-serif' }}>
          Welcome to Videatly!
        </Text>
        
        <Text style={{ fontSize: '16px', marginBottom: '24px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          We are excited to have you on board. Your adventure with Videatly starts really soon!
        </Text>
        
        <Text style={{ fontSize: '16px', marginBottom: '24px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          We are working hard to bring you the best experience possible. You'll be the first to know when we launch.
          If you like what we are doing, please share the news with your friends and family, or related creators.
        </Text>
        
        <Section style={{ textAlign: 'center', margin: '48px 0' }}>
          <Row>
            <Column style={{ paddingRight: '10px' }}>
              <Link 
                href='https://www.instagram.com/videatly/'
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  color: '#1f2937',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                <Img 
                  src='https://vthchdyzjobsniwywuxy.supabase.co/storage/v1/object/public/assets//instagram.png' 
                  alt='Instagram' 
                  width={28} 
                  height={28}
                  style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}
                />
                <span style={{ verticalAlign: 'middle' }}>Follow on Instagram</span>
              </Link>
            </Column>
            <Column style={{ paddingLeft: '10px' }}>
              <Link 
                href='https://youtube.com/@videatly'
                style={{
                  backgroundColor: '#dc2626',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  color: 'white',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                <Img 
                  src='https://vthchdyzjobsniwywuxy.supabase.co/storage/v1/object/public/assets//youtube.png' 
                  alt='Youtube'
                  width={28} 
                  height={28}
                  style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}
                />
                <span style={{ verticalAlign: 'middle' }}>Watch Tutorials</span>
              </Link>
            </Column>
          </Row>
        </Section>
        
        <Text style={{ fontSize: '16px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          If you have questions, suggestions or need assistance, please don't hesitate to contact us.
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

export default WelcomeEmail; 