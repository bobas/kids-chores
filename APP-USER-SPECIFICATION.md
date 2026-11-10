# Daily chores planner — user experience specification

Reference date: 10 November 2026.

This document describes the existing app as experienced by children and parents. It is intended to guide an independent rewrite and the subsequent comparison of the two versions. It specifies observable behavior, visual relationships, and user workflows, without prescribing source structure, programming language, frameworks, drawing techniques, or a storage schema.

The reference app is currently named **Večerní plán** in Czech and **Evening garden** in its English installed-app identity. Its functionality now covers the whole day. The name does not restrict when it can be used.

Sections 1–14 describe the functional and UX baseline. Section 15 distinguishes incidental details and quirks from essential product behavior. Section 16 provides concrete comparison scenarios.

## 1. Purpose and audience

The app is a shared family display that helps young children understand what they need to do, when they should do it, and which tasks they have already completed. It combines pictures, readable names, analog clocks, exact written times, individual checkboxes, and encouraging celebrations.

Children primarily read the schedule and check their own boxes. A parent prepares the routines, manages the children, and adjusts today's timing when family plans change. The same tablet is used by everyone; there are no separate child accounts or sign-in steps. Parent controls are reached through the menu and are not protected by a PIN in the reference app.

The tone is calm, friendly, and encouraging. Finishing late still counts as finishing. The app acknowledges lateness gently rather than treating it as failure. It does not prevent children from completing tasks early or in a different order.

The primary setting is a shared tablet at home, including an old Android 4.4 tablet using Firefox 68.11. Phones and desktop browsers are also usable. The app needs no account or internet service for its everyday calculations and interactions. Family data stays on the device unless the parent explicitly exports a backup.

## 2. What the family configures

### 2.1 Shared children and preferences

The family has one shared list of children, used in every routine. Each child has a name and a chosen color. The reference supports **1–8 children**. Names must be nonempty, distinct even if capitalization differs, and at most 30 characters long. Surrounding spaces are removed when saving.

Each child keeps the same name and color across all profiles. Colors distinguish the child's column, checkboxes, progress indication, and the parent's child-editing controls. A child can exist without any assigned chores in a particular profile.

Two preferences apply everywhere:

- Display times in 24-hour or 12-hour format.
- Enable or disable the little celebrations shown when chores are checked.

### 2.2 Five fixed time-of-day profiles

The app has five profiles, in this order:

| English label | Czech label | Profile illustration |
| --- | --- | --- |
| Morning | Ráno | Sunrise over water |
| Forenoon | Dopoledne | Sun partly behind a small cloud |
| Noon | Poledne | Bright, unobscured sun |
| Afternoon | Odpoledne | Setting sun over buildings |
| Evening | Večer | Crescent moon |

These are independent routines, selected manually. Their names are organizational labels: a Morning chore is not forbidden from having an afternoon time. There are no enforced time boundaries between profiles, and the app does not switch profiles automatically as the clock advances.

The profiles cannot currently be renamed, added, or deleted. The last selected profile is remembered when the app is reopened.

Each profile owns its own:

- Chores, their times, pictures, and child assignments.
- Today's checked and unchecked boxes.
- Today's remembered celebration choices.
- Today's time adjustments, the ability to undo the last adjustment, and the ability to restore the regular times.

Actions in one profile must not affect any other profile's chores or daily progress, even if two chores have identical names and pictures.

### 2.3 Chores

A profile can contain **0–40 chores**. Each chore has:

- A nonempty name, up to 60 characters.
- One picture chosen from the available icon catalog.
- A start time and an end time.
- One or more assigned children.

Times have minute precision and must fit within a single local calendar day, from 00:00 through 23:59. The end must be later than the start. A chore cannot cross midnight or have zero duration.

A child cannot be assigned two overlapping chores within the same profile. Adjacent chores are allowed: one may end at exactly the time the next begins. Different children may have different chores at the same time. Times in different profiles are not checked against each other.

Chore titles do not need to be unique. Two chores with the same name are still separate tasks with separate checkboxes.

The display orders chores by start time. Parents edit times to change their chronological order; the reference has no separate manual ordering control.

## 3. First launch and everyday startup

A fresh installation starts with two placeholder children, **Dítě 1 / Child 1** and **Dítě 2 / Child 2**, with different default colors. The Evening profile is initially selected. All five profiles start empty. The initial time format is 24-hour, and celebrations are enabled.

An empty profile still shows the current clock, toolbar, profile heading, children, and zero progress. Instead of an empty or broken timetable, it displays a short explanation and an **Add chores / Přidat úkoly** button. That button opens the Chores editor directly.

A typical first-use workflow is:

1. Open the hamburger menu and choose Settings.
2. Rename the children, choose their colors, and save by closing Settings.
3. Open the menu and select the desired profile.
4. Open Chores, add the routine, choose pictures and assignments, and close to save.
5. Repeat for the other profiles as needed.

On subsequent visits, the app restores the family setup, selected profile, and valid progress for the current local date. It initially positions the timetable near the current time rather than requiring the family to scroll from the beginning of a long routine.

Startup must not silently fail into an unexplained blank page. The reference shows a loading explanation until startup succeeds. If the browser cannot run the app, a readable notice remains visible.

## 4. Main screen and visual character

### 4.1 Overall appearance

The app has a warm off-white or cream background, dark green-gray text, muted green outlines, soft pastel areas, and rounded controls. The visual style is gentle rather than competitive or attention-seeking. Colorful illustrated pictures provide the playful element.

Text is large and readable from a shared tablet. Chore names are prominent, times are legible, and child checkboxes are large enough for fingers. Long names wrap rather than disappearing or breaking the layout. Family colors must remain usable for both very light and very dark choices, including readable tick marks.

Exact fonts, pixel dimensions, color values, and rendering techniques are not requirements. The rewrite should preserve the hierarchy, readability, recognizable states, and comfortable touch targets.

### 4.2 Top bar

The top bar remains available while the timetable itself scrolls. It contains:

- A large analog clock showing the current local time.
- A large digital clock showing hours and minutes.
- A small next-chore indication when applicable.
- Exactly three icon-only action buttons, in order: **Now**, **Fullscreen**, **Menu**.

The buttons have accessible names and descriptive tooltips. Their visible symbols are a downward/jump arrow, fullscreen corners, and a three-line hamburger.

The digital time format follows the shared preference. In Czech, the 12-hour format uses **dop.** and **odp.**; in English, it uses AM and PM. The selected format is also used for displayed schedule times and shift previews. Duration labels remain durations, not clock times.

When no unfinished chore is currently in its scheduled time interval, the header can show the next future chore's start and the remaining whole minutes, or hours and minutes. It skips chores that every assigned child has already completed. An overdue unfinished chore does not, by itself, prevent a future-chore countdown. No countdown is shown when there is no relevant future chore or while an unfinished chore is currently scheduled.

