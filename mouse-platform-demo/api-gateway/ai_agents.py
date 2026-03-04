"""
AI Agents
King Mouse and Knight implementations with real AI integration
"""
import os
import httpx
import json
from typing import Dict, List, Optional
from datetime import datetime

class MoonshotClient:
    """Client for Moonshot AI API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("MOONSHOT_API_KEY")
        self.base_url = "https://api.moonshot.cn/v1"
        # Using Kimi K2.5 model as default
        self.model = os.getenv("MOONSHOT_MODEL", "kimi-k2.5")
    
    async def chat_completion(
        self, 
        messages: List[Dict], 
        temperature: float = 0.7,
        max_tokens: int = 2000,
        tools: List[Dict] = None
    ) -> Dict:
        """Send chat completion request to Moonshot API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if tools:
            payload["tools"] = tools
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()


class KingMouseAgent:
    """
    King Mouse - Customer-facing AI assistant with real Moonshot AI
    Handles customer requests and delegates to knights
    """
    
    ROLES = {
        "web_developer": {
            "name": "Web Developer",
            "skills": ["HTML", "CSS", "JavaScript", "React", "Next.js", "Shopify"],
            "hourly_value": 75,
            "description": "Builds websites, web applications, and e-commerce stores"
        },
        "social_media_manager": {
            "name": "Social Media Manager", 
            "skills": ["Content Creation", "Instagram", "TikTok", "Strategy"],
            "hourly_value": 50,
            "description": "Creates content and manages social media presence"
        },
        "sales_rep": {
            "name": "Sales Representative",
            "skills": ["Outreach", "Cold Email", "LinkedIn", "CRM"],
            "hourly_value": 60,
            "description": "Handles sales outreach and lead generation"
        },
        "bookkeeper": {
            "name": "Bookkeeper",
            "skills": ["QuickBooks", "Invoicing", "Expense Tracking"],
            "hourly_value": 45,
            "description": "Manages finances, invoicing, and expense tracking"
        },
        "customer_support": {
            "name": "Customer Support",
            "skills": ["Email Support", "Live Chat", "Ticket Resolution"],
            "hourly_value": 35,
            "description": "Handles customer inquiries and support tickets"
        },
        "data_analyst": {
            "name": "Data Analyst",
            "skills": ["SQL", "Python", "Data Visualization", "Reporting"],
            "hourly_value": 65,
            "description": "Analyzes data and creates business reports"
        }
    }
    
    def __init__(self, company_name: str, plan: str, customer_id: str = None):
        self.company_name = company_name
        self.plan = plan
        self.customer_id = customer_id
        self.moonshot = MoonshotClient()
        self.conversation_history = []
    
    async def process_message(self, message: str) -> Dict:
        """
        Process customer message using real Moonshot AI
        """
        # Build system prompt
        system_prompt = self._build_system_prompt()
        
        # Build messages for AI
        messages = [
            {"role": "system", "content": system_prompt},
            *self.conversation_history[-10:],  # Last 10 messages for context
            {"role": "user", "content": message}
        ]
        
        # Define tools for function calling
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "deploy_employee",
                    "description": "Deploy an AI employee to handle a specific task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "role": {
                                "type": "string",
                                "enum": list(self.ROLES.keys()),
                                "description": "The type of employee to deploy"
                            },
                            "employee_name": {
                                "type": "string",
                                "description": "A friendly name for the employee"
                            },
                            "task_description": {
                                "type": "string",
                                "description": "Detailed description of what the employee should do"
                            }
                        },
                        "required": ["role", "employee_name", "task_description"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_status",
                    "description": "Get the status of current employees and tasks",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "general_response",
                    "description": "Provide a general response without deploying an employee",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "response": {
                                "type": "string",
                                "description": "The response to give the user"
                            }
                        },
                        "required": ["response"]
                    }
                }
            }
        ]
        
        try:
            # Call Moonshot API
            completion = await self.moonshot.chat_completion(
                messages=messages,
                tools=tools,
                temperature=0.7
            )
            
            # Parse response
            choice = completion["choices"][0]
            response_message = choice["message"]
            
            # Update conversation history
            self.conversation_history.append({"role": "user", "content": message})
            self.conversation_history.append({
                "role": "assistant", 
                "content": response_message.get("content", "")
            })
            
            # Check for tool calls
            if "tool_calls" in response_message:
                tool_call = response_message["tool_calls"][0]
                function_name = tool_call["function"]["name"]
                arguments = json.loads(tool_call["function"]["arguments"])
                
                if function_name == "deploy_employee":
                    role = arguments["role"]
                    role_info = self.ROLES[role]
                    return {
                        "message": f"🚀 I'll deploy **{role_info['name']}** for {self.company_name}!\n\n"
                                  f"They'll handle: {role_info['description']}\n\n"
                                  f"📊 **Estimated Value**: ${role_info['hourly_value']}/hour\n"
                                  f"⏱️ **Getting Started**: Just a moment...",
                        "action": "deploy_employee",
                        "role": role,
                        "employee_name": arguments["employee_name"],
                        "task_description": arguments["task_description"],
                        "hourly_value": role_info['hourly_value']
                    }
                elif function_name == "get_status":
                    return {
                        "message": "📊 Let me check your current status...",
                        "action": "get_status"
                    }
                elif function_name == "general_response":
                    return {
                        "message": arguments["response"],
                        "action": None
                    }
            
            # Regular text response
            content = response_message.get("content", "").strip()
            if not content:
                content = self._get_default_response()
            
            return {
                "message": content,
                "action": None
            }
            
        except Exception as e:
            print(f"[KingMouseAgent] Moonshot API error: {e}")
            # Fallback to local processing
            return await self._fallback_process(message)
    
    def _build_system_prompt(self) -> str:
        """Build system prompt for King Mouse AI"""
        roles_description = "\n".join([
            f"- {key}: {info['name']} - {info['description']} (${info['hourly_value']}/hr)"
            for key, info in self.ROLES.items()
        ])
        
        return f"""You are King Mouse, an AI workforce coordinator for {self.company_name}.

Your role is to:
1. Understand the customer's needs through conversation
2. Deploy appropriate AI employees when tasks are identified
3. Provide helpful responses about the platform and capabilities

Available AI Employee Types:
{roles_description}

Guidelines:
- Be friendly, professional, and concise
- Ask clarifying questions if the request is unclear
- When deploying employees, provide specific task descriptions
- Use the deploy_employee tool when the user needs work done
- Use general_response for questions, status checks, or casual conversation

The customer's plan tier is: {self.plan}
"""
    
    async def _fallback_process(self, message: str) -> Dict:
        """Fallback rule-based processing if AI fails"""
        message_lower = message.lower()
        
        # Check for deployment requests
        if any(word in message_lower for word in ["website", "web", "site", "build"]):
            return await self._handle_web_request(message)
        elif any(word in message_lower for word in ["social media", "instagram", "content", "post"]):
            return await self._handle_social_request(message)
        elif any(word in message_lower for word in ["sales", "outreach", "leads", "prospect"]):
            return await self._handle_sales_request(message)
        elif any(word in message_lower for word in ["bookkeeping", "invoices", "accounting"]):
            return await self._handle_bookkeeping_request(message)
        elif any(word in message_lower for word in ["support", "customer service", "tickets"]):
            return await self._handle_support_request(message)
        
        return {
            "message": self._get_default_response(),
            "action": None
        }
    
    def _get_default_response(self) -> str:
        """Get default help response"""
        return f"""👋 Hi! I am King Mouse, your AI workforce coordinator for **{self.company_name}**.

I can deploy AI employees for:
• 🌐 Website development
• 📱 Social media management  
• 💼 Sales & outreach
• 📚 Bookkeeping
• 🎧 Customer support
• 📊 Data analysis

What would you like help with today?"""
    
    async def _handle_web_request(self, message: str) -> Dict:
        role = self.ROLES["web_developer"]
        return {
            "message": f"🚀 I'll deploy **{role['name']}** for {self.company_name}!",
            "action": "deploy_employee",
            "role": "web_developer",
            "employee_name": f"Alex ({role['name']})",
            "task_description": f"Build a website for {self.company_name}: {message}",
            "hourly_value": role['hourly_value']
        }
    
    async def _handle_social_request(self, message: str) -> Dict:
        role = self.ROLES["social_media_manager"]
        return {
            "message": f"📱 I'll deploy **{role['name']}** for {self.company_name}!",
            "action": "deploy_employee",
            "role": "social_media_manager",
            "employee_name": f"Sam ({role['name']})",
            "task_description": f"Create social media content for {self.company_name}: {message}",
            "hourly_value": role['hourly_value']
        }
    
    async def _handle_sales_request(self, message: str) -> Dict:
        role = self.ROLES["sales_rep"]
        return {
            "message": f"💼 I'll deploy **{role['name']}** for {self.company_name}!",
            "action": "deploy_employee",
            "role": "sales_rep",
            "employee_name": f"Jordan ({role['name']})",
            "task_description": f"Sales outreach for {self.company_name}: {message}",
            "hourly_value": role['hourly_value']
        }
    
    async def _handle_bookkeeping_request(self, message: str) -> Dict:
        role = self.ROLES["bookkeeper"]
        return {
            "message": f"📚 I'll deploy **{role['name']}** for {self.company_name}!",
            "action": "deploy_employee",
            "role": "bookkeeper",
            "employee_name": f"Taylor ({role['name']})",
            "task_description": f"Bookkeeping for {self.company_name}: {message}",
            "hourly_value": role['hourly_value']
        }
    
    async def _handle_support_request(self, message: str) -> Dict:
        role = self.ROLES["customer_support"]
        return {
            "message": f"🎧 I'll deploy **{role['name']}** for {self.company_name}!",
            "action": "deploy_employee",
            "role": "customer_support",
            "employee_name": f"Casey ({role['name']})",
            "task_description": f"Customer support setup for {self.company_name}: {message}",
            "hourly_value": role['hourly_value']
        }


