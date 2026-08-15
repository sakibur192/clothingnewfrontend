// ============================================================
// COMBOBOX
// ============================================================
// A text input with a dropdown of preloaded options (color/size
// presets) that ALSO accepts free typed input for a brand-new
// value not in the list yet - "preloaded that can be selected and
// also can be input."
// ============================================================

import { useState, useRef, useEffect } from "react";

export default function ComboBox({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes((value || "").toLowerCase()));

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="combobox-dropdown">
          {filtered.map((option) => (
            <div
              key={option}
              className="combobox-option"
              onMouseDown={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
