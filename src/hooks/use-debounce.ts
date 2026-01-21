import { useEffect, useState } from "react";

/**
 * Hook personalizado para debouncing de valores
 * @param value Valor a realizar debounce
 * @param delay Retardo en milisegundos
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Actualizar el valor después del delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancelar el timeout si el valor cambia antes de que termine el delay
        // o si el componente se desmonta
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
