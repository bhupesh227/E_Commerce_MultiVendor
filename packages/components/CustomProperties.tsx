import { Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form';
import Input from './Input';

const CustomProperties = ({ control, errors }: any) => {

    const [properties, setProperties] = useState<
        { label: string; values: string[] }[]
    >([]);
    const [newLabel, setNewLabel] = useState('');
    const [newValue, setNewValue] = useState('');

  return (
    <div>
        <div className="flex flex-col gap-3">
            <Controller
                name="customProperties"
                control={control}
                render={({ field }) => {
                    useEffect(() => {
                        field.onChange(properties);
                    }, [properties]);

                    const addProperty = () => {
                        if (!newLabel.trim()) return;
                        setProperties([...properties, { label: newLabel, values: [] }]);
                        setNewLabel('');
                    };

                    const addValue = (index: number) => {
                        if (!newValue.trim()) return;
                        const updatedProperties = [...properties];
                        updatedProperties[index].values.push(newValue);
                        setProperties(updatedProperties);
                        setNewValue('');
                    };

                    const removeProperty = (index: number) => {
                        setProperties(properties.filter((_, i) => i !== index));
                    };

                    return (
                        <div className="mt-2">
                            <label className="block font-semibold text-gray-300 mb-1">
                                Custom Properties
                            </label>

                            <div className="flex flex-col gap-3">
                        
                                {properties.map((property, index) => (
                                    <div
                                    key={index}
                                    className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-white font-medium">
                                                {property.label}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeProperty(index)}
                                            >
                                                <X size={18} className="text-red-500" />
                                            </button>
                                        </div>
                                
                                        <div className="flex items-center mt-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter value..."
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addValue(index)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-md"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {property.values.map((value, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-700 px-4 py-2 rounded-md text-white"
                                                >
                                                    {value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        placeholder="Enter property label (e.g: Material, Warranty)"
                                        value={newLabel}
                                        onChange={(e: any) => setNewLabel(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={addProperty}
                                        className="px-3 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2"
                                    >
                                        <Plus /> Add
                                    </button>
                                </div>
                            </div>
                            {errors.customProperties && (
                                <p className="text-error">
                                    {String(errors.customProperties.message)}
                                </p>
                            )}
                        </div>
                    );
                }}
            />
        </div>
    </div>
  )
}

export default CustomProperties