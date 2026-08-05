# poor-fools.github.io

Site for the poor fools org. No build step, no dependencies — static files served
as-is.

The repo name has to match the org name exactly (`poor-fools.github.io`) for Pages
to serve it at the bare domain rather than as a subpath.

```
index.html   landing: the crew and the wordmark
sites.html   what we run
404.html     served by Pages for any unknown path
style.css    shared by all three
stars.js     the starfield; activates on any page with <canvas id="stars">
```

CSS and JS are separate files rather than inlined because three pages share them,
and duplicating the starfield across pages means fixing every bug twice.

The `<nav>` is copied into each page rather than injected by script, so it is
there with scripting off. Adding a page means pasting the same block into all of
them and moving `aria-current="page"` to the entry that matches — that attribute
is what colours the current page white, so there is no separate active class to
keep in sync.

## Editing

**Crew** — static markup in `<div class="crew">` in `index.html`. Copy an
`<a class="fool">` block and swap the username in both the `href` and the `src`.
Avatars come from `github.com/<user>.png`, so changing your avatar on GitHub
changes it here.

**Sites** — static markup in `<div class="grid">` in `sites.html`. Copy an
`<a class="card">` block. The grid reflows on its own; nothing else to update.

Both are markup rather than JS arrays so the browser can fetch the avatars while
it parses, and so the pages still say something with scripting off.

**Speed** — `SPEED` at the top of `stars.js` is how fast the camera flies.
`COUNT` is the size of the field; see the note below before changing it.

## Local preview

```
python3 -m http.server 8000
```

Serve it rather than opening `index.html` off the disk — every link in `404.html`
is root-absolute (Pages serves that page at whatever path 404'd, so a relative
path would resolve against that path instead of the root), and those only work
over http.

## Notes

- The starfield is a `<canvas>`. Stars are drawn from one pre-rendered sprite
  rather than a gradient per star per frame.
- `stars.js` keeps no state. A star's position is a pure function of the wall
  clock, so the field is in the same place on every page of the site and after a
  reload, instead of respawning the whole sky at random depths on each load. Two
  tabs show the same stars, and so do two people. `EPOCH` is the fixed instant it
  counts from — the particular date means nothing, only that it never moves.
- That closed form costs the lateral respawn. The old field recycled a star the
  moment it left the frustum sideways, which is what kept nearly all 300 of them
  on screen; without recycling only about a third of the field is ever in view,
  so `COUNT` is 800 rather than 300. Measured against the old code the visible
  count matches within 2% on desktop viewports (about 10% high on a phone, where
  the 40px cull margin is proportionally larger), and the depth distribution of
  visible stars is unchanged — both fall off as z², which is why the swap is
  invisible rather than merely close.
- Nothing teleports when a star loops. By the end of a pass it is at z≈1, where
  the spread has thrown it far outside the viewport, so it is already unseen when
  it draws its next x/y.
- The frame loop adds a one-time skew to rAF's timestamp rather than calling
  `Date.now()` every frame. rAF's clock is document-relative, which is precisely
  the thing that must not survive a navigation. There is no `dt` accumulator any
  more either, so a backgrounded tab comes back to the right place instead of
  lurching to catch up.
- `prefers-reduced-motion: reduce` disables the animation and paints the field
  as a single static exposure.
- The avatars are the only external request.
- `resize` ignores same-width height changes under 120px, because mobile fires it
  every time the URL bar slides and re-sizing the canvas wipes the bitmap.
- The `preconnect` hints deliberately omit `crossorigin`: `<img>` without that
  attribute is a non-CORS fetch and would not reuse a CORS-preconnected socket.
- `.grid` uses `auto-fit`, not `auto-fill` — with one card, `auto-fill` holds the
  empty tracks open and it reads as a mistake.
- `body` and `main` are column flex and `.hero` is `flex: 1`, so the hero takes
  exactly the height the nav leaves it. A `100svh` hero under a static nav would
  overflow by the nav's height.
- The hero vignette is `inset: 0`, not a negative inset. `overflow-x: hidden` on
  `body` makes it a vertical scroll container, so anything hanging below the hero
  lands in `scrollHeight` and the landing page grows a phantom scrollbar.
