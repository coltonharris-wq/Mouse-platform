"""
VM and Employee Deployment Tests
Tests for AI employee deployment, VM management, and task execution
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

def test_list_vms_success(client, mock_supabase):
    """Successfully list customer VMs"""
    with patch('main.platform.supabase', mock_supabase):
        mock_supabase.get_employees_by_customer.return_value = [
            {
                "id": "emp_1",
                "vm_id": "vm_1",
                "name": "Web Dev",
                "role": "Web Developer",
                "status": "active",
                "current_task": "Build website"
            }
        ]
        
        response = client.get("/api/v1/customers/cst_test123/vms")
        
        assert response.status_code == 200
        data = response.json()
        assert "vms" in data
        assert len(data["vms"]) == 1

def test_deploy_employee_success(client, valid_employee_data, mock_supabase, mock_orgo):
    """Successfully deploy new employee"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json=valid_employee_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "vm" in data
        assert "employee" in data

def test_deploy_employee_creates_vm(client, valid_employee_data, mock_supabase, mock_orgo):
    """Employee deployment should create VM"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json=valid_employee_data
        )
        
        mock_orgo.create_computer.assert_called_once()
        
        # Check VM config
        call_args = mock_orgo.create_computer.call_args
        assert call_args[1]["config"]["ram"] == 4
        assert call_args[1]["config"]["cpu"] == 2

def test_deploy_employee_creates_database_record(client, valid_employee_data, mock_supabase, mock_orgo):
    """Employee deployment should create database record"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json=valid_employee_data
        )
        
        mock_supabase.create_employee.assert_called_once()
        mock_supabase.update_employee.assert_called()

def test_deploy_employee_validates_role(client):
    """Should validate employee role"""
    invalid_roles = ["", "invalid_role", "hacker"]
    
    for role in invalid_roles:
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json={
                "role": role,
                "name": "Test",
                "task_description": "Test task"
            }
        )
        assert response.status_code == 422, f"Should reject role: {role}"

def test_deploy_employee_validates_task_description(client):
    """Should validate task description"""
    # Empty task
    response = client.post(
        "/api/v1/customers/cst_test123/vms",
        json={
            "role": "Web Developer",
            "name": "Test",
            "task_description": ""
        }
    )
    assert response.status_code == 422
    
    # Too long task
    response = client.post(
        "/api/v1/customers/cst_test123/vms",
        json={
            "role": "Web Developer",
            "name": "Test",
            "task_description": "A" * 1001
        }
    )
    assert response.status_code == 422

def test_deploy_employee_respects_plan_limits(client, mock_supabase, mock_orgo):
    """Should respect plan VM limits"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        # Mock customer at VM limit (starter = 2 VMs)
        mock_supabase.get_employees_by_customer.return_value = [
            {"id": "emp_1", "status": "active"},
            {"id": "emp_2", "status": "active"}
        ]
        mock_supabase.get_customer.return_value = {
            "id": "cst_test123",
            "plan_tier": "starter"
        }
        
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json={
                "role": "Web Developer",
                "name": "Test",
                "task_description": "Build website"
            }
        )
        
        assert response.status_code == 403  # Limit exceeded

def test_screenshot_returns_base64(client, mock_supabase, mock_orgo):
    """Screenshot endpoint should return base64 image"""
    with patch('main.supabase', mock_supabase), \
         patch('main.orgo', mock_orgo):
        
        mock_supabase.get_employee_by_vm.return_value = {
            "id": "emp_1",
            "customer_id": "cst_test123",
            "status": "active"
        }
        
        response = client.get("/api/v1/customers/cst_test123/vms/vm_test/screenshot")
        
        assert response.status_code == 200
        data = response.json()
        assert "screenshot_base64" in data
        assert "timestamp" in data

def test_vm_status_tracking(client, mock_supabase, mock_orgo):
    """VM status should be tracked correctly"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        # Deploy employee
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json={
                "role": "Web Developer",
                "name": "Test Dev",
                "task_description": "Build site"
            }
        )
        
        # Check employee status progression
        calls = mock_supabase.update_employee.call_args_list
        statuses = [call[0][1].get("status") for call in calls if "status" in call[0][1]]
        
        assert "starting" in statuses
        assert "active" in statuses

def test_get_screenshot_invalid_vm(client, mock_supabase):
    """Screenshot for non-existent VM should 404"""
    with patch('main.supabase', mock_supabase):
        mock_supabase.get_employee_by_vm.return_value = None
        
        response = client.get("/api/v1/customers/cst_test123/vms/vm_nonexistent/screenshot")
        
        assert response.status_code == 404

def test_employee_name_validation(client):
    """Employee name should be validated"""
    invalid_names = ["", "A" * 51]  # Empty or too long
    
    for name in invalid_names:
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json={
                "role": "Web Developer",
                "name": name,
                "task_description": "Test task"
            }
        )
        assert response.status_code == 422, f"Should reject name: {name}"

def test_vm_cleanup_on_failure(client, mock_supabase, mock_orgo):
    """Should cleanup VM if employee setup fails"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        # Make employee creation fail
        mock_supabase.create_employee.side_effect = Exception("DB Error")
        
        response = client.post(
            "/api/v1/customers/cst_test123/vms",
            json={
                "role": "Web Developer",
                "name": "Test",
                "task_description": "Test task"
            }
        )
        
        # Should cleanup VM
        mock_orgo.delete_computer.assert_called_once()
