/**
 * Permission Entity (Association/Join Table for User-Spreadsheet M:N)
 * Represents access permissions for users on spreadsheets
 * Relationship: M : N between User and Spreadsheet
 */
export type AccessType = 'view' | 'edit' | 'admin';

export class Permission {
    private permissionId: string;
    private accessType: AccessType;
    private userId: string; // FK → User
    private sheetId: string; // FK → Spreadsheet
    private grantedAt: Date;

    constructor(permissionId: string, userId: string, sheetId: string, accessType: AccessType = 'view') {
        this.permissionId = permissionId;
        this.userId = userId;
        this.sheetId = sheetId;
        this.accessType = accessType;
        this.grantedAt = new Date();
    }

    // Getters
    public getPermissionId(): string { return this.permissionId; }
    public getAccessType(): AccessType { return this.accessType; }
    public getUserId(): string { return this.userId; }
    public getSheetId(): string { return this.sheetId; }
    public getGrantedAt(): Date { return this.grantedAt; }

    // Setters
    public setAccessType(accessType: AccessType): void { this.accessType = accessType; }

    // Methods
    public canEdit(): boolean {
        return this.accessType === 'edit' || this.accessType === 'admin';
    }

    public canAdmin(): boolean {
        return this.accessType === 'admin';
    }

    public canView(): boolean {
        return true; // All permissions have view access
    }
}