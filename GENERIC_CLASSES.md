# RRMS Shared Kernel: Generic Classes & Application Core

> **Architecture:** Modular Monolithic  
> **Scope:** Cross-cutting Domain & Application Shared Kernel  
> **Language:** TypeScript

---

## 1. Directory Structure (Shared Kernel)

```text
src/
└── shared/
    ├── domain/
    │   ├── base-entity.ts
    │   ├── auditable-entity.ts
    │   ├── soft-deletable-entity.ts
    │   ├── aggregate-root.ts
    │   ├── value-object.ts
    │   ├── domain-event.base.ts
    │   ├── result.ts
    │   └── value-objects/
    │       ├── money.vo.ts
    │       ├── email.vo.ts
    │       ├── phone-number.vo.ts
    │       ├── address.vo.ts
    │       └── date-range.vo.ts
    ├── application/
    │   ├── repository.interface.ts
    │   ├── unit-of-work.interface.ts
    │   ├── pagination.ts
    │   └── event-bus.interface.ts
    └── infrastructure/
        ├── in-memory-event-bus.ts
        └── outbox-message.entity.ts
```

---

## 2. Domain Primitives

### 2.1 Domain Event Base (`src/shared/domain/domain-event.base.ts`)

```typescript
export interface IDomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
}

export abstract class BaseDomainEvent implements IDomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public abstract readonly eventType: string;
  public readonly aggregateId: string;

  protected constructor(aggregateId: string) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }
}
```

---

### 2.2 Base Entity & Auditing (`src/shared/domain/base-entity.ts`)

```typescript
export abstract class BaseEntity<TId> {
  protected constructor(protected readonly _id: TId) {}

  public get id(): TId {
    return this._id;
  }

  public equals(other?: BaseEntity<TId>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (!(other instanceof BaseEntity)) {
      return false;
    }
    return JSON.stringify(this._id) === JSON.stringify(other._id);
  }
}

export abstract class AuditableEntity<TId> extends BaseEntity<TId> {
  public createdAt: Date;
  public updatedAt: Date;
  public createdBy: string;
  public updatedBy: string;
  public version: number;

  protected constructor(id: TId, actor: string = 'SYSTEM') {
    super(id);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.createdBy = actor;
    this.updatedBy = actor;
    this.version = 1;
  }

  public touch(actor: string): void {
    this.updatedBy = actor;
    this.updatedAt = new Date();
    this.version += 1;
  }
}

export abstract class SoftDeletableEntity<TId> extends AuditableEntity<TId> {
  public isDeleted: boolean = false;
  public deletedAt?: Date;
  public deletedBy?: string;

  public softDelete(actor: string): void {
    if (!this.isDeleted) {
      this.isDeleted = true;
      this.deletedAt = new Date();
      this.deletedBy = actor;
      this.touch(actor);
    }
  }

  public restore(actor: string): void {
    if (this.isDeleted) {
      this.isDeleted = false;
      this.deletedAt = undefined;
      this.deletedBy = undefined;
      this.touch(actor);
    }
  }
}
```

---

### 2.3 Aggregate Root (`src/shared/domain/aggregate-root.ts`)

```typescript
import { SoftDeletableEntity } from './base-entity';
import { IDomainEvent } from './domain-event.base';

export abstract class AggregateRoot<TId> extends SoftDeletableEntity<TId> {
  private readonly _domainEvents: IDomainEvent[] = [];

  public get domainEvents(): ReadonlyArray<IDomainEvent> {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }
}
```

---

### 2.4 Value Object Base (`src/shared/domain/value-object.ts`)

```typescript
export abstract class ValueObject<TProps> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  public equals(other?: ValueObject<TProps>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (other.constructor !== this.constructor) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
```

---

### 2.5 Result & Error Pattern (`src/shared/domain/result.ts`)

```typescript
export class AppError {
  public constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly details?: unknown
  ) {}

  public static validation(message: string, details?: unknown): AppError {
    return new AppError('VALIDATION_ERROR', message, details);
  }

  public static notFound(entity: string, id: string): AppError {
    return new AppError('NOT_FOUND', `${entity} with identifier '${id}' was not found.`);
  }

  public static conflict(message: string): AppError {
    return new AppError('CONFLICT', message);
  }

  public static unauthorized(message: string = 'Access denied.'): AppError {
    return new AppError('UNAUTHORIZED', message);
  }
}

export class Result<T, E = AppError> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;
  }

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot retrieve the value of a failure result.');
    }
    return this._value!;
  }

  public get error(): E {
    if (this.isSuccess) {
      throw new Error('Cannot retrieve the error of a success result.');
    }
    return this._error!;
  }

  public static ok<U, E = AppError>(value: U): Result<U, E> {
    return new Result<U, E>(true, undefined, value);
  }

  public static voidOk<E = AppError>(): Result<void, E> {
    return new Result<void, E>(true, undefined, undefined);
  }

  public static fail<U, E = AppError>(error: E): Result<U, E> {
    return new Result<U, E>(false, error);
  }

  public static combine(results: Result<unknown>[]): Result<void, AppError> {
    for (const res of results) {
      if (res.isFailure) {
        return Result.fail(res.error as AppError);
      }
    }
    return Result.voidOk();
  }
}
```

---

## 3. Generic Value Objects

### 3.1 Money & Currency (`src/shared/domain/value-objects/money.vo.ts`)

