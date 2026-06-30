import { Cell, CellType } from '../models/Cell';

/**
 * CellFactory - Factory Pattern
 * Creates different types of cells with proper addressing
 */
export class CellFactory {
    private static readonly COLUMN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    public static createCell(
        cellId: string,
        worksheetId: string,
        row: number,
        col: number,
        type: CellType = 'empty',
        value: any = null
    ): Cell {
        const cellAddress = this.getCellAddress(row, col);
        const cell = new Cell(cellId, cellAddress, worksheetId, row, col);
        
        switch (type) {
            case 'number':
                cell.setValue(Number(value) || 0, 'system');
                break;
            case 'text':
                cell.setValue(String(value) || '', 'system');
                break;
            case 'formula':
                cell.setFormula(String(value) || '', 'system');
                break;
            case 'date':
                cell.setValue(new Date(value) || new Date(), 'system');
                break;
            case 'boolean':
                cell.setValue(Boolean(value) || false, 'system');
                break;
            case 'empty':
            default:
                cell.setValue(null, 'system');
                break;
        }
        
        return cell;
    }

    public static createNumberCell(
        cellId: string,
        worksheetId: string,
        row: number,
        col: number,
        value: number
    ): Cell {
        return this.createCell(cellId, worksheetId, row, col, 'number', value);
    }

    public static createTextCell(
        cellId: string,
        worksheetId: string,
        row: number,
        col: number,
        value: string
    ): Cell {
        return this.createCell(cellId, worksheetId, row, col, 'text', value);
    }

    public static createFormulaCell(
        cellId: string,
        worksheetId: string,
        row: number,
        col: number,
        formula: string
    ): Cell {
        return this.createCell(cellId, worksheetId, row, col, 'formula', formula);
    }

    private static getCellAddress(row: number, col: number): string {
        let colStr = '';
        let c = col;
        while (c >= 0) {
            colStr = this.COLUMN_LETTERS[c % 26] + colStr;
            c = Math.floor(c / 26) - 1;
        }
        return `${colStr}${row + 1}`;
    }

    public static parseCellAddress(address: string): { row: number; col: number } | null {
        const match = address.match(/^([A-Z]+)([0-9]+)$/);
        if (!match) return null;
        
        let col = 0;
        const colStr = match[1];
        for (let i = 0; i < colStr.length; i++) {
            col = col * 26 + (colStr.charCodeAt(i) - 64);
        }
        col--;
        
        const row = parseInt(match[2]) - 1;
        
        return { row, col };
    }
}