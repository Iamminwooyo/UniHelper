import "./Search.css";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ onSearchChange }) => {
  return (
    <div className="searchbar_layout">
      <FaSearch className="searchbar_icon" />
      <input
        type="text"
        placeholder="검색"
        className="searchbar_input"
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