```typescript
import { ValueObject } from '../value-object';
import { Result, AppError } from '../result';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  public get amount(): number { return this.props.amount; }
  public get currency(): string { return this.props.currency; }

  public static create(amount: number, currency: string = 'USD'): Result<Money> {
    if (amount < 0) {
      return Result.fail(AppError.validation('Money amount cannot be negative.'));
    }
    if (!currency || currency.length !== 3) {
      return Result.fail(AppError.validation('Currency must be a valid 3-letter ISO code.'));
    }
    return Result.ok(new Money({
      amount: Math.round(amount * 100) / 100,
      currency: currency.toUpperCase()
    }));
  }

  public static zero(currency: string = 'USD'): Money {
    return new Money({ amount: 0, currency: currency.toUpperCase() });
  }

  public add(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail(AppError.validation(`Cannot add ${other.currency} to ${this.currency}.`));
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail(AppError.validation(`Cannot subtract ${other.currency} from ${this.currency}.`));
    }
    if (this.amount < other.amount) {
      return Result.fail(AppError.validation('Resulting monetary amount cannot be negative.'));
    }
    return Money.create(this.amount - other.amount, this.currency);
  }
}
```

---

### 3.2 Email Address (`src/shared/domain/value-objects/email.vo.ts`)

```typescript
import { ValueObject } from '../value-object';
import { Result, AppError } from '../result';

export class Email extends ValueObject<{ value: string }> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public get value(): string {
    return this.props.value;
  }

  public static create(rawEmail: string): Result<Email> {
    if (!rawEmail || !this.EMAIL_REGEX.test(rawEmail.trim())) {
      return Result.fail(AppError.validation(`Invalid email address format: '${rawEmail}'.`));
    }
    return Result.ok(new Email({ value: rawEmail.trim().toLowerCase() }));
  }
}
```

---

### 3.3 Address (`src/shared/domain/value-objects/address.vo.ts`)

```typescript
import { ValueObject } from '../value-object';

interface AddressProps {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class Address extends ValueObject<AddressProps> {
  public get street(): string { return this.props.street; }
  public get city(): string { return this.props.city; }
  public get state(): string { return this.props.state; }
  public get postalCode(): string { return this.props.postalCode; }
  public get country(): string { return this.props.country; }

  public static create(props: AddressProps): Address {
    return new Address({
      street: props.street.trim(),
      city: props.city.trim(),
      state: props.state.trim(),
      postalCode: props.postalCode.trim(),
      country: props.country.trim().toUpperCase()
    });
  }
}
```

---

### 3.4 Date Range (`src/shared/domain/value-objects/date-range.vo.ts`)

```typescript
import { ValueObject } from '../value-object';
import { Result, AppError } from '../result';

interface DateRangeProps {
  startDate: Date;
  endDate: Date;
}

export class DateRange extends ValueObject<DateRangeProps> {
  public get startDate(): Date { return this.props.startDate; }
  public get endDate(): Date { return this.props.endDate; }

  public get durationInNights(): number {
    const diff = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public static create(startDate: Date, endDate: Date): Result<DateRange> {
    if (startDate >= endDate) {
      return Result.fail(AppError.validation('End date must be strictly after start date.'));
    }
    return Result.ok(new DateRange({ startDate, endDate }));
  }

  public overlaps(other: DateRange): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }
}
```

---

## 4. Application Core & Persistence Contracts

### 4.1 Generic Repositories (`src/shared/application/repository.interface.ts`)

```typescript
import { BaseEntity } from '../domain/base-entity';

export interface IReadRepository<T extends BaseEntity<TId>, TId> {
  findById(id: TId): Promise<T | null>;
  findAll(): Promise<T[]>;
  exists(id: TId): Promise<boolean>;
}

export interface IRepository<T extends BaseEntity<TId>, TId> extends IReadRepository<T, TId> {
  save(entity: T): Promise<void>;
  delete(id: TId): Promise<void>;
}
```

---

### 4.2 Unit of Work (`src/shared/application/unit-of-work.interface.ts`)

```typescript
export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  executeInTransaction<T>(action: () => Promise<T>): Promise<T>;
}
```

---

### 4.3 Pagination (`src/shared/application/pagination.ts`)

```typescript
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export class PagedResult<T> {
  public constructor(
    public readonly items: T[],
    public readonly totalCount: number,
    public readonly page: number,
    public readonly pageSize: number
  ) {}

  public get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  public get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  public get hasPreviousPage(): boolean {
    return this.page > 1;
  }
}
```

---

### 4.4 In-Process Event Bus & Outbox (`src/shared/application/event-bus.interface.ts`)

```typescript
import { IDomainEvent } from '../domain/domain-event.base';

export type EventHandler<TEvent extends IDomainEvent> = (event: TEvent) => Promise<void>;

export interface IEventBus {
  publish(event: IDomainEvent): Promise<void>;
  publishAll(events: ReadonlyArray<IDomainEvent>): Promise<void>;
  subscribe<TEvent extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<TEvent>
  ): void;
}

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, EventHandler<any>[]>();

  public subscribe<TEvent extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<TEvent>
  ): void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);
  }

  public async publish(event: IDomainEvent): Promise<void> {
    const registered = this.handlers.get(event.eventType) || [];
    for (const handler of registered) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Error in ${event.eventType} handler:`, err);
      }
    }
  }

  public async publishAll(events: ReadonlyArray<IDomainEvent>): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
```

```typescript
// src/shared/infrastructure/outbox-message.entity.ts
export class OutboxMessage {
  public constructor(
    public readonly id: string,
    public readonly eventType: string,
    public readonly payload: string,
    public readonly occurredOn: Date,
    public processedOn: Date | null = null,
    public retryCount: number = 0,
    public errorMessage: string | null = null
  ) {}

  public markProcessed(): void {
    this.processedOn = new Date();
  }

  public recordFailure(error: string): void {
    this.retryCount += 1;
    this.errorMessage = error;
  }
}
```
