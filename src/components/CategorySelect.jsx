function CategorySelect({
  categories,
  value,
  onChange,
  loading
}) {
  return (
    <div className="form-group">
      <label htmlFor="category">
        Category
      </label>

      <select
        id="category"
        value={value}
        onChange={event =>
          onChange(event.target.value)
        }
        disabled={loading}
        required
      >
        <option value="">
          {loading
            ? "Loading categories..."
            : "Select a category"}
        </option>

        {categories.map(category => (
          <option
            key={category.value}
            value={category.value}
          >
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CategorySelect;