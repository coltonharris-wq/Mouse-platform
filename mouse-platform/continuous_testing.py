#!/usr/bin/env python3
"""
Continuous Testing System for Mouse Platform
Runs end-to-end tests every 30 minutes, finds bugs, reports them, and attempts fixes.
"""

import os
import sys
import time
import json
import subprocess
import logging
from datetime import datetime, timezone
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('continuous_testing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration
TEST_INTERVAL_MINUTES = 30
PLATFORM_DIR = Path(__file__).parent
TESTS_DIR = PLATFORM_DIR / 'tests'
RESULTS_FILE = PLATFORM_DIR / 'continuous_test_results.json'
BUGS_FILE = PLATFORM_DIR / 'bugs_found.json'

def run_tests():
    """Run all tests and return results"""
    logger.info("=" * 60)
    logger.info("Running test suite...")
    
    try:
        # Activate venv and run tests
        result = subprocess.run(
            ['bash', '-c', f'source {PLATFORM_DIR}/venv/bin/activate && python -m pytest {TESTS_DIR} -v --tb=line --json-report --json-report-file={PLATFORM_DIR}/test_report.json 2>&1'],
            capture_output=True,
            text=True,
            cwd=PLATFORM_DIR
        )
        
        # Parse test results
        output = result.stdout + result.stderr
        
        # Count passes and failures
        passed = output.count('PASSED')
        failed = output.count('FAILED')
        errors = output.count('ERROR')
        
        logger.info(f"Tests complete: {passed} passed, {failed} failed, {errors} errors")
        
        return {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'passed': passed,
            'failed': failed,
            'errors': errors,
            'return_code': result.returncode,
            'output': output[-2000:] if len(output) > 2000 else output  # Last 2000 chars
        }
        
    except Exception as e:
        logger.error(f"Error running tests: {e}")
        return {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'error': str(e),
            'return_code': -1
        }

def load_bugs():
    """Load previously found bugs"""
    if BUGS_FILE.exists():
        with open(BUGS_FILE, 'r') as f:
            return json.load(f)
    return {'bugs': [], 'fixed': [], 'total_found': 0}

def save_bugs(bugs_data):
    """Save bugs to file"""
    with open(BUGS_FILE, 'w') as f:
        json.dump(bugs_data, f, indent=2)

def load_results():
    """Load previous test results"""
    if RESULTS_FILE.exists():
        with open(RESULTS_FILE, 'r') as f:
            return json.load(f)
    return {'runs': []}

def save_results(results_data):
    """Save test results"""
    with open(RESULTS_FILE, 'w') as f:
        json.dump(results_data, f, indent=2)

def analyze_failures(test_output):
    """Analyze test output to identify specific bugs"""
    bugs = []
    
    # Known bug patterns
    bug_patterns = {
        'screenshot_endpoint_allows_owner': {
            'pattern': 'test_screenshot_endpoint_allows_owner',
            'severity': 'CRITICAL',
            'description': 'Screenshot endpoint returns 500 error for valid owner',
            'fix_file': 'api-gateway/main.py'
        },
        'cors_restricted_in_production': {
            'pattern': 'test_cors_restricted_in_production',
            'severity': 'HIGH',
            'description': 'CORS allows all origins (*) - security risk',
            'fix_file': 'api-gateway/main.py'
        },
        'customer_create_input_validation': {
            'pattern': 'test_customer_create_input_validation',
            'severity': 'HIGH',
            'description': 'No input validation on customer creation data',
            'fix_file': 'api-gateway/main.py'
        },
        'customer_create_company_name_length': {
            'pattern': 'test_customer_create_company_name_length',
            'severity': 'MEDIUM',
            'description': 'No length validation on company name field',
            'fix_file': 'api-gateway/main.py'
        },
        'api_key_header_required': {
            'pattern': 'test_api_key_header_required_for_sensitive_endpoints',
            'severity': 'CRITICAL',
            'description': 'Admin endpoints do not require authentication',
            'fix_file': 'api-gateway/main.py'
        },
        'sql_injection_protection': {
            'pattern': 'test_sql_injection_protection',
            'severity': 'CRITICAL',
            'description': 'SQL injection vulnerability detected',
            'fix_file': 'api-gateway/supabase_client.py'
        },
        'error_messages_leak_info': {
            'pattern': 'test_error_messages_dont_leak_internal_info',
            'severity': 'HIGH',
            'description': 'Error messages expose internal database credentials',
            'fix_file': 'api-gateway/main.py'
        },
        'stripe_webhook_signature': {
            'pattern': 'test_stripe_webhook_signature_validation',
            'severity': 'CRITICAL',
            'description': 'Stripe webhook signature not validated',
            'fix_file': 'api-gateway/main.py'
        },
        'telegram_webhook_secret': {
            'pattern': 'test_telegram_webhook_secret_validation',
            'severity': 'HIGH',
            'description': 'Telegram webhook lacks secret validation',
            'fix_file': 'api-gateway/main.py'
        }
    }
    
    for bug_id, bug_info in bug_patterns.items():
        if bug_info['pattern'] in test_output:
            bugs.append({
                'id': bug_id,
                'severity': bug_info['severity'],
                'description': bug_info['description'],
                'fix_file': bug_info['fix_file'],
                'found_at': datetime.now(timezone.utc).isoformat(),
                'status': 'open'
            })
    
    return bugs

def attempt_fix_cors():
    """Fix CORS configuration to restrict origins"""
    logger.info("Attempting to fix CORS configuration...")
    
    main_file = PLATFORM_DIR / 'api-gateway' / 'main.py'
    
    try:
        with open(main_file, 'r') as f:
            content = f.read()
        
        # Check if already fixed
        if 'https://app.mouseplatform.com' in content:
            logger.info("CORS already fixed")
            return True
        
        # Replace CORS configuration
        old_cors = '''app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)'''
        
        new_cors = '''app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "https://app.mouseplatform.com,https://admin.mouseplatform.com,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)'''
        
        if old_cors in content:
            content = content.replace(old_cors, new_cors)
            with open(main_file, 'w') as f:
                f.write(content)
            logger.info("CORS configuration fixed")
            return True
        else:
            logger.warning("Could not find CORS configuration to fix")
            return False
            
    except Exception as e:
        logger.error(f"Error fixing CORS: {e}")
        return False

def attempt_fix_input_validation():
    """Add input validation to CustomerCreate model"""
    logger.info("Attempting to fix input validation...")
    
    main_file = PLATFORM_DIR / 'api-gateway' / 'main.py'
    
    try:
        with open(main_file, 'r') as f:
            content = f.read()
        
        # Check if already fixed
        if 'Field(..., min_length' in content:
            logger.info("Input validation already fixed")
            return True
        
        # Add Field import and update CustomerCreate model
        old_import = "from pydantic import BaseModel"
        new_import = "from pydantic import BaseModel, Field, EmailStr"
        
        old_model = '''class CustomerCreate(BaseModel):
    company_name: str
    email: str
    plan: str = "token_based"  # Deprecated, kept for compatibility
    reseller_id: Optional[str] = None'''
        
        new_model = '''class CustomerCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=100, description="Company name (2-100 characters)")
    email: EmailStr = Field(..., description="Valid email address")
    plan: str = Field(default="token_based", pattern=r"^(starter|growth|enterprise|token_based)$")
    reseller_id: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9_-]+$', max_length=50)'''
        
        content = content.replace(old_import, new_import)
        content = content.replace(old_model, new_model)
        
        with open(main_file, 'w') as f:
            f.write(content)
        logger.info("Input validation fixed")
        return True
        
    except Exception as e:
        logger.error(f"Error fixing input validation: {e}")
        return False

def attempt_fix_admin_auth():
    """Add authentication requirement to admin endpoints"""
    logger.info("Attempting to fix admin endpoint authentication...")
    
    main_file = PLATFORM_DIR / 'api-gateway' / 'main.py'
    
    try:
        with open(main_file, 'r') as f:
            content = f.read()
        
        # Check if already fixed
        if 'ADMIN_API_KEY' in content:
            logger.info("Admin auth already fixed")
            return True
        
        # Add admin auth dependency after the imports
        admin_auth_code = '''
# Admin authentication
def verify_admin_token(authorization: str = Header(None)):
    """Verify admin API key"""
    admin_key = os.getenv("ADMIN_API_KEY")
    if not admin_key:
        raise HTTPException(status_code=500, detail="Admin API key not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    if token != admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin token")
    
    return True

'''
        
        # Find a good place to insert (after the imports)
        insert_marker = "manager = ConnectionManager()"
        if insert_marker in content:
            content = content.replace(insert_marker, admin_auth_code + insert_marker)
        
        # Update admin endpoints to require auth
        old_admin_endpoint = '''@app.get("/admin/vms/status")
async def get_all_vm_status():'''
        
        new_admin_endpoint = '''@app.get("/admin/vms/status")
async def get_all_vm_status(authorized: bool = Depends(verify_admin_token)):'''
        
        content = content.replace(old_admin_endpoint, new_admin_endpoint)
        
        # Also update token overview endpoint
        old_token_endpoint = '''@app.get("/admin/tokens/overview")
async def get_token_overview():'''
        
        new_token_endpoint = '''@app.get("/admin/tokens/overview")
async def get_token_overview(authorized: bool = Depends(verify_admin_token)):'''
        
        content = content.replace(old_token_endpoint, new_token_endpoint)
        
        # Add Header to FastAPI imports
        content = content.replace(
            'from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Request',
            'from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Request, Header, Depends'
        )
        
        with open(main_file, 'w') as f:
            f.write(content)
        logger.info("Admin endpoint authentication fixed")
        return True
        
    except Exception as e:
        logger.error(f"Error fixing admin auth: {e}")
        return False

def attempt_fix_error_messages():
    """Fix error messages to not leak internal info"""
    logger.info("Attempting to fix error message handling...")
    
    main_file = PLATFORM_DIR / 'api-gateway' / 'main.py'
    
    try:
        with open(main_file, 'r') as f:
            content = f.read()
        
        # Check if already fixed
        if 'logger.exception' in content:
            logger.info("Error messages already fixed")
            return True
        
        # Add logging import at the top
        if 'import logging' not in content:
            content = 'import logging\n' + content
        
        # Add logger setup after imports
        logger_setup = '''# Setup logging
logger = logging.getLogger(__name__)

'''
        
        # Find a good place for logger setup
        if 'logger = logging.getLogger' not in content:
            insert_marker = "manager = ConnectionManager()"
            if insert_marker in content:
                content = content.replace(insert_marker, logger_setup + insert_marker)
        
        # Replace generic exception handlers
        old_pattern = '''    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))'''
        
        new_pattern = '''    except HTTPException:
        raise
    except ValueError as e:
        # User error - safe to show
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # System error - log internally, generic message externally
        logger.exception(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")'''
        
        content = content.replace(old_pattern, new_pattern)
        
        with open(main_file, 'w') as f:
            f.write(content)
        logger.info("Error message handling fixed")
        return True
        
    except Exception as e:
        logger.error(f"Error fixing error messages: {e}")
        return False

def attempt_fixes(bugs):
    """Attempt to automatically fix identified bugs"""
    logger.info("Attempting automatic fixes...")
    
    fixes_attempted = []
    fixes_successful = []
    
    for bug in bugs:
        bug_id = bug['id']
        
        if bug_id == 'cors_restricted_in_production':
            fixes_attempted.append(bug_id)
            if attempt_fix_cors():
                fixes_successful.append(bug_id)
                bug['status'] = 'fixed'
                
        elif bug_id == 'customer_create_input_validation':
            fixes_attempted.append(bug_id)
            if attempt_fix_input_validation():
                fixes_successful.append(bug_id)
                bug['status'] = 'fixed'
                
        elif bug_id == 'api_key_header_required':
            fixes_attempted.append(bug_id)
            if attempt_fix_admin_auth():
                fixes_successful.append(bug_id)
                bug['status'] = 'fixed'
                
        elif bug_id == 'error_messages_leak_info':
            fixes_attempted.append(bug_id)
            if attempt_fix_error_messages():
                fixes_successful.append(bug_id)
                bug['status'] = 'fixed'
    
    logger.info(f"Fixes attempted: {len(fixes_attempted)}, successful: {len(fixes_successful)}")
    return fixes_attempted, fixes_successful

def generate_report(results, bugs_data, fixes_attempted, fixes_successful):
    """Generate a summary report"""
    report = []
    report.append("=" * 70)
    report.append("CONTINUOUS TESTING REPORT")
    report.append("=" * 70)
    report.append(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    report.append("")
    
    # Test results
    report.append("TEST RESULTS:")
    report.append(f"  Passed: {results.get('passed', 0)}")
    report.append(f"  Failed: {results.get('failed', 0)}")
    report.append(f"  Errors: {results.get('errors', 0)}")
    report.append("")
    
    # Bugs found
    open_bugs = [b for b in bugs_data['bugs'] if b['status'] == 'open']
    fixed_bugs = [b for b in bugs_data['bugs'] if b['status'] == 'fixed']
    
    report.append("BUGS STATUS:")
    report.append(f"  Open: {len(open_bugs)}")
    report.append(f"  Fixed: {len(fixed_bugs)}")
    report.append(f"  Total Found (all time): {bugs_data['total_found']}")
    report.append("")
    
    if open_bugs:
        report.append("OPEN BUGS:")
        for bug in open_bugs:
            report.append(f"  [{bug['severity']}] {bug['description']}")
            report.append(f"    File: {bug['fix_file']}")
        report.append("")
    
    if fixes_attempted:
        report.append("AUTOMATIC FIXES:")
        report.append(f"  Attempted: {len(fixes_attempted)}")
        report.append(f"  Successful: {len(fixes_successful)}")
        report.append("")
    
    report.append("=" * 70)
    
    return "\n".join(report)

def main():
    """Main continuous testing loop"""
    logger.info("Starting Continuous Testing System")
    logger.info(f"Test interval: {TEST_INTERVAL_MINUTES} minutes")
    logger.info(f"Platform directory: {PLATFORM_DIR}")
    
    # Load existing data
    bugs_data = load_bugs()
    results_data = load_results()
    
    run_count = 0
    
    while True:
        run_count += 1
        logger.info(f"\n{'='*60}")
        logger.info(f"TEST RUN #{run_count}")
        logger.info(f"{'='*60}")
        
        # Run tests
        results = run_tests()
        results_data['runs'].append(results)
        save_results(results_data)
        
        # Analyze failures
        if results.get('failed', 0) > 0 or results.get('errors', 0) > 0:
            logger.info("Analyzing failures...")
            new_bugs = analyze_failures(results.get('output', ''))
            
            for bug in new_bugs:
                # Check if bug already exists
                existing = [b for b in bugs_data['bugs'] if b['id'] == bug['id'] and b['status'] == 'open']
                if not existing:
                    logger.info(f"New bug found: [{bug['severity']}] {bug['description']}")
                    bugs_data['bugs'].append(bug)
                    bugs_data['total_found'] += 1
            
            save_bugs(bugs_data)
            
            # Attempt automatic fixes
            open_bugs = [b for b in bugs_data['bugs'] if b['status'] == 'open']
            fixes_attempted, fixes_successful = attempt_fixes(open_bugs)
            
            if fixes_successful:
                save_bugs(bugs_data)
                
                # Re-run tests to verify fixes
                logger.info("Re-running tests to verify fixes...")
                results = run_tests()
                results_data['runs'].append(results)
                save_results(results_data)
        else:
            logger.info("All tests passed! No bugs found.")
            fixes_attempted = []
            fixes_successful = []
        
        # Generate and log report
        report = generate_report(results, bugs_data, fixes_attempted, fixes_successful)
        logger.info("\n" + report)
        
        # Save report to file
        report_file = PLATFORM_DIR / f'report_{datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")}.txt'
        with open(report_file, 'w') as f:
            f.write(report)
        
        # Wait for next run
        logger.info(f"\nWaiting {TEST_INTERVAL_MINUTES} minutes until next test run...")
        time.sleep(TEST_INTERVAL_MINUTES * 60)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\nContinuous testing stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.exception(f"Fatal error in continuous testing: {e}")
        sys.exit(1)
