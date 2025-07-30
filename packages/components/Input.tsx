import {forwardRef, InputHTMLAttributes, Ref, TextareaHTMLAttributes, useId } from 'react';


interface BaseProps {
  label?: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'textarea' | 'datetime-local';
  className?: string;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLElement, Props>(
  ({ label, type = 'text', className='', ...props }, ref) => {
    const componentId = useId();
    const id = props.id || componentId;
    const sharedClasses ='w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white';
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block font-semibold text-gray-300 mb-1">
                    {label}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    ref={ref as Ref<HTMLTextAreaElement>}
                    className={`${sharedClasses} ${className}`}
                    {...(props as TextareaProps)}
                />
            ) : (
                <input
                    id={id}
                    type={type}
                    ref={ref as Ref<HTMLInputElement>}
                    {...(props as InputProps)}
                    className={`${sharedClasses} ${className}`}
                />
            )}
        </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;