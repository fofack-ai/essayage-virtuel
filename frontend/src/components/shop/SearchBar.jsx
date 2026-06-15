export default function SearchBar({ search, setSearch, sort, setSort, setPage }) {
  return (
    <div className="search-sort">
      <input
        type="text"
        placeholder="Rechercher une tenue..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="popularite">Popularité</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
      </select>
    </div>
  );
}