class KnightAgent:
    """
    Knight - Task execution AI running on Orgo VM with real AI capabilities
    """
    
    def __init__(self, vm_id: str, role: str, task: str = ""):
        self.vm_id = vm_id
        self.role = role
        self.task = task
        self.moonshot = MoonshotClient()
        self.orgo_api_key = os.getenv("ORGO_API_KEY")
        self.workspace_id = os.getenv("ORGO_WORKSPACE_ID")
    
    async def initialize(self):
        """Initialize the knight on the VM with proper environment setup"""
        setup_script = '''
import subprocess
import os

# Update and install dependencies
subprocess.run(["apt-get", "update"], capture_output=True)
subprocess.run(["apt-get", "install", "-y", "nodejs", "npm", "python3-pip", "git"], capture_output=True)

# Create workspace
os.makedirs("/home/user/workspace", exist_ok=True)
os.makedirs("/home/user/workspace/output", exist_ok=True)

# Create task log
with open("/home/user/workspace/task.log", "w") as f:
    f.write("Knight initialized\\n")

print("Knight initialized successfully")
'''
        await self._execute_on_vm(setup_script)
    
    async def start_task(self, task: str):
        """Start executing a task using AI"""
        self.task = task
        
        # Generate task plan using Moonshot
        plan = await self._generate_task_plan(task)
        
        # Execute based on role
        if self.role == "web_developer":
            await self._start_web_task(task, plan)
        elif self.role == "social_media_manager":
            await self._start_social_task(task, plan)
        elif self.role == "sales_rep":
            await self._start_sales_task(task, plan)
        elif self.role == "bookkeeper":
            await self._start_bookkeeping_task(task, plan)
        elif self.role == "customer_support":
            await self._start_support_task(task, plan)
        else:
            await self._start_generic_task(task, plan)
    
    async def _generate_task_plan(self, task: str) -> List[str]:
        """Generate a step-by-step plan for the task using Moonshot"""
        messages = [
            {"role": "system", "content": f"You are a {self.role} planning a task. Return ONLY a numbered list of steps."},
            {"role": "user", "content": f"Create a step-by-step plan for: {task}"}
        ]
        
        try:
            completion = await self.moonshot.chat_completion(messages, max_tokens=1000)
            plan_text = completion["choices"][0]["message"]["content"]
            # Parse numbered list
            steps = [line.strip() for line in plan_text.split('\n') if line.strip() and line[0].isdigit()]
            return steps
        except Exception as e:
            print(f"[KnightAgent] Error generating plan: {e}")
            return ["Analyze requirements", "Create deliverables", "Review and finalize"]
    
    async def _start_web_task(self, task: str, plan: List[str]):
        """Start website development task"""
        plan_text = "\\n".join([f"{i+1}. {step}" for i, step in enumerate(plan)])
        
        code = f'''
import os
import subprocess

os.makedirs("/home/user/workspace", exist_ok=True)
os.chdir("/home/user/workspace")

# Create project structure
os.makedirs("website", exist_ok=True)
os.chdir("website")

# Initialize project
with open("plan.md", "w") as f:
    f.write("# Website Development Plan\\n\\n")
    f.write("Task: {task}\\n\\n")
    f.write("## Steps\\n")
    f.write("{plan_text}\\n")

# Create starter files
with open("index.html", "w") as f:
    f.write("<!DOCTYPE html>\\n<html>\\n<head>\\n")
    f.write("<title>Website</title>\\n")
    f.write("<style>body {{ font-family: sans-serif; padding: 20px; }}</style>\\n")
    f.write("</head>\\n<body>\\n")
    f.write("<h1>Website Under Construction</h1>\\n")
    f.write("<p>Task: {task}</p>\\n")
    f.write("</body>\\n</html>")

print("Web development project initialized")
'''
        await self._execute_on_vm(code)
    
    async def _start_social_task(self, task: str, plan: List[str]):
        """Start social media task with AI-generated content"""
        plan_text = "\\n".join([f"{i+1}. {step}" for i, step in enumerate(plan)])
        
        # Generate content using AI
        content_prompt = f"Create 3 social media posts for: {task}. Return as a JSON array with 'platform', 'caption', and 'hashtags'."
        try:
            completion = await self.moonshot.chat_completion([
                {"role": "user", "content": content_prompt}
            ], max_tokens=1500)
            ai_content = completion["choices"][0]["message"]["content"]
        except:
            ai_content = "[]"
        
        code = f'''
import os
import json

os.makedirs("/home/user/workspace/social-media", exist_ok=True)
os.chdir("/home/user/workspace/social-media")

# Create content strategy doc
with open("content-strategy.md", "w") as f:
    f.write("# Social Media Strategy\\n\\n")
    f.write("## Task\\n{task}\\n\\n")
    f.write("## Plan\\n{plan_text}\\n\\n")
    f.write("## AI-Generated Content\\n")
    f.write("{ai_content}\\n")

# Save AI content
with open("posts.json", "w") as f:
    f.write("{ai_content}")

print("Social media project initialized")
'''
        await self._execute_on_vm(code)
    
    async def _start_sales_task(self, task: str, plan: List[str]):
        """Start sales task"""
        plan_text = "\\n".join([f"{i+1}. {step}" for i, step in enumerate(plan)])
        
        code = f'''
import os

os.makedirs("/home/user/workspace/sales", exist_ok=True)
os.chdir("/home/user/workspace/sales")

# Create outreach materials
with open("sales-plan.md", "w") as f:
    f.write("# Sales Plan\\n\\n")
    f.write("## Task\\n{task}\\n\\n")
    f.write("## Steps\\n{plan_text}\\n")

with open("outreach-template.md", "w") as f:
    f.write("# Sales Outreach Template\\n\\n")
    f.write("## Subject: Partnership Opportunity\\n\\n")
    f.write("Hi {{name}},\\n\\n")
    f.write("I noticed {{company}} and think we could help...\\n\\n")
    f.write("Best,\\nAI Sales Rep\\n")

print("Sales project initialized")
'''
        await self._execute_on_vm(code)
    
    async def _start_bookkeeping_task(self, task: str, plan: List[str]):
        """Start bookkeeping task"""
        plan_text = "\\n".join([f"{i+1}. {step}" for i, step in enumerate(plan)])
        
        code = f'''
import os

os.makedirs("/home/user/workspace/bookkeeping", exist_ok=True)
os.chdir("/home/user/workspace/bookkeeping")

with open("bookkeeping-plan.md", "w") as f:
    f.write("# Bookkeeping Plan\\n\\n")
    f.write("## Task\\n{task}\\n\\n")
    f.write("## Steps\\n{plan_text}\\n")

# Create tracking spreadsheets
with open("expenses.csv", "w") as f:
    f.write("Date,Category,Amount,Description\\n")

with open("income.csv", "w") as f:
    f.write("Date,Source,Amount,Description\\n")

print("Bookkeeping project initialized")
'''
        await self._execute_on_vm(code)
    
    async def _start_support_task(self, task: str, plan: List[str]):
        """Start customer support task"""
        plan_text = "\\n".join([f"{i+1}. {step}" for i, step in enumerate(plan)])
        
        code = f'''
import os

os.makedirs("/home/user/workspace/support", exist_ok=True)
os.chdir("/home/user/workspace/support")

with open("support-plan.md", "w") as f:
    f.write("# Customer Support Setup\\n\\n")
    f.write("## Task\\n{task}\\n\\n")
    f.write("## Steps\\n{plan_text}\\n")

# Create response templates
with open("response-templates.md", "w") as f:
    f.write("# Response Templates\\n\\n")
    f.write("## Welcome\\nHello! How can I help you today?\\n\\n")
    f.write("## Issue Acknowledgment\\nI understand your concern. Let me help you with that.\\n")

print("Support project initialized")
'''
        await self._execute_on_vm(code)
    
    async def _start_generic_task(self, task: str, plan: List[str]):
        """Start generic task"""
        plan_text = "\\n".join([f"{i+1}. {step}" for i, step in enumerate(plan)])
        
        code = f'''
import os

os.makedirs("/home/user/workspace/task", exist_ok=True)
os.chdir("/home/user/workspace/task")

with open("README.md", "w") as f:
    f.write("# Task: {task}\\n\\n")
    f.write("## Plan\\n{plan_text}\\n\\n")
    f.write("Status: In Progress\\n")

with open("task.log", "w") as f:
    f.write("Task started\\n")

print("Generic task initialized")
'''
        await self._execute_on_vm(code)
    
    async def _execute_on_vm(self, code: str):
        """Execute Python code on the VM via Orgo API"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://api.orgo.ai/v1/computers/{self.vm_id}/exec",
                headers={"Authorization": f"Bearer {self.orgo_api_key}"},
                json={"code": code, "timeout": 60}
            )
            return response.json()
    
    async def get_status(self) -> Dict:
        """Get current task status from VM"""
        code = '''
import os
status = {"files": [], "log": ""}
if os.path.exists("/home/user/workspace"):
    for root, dirs, files in os.walk("/home/user/workspace"):
        for f in files:
            status["files"].append(os.path.join(root, f).replace("/home/user/workspace/", ""))
if os.path.exists("/home/user/workspace/task.log"):
    with open("/home/user/workspace/task.log", "r") as f:
        status["log"] = f.read()
print(json.dumps(status))
'''
        try:
            result = await self._execute_on_vm(code)
            return {
                "status": "active",
                "files": result.get("files", []),
                "log_snippet": result.get("log", "")[:500]
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
