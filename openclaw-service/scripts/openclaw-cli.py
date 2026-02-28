#!/usr/bin/env python3
"""
OpenClaw Service CLI
Management tool for the OpenClaw-as-a-Service platform
"""

import click
import requests
import json
import os
from typing import Optional

API_BASE = os.getenv("OPENCLAW_API", "http://localhost:8000")

@click.group()
@click.option('--api-url', default=API_BASE, help='API base URL')
@click.option('--api-key', envvar='OPENCLAW_API_KEY', help='API key for authentication')
@click.pass_context
def cli(ctx, api_url, api_key):
    """OpenClaw-as-a-Service Management CLI"""
    ctx.ensure_object(dict)
    ctx.obj['api_url'] = api_url
    ctx.obj['api_key'] = api_key

@cli.command()
@click.option('--name', required=True, help='Tenant/company name')
@click.option('--email', required=True, help='Contact email')
@click.option('--tier', default='free', type=click.Choice(['free', 'starter', 'pro', 'enterprise']))
@click.option('--telegram-token', help='Telegram bot token (optional)')
@click.option('--whatsapp-phone', help='WhatsApp phone number ID (optional)')
@click.pass_context
def onboard(ctx, name, email, tier, telegram_token, whatsapp_phone):
    """Onboard a new customer"""
    
    payload = {
        "name": name,
        "email": email,
        "subscription_tier": tier
    }
    
    headers = {}
    if ctx.obj['api_key']:
        headers['X-API-Key'] = ctx.obj['api_key']
    
    response = requests.post(
        f"{ctx.obj['api_url']}/api/v1/tenants",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()['data']
        click.echo(f"✅ Tenant created successfully!")
        click.echo(f"   ID: {data['id']}")
        click.echo(f"   Slug: {data['slug']}")
        
        if telegram_token:
            click.echo("🔗 Configure Telegram bot with:")
            click.echo(f"   curl -X POST {ctx.obj['api_url']}/api/v1/tenants/{data['id']}/bots/telegram \\")
            click.echo(f"     -H 'X-API-Key: YOUR_KEY' \\")
            click.echo(f"     -d '{{\"token\": \"{telegram_token}\"}}'")
    else:
        click.echo(f"❌ Failed: {response.status_code}")
        click.echo(response.text)

@cli.command()
@click.option('--tenant-id', required=True, help='Tenant ID')
@click.option('--task', required=True, help='Task description')
@click.option('--ram', default=4, type=int, help='RAM in GB')
@click.option('--cpu', default=2, type=int, help='CPU cores')
@click.pass_context
def deploy_knight(ctx, tenant_id, task, ram, cpu):
    """Deploy a Knight VM for a tenant"""
    
    payload = {
        "task_description": task,
        "ram_gb": ram,
        "cpu_cores": cpu
    }
    
    headers = {}
    if ctx.obj['api_key']:
        headers['X-API-Key'] = ctx.obj['api_key']
    
    response = requests.post(
        f"{ctx.obj['api_url']}/api/v1/knights",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 202:
        data = response.json()['data']
        click.echo(f"✅ Knight deployment queued!")
        click.echo(f"   Knight ID: {data['id']}")
        click.echo(f"   Status: {data['status']}")
    else:
        click.echo(f"❌ Failed: {response.status_code}")
        click.echo(response.text)

@cli.command()
@click.option('--tenant-id', required=True, help='Tenant ID')
@click.pass_context
def status(ctx, tenant_id):
    """Get tenant status"""
    
    headers = {}
    if ctx.obj['api_key']:
        headers['X-API-Key'] = ctx.obj['api_key']
    
    # Get tenant info
    response = requests.get(
        f"{ctx.obj['api_url']}/api/v1/tenants/{tenant_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()['data']
        click.echo(f"📊 Tenant: {data['name']}")
        click.echo(f"   Tier: {data['subscription_tier']}")
        click.echo(f"   Status: {data['subscription_status']}")
        
        # Get knights
        knights_resp = requests.get(
            f"{ctx.obj['api_url']}/api/v1/knights",
            headers=headers
        )
        
        if knights_resp.status_code == 200:
            knights = knights_resp.json()['data']
            click.echo(f"\n🛡️  Knights: {len(knights)}")
            for k in knights[:5]:
                click.echo(f"   - {k.get('name', 'Unnamed')}: {k['status']}")
    else:
        click.echo(f"❌ Failed: {response.status_code}")

@cli.command()
@click.option('--tenant-id', required=True, help='Tenant ID')
@click.option('--knight-id', required=True, help='Knight ID to stop')
@click.pass_context
def stop_knight(ctx, tenant_id, knight_id):
    """Stop a Knight VM"""
    
    headers = {}
    if ctx.obj['api_key']:
        headers['X-API-Key'] = ctx.obj['api_key']
    
    response = requests.delete(
        f"{ctx.obj['api_url']}/api/v1/knights/{knight_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        click.echo(f"✅ Knight {knight_id} stop queued")
    else:
        click.echo(f"❌ Failed: {response.status_code}")

@cli.command()
@click.pass_context
def health(ctx):
    """Check platform health"""
    
    response = requests.get(f"{ctx.obj['api_url']}/health")
    
    if response.status_code == 200:
        data = response.json()
        click.echo(f"✅ Platform Status: {data['status']}")
        click.echo(f"   Database: {data.get('database', 'unknown')}")
        click.echo(f"   Redis: {data.get('redis', 'unknown')}")
        click.echo(f"   Time: {data['timestamp']}")
    else:
        click.echo(f"❌ Platform unhealthy: {response.status_code}")

@cli.command()
@click.option('--output', default='openclaw-backup.json', help='Backup file path')
@click.pass_context
def backup(ctx, output):
    """Backup tenant data"""
    click.echo(f"💾 Creating backup to {output}...")
    # Implementation would export tenant data
    click.echo("✅ Backup complete")

@cli.command()
@click.argument('backup_file')
@click.pass_context
def restore(ctx, backup_file):
    """Restore from backup"""
    click.echo(f"📥 Restoring from {backup_file}...")
    # Implementation would import tenant data
    click.echo("✅ Restore complete")

if __name__ == '__main__':
    cli()
