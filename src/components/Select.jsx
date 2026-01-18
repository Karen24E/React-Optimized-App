import React from "react";
 
export default function SelectField({
  placeholder,
  options,
  value,
  onSelect,
}) {
  return (
<label style={{ display: "block", marginBottom: "1rem" }}>
<select
        value={value}
        onChange={(e) => onSelect(e.target.value)}
>
        
<option value="">{placeholder}</option>
        {options.map((option) => (
<option key={option} value={option}>
            {option}
</option>
        ))}
</select>
</label>
  );
}