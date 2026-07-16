import { useTranslation } from 'react-i18next';

export default function SearchBar({ search, setSearch, sort, setSort, setPage }) {
  const { t } = useTranslation();

  return (
    <div className="search-sort">
      <input
        type="text"
        placeholder={t('shop.search.placeholder')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="popularite">{t('shop.sort.popularity')}</option>
        <option value="price-asc">{t('shop.sort.priceAsc')}</option>
        <option value="price-desc">{t('shop.sort.priceDesc')}</option>
      </select>
    </div>
  );
}