import React from 'react'
import { Controller } from 'react-hook-form';


const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];



const SizeSelector = ({ control, errors }: any) => {
  return (
    <div>
        <label className="block font-semibold text-gray-300 mb-1">Sizes</label>
        <Controller
            name="sizes"
            control={control}
            render={({ field }) => (
            <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                const isSelected = (field.value || []).includes(size);

                return (
                    <button
                    type="button"
                    key={size}
                    onClick={() =>
                        field.onChange(
                        isSelected
                            ? field.value.filter((s: string) => s !== size)
                            : [...(field.value || []), size]
                        )
                    }
                    className={`px-3 py-1 rounded-lg font-Poppins transition-colors ${
                        isSelected
                        ? 'bg-gray-700 text-white border border-[#ffffff6b]'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                    >
                    {size}
                    </button>
                );
                })}
            </div>
            )}
        />
        {errors.sizes && (
            <p className="text-error">{String(errors.sizes.message)}</p>
        )}
    </div>
  )
}

export default SizeSelector