# poor-fools.github.io

Landing page for the poor fools org. One file, no build step, no dependencies.

The repo name has to match the org name exactly (`poor-fools.github.io`) for Pages
to serve it at the bare domain rather than as a subpath.

## Editing

The knobs are at the top of the `<script>` tag:

```js
const CREW = ['sagemachine', 'ryanhtruong'];
const PROJECTS = [];
const SPEED = 1.35;
```

- `CREW` — GitHub usernames. Avatars come from `github.com/<user>.png`, so changing
  your avatar on GitHub changes it here.
- `PROJECTS` — `{ name, blurb, href }` entries. Adding any renders a *works* section
  below the fold; an empty array renders nothing.
- `SPEED` — how fast the camera flies.

## Local preview

Open `index.html` directly; `file://` renders it the same as Pages will. Or
`python3 -m http.server 8000`.

## Notes

- The starfield is a `<canvas>`. Stars are drawn from one pre-rendered sprite
  rather than a gradient per star per frame.
- `prefers-reduced-motion: reduce` disables the animation and paints the field
  as a single static exposure.
- The avatars are the only external request.
