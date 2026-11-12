# Evening garden

A small, private evening-routine app for a shared family tablet. No accounts, analytics, external libraries, fonts, APIs, or internet connection are needed.

The complete user experience specification describes family workflows and comparison scenarios for a rewrite. [App description](APP-USER-SPECIFICATION.md)

## GitHub Pages

The workflow in [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) tests and builds both language versions and publishes them together on pushes to `main` or `czech-translation`. It can also run manually through **Actions → Deploy English and Czech → Run workflow**.

| Version | Source branch | URL |
| --- | --- | --- |
| English | `main` | https://bobas.github.io/kids-chores/ |
| Czech | `czech-translation` | https://bobas.github.io/kids-chores/cs/ |

1. Keep the same workflow in both branches. With the usual Git workflow, commit it to `main` and rebase `czech-translation` onto it, then push both branches.
2. Open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the **Source**.
3. If **Settings → Environments → github-pages** restricts deployment branches, allow both `main` and `czech-translation`.
4. Run the workflow manually or push another change to either branch.

Both URLs share saved children, chores, and daily progress within the same browser. The build gives each language version separate offline caches. The published files include the app, standalone HTML, and licenses.

## Run on a tablet (recommended)

1. Extract this folder on a computer connected to your home Wi-Fi.
2. Open a terminal in this folder and run:

   ```sh
   python3 serve.py
   ```

   On Windows, use `py serve.py` if `python3` is unavailable.
3. Leave that computer and terminal running. On the tablet, open the printed tablet address, for example `http://192.168.1.20:8080`. If an address is not printed, use the computer's Wi-Fi IP address. Both devices must be on the same local network; internet access is unnecessary.
4. Open **Settings**, edit your chores and times, then close Settings to save automatically.
5. Bookmark this address. Use the same address and browser each evening so the tablet finds its saved settings. If your computer's IP address changes, a fixed DHCP reservation in your router can keep the address stable.

The server only delivers the app files; settings and progress live in the tablet browser. Editing the app on the computer does not change the tablet's saved routine. The tablet never sends its settings or completion state to the server.

If you prefer, run Python directly on the tablet and open `http://localhost:8080`. To limit the server to its own device, use `python3 serve.py --host 127.0.0.1`.

## Older Android 4.4 tablets

Use **Firefox 68.11** on this tablet. The app targets Firefox 68 and newer. Android's version alone does not identify the browser engine; the original Android 4.4 system browser is not supported.

Open the same local server address and port as usual. Reload the page after updating the files; `serve.py` does not need to restart. If only the header appears, close the tab and reopen the same address. Keep site data unless you have backed up the routine.

The agenda, clocks, individual completion, settings, and backup import/export work without newer browser APIs. Browsers without native dialogs use a settings overlay. Task, celebration, and particle icons are embedded SVG graphics, so they need neither emoji fonts nor an internet connection. The icon picker shows previews and descriptive names. Existing routines and backups remain compatible. A startup notice stays visible if JavaScript is disabled or the browser cannot start the app.

## Single-file version

`Evening garden.html` contains the whole app. Open it in a browser that supports local HTML files with JavaScript, and it can run completely offline with no server. Desktop browsers usually support this; tablet file viewers vary. Use the local server method if your tablet previews the file rather than opening it as a web app, or does not preserve file-based browser storage.

Opening `index.html` directly also works when the other app files stay beside it.

The optional service worker provides offline reloads on supported secure origins such as `localhost`. Ordinary tablet access over a Wi-Fi `http://192.168...` address requires the local server to remain reachable for page loads. The open app keeps working if the connection drops; all timing and interactions happen on the tablet.

## How it works

