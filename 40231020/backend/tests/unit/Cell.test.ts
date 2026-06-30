import { Cell } from '/Users/amiralirahimi/git-exam-test/SE1EndtermExamSpring2026/40231020/backend/src/models/Cell.ts';
import { CellFactory } from '/Users/amiralirahimi/git-exam-test/SE1EndtermExamSpring2026/40231020/backend/src/services/CellFactory';

describe('Cell Tests', () => {
    let cell: Cell;

    beforeEach(() => {
        cell = new Cell('cell-1', 'A1', 'ws-1', 0, 0);
    });

    test('should create empty cell', () => {
        expect(cell.getValue()).toBeNull();
        expect(cell.getType()).toBe('empty');
        expect(cell.getCellAddress()).toBe('A1');
    });

    test('should set value correctly', () => {
        cell.setValue(42, 'user-1');
        expect(cell.getValue()).toBe(42);
        expect(cell.getType()).toBe('number');
        expect(cell.getLastModifiedBy()).toBe('user-1');
    });

    test('should set formula correctly', () => {
        cell.setFormula('SUM(A1:A10)', 'user-1');
        expect(cell.getFormula()).toBe('SUM(A1:A10)');
        expect(cell.getType()).toBe('formula');
    });

    test('should get display value', () => {
        cell.setValue('Hello', 'user-1');
        expect(cell.getDisplayValue()).toBe('Hello');
        
        cell.setFormula('SUM(A1:A10)', 'user-1');
        expect(cell.getDisplayValue()).toBe('=SUM(A1:A10)');
    });
});

describe('CellFactory Tests', () => {
    test('should create number cell', () => {
        const cell = CellFactory.createNumberCell('cell-2', 'ws-1', 5, 3, 100);
        expect(cell.getValue()).toBe(100);
        expect(cell.getType()).toBe('number');
        expect(cell.getCellAddress()).toBe('D6');
    });

    test('should create formula cell', () => {
        const cell = CellFactory.createFormulaCell('cell-3', 'ws-1', 1, 2, 'SUM(A1:A10)');
        expect(cell.getFormula()).toBe('SUM(A1:A10)');
        expect(cell.getType()).toBe('formula');
        expect(cell.getCellAddress()).toBe('C2');
    });

    test('should parse cell address', () => {
        const parsed = CellFactory.parseCellAddress('D6');
        expect(parsed).toEqual({ row: 5, col: 3 });
    });
});