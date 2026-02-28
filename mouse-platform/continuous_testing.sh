#!/bin/bash
# Continuous Testing Script for Mouse Platform
# Runs tests every 30 minutes

PLATFORM_DIR="/Users/jewelsharris/.openclaw/workspace/mouse-platform"
TESTS_DIR="$PLATFORM_DIR/tests"
VENV_DIR="$PLATFORM_DIR/venv"
RESULTS_FILE="$PLATFORM_DIR/continuous_test_results.json"
BUGS_FILE="$PLATFORM_DIR/bugs_found.json"
LOG_FILE="$PLATFORM_DIR/continuous_testing.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

run_tests() {
    log "Running test suite..."
    
    cd "$PLATFORM_DIR"
    source "$VENV_DIR/bin/activate"
    
    # Run tests with JSON report
    python -m pytest "$TESTS_DIR" -v --tb=line --json-report --json-report-file="$PLATFORM_DIR/test_report.json" 2>&1 | tee -a "$LOG_FILE"
    
    TEST_EXIT_CODE=$?
    
    # Count results
    if [ -f "$PLATFORM_DIR/test_report.json" ]; then
        PASSED=$(cat "$PLATFORM_DIR/test_report.json" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('summary', {}).get('passed', 0))" 2>/dev/null || echo "0")
        FAILED=$(cat "$PLATFORM_DIR/test_report.json" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('summary', {}).get('failed', 0))" 2>/dev/null || echo "0")
        ERRORS=$(cat "$PLATFORM_DIR/test_report.json" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('summary', {}).get('error', 0))" 2>/dev/null || echo "0")
        TOTAL=$(cat "$PLATFORM_DIR/test_report.json" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('summary', {}).get('total', 0))" 2>/dev/null || echo "0")
    else
        PASSED=0
        FAILED=0
        ERRORS=0
        TOTAL=0
    fi
    
    log "Test Results: $PASSED passed, $FAILED failed, $ERRORS errors (Total: $TOTAL)"
    
    return $TEST_EXIT_CODE
}

analyze_failures() {
    log "Analyzing test failures for bugs..."
    
    BUGS_FOUND=0
    
    # Check for specific bug patterns
    if grep -q "test_screenshot_endpoint_allows_owner FAILED" "$LOG_FILE" 2>/dev/null; then
        log_error "BUG: Screenshot endpoint returns 500 error [CRITICAL]"
        BUGS_FOUND=$((BUGS_FOUND + 1))
    fi
    
    if grep -q "test_cors_restricted_in_production FAILED" "$LOG_FILE" 2>/dev/null; then
        log_error "BUG: CORS allows all origins (*) [HIGH - Security Risk]"
        BUGS_FOUND=$((BUGS_FOUND + 1))
    fi
    
    if grep -q "test_customer_create_input_validation FAILED" "$LOG_FILE" 2>/dev/null; then
        log_error "BUG: No input validation on customer creation [HIGH]"
        BUGS_FOUND=$((BUGS_FOUND + 1))
    fi
    
    if grep -q "test_api_key_header_required_for_sensitive_endpoints FAILED" "$LOG_FILE" 2>/dev/null; then
        log_error "BUG: Admin endpoints don't require authentication [CRITICAL]"
        BUGS_FOUND=$((BUGS_FOUND + 1))
    fi
    
    if grep -q "test_sql_injection_protection FAILED" "$LOG_FILE" 2>/dev/null; then
        log_error "BUG: SQL injection vulnerability [CRITICAL]"
        BUGS_FOUND=$((BUGS_FOUND + 1))
    fi
    
    if grep -q "test_error_messages_dont_leak_internal_info FAILED" "$LOG_FILE" 2>/dev/null; then
        log_error "BUG: Error messages leak internal info [HIGH]"
        BUGS_FOUND=$((BUGS_FOUND + 1))
    fi
    
    if [ $BUGS_FOUND -eq 0 ]; then
        log_success "No new bugs identified"
    else
        log_warn "Total bugs identified: $BUGS_FOUND"
    fi
    
    return $BUGS_FOUND
}

generate_report() {
    log "Generating test report..."
    
    REPORT_FILE="$PLATFORM_DIR/report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
======================================================================
CONTINUOUS TESTING REPORT
======================================================================
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Test Run: #$1

TEST RESULTS:
EOF

    if [ -f "$PLATFORM_DIR/test_report.json" ]; then
        cat "$PLATFORM_DIR/test_report.json" | python -c "
import sys, json
d = json.load(sys.stdin)
summary = d.get('summary', {})
print(f\"  Total Tests: {summary.get('total', 0)}\")
print(f\"  Passed: {summary.get('passed', 0)}\")
print(f\"  Failed: {summary.get('failed', 0)}\")
print(f\"  Errors: {summary.get('error', 0)}\")
print(f\"  Skipped: {summary.get('skipped', 0)}\")
" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    echo "FAILED TESTS:" >> "$REPORT_FILE"
    
    if [ -f "$PLATFORM_DIR/test_report.json" ]; then
        cat "$PLATFORM_DIR/test_report.json" | python -c "
import sys, json
d = json.load(sys.stdin)
tests = d.get('tests', [])
for t in tests:
    if t.get('outcome') == 'failed':
        nodeid = t.get('nodeid', '')
        print(f'  - {nodeid}')
" 2>/dev/null >> "$REPORT_FILE" || echo "  (Error parsing test results)" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    echo "======================================================================" >> "$REPORT_FILE"
    
    log "Report saved to: $REPORT_FILE"
}

# Main execution
main() {
    log "=========================================="
    log "MOUSE PLATFORM - CONTINUOUS TESTING"
    log "=========================================="
    log "Starting continuous testing..."
    log "Platform directory: $PLATFORM_DIR"
    log "Test interval: 30 minutes"
    log ""
    
    RUN_COUNT=0
    
    while true; do
        RUN_COUNT=$((RUN_COUNT + 1))
        
        log ""
        log "=========================================="
        log "TEST RUN #$RUN_COUNT"
        log "=========================================="
        
        # Run tests
        run_tests
        TEST_RESULT=$?
        
        # Analyze failures
        if [ $TEST_RESULT -ne 0 ]; then
            analyze_failures
        else
            log_success "All tests passed!"
        fi
        
        # Generate report
        generate_report $RUN_COUNT
        
        # Wait for next run
        log ""
        log "Waiting 30 minutes until next test run..."
        log "Press Ctrl+C to stop"
        sleep 1800  # 30 minutes
    done
}

# Handle interrupts
trap 'log "Continuous testing stopped"; exit 0' INT

# Run main loop
main
