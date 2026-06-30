/**
 * Cell Entity
 * Represents a single cell in a worksheet
 */
export type CellType = 'number' | 'text' | 'formula' | 'date' | 'boolean' | 'empty';

export class Cell {
    private cellId: string;
    private cellAddress: string; // e.g., "A1", "B2"
    private value: any;
    private formula: string;
    private worksheetId: string; // FK → Worksheet
    private row: number;
    private col: number;
    private type: CellType;
    private lastModifiedBy: string;
    private lastModifiedAt: Date;

    constructor(cellId: string, cellAddress: string, worksheetId: string, row: number, col: number) {
        this.cellId = cellId;
        this.cellAddress = cellAddress;
        this.value = null;
        this.formula = '';
        this.worksheetId = worksheetId;
        this.row = row;
        this.col = col;
        this.type = 'empty';
        this.lastModifiedBy = '';
        this.lastModifiedAt = new Date();
    }

    // Getters
    public getCellId(): string { return this.cellId; }
    public getCellAddress(): string { return this.cellAddress; }
    public getValue(): any { return this.value; }
    public getFormula(): string { return this.formula; }
    public getWorksheetId(): string { return this.worksheetId; }
    public getRow(): number { return this.row; }
    public getCol(): number { return this.col; }
    public getType(): CellType { return this.type; }
    public getLastModifiedBy(): string { return this.lastModifiedBy; }
    public getLastModifiedAt(): Date { return this.lastModifiedAt; }

    // Setters
    public setCellAddress(address: string): void { this.cellAddress = address; }

    // Methods
    public setValue(value: any, modifiedBy: string): void {
        this.value = value;
        this.type = this.inferType(value);
        this.lastModifiedBy = modifiedBy;
        this.lastModifiedAt = new Date();
    }

    public setFormula(formula: string, modifiedBy: string): void {
        this.formula = formula;
        this.type = 'formula';
        this.lastModifiedBy = modifiedBy;
        this.lastModifiedAt = new Date();
    }

    public getDisplayValue(): string {
        if (this.type === 'formula' && this.formula) {
            return `=${this.formula}`;
        }
        return String(this.value ?? '');
    }

    private inferType(value: any): CellType {
        if (value === null || value === undefined) return 'empty';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'string') return 'text';
        if (typeof value === 'boolean') return 'boolean';
        if (value instanceof Date) return 'date';
        return 'text';
    }
}