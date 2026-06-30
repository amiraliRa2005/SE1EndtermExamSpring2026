/**
 * Subscription Entity
 * Represents a user's subscription to the spreadsheet service
 * Relationship: 1 : 1 with User (each user has one active subscription)
 */
export type PlanType = 'free' | 'monthly' | 'yearly' | 'enterprise';

export class Subscription {
    private subscriptionId: string;
    private planType: PlanType;
    private startDate: Date;
    private endDate: Date;
    private userId: string; // FK → User (1:1 relationship)

    constructor(subscriptionId: string, userId: string, planType: PlanType, durationMonths: number = 1) {
        this.subscriptionId = subscriptionId;
        this.userId = userId;
        this.planType = planType;
        this.startDate = new Date();
        this.endDate = new Date();
        this.endDate.setMonth(this.endDate.getMonth() + durationMonths);
    }

    // Getters
    public getSubscriptionId(): string { return this.subscriptionId; }
    public getPlanType(): PlanType { return this.planType; }
    public getStartDate(): Date { return this.startDate; }
    public getEndDate(): Date { return this.endDate; }
    public getUserId(): string { return this.userId; }

    // Setters
    public setPlanType(planType: PlanType, durationMonths: number = 1): void {
        this.planType = planType;
        this.startDate = new Date();
        this.endDate = new Date();
        this.endDate.setMonth(this.endDate.getMonth() + durationMonths);
    }

    public renew(): void {
        this.startDate = new Date();
        this.endDate = new Date();
        this.endDate.setMonth(this.endDate.getMonth() + 1);
    }

    public isActive(): boolean {
        const now = new Date();
        return now >= this.startDate && now <= this.endDate;
    }

    public getDaysRemaining(): number {
        if (!this.isActive()) return 0;
        const now = new Date();
        const diff = this.endDate.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    public getPlanPrice(): number {
        switch (this.planType) {
            case 'free': return 0;
            case 'monthly': return 9.99;
            case 'yearly': return 99.99;
            case 'enterprise': return 499.99;
            default: return 0;
        }
    }
}