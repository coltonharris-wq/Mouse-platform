/**
 * Worker Pool Orchestration System
 * Mouse → 8 Managers → 64 Knights
 * Recursive chain of command for task delegation
 */

import { OgerClient, createOgerClient, OgerVM } from './oger-client';

export interface Task {
  id: string;
  type: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  assignedTo?: string;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Worker {
  id: string;
  vmId: string;
  type: 'manager' | 'knight';
  status: 'idle' | 'busy' | 'offline' | 'error';
  parentId?: string; // For knights, their manager ID
  children?: string[]; // For managers, their knight IDs
  currentTask?: string;
  lastHeartbeat: Date;
  capabilities: string[];
  metadata: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  workerId: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export class WorkerPoolOrchestrator {
  private ogerClient: OgerClient;
  private workers: Map<string, Worker> = new Map();
  private tasks: Map<string, Task> = new Map();
  private taskQueue: Task[] = [];
  private heartbeatInterval?: NodeJS.Timeout;
  private isRunning: boolean = false;

  // Configuration
  private readonly NUM_MANAGERS = 8;
  private readonly NUM_KNIGHTS_PER_MANAGER = 8;
  private readonly HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
  private readonly TASK_TIMEOUT_MS = 300000; // 5 minutes

  constructor() {
    this.ogerClient = createOgerClient();
  }

  /**
   * Initialize the worker pool
   * Creates 8 managers and 64 knights if they don't exist
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Worker Pool Orchestrator...');
    console.log(`   Structure: 1 Mouse → ${this.NUM_MANAGERS} Managers → ${this.NUM_MANAGERS * this.NUM_KNIGHTS_PER_MANAGER} Knights`);

    // Check for existing workers in database
    await this.loadExistingWorkers();

    // Create missing managers
    const existingManagers = Array.from(this.workers.values()).filter(w => w.type === 'manager');
    const managersToCreate = this.NUM_MANAGERS - existingManagers.length;
    
    if (managersToCreate > 0) {
      console.log(`📊 Creating ${managersToCreate} manager VMs...`);
      for (let i = 0; i < managersToCreate; i++) {
        const managerNum = existingManagers.length + i + 1;
        await this.createManager(managerNum);
      }
    }

    // Create missing knights for each manager
    for (const manager of this.workers.values()) {
      if (manager.type !== 'manager') continue;

      const existingKnights = Array.from(this.workers.values())
        .filter(w => w.type === 'knight' && w.parentId === manager.id);
      
      const knightsToCreate = this.NUM_KNIGHTS_PER_MANAGER - existingKnights.length;
      
      if (knightsToCreate > 0) {
        console.log(`📊 Creating ${knightsToCreate} knights for ${manager.id}...`);
        for (let i = 0; i < knightsToCreate; i++) {
          await this.createKnight(manager.id, existingKnights.length + i + 1);
        }
      }
    }

    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();
    this.isRunning = true;

    console.log('✅ Worker Pool initialized');
    console.log(`   Total workers: ${this.workers.size}`);
    console.log(`   Managers: ${Array.from(this.workers.values()).filter(w => w.type === 'manager').length}`);
    console.log(`   Knights: ${Array.from(this.workers.values()).filter(w => w.type === 'knight').length}`);
  }

  /**
   * Create a manager VM
   */
  private async createManager(num: number): Promise<Worker> {
    const managerId = `manager-${num}`;
    console.log(`🎯 Creating manager: ${managerId}`);

    const result = await this.ogerClient.createVM({
      name: `mouse-manager-${num}`,
      type: 'cpx31', // 8 vCPUs, 16GB RAM for managers
      metadata: {
        role: 'manager',
        managerId,
        parent: 'mouse',
      },
    });

    if (!result.success || !result.vm) {
      throw new Error(`Failed to create manager ${managerId}: ${result.error}`);
    }

    // Wait for VM to be ready
    const vm = await this.ogerClient.waitForVM(result.vm.id);
    if (!vm) {
      throw new Error(`Manager VM ${result.vm.id} failed to become ready`);
    }

    const worker: Worker = {
      id: managerId,
      vmId: vm.id,
      type: 'manager',
      status: 'idle',
      children: [],
      lastHeartbeat: new Date(),
      capabilities: ['orchestrate', 'delegate', 'aggregate', 'monitor'],
      metadata: { vmIp: vm.ip },
    };

    this.workers.set(managerId, worker);
    await this.saveWorker(worker);

    console.log(`✅ Manager ${managerId} ready at ${vm.ip}`);
    return worker;
  }

  /**
   * Create a knight VM under a manager
   */
  private async createKnight(managerId: string, num: number): Promise<Worker> {
    const knightId = `knight-${managerId}-${num}`;
    console.log(`⚔️ Creating knight: ${knightId}`);

    const result = await this.ogerClient.createVM({
      name: `mouse-knight-${managerId}-${num}`,
      type: 'cpx21', // 4 vCPUs, 8GB RAM for knights
      metadata: {
        role: 'knight',
        knightId,
        parent: managerId,
      },
    });

    if (!result.success || !result.vm) {
      throw new Error(`Failed to create knight ${knightId}: ${result.error}`);
    }

    // Wait for VM to be ready
    const vm = await this.ogerClient.waitForVM(result.vm.id);
    if (!vm) {
      throw new Error(`Knight VM ${result.vm.id} failed to become ready`);
    }

    const worker: Worker = {
      id: knightId,
      vmId: vm.id,
      type: 'knight',
      status: 'idle',
      parentId: managerId,
      lastHeartbeat: new Date(),
      capabilities: ['execute', 'compute', 'analyze', 'generate'],
      metadata: { vmIp: vm.ip },
    };

    this.workers.set(knightId, worker);
    await this.saveWorker(worker);

    // Add to manager's children
    const manager = this.workers.get(managerId);
    if (manager) {
      manager.children = manager.children || [];
      manager.children.push(knightId);
      await this.saveWorker(manager);
    }

    console.log(`✅ Knight ${knightId} ready at ${vm.ip}`);
    return worker;
  }

  /**
   * Delegate a task to the worker pool
   * Routes through managers to knights
   */
  async delegateTask(
    taskType: string,
    taskData: any,
    options: { priority?: 'low' | 'normal' | 'high' | 'urgent'; timeout?: number } = {}
  ): Promise<TaskResult> {
    const priority = options.priority || 'normal';
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`📋 Delegating task: ${taskId} (${taskType}, priority: ${priority})`);

    const task: Task = {
      id: taskId,
      type: taskType,
      data: taskData,
      priority,
      status: 'pending',
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);

    // Find available manager
    const availableManager = await this.findAvailableManager();
    if (!availableManager) {
      // Queue task if no manager available
      this.taskQueue.push(task);
      console.log(`⏳ Task ${taskId} queued (no available managers)`);
      
      return {
        taskId,
        workerId: '',
        success: false,
        error: 'Task queued - no available workers',
        duration: 0,
      };
    }

    // Assign to manager for delegation to knight
    return this.assignTaskToManager(task, availableManager);
  }

  /**
   * Assign task to a manager, who delegates to a knight
   */
  private async assignTaskToManager(task: Task, manager: Worker): Promise<TaskResult> {
    const startTime = Date.now();
    
    task.status = 'assigned';
    task.assignedTo = manager.id;
    
    // Manager finds available knight
    const knight = await this.findAvailableKnight(manager);
    if (!knight) {
      task.status = 'pending';
      task.assignedTo = undefined;
      this.taskQueue.push(task);
      
      return {
        taskId: task.id,
        workerId: manager.id,
        success: false,
        error: 'Task queued - no available knights',
        duration: Date.now() - startTime,
      };
    }

    // Assign task to knight via Oger
    console.log(`🎯 Manager ${manager.id} assigning to knight ${knight.id}`);
    
    task.status = 'running';
    task.assignedTo = knight.id;
    task.startedAt = new Date();
    
    knight.status = 'busy';
    knight.currentTask = task.id;
    await this.saveWorker(knight);

    try {
      // Execute task on knight VM
      const ogerTask = await this.ogerClient.assignTask(knight.vmId, {
        taskId: task.id,
        type: task.type,
        data: task.data,
      });

      if (!ogerTask) {
        throw new Error('Failed to assign task via Oger');
      }

      // Wait for completion
      const completedTask = await this.ogerClient.waitForTask(
        knight.vmId,
        ogerTask.id,
        { timeout: this.TASK_TIMEOUT_MS }
      );

      task.completedAt = new Date();
      task.status = completedTask?.status === 'completed' ? 'completed' : 'failed';
      task.result = completedTask?.result;

      // Update knight status
      knight.status = 'idle';
      knight.currentTask = undefined;
      await this.saveWorker(knight);

      // Process any queued tasks
      this.processQueue();

      const duration = Date.now() - startTime;

      return {
        taskId: task.id,
        workerId: knight.id,
        success: completedTask?.status === 'completed',
        result: completedTask?.result,
        error: completedTask?.status === 'failed' ? 'Task execution failed' : undefined,
        duration,
      };

    } catch (error) {
      // Reset knight status
      knight.status = 'idle';
      knight.currentTask = undefined;
      await this.saveWorker(knight);

      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';

      return {
        taskId: task.id,
        workerId: knight.id,
        success: false,
        error: task.error,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Find an available manager
   */
  private async findAvailableManager(): Promise<Worker | null> {
    const managers = Array.from(this.workers.values())
      .filter(w => w.type === 'manager' && w.status === 'idle');
    
    if (managers.length === 0) return null;
    
    // Simple round-robin: pick first available
    // Could be enhanced with load balancing based on queue depth
    return managers[0];
  }

  /**
   * Find an available knight under a manager
   */
  private async findAvailableKnight(manager: Worker): Promise<Worker | null> {
    if (!manager.children) return null;
    
    const knights = manager.children
      .map(id => this.workers.get(id))
      .filter((w): w is Worker => w !== undefined && w.status === 'idle');
    
    if (knights.length === 0) return null;
    
    return knights[0];
  }

  /**
   * Process queued tasks
   */
  private async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0) {
      const manager = await this.findAvailableManager();
      if (!manager) break;

      const task = this.taskQueue.shift();
      if (task) {
        this.assignTaskToManager(task, manager);
      }
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(async () => {
      await this.checkWorkerHealth();
    }, this.HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Check health of all workers
   */
  private async checkWorkerHealth(): Promise<void> {
    for (const worker of this.workers.values()) {
      try {
        const vm = await this.ogerClient.getVM(worker.vmId);
        
        if (!vm) {
          console.error(`❌ Worker ${worker.id} VM not found`);
          worker.status = 'offline';
        } else if (vm.status === 'error') {
          console.error(`❌ Worker ${worker.id} VM in error state`);
          worker.status = 'error';
        } else if (vm.status === 'running') {
          worker.status = worker.currentTask ? 'busy' : 'idle';
        }

        worker.lastHeartbeat = new Date();
        await this.saveWorker(worker);

      } catch (error) {
        console.error(`❌ Health check failed for ${worker.id}:`, error);
        worker.status = 'offline';
        await this.saveWorker(worker);
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalWorkers: number;
    managers: number;
    knights: number;
    idle: number;
    busy: number;
    offline: number;
    queuedTasks: number;
    completedTasks: number;
    failedTasks: number;
  } {
    const workers = Array.from(this.workers.values());
    const tasks = Array.from(this.tasks.values());

    return {
      totalWorkers: workers.length,
      managers: workers.filter(w => w.type === 'manager').length,
      knights: workers.filter(w => w.type === 'knight').length,
      idle: workers.filter(w => w.status === 'idle').length,
      busy: workers.filter(w => w.status === 'busy').length,
      offline: workers.filter(w => w.status === 'offline').length,
      queuedTasks: this.taskQueue.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
    };
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Worker Pool...');
    
    this.isRunning = false;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Stop all VMs
    for (const worker of this.workers.values()) {
      try {
        await this.ogerClient.stopVM(worker.vmId);
        console.log(`⏹️ Stopped ${worker.id}`);
      } catch (error) {
        console.error(`Failed to stop ${worker.id}:`, error);
      }
    }

    console.log('✅ Worker Pool shut down');
  }

  /**
   * Load existing workers from database
   */
  private async loadExistingWorkers(): Promise<void> {
    // This would load from Supabase
    // For now, we start fresh
    console.log('📂 Loading existing workers...');
    // Implementation would query Supabase workers table
  }

  /**
   * Save worker to database
   */
  private async saveWorker(worker: Worker): Promise<void> {
    // This would save to Supabase
    // For now, we just keep in memory
  }
}

// Export singleton
export const workerPool = new WorkerPoolOrchestrator();
