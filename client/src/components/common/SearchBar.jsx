import { Search } from 'lucide-react'

export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-wrap">
      <Search size={15} className="search-icon" />
      <input
        type="search"
        className="search-bar"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
