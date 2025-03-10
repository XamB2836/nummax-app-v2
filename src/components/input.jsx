"use client";

import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";


// ==================================================================================================================
// * Fonctions

// Normalisation des options du select
const normalizeOptions = (options) => {
  if (Array.isArray(options)) return options;
  if (typeof options === "object") {
    return Object.entries(options).map(([key, value]) =>
      Array.isArray(value) ? [key, value] : { id: key, label: value }
    );
  }
  return [];
};

// ==================================================================================================================
// * Composantes

// Composant pour afficher une <option>
const OptionRenderer = ({ option }) => (
  typeof option === "string" ?
    <option value={option}>{option}</option> :
    <option value={option.id}>{option.label || option.id}</option>
);

OptionRenderer.propTypes = {
  option: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ id: PropTypes.string, label: PropTypes.string }),
  ]).isRequired,
};



// ==================================================================================================================
// * Composante MetricInput
export const MetricInput = ({ value, onChange, label, increments = 1, error = false }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleValueChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  }, [onChange]);

  return <div className={`input-wrapper ${error ? 'error' : ''}`}>
    <label>{label} (mm)</label>
    <input
      type="number"
      value={inputValue}
      onChange={handleValueChange}
      placeholder="Ex: 1120"
      step={increments}
      min={0}
    />
  </div>
};

MetricInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  increments: PropTypes.number,
  error: PropTypes.bool,
};

// ==================================================================================================================
// * Composante SelectorInput
export const SelectorInput = ({ value, onChange, options = [], label, error = false }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleValueChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const normalizedOptions = normalizeOptions(options);

  return <div className={`input-wrapper ${error ? 'error' : ''}`}>
    <label>{label}</label>
    <select value={inputValue} onChange={handleValueChange}>
      {normalizedOptions.map((option, index) =>
        Array.isArray(option) ? (
          <optgroup key={index} label={option[0]}>
            {option[1].map((subOption, subIndex) => (
              <OptionRenderer key={subIndex} option={subOption} />
            ))}
          </optgroup>
        ) : (
          <OptionRenderer key={index} option={option} />
        )
      )}
    </select>
  </div>;
};

SelectorInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]).isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.bool,
};