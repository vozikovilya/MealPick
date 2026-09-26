import { useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Plus, X, Image } from 'lucide-react';

interface Props {
  onDone: () => void;
}

export function AddRecipe({ onDone }: Props) {
  const { addRecipe } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    addRecipe({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      ingredients,
      mealType,
    });
    onDone();
  };

  const mealOptions = [
    { value: 'breakfast' as const, label: '🌅 Завтрак' },
    { value: 'lunch' as const, label: '☀️ Обед' },
    { value: 'dinner' as const, label: '🌙 Ужин' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onDone} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Новый рецепт</h2>
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Image className="w-4 h-4" /> Фото блюда
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
        />
        {imageUrl && (
          <div className="w-full h-32 rounded-xl overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Название блюда</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Паста Карбонара"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Краткое описание блюда..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm resize-none"
        />
      </div>

      {/* Meal Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Тип приёма пищи</label>
        <div className="flex gap-2">
          {mealOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setMealType(option.value)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                mealType === option.value
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ингредиенты</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
            placeholder="Добавить ингредиент"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
          />
          <button
            onClick={handleAddIngredient}
            className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {ingredients.map((ing, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm"
            >
              {ing}
              <button onClick={() => handleRemoveIngredient(index)} className="hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Сохранить рецепт
      </button>
    </div>
  );
}
