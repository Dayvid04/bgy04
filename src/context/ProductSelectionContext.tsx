import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductSelection {
  size: number | null;
  color: string;
  sizes: Record<number, number>;
}

interface ProductSelectionContextType {
  selections: Record<string, ProductSelection>;
  updateSelection: (productId: string, selection: Partial<ProductSelection>) => void;
}

const ProductSelectionContext = createContext<ProductSelectionContextType | undefined>(undefined);

export const ProductSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<Record<string, ProductSelection>>({});

  const updateSelection = (productId: string, selection: Partial<ProductSelection>) => {
    setSelections(current => ({
      ...current,
      [productId]: {
        size: current[productId]?.size ?? null,
        color: current[productId]?.color ?? 'Standard',
        sizes: current[productId]?.sizes ?? {},
        ...selection,
      },
    }));
  };

  return (
    <ProductSelectionContext.Provider value={{ selections, updateSelection }}>
      {children}
    </ProductSelectionContext.Provider>
  );
};

export const useProductSelection = (productId: string, defaultColor = 'Standard') => {
  const context = useContext(ProductSelectionContext);
  if (!context) throw new Error('useProductSelection must be used within ProductSelectionProvider');

  const selection = context.selections[productId];
  return {
    selectedSize: selection?.size ?? null,
    selectedColor: selection?.color && selection.color !== 'Standard' ? selection.color : defaultColor,
    selectedSizes: selection?.sizes && Object.keys(selection.sizes).length > 0
      ? selection.sizes
      : selection?.size
        ? { [selection.size]: 1 }
        : {},
    setSelectedSize: (size: number | null) => context.updateSelection(productId, { size }),
    setSelectedColor: (color: string) => context.updateSelection(productId, { color }),
    setSelectedSizes: (sizes: Record<number, number>) => context.updateSelection(productId, { sizes }),
  };
};