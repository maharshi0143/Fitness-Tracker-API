type ErrorLayer = 'runtime' | 'database';

type AppErrorOptions = {
    layer?: ErrorLayer;
    field?: string;
    rule?: string;
    value?: unknown;
};

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly layer: ErrorLayer;
    public readonly field?: string;
    public readonly rule?: string;
    public readonly value?: unknown;

    constructor(message: string, statusCode: number, options: AppErrorOptions = {}) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.layer = options.layer ?? 'runtime';
        this.field = options.field;
        this.rule = options.rule;
        this.value = options.value;

        Error.captureStackTrace(this, this.constructor);
    }
}
