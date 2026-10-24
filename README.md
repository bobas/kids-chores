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

## Older Android 4.4 tablets

Use **Firefox 68.11** on this tablet. The app targets Firefox 68 and newer. Android's version alone does not identify the browser engine; the original Android 4.4 system browser is not supported.

Open the same local server address and port as usual. Reload the page after updating the files; `serve.py` does not need to restart. If only the header appears, close the tab and reopen the same address. Keep site data unless you have backed up the routine.

The agenda, clocks, individual completion, settings, and backup import/export work without newer browser APIs. Browsers without native dialogs use a settings overlay. Task, celebration, and particle icons are embedded SVG graphics, so they need neither emoji fonts nor an internet connection. The icon picker shows previews and descriptive names. Existing routines and backups remain compatible. A startup notice stays visible if JavaScript is disabled or the browser cannot start the app.

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

The revised app has 47 automated tests for child-specific progress, assignment cleanup, timing, compressed-scale continuity, readable slot heights, cross-child alignment, range-sector geometry, validation, and migration. Browser checks verified custom color selection, color persistence and discard, late turtle reminders, regular celebrations, quiet undo, one shared row/title/range clock per chore, individual checkbox persistence and undo, assignment dashes, compact supper rows, preserved settings, and tablet column alignment. Earlier checks covered child addition/removal, selective assignment, independent completion, and reload persistence.

## Icons and licensing

[Twemoji 15.1.0](https://github.com/jdecked/twemoji/tree/7407fa31c51be5ab45626b8ab5554d50cc8073f6) graphics by Twitter, Inc. and other contributors are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `LICENSE-TWEMOJI.txt` for the full license. The 38 selected SVG graphics are embedded in `ICON_ART` in `app.js`, so the standalone HTML works offline and the existing server needs no restart. Artwork is unchanged; rendering adds styling and accessibility attributes to the SVG root. The app draws geometric particles and controls as vectors. No Twemoji JavaScript or network image requests are used.

## Keep the screen awake in fullscreen

The fullscreen button also enables keep-awake. Leaving fullscreen or hiding the page releases it; returning to a still-fullscreen page tries to reacquire it. A green button border indicates active keep-awake. If the browser refuses or interrupts it, a message appears and the next tap on the page retries.

Supporting browsers use the Screen Wake Lock API. Firefox 68 and local HTTP access use bundled silent video adapted from [NoSleep.js 0.12.0](https://github.com/richtr/NoSleep.js/tree/07fcee254724ab1b79076fbc22f3dd447649a2eb). The video needs no network requests and is included in the standalone HTML. The samples and fallback technique are MIT licensed (Rich Tibbett); the license is in `LICENSE-NOSLEEP.txt` and the embedded app source.

Actual screen-sleep prevention also depends on the browser, operating system, and power-saving settings. On the tablet, check that fullscreen keeps the display on beyond its normal timeout and that exiting allows it to sleep normally again. Manually locking the device still locks the screen.

## Shift today’s times

Use the clock icon in the top bar (**Shift times**) to open a separate dialog for today’s adjustment. Choose +5, +10, +15, or +30 minutes, or enter a custom positive or negative offset. The preview shows the old and new times. **Apply shift and close** saves today’s adjustment and closes the dialog. Cancel, the close button, Escape, or tapping outside closes without applying the preview. **Undo last shift** restores the times before the last adjustment while preserving all checkmarks.

The same offset applies to every future chore and every chore that any assigned child has not finished, including overdue and currently active chores. Completed past chores stay in place. Future chores move even if completed early. Both start and end move, preserving durations and gaps between shifted chores. Completed history can overlap shifted rows.

The timeline, range clocks, countdown, Now button, and celebrations use today’s adjusted times. The shift and Undo survive a reload, but expire at local midnight along with daily progress. The regular schedule and its JSON backup exclude today’s adjustments. A shift crossing a day boundary is rejected with an explanation.

## The same celebration all day

Each child’s chore checkbox receives a randomly selected celebration on its first completion of the local day. Unchecking and checking it again replays the same picture, message, and animation, even after reloading. Choices are independent for each child and chore. At midnight they are cleared, and the next day draws fresh choices on first completion. A random draw can occasionally pick the same theme again.

The first earned outcome is preserved: an on-time celebration does not become a turtle when replayed after the deadline, a late completion keeps its turtle message, and an earned final celebration can also be replayed. Settings previews remain random and do not change any checkbox’s selection. Shifting today’s times or undoing a shift also preserves these choices.