### 4.3 Schedule columns

The schedule is a shared table-like timeline with:

1. A narrow vertical time axis at the left.
2. One shared chore column.
3. One completion column per child.

The shared chore heading includes the selected profile name, such as **Úkol · Ráno**. Every child heading shows the child's name, a progress bar, and a completed/assigned count such as **2/5**. When a child with at least one assigned chore completes all of them, the heading also shows a completion mark. A child with no assignments shows **0/0**, not a completed-routine badge.

Child headings stay visible during vertical scrolling. The shared chore information and all children's boxes remain aligned on the same row. A chore is shown once, even if assigned to several children.

Each child's cells use a pale tint of their selected color. An unassigned child's cell instead contains a muted dash, with no interactive checkbox.

### 4.4 Chore rows, content layout, and completion states

Within the shared chore area, content reads from left to right:

1. A large illustration in its own narrow left-hand column.
2. The chore title in a separate, flexible text column.
3. A clock-and-times column on the right, only when the timing details are relevant as described in section 4.6.

The illustration is a prominent, recognizable picture, not a small symbol above the title. The reference has a subtle vertical divider between the picture and text. Long titles wrap within their text column without overlapping the picture, timing details, or children's checkboxes.

In a fully visible row, the picture and title block are vertically centered within the available row height, aligned with the child's checkbox. This also applies to short rows such as **Modlitba / Prayer**. Center the content within the row itself, rather than centering the picture against a top-aligned text block. The row remains centered as it grows or shrinks; a multiline title is centered as a whole block.

An unchecked box is pale with a colored outline. A checked box is filled with the child's color and has a clearly contrasting tick. Tapping one child's box affects only that child.

The shared picture/title/clock area becomes **light green only when every child assigned to that chore has checked it off**. Merely reaching the chore's scheduled time does not make it green. Completion by only one of several assigned children does not make it green. Unchecking any assigned child removes that shared completion highlight.

Lateness does not create a red row or erase completion. It changes only the visible clock's allocated-time sector to pale red when the chore is overdue and unfinished. The green shared completion highlight and the green/red clock sector communicate different things: completion of the shared chore versus the timing of its allocated interval.

### 4.5 Row height, resizing, and the Now line

The vertical timeline is intentionally not a uniform ruler. Duration influences row height, but long durations are compressed so they do not consume several screens. Actual visible content sets the minimum usable height. Two different durations may therefore have similar heights when they both need the same space for content.

A short chore without a clock should be compact, with only enough room for its large picture, wrapped title, checkboxes, and comfortable padding. Do not reserve the empty height or width of an invisible clock. Do not give every row a fixed minimum intended for the largest clock-and-times block.

When timing details are visible, the row must have enough height for the entire clock, written start/end, and duration. A longer or multiline title can make the row taller even when no clock is shown. Checkbox touch targets remain comfortably usable in compact rows. Pictures, titles, timing details, and controls must not be clipped or run into another row.

Timing details appear with a brief gentle fade and horizontal slide, making space beside the title. When they disappear, their column closes and the title can use that space. The row then settles to the height needed by the remaining content and its duration. Expanding and collapsing the row is itself animated rather than an abrupt height jump.

Neighbouring rows move smoothly to their new positions. Time labels, grid lines, compressed-gap indicators, and the **NOW / TEĎ** line move with the same layout adjustment. They must not jump straight to the final positions while the chore cards are still moving. Once settled, the clock positions, labels, and row boundaries must describe the same time scale. These visual adjustments do not change the actual scheduled times, assignments, checkboxes, or selected profile.

Animations must work both as time advances and after children check or uncheck chores. They must remain responsive if another change occurs before a transition finishes. A partially revealed clock must not cover a neighbouring chore. Reduced-motion preferences remove the fade, slide, and resizing movement while preserving the same final visibility, height, and alignment.

Empty time gaps remain recognizable. Longer gaps, starting at about 30 minutes in the reference, are compressed and explicitly labeled with their actual duration and a visual fold indication. Compact chores must not eliminate meaningful gaps from the time scale. The family must not mistake compressed spacing for a different written time.

When different children's chores overlap, the individual chores are stacked as separate readable rows within their shared time span. They are not drawn on top of one another, and a shared chore is not duplicated for each child. Changing their content heights keeps this shared time block and all children's cells aligned.

A warm brown/orange horizontal **NOW / TEĎ** line and time label move through the timeline, including compressed chores, overlaps, and gaps. Its position corresponds to the same visual time scale as the rows. It updates as time passes, without user interaction. The line is hidden when the current time is outside the displayed timeline.

The **Now** button scrolls to the current time. Before the routine it brings the start into view; after the routine it brings the last chore into view. It does nothing disruptive in an empty profile.

### 4.6 Conditional clock faces and time information

The clock face, exact written start/end times, and duration are one timing-details group. Show or hide the whole group together. The left time scale remains available even when a row has no timing-details group.

Use **today's actual times in the selected profile**, including any time shifts, to decide visibility. Evaluate the rules as the clock advances and as children check or uncheck chores; refreshing the page is not required.

| Chore's current situation | Timing details | Allocated-time sector |
| --- | --- | --- |
| Currently running: its start has arrived but its end has not | Visible, even if all assigned children already finished | Pale green |
| Future, unfinished by at least one assigned child, and has the earliest such future start | Visible as next up | Pale green |
| Future and fully completed early | Hidden; skip it when choosing next up | Not shown |
| Future unfinished chore after the next-up start | Hidden | Not shown |
| Its end has arrived or passed and at least one assigned child is unfinished | Visible as overdue | Pale red |
| Its end has arrived or passed and all assigned children are finished | Hidden | Not shown |

“Next up” is chosen across the selected profile, not separately per child. If multiple unfinished future chores share the earliest start, show timing details for all of them. Show next-up details even while another chore is currently running. Several overdue unfinished chores can also show their clocks simultaneously.

At the exact start, a next-up chore becomes running; it keeps its details, and the next relevant future chore can reveal its own. At the exact end, a running chore becomes overdue if unfinished, or hides its details if finished. A running chore that everyone completes early keeps its clock until that end. Finishing the last assigned child on an overdue chore hides its details; unchecking any assigned child brings them back in pale red.

Clock visibility and celebration decisions are distinct. The running interval stops at the end time, so an unchecked clock can become pale red at that instant; checking a chore exactly at its end still counts as on time for a fresh celebration decision under section 7. A remembered celebration is not rerolled merely because the clock changed color or visibility.

When shown, the chore has a single clock face with numbers 1–12, a short hand indicating its starting hour, a starting minute hand, and a differently colored ending minute hand. The forward sector from the starting minute to the ending minute is pale green for running/next-up chores and pale red for overdue unfinished chores. The ending hand remains warm brown/orange.

