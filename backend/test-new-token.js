// test-new-token.js
require('dotenv').config();
const { google } = require('googleapis');

console.log('🔐 Testing New Refresh Token\n');

async function test() {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    
    console.log('🔄 Getting new access token...');
    const { token } = await oAuth2Client.getAccessToken();
    
    if (token) {
      console.log('✅ SUCCESS! New token works!');
      console.log('📧 You can now send emails');
    } else {
      console.log('❌ Failed to get access token');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n⚠️  Token is still invalid. Possible reasons:');
      console.log('1. Copied token incorrectly (missing characters)');
      console.log('2. Not the same email used for authorization');
      console.log('3. Token already used/revoked');
    }
  }
}

test();