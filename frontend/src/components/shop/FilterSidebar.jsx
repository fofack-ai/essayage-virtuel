export default function FilterSidebar({ filters, activeFilter, onChangeFilter }) {
  return (
    <div className="filters">
      {filters.map((item) => {
        const label = typeof item === 'object' ? item.label : item;
        const value = typeof item === 'object' ? item.value : item;
        return (
          <button
            key={value}
            type="button"
            className={activeFilter === value ? "active" : ""}
            onClick={() => onChangeFilter(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}