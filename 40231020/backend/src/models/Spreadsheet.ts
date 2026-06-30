import { Worksheet } from './Worksheet';
import { Permission } from './Permission';

/**
 * Spreadsheet Entity
 * Represents a spreadsheet file containing multiple worksheets
 */
export class Spreadsheet {
    private sheetId: string;
    private title: string;
    private createDate: Date;
    private ownerId: string; // FK → User
    private worksheets: Worksheet[];
    private permissions: Permission[];

    constructor(sheetId: string, title: string, ownerId: string) {
        this.sheetId = sheetId;
        this.title = title;
        this.createDate = new Date();
        this.ownerId = ownerId;
        this.worksheets = [];
        this.permissions = [];
    }

    // Getters
    public getSheetId(): string { return this.sheetId; }
    public getTitle(): string { return this.title; }
    public getCreateDate(): Date { return this.createDate; }
    public getOwnerId(): string { return this.ownerId; }
    public getWorksheets(): Worksheet[] { return this.worksheets; }
    public getPermissions(): Permission[] { return this.permissions; }

    // Setters
    public setTitle(title: string): void { this.title = title; }

    // Methods
    public addWorksheet(worksheet: Worksheet): void {
        this.worksheets.push(worksheet);
    }

    public removeWorksheet(worksheetId: string): void {
        this.worksheets = this.worksheets.filter(w => w.getWorksheetId() !== worksheetId);
    }

    public getWorksheetById(worksheetId: string): Worksheet | undefined {
        return this.worksheets.find(w => w.getWorksheetId() === worksheetId);
    }

    public addPermission(permission: Permission): void {
        this.permissions.push(permission);
    }

    public removePermission(permissionId: string): void {
        this.permissions = this.permissions.filter(p => p.getPermissionId() !== permissionId);
    }

    public getPermissionsForUser(userId: string): Permission[] {
        return this.permissions.filter(p => p.getUserId() === userId);
    }
}