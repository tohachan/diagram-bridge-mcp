# Development Workflow Rules

## TypeScript Testing & Compilation
```yaml
typescript:
  before_testing:
    - always_run: "npm run build"
    - compiled_path: "./dist/"
    - source_path: "./src/"
  
  module_imports:
    - test_files: "use .cjs extension"
    - import_style: "const { Class } = require('./dist/path/file.js')"
    - avoid: "import statements in test files"
    - reason: "project uses ES modules, test files need CommonJS"

  compilation_check:
    - verify: "dist/ folder exists after build"
    - if_missing: "run npm run build first"
    - structure: "dist mirrors src structure"
```

## Docker Testing
```yaml
docker:
  container_lifecycle:
    - startup: "docker-compose up -d"
    - check_status: "docker-compose ps"
    - shutdown: "docker-compose down"
    - never_forget: "cleanup containers after testing"

  mcp_behavior:
    - restart_policy: "restart: 'no'"
    - normal_behavior: "MCP servers exit when not in use"
    - not_http_server: "MCP uses stdin/stdout, not HTTP endpoints"
    - testing_method: "test via Kroki direct API"

  networking:
    - kroki_endpoint: "http://localhost:8000"
    - test_formats: "POST to /format/output_type"
    - content_type: "text/plain"
    - encoding: "send raw code, not base64url"
```

## API Testing Patterns
```yaml
api_testing:
  kroki_direct:
    - method: "POST"
    - url: "http://localhost:8000/{format}/{output}"
    - headers: { "Content-Type": "text/plain" }
    - body: "raw diagram code"
    - avoid: "base64url encoding for GET requests"

  test_file_naming:
    - pattern: "test-{feature}-{method}.cjs"
    - examples: ["test-d2-kroki-direct.cjs", "test-mermaid-workflow.cjs"]
    - cleanup: "delete temporary test files when done"

  error_debugging:
    - always_check: "response.ok before parsing"
    - log_errors: "console.error status + error text"
    - incremental: "test simple cases first, then complex"
```

## Template & Configuration Testing
```yaml
template_testing:
  instruction_templates:
    - path: "./dist/templates/instruction-template.js"
    - test_method: "DiagramInstructionTemplate.generateInstructionPrompt()"
    - verify_sections: ["syntaxGuidelines", "commonPitfalls", "examplePatterns"]
    
  config_changes:
    - after_edit: "always rebuild with npm run build"
    - test_impact: "create focused test for changed format"
    - verify_examples: "ensure examples use correct syntax"

  validation_flow:
    1. "edit config/template"
    2. "npm run build"
    3. "create test file (.cjs)"
    4. "test specific changes"
    5. "test full workflow"
    6. "cleanup test files"
```

## Common Pitfalls to Avoid
```yaml
pitfalls:
  file_extensions:
    - avoid: ".js files for testing (ES module conflicts)"
    - use: ".cjs for test files"
    - reason: "project has 'type: module' in package.json"

  import_paths:
    - source_files: "./src/path/file.ts"
    - compiled_files: "./dist/path/file.js"
    - never_mix: "don't import from src/ in tests"

  docker_expectations:
    - mcp_servers: "designed to exit when idle"
    - not_web_apps: "no persistent HTTP server"
    - kroki_testing: "test rendering engines directly"

  template_debugging:
    - syntax_errors: "usually in instruction templates"
    - fix_source: "edit src/resources/diagram-instructions-config.ts"
    - not_generated: "don't fix generated code manually"
```

## Quick Commands Reference
```yaml
commands:
  build: "npm run build"
  test_all: "npm test"
  docker_up: "docker-compose up -d"
  docker_down: "docker-compose down"
  docker_status: "docker-compose ps"
  docker_logs: "docker-compose logs -f"
  kroki_health: "curl http://localhost:8000/health"

  create_test:
    - "touch test-{feature}.cjs"
    - "add: const { Class } = require('./dist/path/file.js')"
    - "test your changes"
    - "rm test-{feature}.cjs"
```

## Emergency Troubleshooting
```yaml
troubleshooting:
  module_not_found:
    - check: "npm run build completed"
    - verify: "dist/ folder structure"
    - ensure: "correct path in require()"

  docker_issues:
    - restart: "docker-compose down && docker-compose up -d"
    - wait: "2-3 seconds for services to start"
    - check: "docker-compose ps shows 'healthy' status"

  syntax_errors:
    - location: "usually in instruction templates"
    - fix_in: "src/resources/diagram-instructions-config.ts"
    - rebuild: "npm run build after changes"
    - test: "create specific test for the format"
``` 