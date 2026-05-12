# dhirender's notes

a minimal notes app built with react native and expo. clean indigo and slate ui, two views, no navigation library.

---


| | | | |
|---|---|---|---|
| <img width="100" src="https://github.com/user-attachments/assets/8a875551-7076-4e71-ab32-9be11a71e633" /> | <img width="100" src="https://github.com/user-attachments/assets/63435603-0c33-41c3-84cb-f6f6ab3271bc" /> | <img width="100" src="https://github.com/user-attachments/assets/ed07b38e-5699-4493-9119-be4a3f4d3247" /> | <img width="100" src="https://github.com/user-attachments/assets/1c49a266-f2c3-42cb-bc7f-af1ecea68594" /> |



## screens

**view 1 .. notes list**

- flatlist of all notes
- each card shows title, preview, and date
- search bar filters notes in real time
- tap a card to edit it
- tap the three dots on a card to open the note menu (edit, delete, cancel)
- note count shown under the title
- floating + button to create a new note
- dark/light toggle with smooth slide animation
- 2-column grid on tablets

**view 2 .. editor**

- imagebackground header .. swaps between dark and light image based on theme
- title input and multiline body input
- keyboard avoiding view so the keyboard never covers the inputs
- save button disabled until title is filled
- shows "update" instead of "save" when editing an existing note

---

https://github.com/user-attachments/assets/64ec610c-c113-4e36-ad5f-51736cc3cdeb

## components and hooks used

- `flatlist` .. note list with search filtering
- `textinput` .. search bar, note title, note body
- `pressable` .. all buttons, cards, toggle, menu items
- `switch` .. replaced with custom animated toggle using `animated.timing`
- `keyboardavoidingview` .. editor screen
- `imagebackground` .. editor header
- `modal` .. note menu popup
- `safeareaview` .. all screens
- `usecolorscheme` .. detects system dark/light mode
- `usewindowdimensions` .. responsive layout, 2-column grid on tablets
- `usesafeareainsets` .. positions fab above home bar
- `stylesheet.create` .. all styles live in `src/app/styles/notes.ts`
- `stylesheet.compose` .. merges base card style with tablet variant
- `stylesheet.flatten` .. reads fontsize from titleinput for maxfontsizemultiplier
- `stylesheet.hairlinewidth` .. 1 physical pixel dividers

---

## file structure

```
src/app/
  index.tsx              .. both views, all state and logic
  _layout.tsx            .. safeareavrovider + headerless stack
  styles/
    notes.ts             .. all stylesheets, theme tokens
  components/
    Icons.tsx            .. svg icons via react-native-svg

assets/
  header-bg.jpg          .. dark header image for editor
  header-bg-light.jpg    .. light header image for editor
```

---

## setup

```bash
npm install
npx expo start
```

requires `react-native-svg` .. already in package.json.

---

## improvements added beyond requirements

- animated custom toggle .. no native switch flicker
- vertical three-dot svg icon on each card
- centered fade-in popup menu instead of system alert
- note count in header
- "update" vs "save" label based on edit state
- premium indigo and slate theme colors .. easier on the eyes
- tablet responsive grid with `usenwindowdimensions`