The sector must wrap correctly through the top of the clock, for example **18:50–19:10**. For a duration of an hour or more, the face is filled in the applicable green or red and the written duration explains the actual length. The exact written times resolve the 12-hour ambiguity of the analog face. Display the written times using the shared 12-/24-hour preference.

The range clock explains the planned interval; its sector is not a live completion meter or countdown wedge. The separate top clock always shows the current time regardless of which chore clocks are visible.

### 4.7 Smaller screens

On a phone, the top clock and controls become more compact but remain readable and usable. The timetable keeps the separate picture column, readable title, relevant timing details, and usable child-checkbox columns rather than shrinking everything to fit. Users may scroll horizontally to reach children's columns and vertically through the day. Row heights adapt to the available width, including additional lines in a wrapped title, and the content remains vertically centered after resizing or changing orientation.

Dialogs fit within the viewport and scroll internally when necessary. Button labels and long names wrap. Large celebrations use almost the full phone width; on a tablet they are broad, prominent cards occupying roughly three quarters of the available width rather than a small narrow popup.

## 5. Menu and profile switching

Tapping the hamburger opens a centered **Menu** dialog over a dimmed background.

Its first section displays the five profiles directly, without an extra submenu. They appear as rounded square or slightly rectangular picture tiles, with the illustration above the name. The reference uses three columns followed by a second row of two tiles. The current profile has a pale green fill and stronger green border.

Below the tiles is a divider, followed by three full-width actions:

1. **Shift times / Posunout časy**.
2. **Chores / Úkoly**.
3. **Settings / Nastavení**.

Selecting a tile closes the menu and immediately displays that profile. Both tapping its picture and tapping its text work. Switching does not check boxes, trigger a celebration, reset progress, or change another profile. Any existing celebration is dismissed when changing profiles. The timetable is repositioned appropriately for the current time.

Selecting a menu action closes the menu and opens the requested dialog. Closing that dialog returns to the main screen, with keyboard focus on the hamburger button. It does not automatically reopen the menu.

## 6. Completing and undoing chores

A child can check any assigned chore at any time, including before its start, after its end, or out of chronological order. Chores do not unlock one another, and there is no required completion sequence.

An accepted check has the following effects.

- Marks that child's box as complete.
- Updates that child's count and progress bar.
- Updates the shared chore highlight if all assigned children are now done.
- Re-evaluates timing-detail visibility and row height, including revealing another next-up chore or collapsing a fully completed past chore.
- Remembers the completion for today.
- Shows the appropriate celebration, if enabled.

The checked state and updated child progress become visible promptly after a tap, before the celebration opens. Children see that their action was accepted while the app prepares the acknowledgment. The rest of the timetable stays responsive as timing details and row heights adjust.

For two seconds after each accepted check or uncheck, that child's checkbox for that chore is temporarily unavailable. Further taps on the box or its surrounding touch target are ignored. They neither queue another change nor extend the waiting period. Other children's boxes and other chores can be used independently. The same protection applies when little celebrations are disabled. Redrawing the timetable or switching away from the profile and back within those two seconds preserves the remaining wait for that checkbox.

If a parent opens a dialog or changes profiles, or the page is hidden before a queued celebration appears, that pending overlay is canceled. The accepted completion stays saved. If the check is subsequently undone before its celebration has appeared, cancel the pending celebration too.

Once the checkbox's two-second wait has expired, unchecking immediately reverses that child's completion and updates the count, bar, and any shared highlight. It can reveal an overdue clock and expand the row again when the chore is past its end. It does not launch a celebration. It does not delete the remembered daily celebration choice, because children may want to check again to replay it.

Refreshing or reopening the app on the same day preserves checkboxes. Changing the display language must not rewrite family-entered names or chore titles.

The app does not automatically mark chores done when their time ends, and no celebration appears merely because the clock advances, a profile opens, or its displayed progress happens to become complete through a parent edit.

## 7. Celebrations and gentle lateness reminders

### 7.1 Presentation

Celebrations are large, centered overlays that clearly acknowledge the action. The background is softened and blocked from accidental interaction. A large hero picture appears above a short, prominent encouraging message; the child's name identifies whose achievement is being celebrated when applicable. A small prompt explains that tapping closes the celebration.

Small but clearly visible illustrated particles fly, float, fall, orbit, or bounce around the card. They are colorful enough to be enjoyable and large enough to recognize on a tablet. The finale is more exuberant than a single-chore celebration. The turtle reminder is gentler, with fewer floating leaf-like particles.

For two seconds after a celebration opens, taps on its card, dismiss button, or surrounding overlay and presses of Escape are ignored. This waiting period starts when the celebration opens, independently of the checkbox's waiting period. Early dismissal attempts are discarded and do not extend the wait.

After those two seconds, a new tap on the celebration or its surrounding overlay, or a new press of Escape, dismisses it. The message stays visible until then, even when its animation has finished. Reaching the end of the waiting period leaves the celebration open for the child to read. A dismissing tap is consumed by the overlay.

The experience is silent. It does not depend on sound, remote imagery, or the device's emoji fonts. Reduced-motion preferences suppress or substantially reduce celebratory movement while retaining a readable acknowledgment.

### 7.2 Ordinary chores

For a fresh celebration decision on a chore that does not complete the child's entire profile:

| When the child checks it | Result |
| --- | --- |
| Before the chore starts | An ordinary positive celebration |
| During its interval | An ordinary positive celebration |
| Exactly at its end | An ordinary positive celebration |
| After its end | A friendly turtle reminder; the chore still counts as done |

The ordinary catalog has **20 themes**: star, butterfly, balloon, flower, rocket, bee, rainbow, sparkles, frog, bubbles, strawberry, sunflower, ladybird, party/confetti, fish, heart, kite, autumn leaves, rabbit, and moon.

Turtle reminders are gently phrased, with **six variants** in the reference. Examples include “Next time, let’s try turtle turbo!” and its Czech equivalent **Příště zapneme želví turbo!**. They should not shame the child or imply that completion did not count.

Evening may use bedtime language. Daytime profiles use neutral alternatives rather than telling the child to go to dreamland during the morning.

### 7.3 Finishing all of a child's chores

Completing the last remaining assigned chore is judged against the **latest end time of any chore in the selected profile**, using today's adjusted times. This is the end of the whole profile, not the deadline of the checkbox just tapped, and not necessarily the end of only that child's assigned chores.

If the child has now completed all their assigned chores by that profile-wide end, show a **trophy**. The trophy takes precedence over the fact that the last checkbox's own chore might be late.

If they first finish everything after the profile-wide end, show the turtle reminder instead, while still acknowledging that the child's chores are complete.

Exactly at the profile-wide end counts as on time. Completion order does not matter. A child with no assigned chores does not earn an automatic finale.

Example: tidying ends at 18:55, and the profile's latest chore ends at 20:30. A child completes the later chores first, then checks tidying at 20:10 as their last remaining chore. They get a trophy, not a turtle. The same first completion at 20:30 is still a trophy; at 20:30:01 it is late.

