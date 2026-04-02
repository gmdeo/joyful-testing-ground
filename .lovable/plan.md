

## Plan: Fix Memory.tsx Build Errors

The previous fix renamed the `Memory` import to `MemoryType` and the component to `MemoryPage`, but missed updating all references to the `Memory` type throughout the file.

### Changes

**File: `src/pages/Memory.tsx`**
- Replace all usages of `Memory` as a type with `MemoryType` (lines 54, 57, 59, 176, 276, 277, 400, 405, 411)
- Update the default export on line 649 from `Memory` to `MemoryPage`

This should clear all 10 build errors and let the app compile.

