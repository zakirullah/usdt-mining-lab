async function test() {
  // Test register
  const registerRes = await fetch('http://localhost:3000/api/auth/register-wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      loginPin: '111111',
      withdrawPin: '222222'
    })
  });
  console.log('Register Status:', registerRes.status);
  const regData = await registerRes.json();
  console.log('Register Response:', regData);
  
  // Test login
  const loginRes = await fetch('http://localhost:3000/api/auth/login-wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      pin: '111111'
    })
  });
  console.log('\nLogin Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Response:', loginData);
}

test();