### 7.4 Finishing the whole family's profile

When every assigned checkbox in the selected profile is complete, the acknowledgment can say **Everyone: all done! / Všichni mají hotovo!**. This is completion of that profile, not completion of the entire day or all five profiles.

On a late fresh finale, the turtle reminder remains the primary message, with the family's completion acknowledged separately. A family's completed morning routine is independent of unfinished evening chores.

### 7.5 Stable choices during one day

The app remembers a random positive celebration theme, turtle-message variant, and animation arrangement for each child, chore, profile, and local date. Replaying the same kind of acknowledgment uses that day's remembered choice. Reloading preserves it. Other children's boxes and other profiles have independent choices.

An earned ordinary positive celebration can be replayed later that day as an ordinary acknowledgment, including after its deadline. A check that completes the profile follows the finale rules. When a repeated completion is still late, a remembered turtle retains its original message variant.

A saved turtle is reconsidered when the child checks the chore again. If that check meets today's adjusted deadline, it earns a positive celebration using the remembered daily theme. Later replays reproduce that positive acknowledgment consistently. An ordinary completion uses that chore's end time. A check that now finishes all the child's assigned chores uses the latest end time of the whole selected profile and earns a trophy when on time. Exactly at the applicable end counts as on time.

A parent can therefore dismiss the turtle after its two-second wait, uncheck the chore once its checkbox is available, extend the remaining times through Menu → Shift times, and let the child check it again. For example, a chore ending at 18:45 earns a turtle when checked at 18:50. Unchecking it and shifting the remaining times by +15 minutes moves its end to 19:00. Rechecking at 18:50 earns an ordinary celebration if the child still has other chores to finish. If the first recheck instead occurs after 19:00, the saved turtle is replayed. Changing times alone preserves saved acknowledgments until another check evaluates the new deadline.

A previously remembered ordinary celebration or turtle can also be promoted to a finale when the box now completes everything before the profile-wide end. A previously late finale can become a trophy under an extended deadline. When correcting a late finale while another chore remains unfinished, an on-time recheck earns an ordinary celebration.

Once earned, a trophy remains replayable later that day. Remembered celebrations describe the earned acknowledgment, while counters and checkboxes show the live completion state.

At the next local date, remembered choices are cleared. The next day's first checks receive fresh random choices, which may coincidentally select the same theme again.

### 7.6 Disabled celebrations and preview

When little celebrations are disabled, checking still saves completion, updates the timetable, and gives a brief textual “child: done” acknowledgment. Ordinary, trophy, and turtle overlays are suppressed.

Settings contains a manual preview. It can be used to try a random ordinary celebration, including when automatic celebrations are disabled. Preview does not check a chore or change any box's remembered celebration. The preview follows the same two-second wait before tap or Escape dismissal. Closing it returns to the Settings draft.

## 8. Chores editor workflow

Open **Menu → Chores**. The title identifies the selected profile, for example **Úkoly · Ráno**. This dialog contains only that profile's chore editor, not the children or general preferences.

Each editable chore card provides:

- A picture button.
- A title field.
- Start and end time fields.
- A remove button.
- Clearly labeled child-assignment checkboxes.

An **Add chore** action appends a blank-titled chore, initially assigned to all existing children and using a neutral star picture. Normally its start follows the last editor row's end and its duration is initially 15 minutes. In an empty profile, the suggested first starts are Morning 07:00, Forenoon 09:00, Noon 12:00, Afternoon 15:00, and Evening 18:00. The parent can change them freely. The add action is unavailable at the 40-chore limit.

Existing chore names, pictures, times, and assignments can be changed. Removing a card removes it from the draft immediately; it is committed only when the editor saves. The app does not require a separate confirmation for each draft deletion.

The dialog explicitly states that valid changes save when it closes. Closing with its × button, Escape, or a tap outside attempts to save. A successful save updates the schedule and returns to the main view near Now, with a brief saved acknowledgment. There is no separate Save button in the reference workflow.

**Discard changes / Zahodit změny** closes without applying the draft, including picture choices and added or removed cards.

Save-on-close means closing the editor within the app. Reloading the page or closing its browser tab while an editor is still open does not promise to save that draft.

If validation fails, the dialog stays open with an explanation. The user can fix the offending value or discard. Errors identify the relevant chore and child where applicable. No partial valid subset should be saved while another part is invalid.

Editing this profile must not replace the shared children or modify another profile's chores. Valid current-day progress for surviving chores and assignments is retained. Removing a chore or removing a child's assignment removes the corresponding completion from the live counts.

## 9. Chore picture picker

Tapping a chore's current picture opens a separate picker above the chore-editing workflow. It identifies the chore being edited and contains large picture tiles with short names underneath, visually similar to the profile tiles.

The picker starts in **All / Vše**, highlights the currently selected picture, and brings that selection into view. Category buttons narrow the choices without changing the current picture. The grid scrolls when necessary; the parent should not need to use a text search or an emoji keyboard.

The reference catalog contains **82 pictures**:

| Category | Pictures available |
| --- | --- |
| Food / Jídlo | Meal/plate, bowl, spoon, milk, apple, banana, carrot, sandwich/snack, bread, cooking/egg |
| Hygiene / Hygiena | Toothbrush, toilet, bath, shower, soap, washing hands, lotion, toilet paper, comb, water |
| Health / Zdraví | Pill/medicine, plaster/bandage, stethoscope/checkup, thermometer, injection, hospital, health-care symbol, heart organ, lungs/breathing, mask, crutch, meditation |
| Clothes / Oblečení | Shirt/clothes, trousers, dress, socks, shoes, coat, gloves, cap |
| Tidying / Úklid | Broom, laundry basket, bucket, rubbish bin, sponge, toolbox, potted plant/watering, home |
| School / Škola | Backpack, pencil, homework/note, textbooks, open book, ruler, crayon, painting palette |
| Pets / Zvířátka | Dog, cat, hamster, rabbit, fish, turtle, bird, paw prints |
| Fun / Zábava | Teddy, puzzle, football, bicycle, music, dice/game, video game, kite, violin, swimming |
| Rest / Odpočinek | Bed, moon, star, prayer, sleep, alarm clock, sofa, heart |

Selecting a picture closes the picker and updates the chore draft immediately. It does not save the parent editor yet. Canceling the picker with Cancel, ×, Escape, or the backdrop preserves the previous picture. Other draft edits, such as a partially edited title, remain intact.

Closing the picker returns keyboard focus to that chore's picture control. Discarding the parent Chores dialog also discards the selected picture.

All illustrations must display consistently on the old tablet and modern browsers, including offline. The reference uses a coherent, colorful illustrated style; the rewrite is not required to use the same drawing technology.

## 10. Shared Settings workflow

Open **Menu → Settings**. This dialog contains:

