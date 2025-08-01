#!/bin/bash
# Complete Alpha Vantage API Key Test
# Usage: ./test-api-key.sh [PRODUCTION_URL]

echo "🔍 Testing Alpha Vantage API Key..."
echo "=================================="
echo

# URLs
LOCAL_URL="http://localhost:3000"
PROD_URL="${1:-https://tradetools.vercel.app}"

# Function to test a URL
test_api_key() {
    local url=$1
    local env_name=$2
    
    echo "📍 Testing $env_name:"
    echo "URL: $url/api/test-env"
    
    # Make request
    local result=$(curl -s "$url/api/test-env" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo "❌ Connection error with $env_name"
        return 1
    fi
    
    # Extract information using jq (if available) or grep
    if command -v jq >/dev/null 2>&1; then
        local status=$(echo "$result" | jq -r '.apiKeyStatus // "unknown"')
        local has_key=$(echo "$result" | jq -r '.hasApiKey // false')
        local platform=$(echo "$result" | jq -r '.deploymentInfo.platform // "unknown"')
        local environment=$(echo "$result" | jq -r '.environment // "unknown"')
        local test_result=$(echo "$result" | jq -r '.apiTestResult // "no result"')
        
        echo "   Status: $status"
        echo "   Has Key: $has_key"
        echo "   Platform: $platform"
        echo "   Environment: $environment"
        echo "   Test Result: $test_result"
        
        # Determine emoji based on status
        case $status in
            "working")
                echo "   ✅ API Key working perfectly!"
                return 0
                ;;
            "invalid")
                echo "   ❌ Invalid API Key"
                return 1
                ;;
            "rate_limited")
                echo "   ⚠️  Rate limit reached - wait 1 minute"
                return 2
                ;;
            "not_configured")
                echo "   🚫 API Key not configured"
                return 3
                ;;
            "network_error")
                echo "   🌐 Network error connecting to Alpha Vantage"
                return 4
                ;;
            *)
                echo "   ❓ Unknown status: $status"
                return 5
                ;;
        esac
    else
        echo "   ℹ️  Install 'jq' for detailed analysis: brew install jq"
        echo "   Raw response: $result"
        
        # Basic analysis without jq
        if echo "$result" | grep -q '"apiKeyStatus":"working"'; then
            echo "   ✅ API Key appears to be working"
            return 0
        else
            echo "   ❌ API Key may not be working"
            return 1
        fi
    fi
}

# Test local environment
test_api_key "$LOCAL_URL" "Local (Development)"
local_status=$?
echo

# Test production environment
test_api_key "$PROD_URL" "Production"
prod_status=$?
echo

# Final summary
echo "📊 Test Summary:"
echo "===================="

if [ $local_status -eq 0 ] && [ $prod_status -eq 0 ]; then
    echo "🎉 Success! API Key working in both environments"
    echo "   ✅ Local: OK"
    echo "   ✅ Production: OK"
    exit 0
elif [ $local_status -eq 0 ] && [ $prod_status -ne 0 ]; then
    echo "⚠️  API Key works locally but fails in production"
    echo "   ✅ Local: OK"
    echo "   ❌ Production: FAILED"
    echo
    echo "🔧 Solutions:"
    echo "   1. Check environment variables in Vercel:"
    echo "      → https://vercel.com/dashboard → your-project → Settings → Environment Variables"
    echo "   2. Add ALPHA_VANTAGE_API_KEY in Vercel"
    echo "   3. Redeploy: vercel --prod"
    exit 1
elif [ $local_status -ne 0 ] && [ $prod_status -eq 0 ]; then
    echo "⚠️  API Key works in production but fails locally"
    echo "   ❌ Local: FAILED"
    echo "   ✅ Production: OK"
    echo
    echo "🔧 Solutions:"
    echo "   1. Check .env.local file"
    echo "   2. Restart local server: npm run dev"
    echo "   3. Verify .env.local has ALPHA_VANTAGE_API_KEY"
    exit 1
else
    echo "❌ API Key is not working in any environment"
    echo "   ❌ Local: FAILED"
    echo "   ❌ Production: FAILED"
    echo
    echo "🔧 Solutions:"
    echo "   1. Verify if API key is valid:"
    echo "      → https://www.alphavantage.co/support/#api-key"
    echo "   2. Test API key directly:"
    echo "      → curl 'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=YOUR_API_KEY'"
    echo "   3. Configure API key in both environments"
    exit 1
fi