- Closing Chores or Settings with ×, Escape, or a click outside saves valid edits automatically. **Discard changes** abandons that editor’s draft. Invalid values keep the relevant dialog open with an explanation.
- Settings manages 1–8 shared children, their colors, the clock format, and celebrations. Chores manages 0–40 chores and their child assignments for the selected profile. A new child starts with no assignments. Choose their chores in the Chores editor.
- Each chore appears once in a shared left column with a large picture and title. Its clock and times appear when relevant, as described below. Child names head the checkbox columns on the right. Checking and unchecking update that child’s progress, and the checkbox then waits two seconds before accepting another change. Unassigned children show a dash.
- The shared vertical axis uses an adaptive, compressed scale. Longer chores receive more height without spanning many screens, while short rows fit their pictures, titles, checkboxes, and any visible clock. Overlapping chores for different children are stacked in one shared time block, with aligned child columns and time labels. A chore turns light green when every assigned child has checked it off. Gaps stay visible, and gaps of 30 minutes or more display their duration beside a fold mark. Rows and time labels move together as visible content changes.
- The NOW line updates every second and follows the same compressed mapping as cards and time labels, including through gaps. Child headings remain visible while scrolling. The **Now** button jumps to the current time (or the first/last chore outside the displayed range). Extra columns scroll sideways.
- A chore’s numbered range clock, exact start/end times, and duration appear while it is running, when it is the next unfinished future chore, or when it is overdue and still unfinished for any assigned child. The allocated interval is pale green for running or next-up chores and pale red for overdue unfinished chores. The starting hour hand, starting minute hand, and brown ending hand explain the interval. Ranges crossing the top of the face wrap correctly, and intervals of an hour or more fill the face with their duration written underneath.
- The header keeps a normal digital and analog clock for device-local time. It shows the next chore's time and countdown when nothing is currently due.
- Different children may have chores at the same time. Overlapping chores for the same child, unassigned chores, and time slots crossing midnight are rejected.
- There are no decorative headings, subtitles, instructions on chore cards, or footers on the children's screen. The visible text focuses on time, child names, chore names, and completion counts.
- Checking a chore by its deadline plays one of 20 daily celebration themes, including for early completion. A late ordinary completion shows a gentle turtle reminder. Finishing a child’s whole profile is judged against that profile’s latest adjusted end time and earns a trophy when on time. The family’s completion is acknowledged when everyone is done. Overlays remain visible for reading and accept tap or Escape dismissal after two seconds. The overlay consumes dismissing taps. Settings can disable or preview celebrations, and reduced-motion preferences are respected.
- Progress resets at local midnight for every child. Schedules and names persist. Children without assignments show a dash and 0/0 progress.
- **Back up all profiles** downloads the shared family settings and all regular profile schedules. **Import all profiles** stages a replacement in Settings, applied when that editor closes with valid data. Backups exclude daily checkmarks, rewards, and shifts. Discard changes abandons a staged import.
- Older single-schedule backups need conversion outside the app before importing. Unsupported stored data is preserved and a message explains how to load a converted backup.
- Browser storage is specific to its origin (address and port). Clearing site data removes your routine. The page warns if saving fails. There is no network synchronization.

## Files and checks

- `index.html`, `style.css`, `app.js`: interface and browser interactions.
- `routine.js`: schedule validation, time windows, and daily-state rules.
- `serve.py`: Python standard-library static server, restricted to app assets.
- `sw.js`, `manifest.webmanifest`, `icon.svg`: optional offline cache / home-screen metadata.
- `Evening garden.html`: standalone, bundled version.
- `build.py`: regenerate the standalone HTML after editing the app.
- `test.cjs`: automated tests of timing boundaries, validation, reload cleanup, and midnight reset. Run `node test.cjs` with Node 18 or newer. Node is only needed for these tests, not to run the app.

The revised app has 47 automated tests for child-specific progress, assignment cleanup, timing, compressed-scale continuity, readable slot heights, cross-child alignment, range-sector geometry, validation, and migration. Browser checks verified custom color selection, color persistence and discard, late turtle reminders, regular celebrations, quiet undo, one shared row/title/range clock per chore, individual checkbox persistence and undo, assignment dashes, compact supper rows, preserved settings, and tablet column alignment. Earlier checks covered child addition/removal, selective assignment, independent completion, and reload persistence.