- The shared children list, with name fields, color controls, remove actions, and Add child.
- The shared 12-/24-hour preference.
- The little-celebrations toggle.
- Try a celebration.
- Back up all profiles and Import all profiles.
- Explanatory notes about local saving and the daily reset.

It does not contain the chore editor.

Choosing a child's color updates their editing row's preview. Saving applies that color everywhere the child appears. New children receive a default color and need a nonempty unique name before saving. They do not automatically become assigned to existing chores; parents assign them in each profile's Chores editor.

Removing a child removes their assignments across all profiles. Saving must be blocked if any chore would be left with no assigned child. The explanation identifies the affected chore/profile so the parent can discard the removal and reassign or remove the chore first.

Child edits must preserve the other profiles' chore definitions. Saving shared settings must not accidentally resurrect, erase, or apply a stale copy of the Chores draft.

Like Chores, Settings saves valid changes when closed with ×, Escape, or a backdrop tap. Discard changes abandons the draft. Invalid settings keep the dialog open with an explanation. Shared preferences do not change simply because the parent selected an unsaved value in the draft.

## 11. Adjusting today's remaining times

### 11.1 Purpose and entry

Open **Menu → Shift times** when the family's routine has been delayed or needs to move earlier. This is an adjustment to today's selected profile, not a permanent edit to the regular schedule.

The dialog explains that future and unfinished chores move together and that existing checkmarks are retained. A status note indicates whether today's times are already adjusted.

It offers **+5, +10, +15, and +30 minutes**, plus a custom signed whole-minute input. Positive moves later; negative moves earlier. The reference initially proposes +15 minutes. Zero, fractional minutes, and invalid values are not accepted; the reference's custom range is −1439 through +1439 minutes.

### 11.2 Which chores move

A shift applies to every chore that is either:

- Still scheduled to start in the future, even if everyone completed it early; or
- Not yet complete for every assigned child, including overdue and currently scheduled chores.

A chore whose start has arrived or passed and whose assigned children have all finished stays where it is. In particular, a fully completed currently scheduled chore is also left in place.

One child's completion does not exempt a shared chore if another assigned child is still unfinished.

Every included chore gets the same offset on both start and end. Its duration is unchanged. Multiple shifts accumulate; different chores may end up with different total offsets if some became completed history between adjustments.

### 11.3 Preview and apply

Before applying, show the number of affected chores and a list of their titles with old and new start/end times. Old times are visually de-emphasized or struck through, and new times are emphasized. The selected 12-/24-hour format applies.

**Apply shift and close** applies the entire adjustment, saves it, closes the dialog, and moves the main view near Now. The timeline, written times, range clocks, countdown, checkbox time descriptions, and newly evaluated celebration deadlines all use the adjusted times. Clock visibility and color are re-evaluated too: a shifted overdue chore may become running or future, and a different chore may become next up. Compact row heights and the animated layout follow the new state.

If any affected chore would cross the calendar-day boundary, reject the entire shift. Explain which chore causes the problem and disable applying the preview. Do not move the subset that happens to fit. If no eligible chores remain, explain that there is nothing left to shift.

Today’s shifted unfinished chores may overlap the displayed history of completed chores. The parent is allowed to adjust the remaining routine through that history; completed rows need not block the adjustment.

Closing with ×, Escape, a backdrop tap, or Cancel abandons the preview. This differs deliberately from the save-on-close behavior of the two editors.

### 11.4 Undo versus restore

**Undo last shift / Vrátit poslední posun** appears when the most recent shift can be undone. It restores the timing offsets that existed immediately before that shift. This is one level of undo, not a navigable history stack. It does not undo checkmarks or celebrations earned since the shift. Applying another shift creates a new last-shift undo opportunity.

**Restore original times / Obnovit původní časy** appears when the profile currently differs from its regular times. It clears all accumulated time shifts in that profile for today, including on rows that have since been completed. It also clears the last-shift undo opportunity. It preserves all checkmarks and remembered celebrations.

Both recovery actions apply immediately and close the dialog. They can be used even when no further unfinished chores remain. When the schedule is back to its regular times, Restore is no longer offered. After Restore, a new shift starts from the regular schedule.

All daily shifts and undo state survive reloads but expire at the next local date. They do not change another profile, tomorrow's regular schedule, or exported backup times.

### 11.5 Correcting a late completion

A parent can use a time shift to give a child a new opportunity to earn a positive acknowledgment. After dismissing the turtle and waiting for the checkbox to become available, uncheck that child's completed chore. This makes the chore unfinished and eligible for a shift even if all assigned children had previously completed it. Open Menu → Shift times, extend the remaining times enough to cover the child's next check, and apply the shift. Once the checkbox's two-second wait has expired, the child can check it again.

That accepted check evaluates the applicable adjusted deadline as described in section 7.5. A previously saved turtle becomes an ordinary celebration or an on-time finale trophy according to the child's current completion state. An insufficient extension keeps the turtle. The newly earned acknowledgment can be replayed consistently after a reload.

## 12. Date changes, saving, and backups

### 12.1 Daily reset

The app follows the device's local calendar date and clock. A new day is a date change, not a fixed number of hours since the previous completion.

At a local-date change, clear all profiles' daily checkmarks, remembered celebration choices, daily shifts, and shift undo opportunities. Names, colors, preferences, and regular chore definitions remain. An inactive profile must not show yesterday's progress when opened later, and returning from a hidden/backgrounded page must recognize the new date.

Progress is a record for the current day, not a historical diary. The reference has no previous-day reports, streaks, points, or score history.

### 12.2 Saving on the device

The family does not need to press a global Save button after checking a chore or applying a shift. Same-day state and saved configuration survive normal reloads and reopening in the same browser at the same address.

A different browser, device, or site address/port has separate data. There is no cross-device synchronization. Clearing the browser's site data removes the saved setup and daily progress. Parents should be able to use backups to preserve the setup before changing devices or browser data.

If saving is unavailable, show a readable warning rather than claiming that persistence succeeded. The screen should remain useful as far as possible. Unsupported or unreadable existing data must not be silently overwritten with an empty setup; the reference explains that a suitable converted backup must be imported before saving can replace it.

### 12.3 Export

From Settings, **Back up all profiles** downloads one JSON backup containing the shared children, their colors, preferences, and the regular chores, pictures, times, and assignments in all five profiles.

The file contains the setup, not today's completion history. It excludes checkmarks, remembered celebrations, daily time shifts, and shift undo state. Exporting during a delayed evening therefore preserves the regular evening timetable.

The current Settings draft is included if valid; exporting does not itself commit that draft to the app. Invalid draft data produces an explanation instead of a misleading backup.

The reference download is named **daily-profiles.json**. The rewrite can choose its internal representation freely, but the comparison must use equivalent setup data in both versions. A separate conversion step is acceptable where needed; the app does not need built-in migration of the earlier, pre-profile single-routine format.

### 12.4 Import

