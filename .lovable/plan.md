## Add try/catch + debug logs to fetchGuide

In `src/pages/GuideProfilePage.tsx`, modify the `fetchGuide` function (lines 100–179):

1. Wrap the entire function body (after the `if (!id) return;` guard) in a `try { ... } catch (err: any) { ... }` block.
2. After `setGuide(data);` (line 139), add:
   ```ts
   console.log("[GuideProfilePage] guide set:", data);
   ```
3. Catch block:
   ```ts
   } catch (err: any) {
     console.error("[GuideProfilePage] fetchGuide error:", err);
     setLoading(false);
   }
   ```

No other changes — query logic, selects, and downstream fetches stay identical.