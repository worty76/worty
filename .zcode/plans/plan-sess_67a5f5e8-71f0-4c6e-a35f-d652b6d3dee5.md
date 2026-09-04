Shorten the homepage intro headline (`src/app/page.tsx`)

**Change:**
1. Replace the current 55-word h1 with the short version you picked:
   `Hi, I'm Dat — a Go developer passionate about building scalable, efficient applications.`
2. Preserve the personality by opening the first body paragraph with the removed "normal guy" line, flowing into the existing text:
   - Paragraph 1 becomes: *"I'm just a normal guy with no fancy achievements or extraordinary background — just someone trying to grow, learn, and become a little better every single day. I enjoy working with various backend technologies and architectures, but my favorite stack revolves around Go…"*
   - Paragraph 2 (collaboration) stays unchanged.
3. No other structural/styling changes — same h1 element, same `text-2xl duration-1000` classes.

**Verify:** `next build` passes.