**Import all profiles** opens a file chooser. A supported valid backup prepares replacement of the whole family setup: all children, shared preferences, and all five profiles. It is not a merge into only the selected profile.

Import remains a draft. Show a persistent notice explaining that closing Settings will replace all profiles and clear daily progress, and that Discard changes cancels the replacement. The parent can inspect or adjust the imported shared settings before applying.

Closing Settings applies the replacement and clears daily checkmarks, celebration choices, shifts, and undo state for all profiles. Discarding leaves the original setup and daily progress unchanged. The current profile selection stays selected rather than unexpectedly changing during import.

A malformed file, unsupported older format, missing required profile, invalid child, overlapping assignment, invalid time, or other validation problem produces an explanatory error. Do not apply a partial import. The reference rejects files larger than 100 KB; supporting larger valid files is not a product regression.

## 13. Fullscreen and keeping the display awake

The Fullscreen button enters fullscreen when supported; pressing it again exits. The schedule, profile menu, editors, icon picker, and celebrations remain usable in fullscreen.

While fullscreen is active and the page is visible, the app attempts to prevent automatic screen sleep. An active indication on the Fullscreen button uses a green border. Exiting fullscreen or hiding/leaving the page stops that attempt; returning to a still-fullscreen page tries to resume it.

If the browser refuses fullscreen, show a brief understandable message and leave the normal interface usable. If keeping the display awake fails or is interrupted, indicate that the screen may turn off, using a warning and changed button state. Tapping the page provides a retry opportunity. Do not falsely indicate active protection after it has stopped.

The keep-awake experience is silent and shows no distracting media. It does not override a person deliberately locking the device. Actual prevention of sleep must be checked on the target tablet; desktop testing alone does not prove the physical device will stay awake.

## 14. Dialogs, accessibility, localization, and offline use

### 14.1 Consistent dialog rules

Dialogs are centered rounded panels over a dimmed page. Their contents can scroll on a short screen. The background cannot be accidentally edited while a dialog is active.

| Surface | Main action | Closing without its main action |
| --- | --- | --- |
| Menu | Select a profile or another workflow | Dismisses only the menu |
| Chores editor | Edit the selected profile | Attempts to save valid changes; Discard abandons them |
| Settings editor | Edit shared settings or stage a backup | Attempts to save valid changes; Discard abandons them |
| Icon picker | Choose a picture for the chore draft | Cancels the picker only, preserving the parent draft |
| Shift times | Apply a preview, Undo, or Restore | Cancels an unapplied preview |
| Celebration | Read/replay the acknowledgment | Tap or Escape dismisses after its initial two-second wait, with completion saved |

Keyboard users can operate buttons and fields, see focus, dismiss with Escape, and move through the active dialog without falling into the background page. Returning from the icon picker restores focus to the originating picture control. Returning to the main screen restores focus to the menu button. During a celebration's first two seconds, Escape is consumed and the celebration stays open. After the wait, Escape dismisses the celebration while the editor underneath stays open with its draft.

Checkboxes have meaningful labels connecting the child, chore, and times. Child progress is understandable without relying only on the width of a colored bar. Unassigned cells and icon-only controls have meaningful names. The currently selected profile and picture are conveyed by more than subtle color alone, through a clear outline/state and accessible labeling.

### 14.2 Language

The app has Czech and English versions with equivalent functionality. Czech labels and examples in this document identify the currently used UI; English equivalents should express the same meaning. There is no in-app language switch in the reference.

Keep parent-entered names and chore titles exactly as user content, apart from normal validation and surrounding-space trimming. Translating the surrounding interface must not rename the family's chores or children.

### 14.3 Old devices and offline use

The Android 4.4 tablet with Firefox 68.11 is a real target, not an optional afterthought. Its core workflows must show the same pictures, schedules, checkboxes, and dialogs as a modern browser. Native device emoji rendering cannot be relied on for recognizable artwork.

The family can use a locally served app over home Wi-Fi without internet access, or an equivalent self-contained offline copy where the browser supports it. A locally served page may still need its local server available for a fresh page load. Once open, timekeeping and interactions continue without an internet connection or a live connection to an account service. Do not promise that every arbitrary browser can reload a locally served page after its server has disappeared.

Browser restrictions on local-file persistence, installed-app behavior, fullscreen, and keeping the display awake should be handled visibly and gracefully. The specification does not require the rewrite to reproduce the old delivery mechanism, only to preserve the practical offline/local-device use case and target-browser usability.

### 14.4 Changes from another open window

When another tab/window changes the same saved setup, the reference refreshes to that saved state, dismisses celebrations, closes stale editing dialogs, and notifies the user. It does not silently save an obsolete open draft over the newer state. This is same-device browser behavior, not a cloud collaboration feature.

## 15. Comparison notes: essential behavior versus incidental reference details

Preserve the product semantics above, including independent profiles, per-child completion, save-on-close versus cancel-on-close, prompt checked feedback, the two-second interaction waits, stable daily choices with deadline-based upgrades, the profile-wide trophy deadline, and today's shift eligibility rules.

The following should not accidentally dictate the rewrite's architecture or perpetuate defects:

- The reference still has evening branding even though it supports the whole day. The branding is descriptive history, not a time restriction.
- The exact typography, colors, icon source, animation counts, visual-transition duration, timing-curve equations, and nonuniform timeline formula are not essential. Their visible purposes—readability, coherent pictures, enjoyable celebrations, content-sized rows, coordinated resizing, and compact but honest timing—are essential. Do not carry over the older always-visible clocks or fixed tall rows as requirements.
- Some written celebration subtitles exist in the reference but are not actually shown. There is no requirement to reproduce text that users cannot see. Preserve the visible hero, message, child/family acknowledgment, and dismissal behavior.
- Daily choices stay stable during replay, and saved turtles can improve when a subsequent check meets the applicable deadline. A previously earned trophy can be replayed even if another chore was subsequently unchecked, and remembered child/family wording can reflect the original achievement. The live counters remain authoritative. A corrected late finale uses the current completion state to choose an ordinary celebration or trophy.
- Editing regular times while a daily shift exists generally retains valid shifts for the surviving chores. The reference can silently drop a retained shift that would become invalid after the edit. This is an edge case to review during comparison, not a requirement to silently change times in the rewrite.
- Header countdown refreshes and positioning are not perfectly smooth in every circumstance. Preserve understandable current/next timing rather than copying incidental refresh artifacts.
- A displayed border or pale background can differ slightly between old and new browser engines. Compare meaning, contrast, touch usability, and alignment rather than requiring pixel-identical rendering.
- The reference's exact filename and backup size cap need not constrain a different implementation. Preserve safe export/import behavior and the ability to transfer equivalent family setup for comparison.

No additional functionality is implied: the baseline has no automatic profile switching, custom profiles, weekday-specific schedules, chores spanning midnight, per-child login, password-protected parent mode, cloud synchronization, task dependencies, untimed checklist mode, push reminders, or historical performance dashboard.

