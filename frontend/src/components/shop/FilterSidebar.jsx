export default function FilterSidebar({ filters, activeFilter, onChangeFilter }) {
  return (
    <div className="filters">
      {filters.map((item) => (
        <button
          key={item}
          type="button"
          className={activeFilter === item ? "active" : ""}
          onClick={() => onChangeFilter(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}