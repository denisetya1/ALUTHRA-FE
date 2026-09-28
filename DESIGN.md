# ALUTHRA admin design direction

## Design read

Reading this as: an internal game administration portal for ALUTHRA operators, using a clean light and dark interface with restrained game-world identity. Dial: ENERGY 1 / RHYTHM 1 / MOTION 1.

## Identity

The repeated realm mark is a circular `A` monogram. It connects the login sigil to the authenticated workspace without adding a new logo asset or decorative fantasy symbols.

## Decisions

- **Color:** blue identifies selected navigation and primary actions because operators need one reliable action color; neutral surfaces keep dense game data readable.
- **Layout:** persistent navigation and content-first tables support repeated administration tasks; each screen keeps one page heading and one primary action as its focal point.
- **Typography:** Outfit stays the default because its rounded geometry fits the game's friendly fantasy interface while remaining legible in dense tables and forms.
- **Spacing:** compact navigation and a restrained spacing scale prioritize data density; larger gaps separate page-level sections from related controls.
- **Surfaces:** cards, inputs, and tables stay flat because they belong to the page plane; only dialogs use a strong shadow because they sit above and temporarily block the workspace.
- **Icons:** one consistent line-icon family is used only for navigation and actions. Each glyph describes its destination, such as a scroll for quests, panels for cards, a package for items, and users for players.
- **Motion:** interaction feedback is limited to hover, focus, and short state transitions. The loading spinner is functional and respects reduced-motion preferences.
- **Empty states:** each empty state names what is missing and tells the operator which existing action will populate the screen.
- **Themes:** light is the neutral default for long administration sessions; dark remains an equal user-controlled option.

## Identity check

The realm monogram, game-world information hierarchy, and content-specific navigation keep this workspace tied to ALUTHRA even if the product wordmark is temporarily hidden.
