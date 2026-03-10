#!/usr/bin/env python3
"""
Orgo API CLI - Command-line interface for Orgo virtual machines.

Usage:
    python3 orgo.py <command> <subcommand> [options]

Examples:
    python3 orgo.py workspace list
    python3 orgo.py computer create --workspace-id <id> --name "my-vm"
    python3 orgo.py screenshot --id <computer-id>
"""

import os
import sys
import json
import argparse
import requests
from typing import Optional, Dict, Any

BASE_URL = "https://www.orgo.ai/api"

def get_api_key() -> str:
    """Get API key from environment variable."""
    api_key = os.environ.get("ORGO_API_KEY")
    if not api_key:
        print("Error: ORGO_API_KEY environment variable not set", file=sys.stderr)
        print("Get your API key at: https://www.orgo.ai/workspaces", file=sys.stderr)
        sys.exit(1)
    return api_key

def make_request(
    method: str,
    endpoint: str,
    json_data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Make an API request to Orgo."""
    api_key = get_api_key()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=json_data,
            params=params
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            error_data = response.json() if response.content else {"error": "Unknown error"}
            print(f"Error {response.status_code}: {error_data.get('error', 'Unknown error')}", file=sys.stderr)
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}", file=sys.stderr)
        sys.exit(1)

# Workspace commands
def workspace_list():
    """List all workspaces."""
    result = make_request("GET", "/workspaces")
    print(json.dumps(result, indent=2))

def workspace_create(name: str):
    """Create a new workspace."""
    result = make_request("POST", "/workspaces", json_data={"name": name})
    print(json.dumps(result, indent=2))

def workspace_get(workspace_id: str):
    """Get workspace details."""
    result = make_request("GET", f"/workspaces/{workspace_id}")
    print(json.dumps(result, indent=2))

def workspace_delete(workspace_id: str):
    """Delete a workspace."""
    result = make_request("DELETE", f"/workspaces/{workspace_id}")
    print("Workspace deleted successfully")

# Computer commands
def computer_create(workspace_id: str, name: str, ram: int = 4, cpu: int = 2, gpu: str = "none"):
    """Create a new computer."""
    data = {
        "workspace_id": workspace_id,
        "name": name,
        "os": "linux",
        "ram": ram,
        "cpu": cpu,
        "gpu": gpu
    }
    result = make_request("POST", "/computers", json_data=data)
    print(json.dumps(result, indent=2))

def computer_get(computer_id: str):
    """Get computer details."""
    result = make_request("GET", f"/computers/{computer_id}")
    print(json.dumps(result, indent=2))

def computer_delete(computer_id: str):
    """Delete a computer."""
    result = make_request("DELETE", f"/computers/{computer_id}")
    print("Computer deleted successfully")

def computer_start(computer_id: str):
    """Start a stopped computer."""
    result = make_request("POST", f"/computers/{computer_id}/start")
    print("Computer started successfully")

def computer_stop(computer_id: str):
    """Stop a running computer."""
    result = make_request("POST", f"/computers/{computer_id}/stop")
    print("Computer stopped successfully")

def computer_restart(computer_id: str):
    """Restart a computer."""
    result = make_request("POST", f"/computers/{computer_id}/restart")
    print("Computer restarted successfully")

def computer_vnc_password(computer_id: str):
    """Get VNC password for a computer."""
    result = make_request("GET", f"/computers/{computer_id}/vnc-password")
    print(json.dumps(result, indent=2))

# Computer action commands
def screenshot(computer_id: str, output: Optional[str] = None):
    """Take a screenshot."""
    result = make_request("GET", f"/computers/{computer_id}/screenshot")
    
    if output:
        # Save to file
        import base64
        image_data = result["image"]
        if image_data.startswith("data:image/png;base64,"):
            image_data = image_data.replace("data:image/png;base64,", "")
        
        with open(output, "wb") as f:
            f.write(base64.b64decode(image_data))
        print(f"Screenshot saved to {output}")
    else:
        print(json.dumps(result, indent=2))

def click(computer_id: str, x: int, y: int, button: str = "left", double: bool = False):
    """Click the mouse."""
    data = {
        "x": x,
        "y": y,
        "button": button,
        "double": double
    }
    result = make_request("POST", f"/computers/{computer_id}/click", json_data=data)
    print("Click executed")

def drag(computer_id: str, start_x: int, start_y: int, end_x: int, end_y: int, 
         button: str = "left", duration: float = 0.5):
    """Drag the mouse."""
    data = {
        "start_x": start_x,
        "start_y": start_y,
        "end_x": end_x,
        "end_y": end_y,
        "button": button,
        "duration": duration
    }
    result = make_request("POST", f"/computers/{computer_id}/drag", json_data=data)
    print("Drag executed")

def type_text(computer_id: str, text: str):
    """Type text."""
    result = make_request("POST", f"/computers/{computer_id}/type", json_data={"text": text})
    print("Text typed")

def press_key(computer_id: str, key: str):
    """Press a key."""
    result = make_request("POST", f"/computers/{computer_id}/key", json_data={"key": key})
    print(f"Key '{key}' pressed")

def scroll(computer_id: str, direction: str, amount: int = 3):
    """Scroll."""
    data = {
        "direction": direction,
        "amount": amount
    }
    result = make_request("POST", f"/computers/{computer_id}/scroll", json_data=data)
    print(f"Scrolled {direction}")

def wait(computer_id: str, duration: float):
    """Wait for a duration."""
    result = make_request("POST", f"/computers/{computer_id}/wait", json_data={"duration": duration})
    print(f"Waited {duration} seconds")

def bash(computer_id: str, command: str):
    """Execute bash command."""
    result = make_request("POST", f"/computers/{computer_id}/bash", json_data={"command": command})
    print(json.dumps(result, indent=2))

def python_exec(computer_id: str, code: str, timeout: int = 10):
    """Execute Python code."""
    data = {
        "code": code,
        "timeout": timeout
    }
    result = make_request("POST", f"/computers/{computer_id}/exec", json_data=data)
    print(json.dumps(result, indent=2))

# File commands
def file_upload(workspace_id: str, file_path: str, computer_id: Optional[str] = None):
    """Upload a file."""
    api_key = get_api_key()
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}"
    }

    files = {"file": open(file_path, "rb")}
    data = {"projectId": workspace_id}
    if computer_id:
        data["desktopId"] = computer_id

    response = requests.post(
        f"{BASE_URL}/files/upload",
        headers=headers,
        files=files,
        data=data
    )
    
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Upload failed: {response.text}", file=sys.stderr)
        sys.exit(1)

def file_list(workspace_id: str, computer_id: Optional[str] = None):
    """List files."""
    params = {"projectId": workspace_id}
    if computer_id:
        params["desktopId"] = computer_id
    result = make_request("GET", "/files", params=params)
    print(json.dumps(result, indent=2))

def file_export(computer_id: str, path: str):
    """Export a file from the computer."""
    data = {
        "desktopId": computer_id,
        "path": path
    }
    result = make_request("POST", "/files/export", json_data=data)
    print(json.dumps(result, indent=2))

def file_download(file_id: str):
    """Get download URL for a file."""
    result = make_request("GET", "/files/download", params={"id": file_id})
    print(json.dumps(result, indent=2))

def file_delete(file_id: str):
    """Delete a file."""
    result = make_request("DELETE", "/files/delete", params={"id": file_id})
    print("File deleted successfully")

def main():
    parser = argparse.ArgumentParser(description="Orgo API CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Workspace commands
    workspace_parser = subparsers.add_parser("workspace", help="Workspace commands")
    workspace_subs = workspace_parser.add_subparsers(dest="subcommand")
    
    workspace_subs.add_parser("list", help="List workspaces")
    
    workspace_create_parser = workspace_subs.add_parser("create", help="Create workspace")
    workspace_create_parser.add_argument("--name", required=True, help="Workspace name")
    
    workspace_get_parser = workspace_subs.add_parser("get", help="Get workspace")
    workspace_get_parser.add_argument("--id", required=True, help="Workspace ID")
    
    workspace_delete_parser = workspace_subs.add_parser("delete", help="Delete workspace")
    workspace_delete_parser.add_argument("--id", required=True, help="Workspace ID")
    
    # Computer commands
    computer_parser = subparsers.add_parser("computer", help="Computer commands")
    computer_subs = computer_parser.add_subparsers(dest="subcommand")
    
    computer_create_parser = computer_subs.add_parser("create", help="Create computer")
    computer_create_parser.add_argument("--workspace-id", required=True, help="Workspace ID")
    computer_create_parser.add_argument("--name", required=True, help="Computer name")
    computer_create_parser.add_argument("--ram", type=int, default=4, choices=[4, 8, 16, 32, 64])
    computer_create_parser.add_argument("--cpu", type=int, default=2, choices=[2, 4, 8, 16])
    computer_create_parser.add_argument("--gpu", default="none", choices=["none", "a10", "l40s", "a100-40gb", "a100-80gb"])
    
    computer_get_parser = computer_subs.add_parser("get", help="Get computer")
    computer_get_parser.add_argument("--id", required=True, help="Computer ID")
    
    computer_delete_parser = computer_subs.add_parser("delete", help="Delete computer")
    computer_delete_parser.add_argument("--id", required=True, help="Computer ID")
    
    computer_start_parser = computer_subs.add_parser("start", help="Start computer")
    computer_start_parser.add_argument("--id", required=True, help="Computer ID")
    
    computer_stop_parser = computer_subs.add_parser("stop", help="Stop computer")
    computer_stop_parser.add_argument("--id", required=True, help="Computer ID")
    
    computer_restart_parser = computer_subs.add_parser("restart", help="Restart computer")
    computer_restart_parser.add_argument("--id", required=True, help="Computer ID")
    
    computer_vnc_parser = computer_subs.add_parser("vnc-password", help="Get VNC password")
    computer_vnc_parser.add_argument("--id", required=True, help="Computer ID")
    
    # Action commands
    screenshot_parser = subparsers.add_parser("screenshot", help="Take screenshot")
    screenshot_parser.add_argument("--id", required=True, help="Computer ID")
    screenshot_parser.add_argument("--output", help="Save to file (optional)")
    
    click_parser = subparsers.add_parser("click", help="Click mouse")
    click_parser.add_argument("--id", required=True, help="Computer ID")
    click_parser.add_argument("--x", type=int, required=True, help="X coordinate")
    click_parser.add_argument("--y", type=int, required=True, help="Y coordinate")
    click_parser.add_argument("--button", default="left", choices=["left", "right"])
    click_parser.add_argument("--double", action="store_true", help="Double-click")
    
    drag_parser = subparsers.add_parser("drag", help="Drag mouse")
    drag_parser.add_argument("--id", required=True, help="Computer ID")
    drag_parser.add_argument("--start-x", type=int, required=True, help="Start X")
    drag_parser.add_argument("--start-y", type=int, required=True, help="Start Y")
    drag_parser.add_argument("--end-x", type=int, required=True, help="End X")
    drag_parser.add_argument("--end-y", type=int, required=True, help="End Y")
    drag_parser.add_argument("--button", default="left", choices=["left", "right"])
    drag_parser.add_argument("--duration", type=float, default=0.5)
    
    type_parser = subparsers.add_parser("type", help="Type text")
    type_parser.add_argument("--id", required=True, help="Computer ID")
    type_parser.add_argument("--text", required=True, help="Text to type")
    
    key_parser = subparsers.add_parser("key", help="Press key")
    key_parser.add_argument("--id", required=True, help="Computer ID")
    key_parser.add_argument("--key", required=True, help="Key to press")
    
    scroll_parser = subparsers.add_parser("scroll", help="Scroll")
    scroll_parser.add_argument("--id", required=True, help="Computer ID")
    scroll_parser.add_argument("--direction", required=True, choices=["up", "down"])
    scroll_parser.add_argument("--amount", type=int, default=3)
    
    wait_parser = subparsers.add_parser("wait", help="Wait")
    wait_parser.add_argument("--id", required=True, help="Computer ID")
    wait_parser.add_argument("--duration", type=float, required=True, help="Duration in seconds")
    
    bash_parser = subparsers.add_parser("bash", help="Execute bash command")
    bash_parser.add_argument("--id", required=True, help="Computer ID")
    bash_parser.add_argument("--command", required=True, help="Bash command")
    
    python_parser = subparsers.add_parser("python", help="Execute Python code")
    python_parser.add_argument("--id", required=True, help="Computer ID")
    python_parser.add_argument("--code", required=True, help="Python code")
    python_parser.add_argument("--timeout", type=int, default=10)
    
    # File commands
    file_parser = subparsers.add_parser("file", help="File commands")
    file_subs = file_parser.add_subparsers(dest="subcommand")
    
    file_upload_parser = file_subs.add_parser("upload", help="Upload file")
    file_upload_parser.add_argument("--workspace-id", required=True, help="Workspace ID")
    file_upload_parser.add_argument("--file-path", required=True, help="Local file path")
    file_upload_parser.add_argument("--computer-id", help="Computer ID (optional)")
    
    file_list_parser = file_subs.add_parser("list", help="List files")
    file_list_parser.add_argument("--workspace-id", required=True, help="Workspace ID")
    file_list_parser.add_argument("--computer-id", help="Computer ID (optional)")
    
    file_export_parser = file_subs.add_parser("export", help="Export file")
    file_export_parser.add_argument("--computer-id", required=True, help="Computer ID")
    file_export_parser.add_argument("--path", required=True, help="File path on computer")
    
    file_download_parser = file_subs.add_parser("download", help="Get download URL")
    file_download_parser.add_argument("--id", required=True, help="File ID")
    
    file_delete_parser = file_subs.add_parser("delete", help="Delete file")
    file_delete_parser.add_argument("--id", required=True, help="File ID")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Route to appropriate command
    if args.command == "workspace":
        if args.subcommand == "list":
            workspace_list()
        elif args.subcommand == "create":
            workspace_create(args.name)
        elif args.subcommand == "get":
            workspace_get(args.id)
        elif args.subcommand == "delete":
            workspace_delete(args.id)
        else:
            workspace_parser.print_help()
    
    elif args.command == "computer":
        if args.subcommand == "create":
            computer_create(args.workspace_id, args.name, args.ram, args.cpu, args.gpu)
        elif args.subcommand == "get":
            computer_get(args.id)
        elif args.subcommand == "delete":
            computer_delete(args.id)
        elif args.subcommand == "start":
            computer_start(args.id)
        elif args.subcommand == "stop":
            computer_stop(args.id)
        elif args.subcommand == "restart":
            computer_restart(args.id)
        elif args.subcommand == "vnc-password":
            computer_vnc_password(args.id)
        else:
            computer_parser.print_help()
    
    elif args.command == "screenshot":
        screenshot(args.id, args.output)
    
    elif args.command == "click":
        click(args.id, args.x, args.y, args.button, args.double)
    
    elif args.command == "drag":
        drag(args.id, args.start_x, args.start_y, args.end_x, args.end_y, args.button, args.duration)
    
    elif args.command == "type":
        type_text(args.id, args.text)
    
    elif args.command == "key":
        press_key(args.id, args.key)
    
    elif args.command == "scroll":
        scroll(args.id, args.direction, args.amount)
    
    elif args.command == "wait":
        wait(args.id, args.duration)
    
    elif args.command == "bash":
        bash(args.id, args.command)
    
    elif args.command == "python":
        python_exec(args.id, args.code, args.timeout)
    
    elif args.command == "file":
        if args.subcommand == "upload":
            file_upload(args.workspace_id, args.file_path, args.computer_id)
        elif args.subcommand == "list":
            file_list(args.workspace_id, args.computer_id)
        elif args.subcommand == "export":
            file_export(args.computer_id, args.path)
        elif args.subcommand == "download":
            file_download(args.id)
        elif args.subcommand == "delete":
            file_delete(args.id)
        else:
            file_parser.print_help()

if __name__ == "__main__":
    main()
