# SDD ledger — plan: docs/superpowers/plans/2026-08-12-topics-replace-categories.md

Baseline: a70643f (Astro 7 upgrade), d90ae08 (plan + spec)
Branch: main (user consented, no push)
Build command: npm run build. No test framework in repo.

Task 1: dispatched (implementer task1-impl, sonnet), BASE=d90ae08
Task 1: complete (commits d90ae08..4d68288, review clean, no findings)
  - controller resolved reviewer warning: rebuilt, 12 pages, no stale markup in HTML, category dirs gone, UTC date correct
  - plan defect found by implementer and fixed: commit message said five values, enum has three (plan corrected in ce2f325)
Task 2: dispatched (implementer task2-impl, haiku), BASE=ce2f325
Task 2: complete (commits ce2f325..a4376a0, review clean)
  - controller checks: components.css braces 24/24 balanced, 5 rows render, datetime="2025-09-29" valid alongside "Sep 2025"
Task 2: minor (deferred): row <a> wraps h2+time+p, so the link accessible name includes date and description. Plan-mandated by the design ("whole row remains wrapped in <a>"). For a later accessibility pass.
Task 2: minor (deferred): dev-server visual check not run by implementer. Controller to close during Task 7 final pass, using agent-browser if available.
Task 3: dispatched (implementer task3-impl, sonnet), BASE=a4376a0
Task 3: implementer done (commit a32ebe2). Controller checks: 16 pages, dist/topics = books/engineering/index.html/reflections, no private post linked from any topic page (books 2, engineering 1, reflections 2).
Task 3: reviewer task3-review went idle twice without delivering a verdict; re-dispatched as task3-reviewB.
Task 3: complete (commits a4376a0..a32ebe2, review clean via task3-reviewB, report in task-3-review.md)
  - controller closed reviewer warning: TOPIC_NAMES is Record<TopicType,string> (posts.ts:21), .page-content exists (layout.css:105)
Task 3: minor (deferred): both topic pages independently call import.meta.glob + filterPublicPosts. Unavoidable — Astro requires the glob in each .astro file.
Task 4: dispatched (implementer task4-impl, haiku), BASE=a32ebe2
Task 4: complete (commits a32ebe2..89762a9, review clean, report in task-4-review.md)
  - controller verified all three redirects emit correct targets; commit touches only astro.config.mjs, 6 insertions 0 deletions
Task 5: dispatched (implementer task5-impl, sonnet), BASE=89762a9
NOTE: subagent message delivery is unreliable in this session. Reviewers now write reports to task-N-review.md. After any idle notification, check git log and the filesystem before assuming work is missing.
Task 5: complete (commits 89762a9..97d0dc8, review clean, report in task-5-review.md)
  - controller verified: Alamut -> Posted in Books + related Karamazov (untagged post found, no self-link); Django -> no More like this (only public Engineering post); Shini Bahar -> related Exams; no #tag rendered anywhere
Task 6: dispatched (implementer task6-impl, haiku), BASE=97d0dc8
Task 6: complete (commits 97d0dc8..7d082ee, review approved, report in task-6-review.md)
  - reviewer independently recomputed WCAG contrast: #777 = 4.48:1, #6f6f6f = ~5.0:1, both agree it clears AA
  - FINDING routed to Task 7: src/styles/README.md:28 still documents --text-light: #777. Plan Step 4 grep over src/styles/ fails on it. Implementer disclosed the substitution honestly.
Task 6: minor (deferred): photography gallery has no footer, so no All topics link. PhotographyLayout bypasses BaseLayout. Pre-existing, out of scope.
Task 7: dispatched (implementer task7-impl, sonnet), BASE=7d082ee, includes README fix
Task 7: complete (commits 7d082ee..06f2269, review clean, report in task-7-review.md)
All 7 tasks complete and reviewed.

CONTROLLER BROWSER PASS (agent-browser, playwright headless 1208 installed to ~/Library/Caches):
  - home light + dark: flat rows, short dates right, nav = Resume + Photography. Correct.
  - /topics/: three names with counts (Books 2, Engineering 1, Reflections 2). Correct.
  - Alamut post: Posted in Books, More like this with Karamazov, footer copyright left + All topics right. Matches Screen 2.
  - 390px: rows stack, footer wraps, Posted in on one line. Correct.
  - FINDING: .posted-in a measured 37.59px tall, design required 44px. Plan prescribed padding 6px 0, which cannot reach 44px. Raised with user; user questioned px vs rem; controller recommended keeping px (touch target should not scale with font preference, and codebase is px throughout). Fix dispatched: padding 10px 0.
  - Also fixing: src/styles/README.md file list omits photography.css (user approved).
Fix wave: dispatched (fix-impl, haiku), BASE=06f2269
Fix wave: complete (commit 08f3374, 2 files, 2 insertions 1 deletion). Tap target re-measured in browser: 45.59px, clears 44px.
Final whole-branch review: dispatched (final-review, opus), range a70643f..08f3374, 10 commits.

Final review: verdict READY TO MERGE (yes). Full report in final-review.md. No Critical. Two Important, both latent.
Final fix wave: dispatched (finalfix-impl, sonnet), BASE=08f3374. Fixing Important 1 (topic link guard), Important 2a (getTopicsWithPosts extraction), Important 2b (date ISO helpers into date.ts), Minor 4 (topic-index mobile rule), Minor 6 (MarkdownPostLayout Props), Minor 8 (url required on BlogPost).
PARKED, not fixed:
  - Minor 3: related-post titles are h2, siblings of the "More like this" h2. Plan-mandated markup. Ruling: real but polish; needs a headingLevel prop on PostList, which is a design change beyond this plan.
  - Minor 5: topic index row makes only the name clickable, unlike post rows which are fully clickable. Ruling: real inconsistency, cosmetic, no broken behaviour.
  - Minor 7: getRelatedPosts repeats the date comparator and recomputes tag counts per comparison. Ruling: free at this scale, reviewer agreed. Extract when convenient.
  - Minor 9: getISOString catch branch returned build time. NOW FIXED as part of Fix 3.
  - Deferred (accepted by final review): whole-row link verbosity; per-file import.meta.glob; photography gallery has no footer.
OPEN PRODUCT QUESTION for Ammar: the design spec required a hand-written one-line description per topic page; the user removed descriptions deliberately. Final review notes /topics/books/ is now a heading over a query, and suggests re-opening. Ammar decided; recorded, not a defect.

Final fix wave: complete (commit 6e62a2b, 9 files, +111 -74). Scoped re-review: ALL 6 FINDINGS ADDRESSED, safe to merge. Report in finalfix-rereview.md.
Tidy pass: dispatched (tidy-impl, haiku), BASE=6e62a2b. Two one-liners the re-review recommended: narrow .posted-in span to exclude the label; make MarkdownPostLayout url required to match BlogPost.
