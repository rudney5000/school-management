# Command — New Entity FSD

> Use this template when creating a new entity (e.g., `Student`, `Teacher`, `Course`).
> Replace `{entity}` with the entity name in PascalCase (e.g., `Student`) and `{entities}` in plural.

## 🎯 Core Principle

An **entity** represents a business domain concept. It is **autonomous** and must **NEVER** import another entity. Any orchestration between entities must be done in `@features/` or `@pages/`.

## 📁 Structure to Create


```
src/entities/{entity}/
├── index.ts ← Public API (barrel file, exports only)
├── api/
│ └── {entity}.api.ts ← API class (extends ApiWrapper)
├── lib/
│ └── use{Entity}s.ts ← Main React Query hook
└── model/
├── types.ts ← Main business type (e.g., Country)
├── dto.ts ← DTOs (Create, Update, Params)
├── slice.ts ← Redux slice (UI state ONLY)
└── selectors.ts ← Redux selectors
```


## ⛔ Strict Rules (NON-NEGOTIABLE)

### Imports
- [ ] Entity can ONLY import from `@shared/`
- [ ] Entity must NEVER import from another `@entities/`
- [ ] Entity must NEVER import from `@features/` or `@pages/`

### State Management
- [ ] **Redux (`slice.ts`)**: contains ONLY UI state (e.g., `selectedId`, `isModalOpen`)
- [ ] **React Query**: manages ALL server state (lists, details, mutations)
- [ ] ❌ NEVER put `countries: Country[]` or `isLoading` in the Redux slice

### API & Typing
- [ ] Use the **singleton** `baseApi` (never `new BaseApi()`)
- [ ] API class MUST extend `ApiWrapper`
- [ ] Explicitly type `handleRequest<T>()` with the expected return type
- [ ] ❌ NEVER use `any` — use `unknown` and cast via strict interfaces

### React Query v5
- [ ] ❌ NEVER put `onError` in `useQuery` options (removed in v5)
- [ ] ✅ Use `useEffect` to listen to `query.isError` and call `handleApiError`
- [ ] ✅ `onError: handleApiError` is already configured globally for mutations

## ✅ Creation Checklist

- [ ] Create folder structure
- [ ] Define `types.ts` (business entity) and `dto.ts` (API contracts)
- [ ] Create API class extending `ApiWrapper`
- [ ] Create React Query hook with `useEffect` pattern for errors
- [ ] Create Redux slice (UI state only) + selectors
- [ ] Configure barrel file `index.ts`
- [ ] Add slice to global `store.ts` in `@shared/store`
- [ ] Verify no `any` was introduced (`tsc --noEmit`)

## 🧬 Code Templates

### `index.ts` (Barrel file)
```typescript
export * from './api/{entity}.api';
export * from './lib/use{Entity}s';
export * from './model/types';
export * from './model/dto';
export * from './model/selectors';
export * from './model/slice';
```

### model/types.ts
```typescript
export type {Entity} = {
    id: string;
    name: string;
    // ... other business fields
};
```

### model/dto.ts
```typescript
export type Create{Entity}Dto = {
    name: string;
    // ... fields required for creation
};

export type Update{Entity}Dto = Partial<Create{Entity}Dto>;

export type {Entity}ParamsDto = {
    id: string;
};
```

### model/slice.ts
```typescript
import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";

type {Entity}State = {
    selected{Entity}Id: string | null;
};

const initialState: {Entity}State = {
    selected{Entity}Id: null,
};

export const {entity}Slice: Slice<<Entity>State> = createSlice({
    name: '{entity}',
    initialState,
    reducers: {
        setSelected{Entity}Id: (state, action: PayloadAction<string>) => {
            state.selected{Entity}Id = action.payload;
        },
    },
});

export const { setSelected{Entity}Id } = {entity}Slice.actions;
```

### api/{entity}.api.ts
```typescript
import { ApiWrapper } from "@shared/api/ApiWrapper";
import { baseApi } from "@shared/api/instance";
import type {
{Entity}ParamsDto,
    Create{Entity}Dto,
    Update{Entity}Dto
} from "@entities/{entity}/model/dto";
import type { {Entity} } from "@entities/{entity}/model/types";

export class {Entity}Api extends ApiWrapper {
    constructor() {
        super(baseApi); // Singleton mandatory
    }

    getAll() {
        return this.handleRequest<{Entity}[]>(
            this._baseApi.get('/{entities}'),
            (raw) => raw as {Entity}[]
        );
    }

    getById(params: {Entity}ParamsDto) {
        return this.handleRequest<{Entity}>(
            this._baseApi.get(`/{entities}/${params.id}`),
            (raw) => raw as {Entity}
        );
    }

    create(payload: Create{Entity}Dto) {
        return this.handleRequest<{Entity}>(
            this._baseApi.post('/{entities}', payload),
            (raw) => raw as {Entity}
        );
    }

    update(id: string, payload: Update{Entity}Dto) {
        return this.handleRequest<{Entity}>(
            this._baseApi.patch(`/{entities}/${id}`, payload),
            (raw) => raw as {Entity}
        );
    }

    delete(id: string) {
        return this.handleRequest<void>(
            this._baseApi.delete(`/{entities}/${id}`),
            undefined
        );
    }
}

export const {entity}Api = new {Entity}Api();
```

### lib/use{Entity}s.ts
```typescript
import { {entity}Api } from "@entities/{entity}/api/{entity}.api";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib/errors/handleApiError";
import type { CommonError } from "@shared/helperClass/CommonError";
import type { {Entity} } from "@entities/{entity}/model/types";
import { useEffect } from "react";

export const use{Entity}s = () => {
    const query = useQuery<{Entity}[], Error>({
        queryKey: ['{entities}'],
        queryFn: async () => {
            const response = await {entity}Api.getAll();

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }

            return response.result as {Entity}[];
        },
    });

    // ⚠️ React Query v5: onError no longer exists in useQuery
    // Use useEffect for UI side effects (Toasts)
    useEffect(() => {
        if (query.isError && query.error) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};
```

`
feat(entities): add {Entity} entity with API, hooks and UI state

- Create {Entity}Api extending ApiWrapper with CRUD methods
- Add use{Entity}s hook with React Query v5 pattern
- Add Redux slice for UI state (selected{Entity}Id)
- Register slice in global store
`