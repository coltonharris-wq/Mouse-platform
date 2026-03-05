---
name: orgo
description: Spin up and control headless cloud VMs (Linux) for AI agents using Orgo API. Use when needing to provision virtual computers for sub-agents (employees), browser automation, or isolated compute environments. Supports creating/managing workspaces, computers (VMs), bash/python execution, screenshots, mouse/keyboard control, and file upload/download.
---

# Orgo - Deploy Employee VMs

## Overview

You can spawn virtual computers for employees (sub-agents) using the Orgo API. Each employee gets their own VM that you control programmatically.

## Quick Start

The API key and workspace ID are pre-configured via environment variables (`ORGO_API_KEY`, `ORGO_WORKSPACE_ID`).

### Spawn an Employee VM

```bash
python3 scripts/orgo.py computer create \
  --workspace-id "$ORGO_WORKSPACE_ID" \
  --name "employee-name" \
  --ram 8 \
  --cpu 4

# Check status
python3 scripts/orgo.py computer get --id <computer-id>
```

### Resource Specs
- **RAM**: 4, 8, 16, 32, 64 GB (default: 4)
- **CPU**: 2, 4, 8, 16 cores (default: 2)
- **GPU**: none (default), a10, l40s, a100-40gb, a100-80gb

### Manage Employee VMs

```bash
# Stop (saves money, preserves state)
python3 scripts/orgo.py computer stop --id <computer-id>

# Start back up
python3 scripts/orgo.py computer start --id <computer-id>

# Delete (permanent)
python3 scripts/orgo.py computer delete --id <computer-id>
```

## Control Employee VMs

### Run Commands

```bash
# Bash
python3 scripts/orgo.py bash --id <computer-id> --command "apt-get update"

# Python
python3 scripts/orgo.py python --id <computer-id> --code "print('hello')" --timeout 10
```

### Monitor

```bash
# Screenshot
python3 scripts/orgo.py screenshot --id <computer-id> --output screen.png
```

## Best Practices

1. **Name VMs by role**: `support-agent-1`, `sales-assistant`
2. **Start with 8GB/4CPU** for most employee tasks
3. **Stop idle VMs** to save costs
4. **Delete completed VMs** — don't let them accumulate
5. **Boot time**: ~30-60 seconds for new VMs

## Resources

- `scripts/orgo.py` — Full CLI wrapper (`--help` for all commands)
- `references/api.md` — Complete API documentation
