/**
 * User Entity
 * Represents a user of the collaborative spreadsheet system
 */
export class User {
    private userId: string;
    private name: string;
    private email: string;
    private password: string;

    constructor(userId: string, name: string, email: string, password: string) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters
    public getUserId(): string { return this.userId; }
    public getName(): string { return this.name; }
    public getEmail(): string { return this.email; }
    public getPassword(): string { return this.password; }

    // Setters
    public setName(name: string): void { this.name = name; }
    public setEmail(email: string): void { this.email = email; }
    public setPassword(password: string): void { this.password = password; }
}