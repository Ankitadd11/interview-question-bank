function FileSelect({
  files,
  value,
  onChange,
  loading,
  category
}) {
  const getPlaceholder = () => {
    if (!category) {
      return "Select a category first";
    }

    if (loading) {
      return "Loading files...";
    }

    if (files.length === 0) {
      return "No files found";
    }

    return "Select a file";
  };

  return (
    <div className="form-group">
      <label htmlFor="file">
        File
      </label>

      <select
        id="file"
        value={value}
        onChange={event =>
          onChange(event.target.value)
        }
        disabled={
          !category ||
          loading ||
          files.length === 0
        }
        required
      >
        <option value="">
          {getPlaceholder()}
        </option>

        {files.map(file => (
          <option
            key={file.value}
            value={file.value}
          >
            {file.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FileSelect;