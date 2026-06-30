import { Cell } from '../models/Cell';
import { Spreadsheet } from '../models/Spreadsheet';
import { Permission } from '../models/Permission';

/**
 * CollaborationManager - Singleton Pattern
 * Manages real-time collaboration sessions for the spreadsheet
 */
export class CollaborationManager {
    private static instance: CollaborationManager;
    private sessions: Map<string, string[]>; // sheetId -> userId[]
    private activeUsers: Map<string, Set<string>>; // sheetId -> Set of userIds
    private cellLocks: Map<string, string>; // cellKey (sheetId:row:col) -> userId

    private constructor() {
        this.sessions = new Map();
        this.activeUsers = new Map();
        this.cellLocks = new Map();
    }

    public static getInstance(): CollaborationManager {
        if (!CollaborationManager.instance) {
            CollaborationManager.instance = new CollaborationManager();
        }
        return CollaborationManager.instance;
    }

    // Session management
    public joinSheet(sheetId: string, userId: string): void {
        if (!this.sessions.has(sheetId)) {
            this.sessions.set(sheetId, []);
            this.activeUsers.set(sheetId, new Set());
        }
        if (!this.sessions.get(sheetId)!.includes(userId)) {
            this.sessions.get(sheetId)!.push(userId);
            this.activeUsers.get(sheetId)!.add(userId);
        }
    }

    public leaveSheet(sheetId: string, userId: string): void {
        if (this.sessions.has(sheetId)) {
            this.sessions.set(
                sheetId,
                this.sessions.get(sheetId)!.filter(id => id !== userId)
            );
            this.activeUsers.get(sheetId)?.delete(userId);
        }
        // Clear all locks held by this user on this sheet
        for (const [key, lockedUserId] of this.cellLocks) {
            if (key.startsWith(sheetId) && lockedUserId === userId) {
                this.cellLocks.delete(key);
            }
        }
    }

    public getActiveUsers(sheetId: string): string[] {
        return this.sessions.get(sheetId) || [];
    }

    public getActiveUsersCount(sheetId: string): number {
        return this.sessions.get(sheetId)?.length || 0;
    }

    // Cell locking for collaborative editing
    public lockCell(sheetId: string, row: number, col: number, userId: string): boolean {
        const key = `${sheetId}:${row}:${col}`;
        if (this.cellLocks.has(key) && this.cellLocks.get(key) !== userId) {
            return false; // Cell already locked by someone else
        }
        this.cellLocks.set(key, userId);
        return true;
    }

    public unlockCell(sheetId: string, row: number, col: number, userId: string): void {
        const key = `${sheetId}:${row}:${col}`;
        if (this.cellLocks.get(key) === userId) {
            this.cellLocks.delete(key);
        }
    }

    public isCellLocked(sheetId: string, row: number, col: number): boolean {
        const key = `${sheetId}:${row}:${col}`;
        return this.cellLocks.has(key);
    }

    public getCellLockOwner(sheetId: string, row: number, col: number): string | null {
        const key = `${sheetId}:${row}:${col}`;
        return this.cellLocks.get(key) || null;
    }

    // Broadcast changes to all users in a sheet
    public broadcastChange(sheetId: string, change: any): void {
        // In real implementation, this would send via WebSocket to all active users
        console.log(`Broadcasting change to sheet ${sheetId}:`, change);
    }

    // Permission checking (delegates to Permission model)
    public checkPermission(sheetId: string, userId: string, requiredAccess: 'view' | 'edit'): boolean {
        // This would check the Permission table
        // For now, we'll check if user is owner or has proper permission
        // In real implementation, this would query the Permission repository
        return true; // Simplified for demo
    }
}