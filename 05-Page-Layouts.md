# Plain English Converter: UI/UX Documentation

## 5. Page Layouts & Wireframes

This section provides a structural overview of the main application page. It describes the layout and arrangement of components, serving as a blueprint for the final design.

---

### 5.1 Main Page Layout

The application is a single-page interface, with a responsive design that adjusts for desktop and mobile devices.

#### High-Level Structure

```
+------------------------------------------------------+
|                      Header                          |
+------------------------------------------------------+
|                                                      |
|                  Hero Section                        |
|                                                      |
+------------------------------------------------------+
|                                                      |
|           Main Converter Interface (2-col)           |
|                                                      |
+------------------------------------------------------+
|                                                      |
|                 Features Section                     |
|                                                      |
+------------------------------------------------------+
|                      Footer                          |
+------------------------------------------------------+
```

On desktop, a sidebar for **History** can be revealed on the left, pushing the main content to the right.

---

### 5.2 Section Breakdown

#### 1. Header

*   **Position:** Sticky at the top of the page.
*   **Content (Left to Right):**
    1.  **History Toggle:** (Mobile) An icon button to open the history sheet. (Desktop) A button to open the persistent sidebar.
    2.  **Logo:** "Plain English" text.
    3.  **Search Bar:** A prominent search input field to search through history or chat conversations.

#### 2. Hero Section

*   **Position:** Below the header.
*   **Content (Centered):**
    1.  **Pill Badge:** A small, decorative badge with the text "From Complex to Clear".
    2.  **Main Heading (H1):** "Converts Jargon into Plain English with AI."
    3.  **Subheading:** "Simplify legal, medical, and technical documents instantly."

#### 3. Main Converter Interface

*   **Layout:** A two-column grid on desktop, which stacks vertically on mobile.
*   **Left Column (Input Card):**
    1.  **Card Header:** Title ("Source Material"), and toggles for Text, Vision, and Voice modes. A "Clear" button appears when there is content.
    2.  **Card Content:**
        *   If in "Text" mode: A large `Textarea` for user input. Below it are character/word counts.
        *   If in "Vision" mode: An upload area for images, which shows a preview once a file is selected.
    3.  **Card Footer:** Contains the main controls:
        *   **Persona Selector:** Dropdown to choose a conversion style (e.g., ELI5, Professional).
        *   **Language Selector:** Dropdown to choose a language.
        *   **Simplify Button:** The primary call-to-action.
*   **Right Column (Output Card):**
    1.  **Card Header:** Title ("Simplified Output") and action icons (e.g., "Copy", "Listen").
    2.  **Card Content:**
        *   **Default State:** A placeholder with an icon (`BookOpen`) and text "Ready for conversion".
        *   **Loading State:** `Skeleton` placeholders are shown.
        *   **Error State:** An error message is displayed.
        *   **Success State:** The simplified text or image analysis is displayed.
    3.  **Card Footer (Clarification Chat):** Appears after a successful conversion.
        *   An input field for asking follow-up questions.
        *   A "Send" button.

#### 4. Features Section

*   **Layout:** A responsive "Bento Grid" layout.
*   **Content:** A collection of visually distinct cards that highlight key features like "Clarity Score", "Latency", "Universal Understanding", and "Format Support".

#### 5. Footer

*   **Position:** At the bottom of the page.
*   **Content:** Copyright notice and links to "Privacy" and "Terms".

---

### 5.3 History Panel

*   **Layout (Desktop):** A persistent sidebar that can be toggled open or closed. When open, it pushes the main content.
*   **Layout (Mobile):** A sheet that slides in from the left, covering the main content.
*   **Content:**
    1.  **Header:** "New Simplification" button.
    2.  **List:** A scrollable list of recent conversions. Each item shows the original text and the persona used.
    3.  **Footer:** A "Clear History" button.