## Icons and licensing

[Twemoji 15.1.0](https://github.com/jdecked/twemoji/tree/7407fa31c51be5ab45626b8ab5554d50cc8073f6) graphics by Twitter, Inc. and other contributors are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `LICENSE-TWEMOJI.txt` for the full license. The 105 selected SVG graphics are embedded in `ICON_ART` in `app.js`, so the standalone HTML works offline and the existing server needs no restart. Artwork is unchanged; rendering adds styling and accessibility attributes to the SVG root. The app draws geometric particles and controls as vectors. No Twemoji JavaScript or network image requests are used.

## Keep the screen awake in fullscreen

The fullscreen button also enables keep-awake. Leaving fullscreen or hiding the page releases it; returning to a still-fullscreen page tries to reacquire it. A green button border indicates active keep-awake. If the browser refuses or interrupts it, a message appears and the next tap on the page retries.

Supporting browsers use the Screen Wake Lock API. Firefox 68 and local HTTP access use bundled silent video adapted from [NoSleep.js 0.12.0](https://github.com/richtr/NoSleep.js/tree/07fcee254724ab1b79076fbc22f3dd447649a2eb). The video needs no network requests and is included in the standalone HTML. The samples and fallback technique are MIT licensed (Rich Tibbett); the license is in `LICENSE-NOSLEEP.txt` and the embedded app source.

Actual screen-sleep prevention also depends on the browser, operating system, and power-saving settings. On the tablet, check that fullscreen keeps the display on beyond its normal timeout and that exiting allows it to sleep normally again. Manually locking the device still locks the screen.

## Shift today’s times

Open **Menu → Shift times** for today’s adjustment. Choose +5, +10, +15, or +30 minutes, or enter a custom positive or negative offset. The preview shows old and new times. **Apply shift and close** saves today’s adjustment. Cancel, the close button, Escape, or tapping outside abandons the preview. **Undo last shift** restores the previous timing offsets. **Restore original times** clears all of today’s shifts and their undo history. Both recovery actions preserve checkmarks and saved celebrations.

The same offset applies to every future chore and every chore that any assigned child has not finished, including overdue and currently active chores. Completed past chores stay in place. Future chores move even if completed early. Both start and end move, preserving durations and gaps between shifted chores. Completed history can overlap shifted rows.

The timeline, range clocks, countdown, Now button, and celebrations use today’s adjusted times. The shift and Undo survive a reload, but expire at local midnight along with daily progress. The regular schedule and its JSON backup exclude today’s adjustments. A shift crossing a day boundary is rejected with an explanation.

## The same celebration all day

Each child’s chore checkbox in each profile receives a random daily celebration choice. Replaying the same acknowledgment reuses its picture, message variant, and animation arrangement, including after reload. At midnight the choices are cleared and the next day draws fresh choices on first completion.

Earned positive celebrations and trophies can be replayed later that day. A saved turtle is reconsidered when the chore is checked again. If that check meets today’s adjusted deadline, it earns an ordinary celebration or a trophy according to whether the child has finished the profile. To correct a late finish, dismiss the turtle after its two-second wait, uncheck once the checkbox is available, extend the remaining times, and let the child check again. The daily theme is reused and the upgraded outcome survives reload. A completion that is still late replays its saved turtle message. Shifting times preserves saved choices until the next check, and Settings previews have their own random choices.

## Choosing chore icons

Open Chores from the menu, then tap a chore’s picture to choose from 82 bundled icons. Browse Food, Hygiene, Health, Clothes, Tidying, School, Pets, Fun, and Rest, or use All. The current picture is highlighted. Choosing an icon returns to the Chores draft, where closing saves valid changes and Discard changes abandons them. Canceling the picker keeps the previous picture. All artwork works offline in Firefox 68 and the standalone app.

Health includes medicine, a plaster, a stethoscope, a thermometer, an injection, a hospital, health care, a heart, lungs for breathing, a mask, a crutch, and meditation.

## Time-of-day profiles

Open the hamburger menu to select Morning, Forenoon, Noon, Afternoon, or Evening. Profiles appear as tiles with an illustration above the name: sunrise, sun behind a cloud, sun, sunset, and moon. The selected tile is highlighted in green. The selected profile also appears in the Chore heading. Switching is manual and the last selection is remembered. All profiles start empty, with an Add chores action. New chores in empty profiles start at 07:00, 09:00, 12:00, 15:00, or 18:00, respectively; these are suggestions, not restrictions.

Children, colors, clock format, and the celebrations preference are shared. Each profile has its own chores, assignments, checkmarks, cached celebrations, daily shifts, undo, and reset. Final celebrations count only that profile. Daytime profiles use neutral celebration text; Evening keeps the bedtime wording. Daily progress expires at local midnight, including in inactive profiles.

Settings edits shared children and preferences. The separate Chores dialog edits chores for the selected profile. Discard changes abandons all pending edits, including imports. Removing a child affects every profile; saving is blocked if any chore would lose its last assigned child.

### New backups

Back up all profiles downloads `daily-profiles.json`: `version: 3`, shared `kids`, `format`, `celebrations`, `activeProfileId`, and a `profiles` object. Its fixed keys are `morning`, `forenoon`, `noon`, `afternoon`, and `evening`, each containing `chores`. Backups exclude daily progress and shifts. Import stages replacement of all profiles and children; close Settings to apply or Discard changes to cancel. Applying clears daily progress.

Older single-schedule backups and stored data are not migrated automatically. Unsupported stored data remains untouched; a message explains how to import a separately converted backup. Closing Settings without importing does not overwrite it. Testing-device backups can be converted outside the app.

## Toolbar and menu

The toolbar has only Now, Fullscreen, and a hamburger menu. The menu directly lists the five profiles, followed by Shift times, Chores, and Settings. Chores contains titles, icons, times, and child assignments for the selected profile. Settings contains children and colors, clock format, celebrations and their preview, and all-profile backups. Both editors save valid changes when closed; Discard changes abandons their edits. Invalid values keep the relevant dialog open with an explanation.

## Trophy for completing a profile

When a child finishes all their assigned chores by the latest end time in the selected profile, they earn a trophy even if the last checkbox belongs to a chore whose own deadline has passed. Completion order does not matter. Today’s shifted times apply; finishing exactly at the final deadline still counts as on time. Individual chores before full completion retain their own deadlines. A previously cached ordinary celebration or turtle does not prevent earning the finale trophy. Earned trophies can be replayed like other daily celebrations.

## Contextual chore clocks and compact rows

Clock faces, exact start/end times, and duration are shown only for running chores, the nearest future unfinished chore, and past chores that any assigned child has not finished. All tied next-start chores show their details. Early-completed future chores are skipped when selecting the next chore; running chores retain their details until their end even if completed. Overdue unfinished chores use a pale-red clock sector. The time scale on the left remains available.

Timing details fade and slide in or out. Rows fit their actual visible content and duration, so short clockless chores are compact while wrapped titles, checkboxes, and visible clocks have enough room. Row height changes animate together with neighbouring rows, time labels, and the Now line. Chores have larger illustrations in a separate left column, with their titles beside them; content is vertically centered. Reduced-motion preferences disable these transitions.

## Responsive checkbox feedback

Checking a chore updates its checkbox, the child’s progress and the affected row in place. Unchanged chores reuse their measured sizes. The checked state gets a rendered frame before the celebration opens. Switching profiles, opening a dialog or hiding the page cancels a celebration that has not opened yet.

After checking or unchecking, that checkbox is locked for two seconds. A celebration accepts tap or Escape dismissal two seconds after it opens. Repeated attempts during the wait are ignored and do not extend it.
