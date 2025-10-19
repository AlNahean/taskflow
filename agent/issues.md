## 1.Critical Protocol: Import Path Aliases

This protocol is a strict requirement established due to previous inconsistencies. Adherence is mandatory.

### **Historical Context**

Initial agent development produced code with relative imports (e.g., `../../../components/ui/button`). This practice is error-prone, hard to read, and makes refactoring difficult. It has been corrected and is now forbidden.

### **The Rule**

All internal module imports **MUST** use the `@/` path alias defined in `tsconfig.json`. This provides a stable, absolute path from the project root.

### **Examples**

**Correct (✅):**

```typescript
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import prisma from "@/lib/prisma";
```

**Incorrect (❌):**

```typescript
import { Button } from "./ui/button";
import { Button } from "../ui/button";
import { useTasks } from "../../hooks/use-tasks";
```

### **Enforcement**

Failure to follow this protocol will result in a required code correction. It is a foundational element of this codebase's style and maintainability strategy.

```

```
