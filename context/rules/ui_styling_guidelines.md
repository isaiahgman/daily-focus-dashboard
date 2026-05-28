# UI Styling Guidelines

This document provides agents with strict rules for maintaining a consistent, premium terminal aesthetic across the Terminal Multiverse.

## Color Palette (chalk)
- **Primary Accent:** `chalk.cyan` or `chalk.cyanBright` for highlights, selected items, and key labels.
- **Secondary Accent:** `chalk.magentaBright` for secondary emphasis and decorative elements.
- **Success/Positive:** `chalk.greenBright` for confirmations and successful operations.
- **Warning/Caution:** `chalk.yellow` for warnings and non-critical alerts.
- **Error:** `chalk.red` or `chalk.redBright` for errors and failures.
- **Muted/Disabled:** `chalk.gray` or `chalk.dim` for disabled options, secondary text, and instructions.
- **Headers/Titles:** `chalk.bold.whiteBright` or `chalk.bold.cyanBright` for prominent headings.

## Boxen Settings
- All module headers and title screens MUST use `boxen` with consistent settings:
  - `padding: 1`
  - `margin: { top: 1, bottom: 1 }`
  - `borderStyle: 'round'`
  - `borderColor: 'cyan'`
- Do not mix border styles across modules. Every module should feel like part of the same application.

## Menu & Prompt Formatting
- Instruction indicators MUST be clearly visible and use a consistent format:
  - Navigation: `chalk.dim('[↑/↓] Navigate')`
  - Selection: `chalk.dim('[Enter] Select')`
  - Quit/Back: `chalk.dim('[q] Quit')`
- Menu items should use `chalk.cyanBright('▸')` as the active selection indicator.
- Inactive menu items should use `chalk.dim('  ')` (two spaces) for alignment.

## Screen Clearing
- Use `console.clear()` or the shared `clearScreen()` utility before rendering new frames or screens.
- Never leave stale output from a previous module visible when transitioning between modules.

## General Principles
- The terminal experience should feel **premium and cohesive**. Every module is part of the same "Multiverse" brand.
- Avoid raw unstyled `console.log` output in runners. All visible text must pass through `chalk` for styling.
- Maintain neat vertical alignment. Use padding and spacing to prevent cramped layouts.
