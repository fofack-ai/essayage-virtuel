import React, { useEffect, useState } from "react";

export default React.memo(function SwitchLine({ title, desc, checked, onChange }) {
  const [localOn, setLocalOn] = useState(Boolean(checked));

  useEffect(() => {
    setLocalOn(Boolean(checked));
  }, [checked]);

  const toggle = () => {
    const next = !localOn;
    setLocalOn(next);
    if (onChange) onChange(next);
  };

  return (
    <div className="switch-row">
      <div>
        <b>{title}</b>
        {desc && <p className="muted">{desc}</p>}
      </div>
      <button type="button" className={`switch ${localOn ? "on" : ""}`} onClick={toggle} />
    </div>
  );
});