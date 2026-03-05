# Orgo API Reference

Base URL: `https://www.orgo.ai/api`

Authentication: Bearer token in Authorization header
```
Authorization: Bearer sk_live_your_api_key_here
```

## Workspaces

### Create Workspace
```
POST /workspaces
```
**Request:**
```json
{
  "name": "my-workspace"
}
```
**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-workspace",
  "created_at": "2024-01-15T10:30:00Z",
  "computer_count": 0
}
```

### List Workspaces
```
GET /workspaces
```
**Response:**
```json
{
  "workspaces": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "production",
      "created_at": "2024-01-15T10:30:00Z",
      "computer_count": 3
    }
  ]
}
```

### Get Workspace
```
GET /workspaces/{id}
```
Returns workspace details including its computers.

### Delete Workspace
```
DELETE /workspaces/{id}
```
Deletes the workspace and all its computers. Cannot be undone.

---

## Computers

### Create Computer
```
POST /computers
```
**Request:**
```json
{
  "workspace_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "agent-1",
  "os": "linux",
  "ram": 4,
  "cpu": 2,
  "gpu": "none"
}
```

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| workspace_id | string | Yes | - | UUID |
| name | string | Yes | - | Unique within workspace |
| os | string | No | linux | linux |
| ram | integer | No | 4 | 4, 8, 16, 32, 64 (GB) |
| cpu | integer | No | 2 | 2, 4, 8, 16 (cores) |
| gpu | string | No | none | none, a10, l40s, a100-40gb, a100-80gb |

**Response:**
```json
{
  "id": "a3bb189e-8bf9-3888-9912-ace4e6543002",
  "name": "agent-1",
  "workspace_id": "550e8400-e29b-41d4-a716-446655440000",
  "os": "linux",
  "ram": 4,
  "cpu": 2,
  "gpu": "none",
  "status": "starting",
  "url": "https://orgo.ai/workspaces/a3bb189e-8bf9-3888-9912-ace4e6543002",
  "created_at": "2024-01-15T10:35:00Z"
}
```

### Get Computer
```
GET /computers/{id}
```

### Delete Computer
```
DELETE /computers/{id}
```

### Get VNC Password
```
GET /computers/{id}/vnc-password
```
**Response:**
```json
{
  "password": "abc123xyz"
}
```

---

## Computer Lifecycle

### Start Computer
```
POST /computers/{id}/start
```
Starts a stopped computer. State is preserved.

### Stop Computer
```
POST /computers/{id}/stop
```
Stops a running computer. Stopped computers don't incur charges.

### Restart Computer
```
POST /computers/{id}/restart
```
Restarts the computer (stop + start).

---

## Computer Actions

### Take Screenshot
```
GET /computers/{id}/screenshot
```
**Response:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
}
```

### Click Mouse
```
POST /computers/{id}/click
```
**Request:**
```json
{
  "x": 100,
  "y": 200,
  "button": "left",
  "double": false
}
```

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| x | integer | Yes | - | Pixels from left |
| y | integer | Yes | - | Pixels from top |
| button | string | No | left | left, right |
| double | boolean | No | false | true for double-click |

### Drag Mouse
```
POST /computers/{id}/drag
```
**Request:**
```json
{
  "start_x": 100,
  "start_y": 100,
  "end_x": 300,
  "end_y": 200,
  "button": "left",
  "duration": 0.5
}
```

### Type Text
```
POST /computers/{id}/type
```
**Request:**
```json
{
  "text": "Hello, world!"
}
```

### Press Key
```
POST /computers/{id}/key
```
**Request:**
```json
{
  "key": "Enter"
}
```

Supported keys:
- Basic: Enter, Tab, Escape, Backspace, Delete
- Navigation: Up, Down, Left, Right, Home, End, PageUp, PageDown
- Function: F1-F12
- Combinations: ctrl+c, ctrl+v, alt+Tab, ctrl+shift+t

### Scroll
```
POST /computers/{id}/scroll
```
**Request:**
```json
{
  "direction": "down",
  "amount": 3
}
```

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| direction | string | Yes | - | up, down |
| amount | integer | No | 3 | Scroll clicks |

### Wait
```
POST /computers/{id}/wait
```
**Request:**
```json
{
  "duration": 2.0
}
```
Pauses for the specified duration in seconds (max 60).

### Execute Bash
```
POST /computers/{id}/bash
```
**Request:**
```json
{
  "command": "ls -la /home/user"
}
```
**Response:**
```json
{
  "output": "total 32\ndrwxr-xr-x 4 user user 4096 ...",
  "success": true
}
```

### Execute Python
```
POST /computers/{id}/exec
```
**Request:**
```json
{
  "code": "import os\nprint(os.getcwd())",
  "timeout": 10
}
```
**Response:**
```json
{
  "output": "/home/user\n",
  "success": true
}
```

---

## Streaming

### Start Stream
```
POST /computers/{id}/stream/start
```
**Request:**
```json
{
  "connection_name": "twitch"
}
```

### Get Stream Status
```
GET /computers/{id}/stream/status
```
**Response:**
```json
{
  "status": "streaming",
  "start_time": "2024-01-15T10:30:00Z",
  "pid": 12345
}
```
Status values: idle, streaming, terminated

### Stop Stream
```
POST /computers/{id}/stream/stop
```

---

## Files

### Upload File
```
POST /files/upload
```
Content-Type: multipart/form-data

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | file | Yes | File to upload (max 10MB) |
| projectId | string | Yes | Workspace ID |
| desktopId | string | No | Computer ID to associate file with |

### List Files
```
GET /files?projectId={workspaceId}&desktopId={computerId}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | Workspace ID |
| desktopId | string | No | Filter by computer ID |

### Export File
```
POST /files/export
```
**Request:**
```json
{
  "desktopId": "a3bb189e-8bf9-3888-9912-ace4e6543002",
  "path": "Desktop/results.txt"
}
```
**Response:**
```json
{
  "success": true,
  "file": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "filename": "results.txt"
  },
  "url": "https://storage.example.com/..."
}
```

### Download File
```
GET /files/download?id={fileId}
```
Returns a signed download URL (expires in 1 hour).

### Delete File
```
DELETE /files/delete?id={fileId}
```

---

## Error Responses

All errors return:
```json
{
  "error": "Error message"
}
```

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Invalid request |
| 401 | Invalid or missing API key |
| 403 | Access denied |
| 404 | Resource not found |
| 500 | Server error |

---

## SDKs

### Python
```bash
pip install orgo
```
```python
from orgo import Computer

computer = Computer(workspace="my-workspace")
computer.prompt("Open Firefox and search for AI news")
```

### TypeScript
```bash
npm install orgo
```
```typescript
import { Computer } from 'orgo';

const computer = await Computer.create({ workspace: "my-workspace" });
await computer.prompt("Open Firefox and search for AI news");
```

---

## Links
- Documentation: https://docs.orgo.ai
- Dashboard: https://www.orgo.ai/workspaces
- Support: spencer@orgo.ai
