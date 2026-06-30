import { User } from '../models/User';
import { Spreadsheet } from '../models/Spreadsheet';
import { Worksheet } from '../models/Worksheet';
import { Cell } from '../models/Cell';
import { Subscription } from '../models/Subscription';
import { Permission, AccessType } from '../models/Permission';
import { CollaborationManager } from './CollaborationManager';

/**
 * SpreadsheetService - Facade Pattern
 * Provides a simplified interface for all spreadsheet operations
 */
export class SpreadsheetService {
    private static instance: SpreadsheetService;
    private spreadsheets: Map<string, Spreadsheet>;
    private users: Map<string, User>;
    private subscriptions: Map<string, Subscription>;
    private permissions: Map<string, Permission>;
    private collaborationManager: CollaborationManager;

    private constructor() {
        this.spreadsheets = new Map();
        this.users = new Map();
        this.subscriptions = new Map();
        this.permissions = new Map();
        this.collaborationManager = CollaborationManager.getInstance();
    }

    public static getInstance(): SpreadsheetService {
        if (!SpreadsheetService.instance) {
            SpreadsheetService.instance = new SpreadsheetService();
        }
        return SpreadsheetService.instance;
    }

    // User management
    public createUser(userId: string, name: string, email: string, password: string): User {
        const user = new User(userId, name, email, password);
        this.users.set(userId, user);
        return user;
    }

    public getUser(userId: string): User | undefined {
        return this.users.get(userId);
    }

    public authenticateUser(email: string, password: string): User | null {
        for (const user of this.users.values()) {
            if (user.getEmail() === email && user.getPassword() === password) {
                return user;
            }
        }
        return null;
    }

    // Subscription management (1:1 relationship)
    public createSubscription(userId: string, planType: 'free' | 'monthly' | 'yearly' | 'enterprise'): Subscription {
        const subscriptionId = `sub-${Date.now()}-${userId}`;
        const subscription = new Subscription(subscriptionId, userId, planType);
        this.subscriptions.set(subscriptionId, subscription);
        return subscription;
    }

    public getSubscriptionByUser(userId: string): Subscription | null {
        for (const sub of this.subscriptions.values()) {
            if (sub.getUserId() === userId) {
                return sub;
            }
        }
        return null;
    }

    public renewSubscription(userId: string): boolean {
        const sub = this.getSubscriptionByUser(userId);
        if (!sub) return false;
        if (!sub.isActive()) {
            sub.renew();
            return true;
        }
        return true;
    }

    // Spreadsheet management
    public createSpreadsheet(sheetId: string, title: string, ownerId: string): Spreadsheet {
        const spreadsheet = new Spreadsheet(sheetId, title, ownerId);
        this.spreadsheets.set(sheetId, spreadsheet);
        
        // Create default worksheet
        const worksheet = this.createWorksheet(`ws-${sheetId}-1`, 'Sheet1', sheetId);
        spreadsheet.addWorksheet(worksheet);
        
        return spreadsheet;
    }

    public getSpreadsheet(sheetId: string): Spreadsheet | undefined {
        return this.spreadsheets.get(sheetId);
    }

    public getSpreadsheetsByUser(userId: string): Spreadsheet[] {
        const result: Spreadsheet[] = [];
        for (const sheet of this.spreadsheets.values()) {
            if (sheet.getOwnerId() === userId) {
                result.push(sheet);
            }
        }
        return result;
    }

    public updateSpreadsheetTitle(sheetId: string, newTitle: string): boolean {
        const sheet = this.spreadsheets.get(sheetId);
        if (!sheet) return false;
        sheet.setTitle(newTitle);
        return true;
    }

    public deleteSpreadsheet(sheetId: string): boolean {
        const sheet = this.spreadsheets.get(sheetId);
        if (!sheet) return false;
        
        // Remove all associated permissions
        for (const [permId, perm] of this.permissions) {
            if (perm.getSheetId() === sheetId) {
                this.permissions.delete(permId);
            }
        }
        
        this.spreadsheets.delete(sheetId);
        return true;
    }

    // Worksheet management (1:N relationship)
    public createWorksheet(worksheetId: string, name: string, sheetId: string): Worksheet {
        const sheet = this.spreadsheets.get(sheetId);
        if (!sheet) throw new Error('Spreadsheet not found');
        
        const worksheet = new Worksheet(worksheetId, name, sheetId);
        sheet.addWorksheet(worksheet);
        return worksheet;
    }

    public getWorksheet(worksheetId: string): Worksheet | null {
        for (const sheet of this.spreadsheets.values()) {
            const ws = sheet.getWorksheetById(worksheetId);
            if (ws) return ws;
        }
        return null;
    }

    public deleteWorksheet(worksheetId: string): boolean {
        for (const sheet of this.spreadsheets.values()) {
            const ws = sheet.getWorksheetById(worksheetId);
            if (ws) {
                sheet.removeWorksheet(worksheetId);
                return true;
            }
        }
        return false;
    }

