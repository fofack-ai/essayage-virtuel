import React from "react";

export default React.memo(function Field({ label, ...props }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
});