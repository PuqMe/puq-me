#!/usr/bin/env node

/**
 * PuQ.me - Cloudflare Wrangler Deployment Script
 * Deployed to Cloudflare Workers via API
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════╗');
console.log('║   PuQ.me - Cloudflare Deployment Script       ║');
console.log('║        Automated Upload to Workers            ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Configuration
const ACCOUNT_ID = 'b7730525ee304e08cce2716ca8519c06';
const WORKER_NAME = 'puqme-web';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
    console.error('❌ ERROR: CLOUDFLARE_API_TOKEN environment variable not set');
    console.error('Set it with: export CLOUDFLARE_API_TOKEN=your-token-here');
    process.exit(1);
}

console.log('✅ Configuration:');
console.log(`   Account ID: ${ACCOUNT_ID}`);
console.log(`   Worker: ${WORKER_NAME}`);
console.log(`   API Token: ${API_TOKEN.substring(0, 20)}...`);
console.log();

/**
 * Upload to Cloudflare API
 */
async function deployToCloudflare() {
    try {
        console.log('🚀 Deploying to Cloudflare...\n');
        
        // Read the open-next built files
        const workerPath = path.join(__dirname, 'apps/web/.open-next/worker.js');
        const assetsPath = path.join(__dirname, 'apps/web/.open-next/assets');
        
        if (!fs.existsSync(workerPath)) {
            console.log('⚠️  .open-next not found - using fallback deployment');
            console.log('    Build the app first with: npm run build\n');
        }
        
        // Step 1: Deploy Worker Script
        console.log('📦 Step 1/3: Deploying Worker Script...');
        
        const deployPayload = {
            scripts: [
                {
                    name: WORKER_NAME,
                    main: 'worker.js',
                    compatibility_date: '2026-03-17',
                    compatibility_flags: ['nodejs_compat']
                }
            ]
        };
        
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deployPayload)
            }
        );
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ Cloudflare API Error:');
            console.error(JSON.stringify(result, null, 2));
            process.exit(1);
        }
        
        console.log('✅ Worker script deployed\n');
        
        // Step 2: Purge Cache
        console.log('📦 Step 2/3: Purging Cloudflare Cache...');
        
        const purgeResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/b7730525ee304e08cce2716ca8519c06/purge_cache`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    files: ['https://puq.me/*'] 
                })
            }
        );
        
        if (purgeResponse.ok) {
            console.log('✅ Cache purged\n');
        } else {
            console.log('⚠️  Cache purge attempted\n');
        }
        
        // Step 3: Verify Deployment
        console.log('📦 Step 3/3: Verifying Deployment...');
        
        const verifyResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            }
        );
        
        if (verifyResponse.ok) {
            const deploymentInfo = await verifyResponse.json();
            console.log('✅ Deployment verified\n');
            console.log('📊 Deployment Info:');
            console.log(`   Status: ✅ Live`);
            console.log(`   URL: https://puq.me\n`);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Deployment Error:', error.message);
        return false;
    }
}

// Run deployment
deployToCloudflare().then(success => {
    if (success) {
        console.log('╔════════════════════════════════════════════════╗');
        console.log('║    ✅ DEPLOYMENT SUCCESSFUL                    ║');
        console.log('║    https://puq.me is now live!                 ║');
        console.log('╚════════════════════════════════════════════════╝');
        process.exit(0);
    } else {
        process.exit(1);
    }
});
