import { Cell } from './Cell';

/**
 * Worksheet Entity
 * Represents a single sheet within a spreadsheet
 */
export class Worksheet {
    private worksheetId: string;
    private name: string;
    private sheetId: string; // FK → Spreadsheet
    private cells: Map<string, Cell>; // key: "row,col" -> Cell
    private rowCount: number;
    private colCount: number;

    constructor(worksheetId: string, name: string, sheetId: string, rowCount: number = 100, colCount: number = 26) {
        this.worksheetId = worksheetId;
        this.name = name;
        this.sheetId = sheetId;
        this.cells = new Map();
        this.rowCount = rowCount;
        this.colCount = colCount;
    }

    // Getters
    public getWorksheetId(): string { return this.worksheetId; }
    public getName(): string { return this.name; }
    public getSheetId(): string { return this.sheetId; }
    public getCells(): Map<string, Cell> { return this.cells; }
    public getRowCount(): number { return this.rowCount; }
    public getColCount(): number { return this.colCount; }

    // Setters
    public setName(name: string): void { this.name = name; }

    // Methods
    public getCell(row: number, col: number): Cell | undefined {
        const key = `${row},${col}`;
        return this.cells.get(key);
    }

    public setCell(cell: Cell): void {
        const key = `${cell.getRow()},${cell.getCol()}`;
        this.cells.set(key, cell);
    }

    public deleteCell(row: number, col: number): void {
        const key = `${row},${col}`;
        this.cells.delete(key);
    }

    public getCellsByRange(startRow: number, startCol: number, endRow: number, endCol: number): Cell[] {
        const result: Cell[] = [];
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = this.getCell(row, col);
                if (cell) result.push(cell);
            }
        }
        return result;
    }
}