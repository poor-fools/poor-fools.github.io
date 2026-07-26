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
