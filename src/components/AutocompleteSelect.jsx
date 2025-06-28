import React, { useState, useRef, useEffect } from 'react';
/*
const countries = [
  { value: 'mx', label: 'México' },
  { value: 'co', label: 'Colombia' },
  { value: 'ar', label: 'Argentina' },
  { value: 'es', label: 'España' },
]; */

const AutocompleteSelect = ({ options, onChange, value, placeholder = "Selecciona una opción..." }) => {
    const [inputValue, setInputValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);

    // Filtra las opciones al escribir
    useEffect(() => {
        const filtered = options.filter(opt =>
            opt.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [inputValue, options]);

    useEffect(() => {
        if (value) {
            const found = options.find(opt => opt.value === value);
            if (found) {
                setSelectedOption(found);
                setInputValue(found.label);
            }
        }
    }, [value, options]);


    // Cierra si haces clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                if (!options.some(opt => opt.label === inputValue)) {
                    setInputValue('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputValue, options]);

    const handleSelect = (option) => {
        setSelectedOption(option);
        setInputValue(option.label);
        setIsOpen(false);
        onChange?.(option);
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
        setIsOpen(true);
    };

    return (
        <div style={{ position: 'relative', width: '300px' }} ref={dropdownRef}>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                }}
            />
            {isOpen && filteredOptions.length > 0 && (
                <ul
                    style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: '4px 0',
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        zIndex: 10,
                    }}
                >
                    {filteredOptions.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                                backgroundColor:
                                    selectedOption?.value === option.value ? '#eee' : 'white',
                            }}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteSelect;
