# Evening garden

A small, private evening-routine app for a shared family tablet. No accounts, analytics, external libraries, fonts, APIs, or internet connection are needed.

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

## Single-file version

`Evening garden.html` contains the whole app. Open it in a browser that supports local HTML files with JavaScript, and it can run completely offline with no server. Desktop browsers usually support this; tablet file viewers vary. Use the local server method if your tablet previews the file rather than opening it as a web app, or does not preserve file-based browser storage.

Opening `index.html` directly also works when the other app files stay beside it.

The optional service worker provides offline reloads on supported secure origins such as `localhost`. Ordinary tablet access over a Wi-Fi `http://192.168...` address requires the local server to remain reachable for page loads. The open app keeps working if the connection drops; all timing and interactions happen on the tablet.

## How it works

- Closing Settings with ×, Escape, or a click outside saves valid edits automatically. **Discard changes** closes without applying the current edits. Invalid names, times, assignments, or overlapping slots keep Settings open with an error so you can fix or discard them.
- Settings supports 1–8 children and 1–40 chores. Choose each child’s color using the color picker beside their name; it colors their column, checkboxes, and progress bar and is included in backups. Rename, add, or remove children and tick which children each chore belongs to. A new child starts with no assignments; select their chores before saving.
- Each chore appears once in a shared left column, with one shaded range clock. Child names head the checkbox columns on the right. Tick a child's box to complete that chore for them; untick it to undo. Completion counts and progress bars remain individual. Unassigned children show a dash instead of a checkbox. Existing assignments and completion data are preserved.
- The shared vertical axis uses an adaptive, compressed scale. Row heights grow logarithmically with chore duration, so supper stays compact instead of spanning several screens. Short cards retain enough room for a readable clock. Checkbox columns stay aligned with their shared chore row. Overlapping chores for different children are stacked inside one shared time block; NOW advances across that block while each currently due row is highlighted. Empty gaps stay visible; gaps of 30 minutes or more display their actual duration beside a fold mark. Time labels show the real times. This is deliberately no longer a uniform pixels-per-minute scale.
- The NOW line updates every second and follows the same compressed mapping as cards and time labels, including through gaps. Child headings remain visible while scrolling. The **Now** button jumps to the current time (or the first/last chore outside the displayed range). Extra columns scroll sideways.
- Every chore has one numbered range clock: a shaded clockwise minute sector lies between the start-minute hand and the brown end-minute hand; the short hand gives the starting hour. Exact start/end digits and the full duration are underneath. An interval of an hour or more fills the whole face; the written duration disambiguates additional turns. Intervals crossing the top of the face wrap correctly.
- The header keeps a normal digital and analog clock for device-local time. It shows the next chore's time and countdown when nothing is currently due.
- Different children may have chores at the same time. Overlapping chores for the same child, unassigned chores, and time slots crossing midnight are rejected.
- There are no decorative headings, subtitles, instructions on chore cards, or footers on the children's screen. The visible text focuses on time, child names, chore names, and completion counts.
- Checking a chore by its deadline plays one of 20 randomized celebration themes (early finishes also celebrate). A late finish instead shows a gently animated turtle with a random encouraging reminder, such as “Next time, let’s try turtle turbo!” The chore still counts as completed, and finishing all chores is acknowledged in the turtle message. Unchecking a chore does not celebrate. Finishing a child's assigned chores celebrates that child's completion; finishing everyone's chores celebrates the whole group. All celebration messages, including turtle and all-done messages, stay visible until tapped (or dismissed with Escape); there is no automatic timeout. The overlay blocks taps on the checklist while children read. Settings can disable or preview celebrations. Reduced-motion preferences are respected.
- Progress resets at local midnight for every child. Schedules and names persist. Children without assignments show a dash and 0/0 progress.
- **Back up routine** downloads settings as JSON. **Import routine** loads a backup into the editor; closing Settings applies it. Backups contain children, assignments, and schedules, not daily completion history.
- Previous single-checklist routines and backups migrate automatically to two placeholder child columns. Rename or remove these in Settings. Existing shared completions are retained only in the first child's column, since the old data did not identify individual children.
- Browser storage is specific to its origin (address and port). Clearing site data removes your routine. The page warns if saving fails. There is no network synchronization.

## Files and checks

- `index.html`, `style.css`, `app.js`: interface and browser interactions.
- `routine.js`: schedule validation, time windows, and daily-state rules.
- `serve.py`: Python standard-library static server, restricted to app assets.
- `sw.js`, `manifest.webmanifest`, `icon.svg`: optional offline cache / home-screen metadata.
- `Evening garden.html`: standalone, bundled version.
- `build.py`: regenerate the standalone HTML after editing the app.
- `test.cjs`: automated tests of timing boundaries, validation, reload cleanup, and midnight reset. Run `node test.cjs` with Node 18 or newer. Node is only needed for these tests, not to run the app.

The revised app has 20 automated tests for child-specific progress, assignment cleanup, timing, compressed-scale continuity, readable slot heights, cross-child alignment, range-sector geometry, validation, and migration. Browser checks verified custom color selection, color persistence and discard, late turtle reminders, regular celebrations, quiet undo, one shared row/title/range clock per chore, individual checkbox persistence and undo, assignment dashes, compact supper rows, preserved settings, and tablet column alignment. Earlier checks covered child addition/removal, selective assignment, independent completion, and reload persistence.