## 16. Side-by-side comparison scenarios

Use a synthetic family and equivalent chore definitions in both apps. Control the device time consistently for time-boundary scenarios. Use distinct browser storage for each app so a comparison cannot overwrite the family's real setup. The following are observable acceptance cases, not a prescription for how to automate them. Allow the checkbox and celebration two-second waiting periods to expire in ordinary workflows. Cases that specifically exercise repeated taps should attempt the action during the wait.

| ID | Action or situation | Expected observation |
| --- | --- | --- |
| START-1 | Open a fresh setup | Two placeholder children, empty Evening profile, 24-hour clock, celebrations enabled, Add chores action |
| START-2 | Open each of the other four profiles | Each is independently empty; no invented default chores or completion celebration |
| START-3 | Restart after selecting Morning | Morning is still selected |
| VIEW-1 | Display shared and child-specific chores | One row per chore; separate child boxes; dashes for unassigned children; timing group appears only when relevant |
| VIEW-2 | Check only one child's box on a shared chore | Only that child's progress changes; shared chore is not light green; an overdue clock remains visible while another child is unfinished |
| VIEW-3 | Check all assigned boxes, then uncheck one | Shared completion green appears, then disappears |
| VIEW-4 | Advance through an unchecked chore's start/end | No automatic completion green or celebration; the running clock changes to pale red when its end arrives |
| VIEW-5 | Compare a five-minute clockless chore and an hour-long chore | Short row has no unused clock space; both fit their visible content, and the hour does not use twelve times the screen height |
| VIEW-6 | Use a long gap and overlapping chores for different children | Gap duration is explicit; overlapping chores remain separate readable rows at their appropriate heights |
| VIEW-7 | Show a visible clock for a range crossing the top of the face | The forward sector and written times agree, for example 18:50–19:10 |
| VIEW-8 | Scroll vertically, horizontally, and tap Now | Child headings align; phone users can reach child boxes; Now navigates sensibly after height changes |
| VIEW-9 | Advance from future to next, running, and overdue | Timing details appear only in the relevant states; overdue sector becomes pale red without reloading |
| VIEW-10 | Complete the last remaining child on a past chore, then undo | Clock and times fade out and the row shrinks; undo reveals them in red and expands the row again |
| VIEW-11 | Fully complete a future chore or create tied next start times | Completed future chores are skipped; all tied next unfinished chores show details |
| VIEW-12 | Compare the icon, title, and child checkbox in a fully visible short row such as Prayer | Large icon has its own left column; icon and title block share the row's vertical center with the checkbox |
| VIEW-13 | Use a long wrapped title in a short chore, with and without a visible clock | Row expands enough for every line and control; no text overlaps the icon, clock, checkbox, or next row |
| VIEW-14 | Watch the middle of a row's growth or shrink transition | Height changes gradually; following rows, time labels, grid lines, and Now move together rather than jumping to unrelated positions |
| VIEW-15 | Finish a currently running chore early, then advance to its end | Clock stays visible and green while running; hides and row compacts at the end if everyone remains done |
| VIEW-16 | Keep one chore running while another is next up, with several overdue chores | All running, next-up, and overdue unfinished timing groups can be visible together |
| VIEW-17 | Observe an unfinished chore exactly at its end, then check it at that same instant | The clock can be red at the end boundary; fresh exact-end completion still receives an on-time acknowledgment |
| VIEW-18 | Enable reduced motion and change clock visibility | Correct compact/expanded final layout appears without a fade, slide, or row-motion transition |
| VIEW-19 | Resize a phone/tablet or change orientation with a long title and visible timing details | Heights are recalculated for the available width, content stays centered, and all columns and time labels remain aligned |
| VIEW-20 | Disable little celebrations, then change another available checkbox while a row is resizing | That checkbox responds independently and rows settle to the latest state with aligned clocks and content |
| MENU-1 | Open the menu | Five illustrated profile tiles appear directly, followed by Shift times, Chores, Settings |
| MENU-2 | Select profiles by both picture and text | Both targets work, selection is highlighted, menu closes |
| PROFILE-1 | Check a box and shift times in Morning, then open Evening | Morning state does not leak into Evening |
| PROFILE-2 | Return to Morning, reload, and reopen | Morning's valid daily state survives |
| PROFILE-3 | Use matching chore names in two profiles | Their checkboxes, rewards, shifts, and totals remain independent |
| CHECK-1 | Complete an ordinary chore early or exactly at its end | Positive celebration, completion counted |
| CHECK-2 | First complete an ordinary chore after its end | Friendly turtle; completion still counted |
| CHECK-3 | Uncheck a chore | No new celebration; progress decreases; daily reward is retained |
| CHECK-4 | Check a chore on the old tablet, including a large routine | The checked box and count visibly acknowledge the tap before the celebration; unrelated rows are not visibly refreshed |
| CHECK-5 | Open Menu, switch profiles, or hide the page before the celebration opens | The queued overlay is canceled and the accepted completion stays saved |
| CHECK-6 | Repeatedly tap a checked box and its surrounding touch target during the first two seconds | One completion is saved, the box stays checked, and ignored taps neither queue an undo nor extend the wait |
| CHECK-7 | After the wait, uncheck and immediately try to check the same box again | Undo updates progress at once, with a new two-second wait before rechecking |
| CHECK-8 | Disable little celebrations and change another child's box or a different chore during the first box's wait | Each checkbox responds independently with its own two-second wait |
| CHECK-9 | Redraw the timetable or leave and return to a profile during a checkbox's wait | The checkbox keeps its accepted state and the remaining wait |
| REPLAY-1 | Check, dismiss, uncheck, recheck, and reload | Same ordinary daily picture, message variant, and animation arrangement |
| REPLAY-2 | Replay an ordinary on-time achievement after its deadline | Does not newly become a turtle merely because of replay time |
| REPLAY-3 | Receive a turtle, uncheck, extend the chore's deadline, and recheck on or before its adjusted end | Ordinary positive celebration uses the remembered daily theme and replays consistently after reload |
| REPLAY-4 | Repeat the correction with an extension that leaves the next check after the adjusted end | Same turtle-message variant is replayed |
| REPLAY-5 | Correct a late finale while the child still has another unfinished chore | An on-time ordinary recheck earns a positive celebration for that chore |
| REPLAY-6 | Apply, undo, or restore shifts without rechecking a chore | Existing acknowledgments stay saved and the adjusted deadline is evaluated on the next accepted check |
| FINAL-1 | Complete an earlier-deadline chore last, before the profile's latest end | Trophy takes priority over that chore's individual lateness |
| FINAL-2 | Make the profile's latest chore belong only to another child | Trophy deadline still uses the entire profile's latest end |
| FINAL-3 | First finish all at the exact profile end, then repeat with a fresh setup one second later | Exact end earns trophy; fresh completion after the end earns turtle |
| FINAL-4 | The last checkbox previously had an ordinary turtle cached | Newly earned on-time finale can become a trophy |
| FINAL-5 | Finish every child's assigned boxes | Family completion is acknowledged within this profile only |
| FINAL-6 | Replay an earned trophy later that same day | Earned trophy remains replayable |
| FINAL-7 | Open an empty profile or a child with no assigned chores | No automatic trophy; 0/0 remains understandable |
| FINAL-8 | Receive a late finale, uncheck, extend the profile deadline, then check the final remaining chore by that end | Saved turtle upgrades to an earned trophy that remains replayable after reload |
| CELEBRATE-1 | Leave a celebration open longer than its animation | Readable message stays; background boxes cannot be accidentally activated |
| CELEBRATE-2 | After two seconds, tap the backdrop or press Escape | The celebration dismisses with completion saved, and the page or editor underneath keeps its state |
| CELEBRATE-3 | Disable automatic celebrations, then check and preview | Check uses a small text acknowledgment; manual preview remains usable |
| CELEBRATE-4 | Compare daytime and Evening moon/finale messages | Daytime is neutral; Evening may retain bedtime language |
| CELEBRATE-5 | Tap the card, dismiss button, backdrop, and Escape during the first two seconds after opening | The message stays visible and the wait continues from the original opening time |
| CELEBRATE-6 | Make an early dismissal attempt, then wait longer than two seconds without another action | The celebration stays open until a fresh dismissal action |
| CELEBRATE-7 | Show a celebration after a slow checkbox response, then try to dismiss it immediately | Its own two-second wait starts at opening, independently of the checkbox's wait |
| CELEBRATE-8 | Preview a celebration in Settings and attempt an early dismissal | The same two-second protection applies, then dismissal returns to the Settings draft |
| EDIT-1 | Add a chore to each empty profile | Suggested starts are 07:00, 09:00, 12:00, 15:00, 18:00; no time restriction follows from the label |
| EDIT-2 | Add, rename, retime, assign, and remove chores, then close normally | Entire valid draft saves to only the selected profile |
| EDIT-3 | Change several fields and choose Discard | No draft change is committed |
| EDIT-4 | Try blank names, missing assignments, zero duration, midnight crossing, or same-child overlap | Dialog remains open with a useful explanation; no partial save |
| EDIT-5 | Give different children simultaneous chores | Valid; timetable remains readable |
| ICON-1 | Open the picker, filter Health, choose medicine, then return | Large labeled pictures; active choice visible; draft fields survive the picker |
| ICON-2 | Cancel the picker or discard the Chores editor | Cancel preserves prior picture; parent discard also abandons a selected draft picture |
| SETTINGS-1 | Rename a child, choose a light/dark color, and change clock format | Shared changes appear in all profiles with readable ticks and correct times |
| SETTINGS-2 | Add a child | New column exists, but old chores are not automatically assigned to them |
| SETTINGS-3 | Remove the sole assignee of a chore in another profile | Saving is blocked and the affected routine/chore can be identified |
| SHIFT-1 | Preview +10 on a future, active, overdue, partially complete, and completed-history mix | Future or not-fully-complete chores move; fully completed started chores stay |
| SHIFT-2 | Complete a future chore early, then shift before its start | It still moves because it is future |
| SHIFT-3 | Apply a shift | Start and end move together; durations, checkmarks, and other profiles are preserved |
| SHIFT-4 | Close a shift preview without applying | No timing change |
| SHIFT-5 | Apply several shifts with a completion between them, then Undo | Prior offsets return; later completion remains; no repeated-history undo stack |
| SHIFT-6 | Apply several shifts, then Restore original times | All current profile offsets clear, including completed rows; progress/rewards remain; undo clears |
| SHIFT-7 | Try a shift that makes one chore cross midnight | Entire adjustment is rejected, with no partly moved routine |
| SHIFT-8 | Shift incomplete rows through completed history | Allowed even if the effective display overlaps completed history |
| SHIFT-9 | Reach the original finale end while a shift extended it | A fresh finale uses the shifted end and can still earn a trophy |
| SHIFT-10 | Shift an overdue unfinished chore so it becomes running or future, then Undo or Restore | Clock visibility and green/red sector update using the effective times; rows resize and the time axis stays aligned |
| DATE-1 | Cross local midnight with the app open | Daily boxes, rewards, shifts, and undo clear; the configured setup remains |
| DATE-2 | Leave a profile unopened overnight and return to it | Yesterday's daily state does not reappear |
| BACKUP-1 | Export while daily shifts and checked boxes exist | Backup contains all regular schedules/shared settings, without daily progress or shifts |
| BACKUP-2 | Export a valid unsaved Settings draft, then discard | Export reflects that draft; discarding leaves live settings unchanged |
| BACKUP-3 | Stage an import, then discard | Original setup and daily state remain unchanged |
| BACKUP-4 | Stage a valid import and close Settings | All profiles/shared setup are replaced; daily state clears; current profile stays selected |
| BACKUP-5 | Choose a malformed, older unsupported, or invalid backup | Useful error; no partial replacement |
| STORAGE-1 | Reopen at the same address, then compare a different browser/address | Same location restores its own data; other locations do not pretend to synchronize |
| STORAGE-2 | Existing unsupported data or unavailable saving | Visible warning; existing data is not silently replaced |
| STORAGE-3 | Another open tab saves while an editor is open | Reference reloads saved state, closes the stale editor, and notifies the user |
| FULL-1 | Enter fullscreen, switch profiles, edit chores, and show a celebration | All flows remain usable without leaving fullscreen |
| FULL-2 | Wait beyond the tablet's normal screen timeout in fullscreen, then exit | Display stays awake when supported, and ordinary sleep behavior can resume after exit |
| FULL-3 | Refuse or interrupt keep-awake/fullscreen support | Clear warning/state; ordinary app remains usable; retry is possible |
| ACCESS-1 | Use keyboard navigation and Escape through menu, editors, picker, and celebration | Focus remains meaningful; only the topmost interaction closes; correct save/cancel rules apply |
| ACCESS-2 | Enable reduced motion | Celebrations remain readable; conditional clocks and content-sized rows reach the correct final layout without distracting movement |
| DEVICE-1 | Repeat core workflows in Firefox 68.11 on the old tablet and a modern browser | Pictures, timing, boxes, dialogs, and saving remain usable and equivalent |
| DEVICE-2 | Use a narrow phone and a tablet in both orientations | No clipped dialog actions, unusably small boxes, or misaligned child columns |
| OFFLINE-1 | Open the app without internet, then disconnect the local server after loading | Already loaded timekeeping and local interactions remain functional |

For a comparison report, record each case as equivalent, intentionally improved, regressed, or not yet implemented. Keep functional differences separate from deliberate visual restyling. A prettier screen does not compensate for losing a checkbox, shifting the wrong profile, changing the save/cancel contract, or awarding the wrong finale.