    // Cell management (1:N relationship)
    public getCell(worksheetId: string, row: number, col: number): Cell | undefined {
        const worksheet = this.getWorksheet(worksheetId);
        if (!worksheet) return undefined;
        return worksheet.getCell(row, col);
    }

    public setCellValue(worksheetId: string, row: number, col: number, value: any, userId: string): Cell | undefined {
        const worksheet = this.getWorksheet(worksheetId);
        if (!worksheet) return undefined;
        
        let cell = worksheet.getCell(row, col);
        if (!cell) {
            const cellId = `cell-${worksheetId}-${row}-${col}`;
            const cellAddress = this.getCellAddress(row, col);
            cell = new Cell(cellId, cellAddress, worksheetId, row, col);
            worksheet.setCell(cell);
        }
        
        cell.setValue(value, userId);
        
        // Notify collaboration
        this.collaborationManager.broadcastChange(worksheet.getSheetId(), {
            type: 'cell_update',
            worksheetId,
            row,
            col,
            value,
            userId
        });
        
        return cell;
    }

    public setCellFormula(worksheetId: string, row: number, col: number, formula: string, userId: string): Cell | undefined {
        const worksheet = this.getWorksheet(worksheetId);
        if (!worksheet) return undefined;
        
        let cell = worksheet.getCell(row, col);
        if (!cell) {
            const cellId = `cell-${worksheetId}-${row}-${col}`;
            const cellAddress = this.getCellAddress(row, col);
            cell = new Cell(cellId, cellAddress, worksheetId, row, col);
            worksheet.setCell(cell);
        }
        
        cell.setFormula(formula, userId);
        
        this.collaborationManager.broadcastChange(worksheet.getSheetId(), {
            type: 'formula_update',
            worksheetId,
            row,
            col,
            formula,
            userId
        });
        
        return cell;
    }

    // Permission management (M:N relationship via Permission)
    public grantPermission(userId: string, sheetId: string, accessType: AccessType): Permission {
        const permissionId = `perm-${userId}-${sheetId}-${Date.now()}`;
        const permission = new Permission(permissionId, userId, sheetId, accessType);
        this.permissions.set(permissionId, permission);
        
        const sheet = this.spreadsheets.get(sheetId);
        if (sheet) {
            sheet.addPermission(permission);
        }
        
        return permission;
    }

    public revokePermission(permissionId: string): boolean {
        const perm = this.permissions.get(permissionId);
        if (!perm) return false;
        
        const sheet = this.spreadsheets.get(perm.getSheetId());
        if (sheet) {
            sheet.removePermission(permissionId);
        }
        
        return this.permissions.delete(permissionId);
    }

    public getPermissionsForUser(userId: string): Permission[] {
        const result: Permission[] = [];
        for (const perm of this.permissions.values()) {
            if (perm.getUserId() === userId) {
                result.push(perm);
            }
        }
        return result;
    }

    public getPermissionsForSheet(sheetId: string): Permission[] {
        const result: Permission[] = [];
        for (const perm of this.permissions.values()) {
            if (perm.getSheetId() === sheetId) {
                result.push(perm);
            }
        }
        return result;
    }

    public checkUserAccess(userId: string, sheetId: string, requiredAccess: AccessType): boolean {
        // Check if user is owner
        const sheet = this.spreadsheets.get(sheetId);
        if (sheet && sheet.getOwnerId() === userId) return true;
        
        // Check permissions
        for (const perm of this.permissions.values()) {
            if (perm.getUserId() === userId && perm.getSheetId() === sheetId) {
                if (requiredAccess === 'view') return true;
                if (requiredAccess === 'edit') return perm.canEdit();
                if (requiredAccess === 'admin') return perm.canAdmin();
            }
        }
        
        return false;
    }

    // Collaboration
    public joinSpreadsheet(sheetId: string, userId: string): void {
        this.collaborationManager.joinSheet(sheetId, userId);
    }

    public leaveSpreadsheet(sheetId: string, userId: string): void {
        this.collaborationManager.leaveSheet(sheetId, userId);
    }

    public getActiveUsers(sheetId: string): string[] {
        return this.collaborationManager.getActiveUsers(sheetId);
    }

    public lockCell(sheetId: string, row: number, col: number, userId: string): boolean {
        return this.collaborationManager.lockCell(sheetId, row, col, userId);
    }

    public unlockCell(sheetId: string, row: number, col: number, userId: string): void {
        this.collaborationManager.unlockCell(sheetId, row, col, userId);
    }

    // Helper
    private getCellAddress(row: number, col: number): string {
        const columnLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let colStr = '';
        let c = col;
        while (c >= 0) {
            colStr = columnLetters[c % 26] + colStr;
            c = Math.floor(c / 26) - 1;
        }
        return `${colStr}${row + 1}`;
    }
}