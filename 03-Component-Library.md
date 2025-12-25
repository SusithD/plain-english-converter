# Plain English Converter: UI/UX Documentation

## 3. Component Library

This section provides a detailed breakdown of the UI components used in the Plain English Converter application. Each component is documented with its purpose, variants, states, and usage.

---

### 3.1 Button

**Purpose:** Buttons are used for all interactive actions in the UI.

#### Variants

1.  **Primary Action Button:**
    *   **Description:** The main call-to-action button, used for "Simplify" and "Analyze Image".
    *   **Visuals:** White background, black text.
    *   **States:**
        *   **Default:** White background.
        *   **Hover:** Light gray background (`bg-neutral-200`).
        *   **Disabled:** Opacity is reduced, and the action is blocked.

2.  **Ghost Button:**
    *   **Description:** A transparent button with a subtle hover effect, used for secondary actions like "Copy", "Delete", "Open", and icon buttons.
    *   **Visuals:** Transparent background, neutral text color.
    *   **States:**
        *   **Default:** Transparent background.
        *   **Hover:** `bg-neutral-800` background.
        *   **Active/Toggled:** Can have a colored background (e.g., blue for "Listen", green for "Copied").

3.  **Destructive Button:**
    *   **Description:** Used for actions that cause data loss, like "Clear History" or "Delete".
    *   **Visuals:** Usually has a red text color.
    *   **States:**
        *   **Default:** Red text (`text-red-400`).
        *   **Hover:** Red background (`hover:bg-red-400/10`).

---

### 3.2 Card

**Purpose:** Cards are the main containers for content sections.

#### Variants

1.  **Main Card:**
    *   **Description:** Used for the main input and output areas.
    *   **Visuals:** Dark background (`bg-neutral-900/50`), subtle border (`border-neutral-800`), and a `CardHeader` and `CardContent` section.
    *   **States:**
        *   **Default:** Standard border color.
        *   **Hover:** Border color changes to `border-neutral-700`.

2.  **Feature Card (Bento Grid):**
    *   **Description:** Used in the features section to highlight key aspects of the application.
    *   **Visuals:** Varies in color and content, often with a colored background (`bg-purple-500/10`) and border.
    *   **States:**
        *   **Hover:** Background color or scale may change slightly.

---

### 3.3 Select (Dropdown)

**Purpose:** Used to allow users to choose from a list of options, such as the conversion persona or language.

#### Components
*   `SelectTrigger`: The element that the user clicks to open the dropdown.
*   `SelectContent`: The container for the list of options.
*   `SelectItem`: A single option within the list.

#### States
*   **Default:** Shows the currently selected value.
*   **Open:** `SelectContent` is displayed, showing all `SelectItem` options.
*   **Hover (on Item):** The background of the `SelectItem` changes (`focus:bg-neutral-800`).

---

### 3.4 Textarea

**Purpose:** The main input field for the user to paste their text.

#### States
*   **Default:** Shows the placeholder text.
*   **Focused:** The focus ring is not explicitly visible (`focus-visible:ring-0`) to maintain a clean look, as the cursor indicates the active state.
*   **Filled:** The user's input text is displayed.

---

### 3.5 Skeleton

**Purpose:** Used as a loading state placeholder for the output card content while the AI is processing the text. This provides a better user experience than a simple spinner.

**Visuals:** A series of gray, shimmering bars (`bg-white/5`) that mimic the structure of text.

---

### 3.6 Sheet

**Purpose:** A slide-out panel used for displaying the history of conversions on mobile devices.

#### Components
*   `SheetTrigger`: The button that opens the sheet.
*   `SheetContent`: The content of the slide-out panel.

**Behavior:**
*   On mobile, tapping the "History" icon slides the `SheetContent` in from the left.
*   The sheet can be closed by tapping an overlay or a close button.

---

### 3.7 Toast

**Purpose:** To provide brief, non-intrusive feedback to the user after an action.

#### Variants
1.  **Success:**
    *   **Visuals:** Green icon and border.
    *   **Usage:** For successful actions like "Copied to clipboard".
2.  **Error:**
    *   **Visuals:** Red icon and border.
    *   **Usage:** For failed actions.
3.  **Info:**
    *   **Visuals:** Blue icon and border.
    *   **Usage:** For general information, like "Opened history item".

**Behavior:**
*   Appears at the bottom-right of the screen.
*   Disappears automatically after 3 seconds.
*   Can be dismissed manually by clicking the close icon.
