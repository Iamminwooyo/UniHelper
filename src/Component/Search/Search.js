import "./Search.css";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";

const SearchBar = ({ onSearchChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() === "") {
      onSearchChange?.("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchChange?.(inputValue.trim());
    }
  };

  return (
    <div className="searchbar_layout">
      <FaSearch className="searchbar_icon" />
      <input
        type="text"
        placeholder="검색"
        className="searchbar_input"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchBar;