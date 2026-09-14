# Logo, audio, and mobile refinement

## What will change
- Remove the dark background from the supplied artwork while preserving the four luminous circles.
- Add the resulting mark to the header on every page, with sizing and contrast that remain clear in light and dark modes.
- Derive the browser favicon and installable app icons from the same mark, and add home-screen app metadata without adding offline caching.
- Repair the premium audio level and browser-unlock behavior, then add an immediate preview tone when audio is enabled.
- Review the landing page, map controls, score rows, diagram, premium window, history controls, and export tools at phone widths; correct clipping, crowding, touch targets, and ordering.

## Verification
- Test the premium unlock and audio toggle in a real browser, including a score change after enabling sound.
- Check both pages in light and dark modes at desktop and phone sizes.
- Confirm the favicon, app manifest, and app icons load correctly, then confirm the current build is healthy.

## Technical details
- The transparent logo will be stored as a project asset; favicon and install icons remain optimized local files where browsers require them.
- Audio will continue using the browser audio system and remain opt-in through the existing premium setting.
- Home-screen support will be manifest-only; offline behavior is outside this request.
