import { useState, useRef, useEffect } from 'react';
import { useStore, useAllMealTypes, useCollectionMealTypes } from '../store';
import { Ingredient, CookingStep, Recipe } from '../types';
import { ArrowLeft, Plus, X, Image as ImageIcon, Upload, Trash2, Link2, ChefHat, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecipeImage, getRecipeImages } from '../utils';

interface Props {
  onDone: () => void;
  editRecipe?: Recipe | null;
}

export function AddRecipe({ onDone, editRecipe }: Props) {
  const { addRecipe, updateRecipe, users, currentUserId } = useStore();
  const allMealTypes = useAllMealTypes();
  const collectionMealTypes = useCollectionMealTypes();
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) : null;
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [videoUrl, setVideoUrl] = useState('');
  const [mealType, setMealType] = useState(allMealTypes[0]?.id || 'breakfast');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([]);
  const [pairedRecipeIds, setPairedRecipeIds] = useState<string[]>([]);
  const [showMealTypeInput, setShowMealTypeInput] = useState(false);
  const [newMealTypeName, setNewMealTypeName] = useState('');
  const [newMealTypeEmoji, setNewMealTypeEmoji] = useState('🍽️');
  const [newMealTypeCollection, setNewMealTypeCollection] = useState(false);

  // Ingredient form
  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('');
  const [ingUnit, setIngUnit] = useState('');
  const [ingToTaste, setIngToTaste] = useState(false);

  // Step form
  const [stepTitle, setStepTitle] = useState('');
  const [stepText, setStepText] = useState('');
  const [stepImageUrl, setStepImageUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with edit data
  useEffect(() => {
    if (editRecipe) {
      setName(editRecipe.name);
      setDescription(editRecipe.description);
      setImageUrls(editRecipe.imageUrls.length > 0 ? editRecipe.imageUrls : ['']);
      setVideoUrl(editRecipe.videoUrl || '');
      setMealType(editRecipe.mealType);
      setIngredients(editRecipe.ingredients || []);
      setCookingSteps(editRecipe.cookingSteps || []);
      setPairedRecipeIds(editRecipe.pairedRecipeIds || []);
    }
  }, [editRecipe]);

  const handleAddIngredient = () => {
    if (!ingName.trim()) return;
    const newIng: Ingredient = {
      id: `ing_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: ingName.trim(),
      amount: ingToTaste ? 'по вкусу' : ingAmount.trim() || undefined,
      unit: ingToTaste ? undefined : ingUnit.trim() || undefined,
    };
    setIngredients([...ingredients, newIng]);
    setIngName('');
    setIngAmount('');
    setIngUnit('');
    setIngToTaste(false);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleAddStep = () => {
    if (!stepText.trim()) return;
    const newStep: CookingStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: stepTitle.trim() || `Шаг ${cookingSteps.length + 1}`,
      text: stepText.trim(),
      imageUrl: stepImageUrl.trim() || undefined,
    };
    setCookingSteps([...cookingSteps, newStep]);
    setStepTitle(`Шаг ${cookingSteps.length + 2}`);
    setStepText('');
    setStepImageUrl('');
  };

  const handleRemoveStep = (id: string) => {
    setCookingSteps(cookingSteps.filter((s) => s.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (file.type.startsWith('video/')) {
          setVideoUrl(result);
        } else {
          setImageUrls((prev) => {
            const filtered = prev.filter((url) => url.trim());
            return [...filtered, result];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStepFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setStepImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const handleAddCustomMealType = () => {
    if (!newMealTypeName.trim()) return;
    const { addCustomMealType } = useStore.getState();
    addCustomMealType(newMealTypeName.trim(), newMealTypeEmoji, newMealTypeCollection);
    setNewMealTypeName('');
    setNewMealTypeEmoji('🍽️');
    setNewMealTypeCollection(false);
    setShowMealTypeInput(false);
  };

  const togglePairedRecipe = (recipeId: string) => {
    setPairedRecipeIds((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const validUrls = imageUrls.filter((url) => url.trim());
    const recipeData = {
      name: name.trim(),
      description: description.trim(),
      imageUrls: validUrls.length > 0 ? validUrls : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
      videoUrl: videoUrl.trim() || undefined,
      ingredients,
      mealType,
      cookingSteps: cookingSteps.length > 0 ? cookingSteps : undefined,
      pairedRecipeIds: pairedRecipeIds.length > 0 ? pairedRecipeIds : undefined,
    };

    if (editRecipe) {
      updateRecipe(editRecipe.id, recipeData);
    } else {
      addRecipe(recipeData);
    }
    onDone();
  };

  const formatIngredient = (ing: Ingredient) => {
    if (ing.amount && ing.unit) return `${ing.name} — ${ing.amount} ${ing.unit}`;
    if (ing.amount) return `${ing.name} — ${ing.amount}`;
    return ing.name;
  };

  // Получаем блюда из подборок для pairing
  const collectionRecipes = collectionMealTypes.flatMap((mt) =>
    (currentUser?.recipes || []).filter((r) => r.mealType === mt.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          {editRecipe ? 'Редактировать блюдо' : 'Новое блюдо'}
        </h2>
      </div>

      {/* ========== БЛОК: Фото и видео ========== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Фото и видео</h3>
        </div>
        
        <div className="space-y-3">
          {/* File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-orange-200 rounded-xl text-sm text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Загрузить фото или видео из файлов
          </button>

          {/* Image URLs */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <Link2 className="w-3 h-3" /> Или добавьте ссылки на фото
            </label>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      onClick={() => removeImageField(index)}
                      className="px-2 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            <button
              onClick={addImageField}
              className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Добавить ещё ссылку
            </button>

            {/* Previews */}
            {imageUrls.some((url) => url.trim()) && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls
                  .filter((url) => url.trim())
                  .map((url, index) => (
                    <div key={index} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Video */}
          {videoUrl && (
            <div>
              <video src={videoUrl} controls className="w-full rounded-lg max-h-32" />
            </div>
          )}
        </div>
      </div>

      {/* ========== БЛОК: Название ========== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-sm">✏️</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Название</h3>
        </div>
        
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Паста Карбонара"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание блюда..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm resize-none"
          />
        </div>
      </div>

      {/* ========== БЛОК: Категория ========== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-sm">📋</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Категория</h3>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {allMealTypes.map((option) => (
              <button
                key={option.id}
                onClick={() => setMealType(option.id)}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                  mealType === option.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.emoji} {option.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowMealTypeInput(!showMealTypeInput)}
            className="w-full py-2 text-sm text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1"
          >
            {showMealTypeInput ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Добавить свою категорию
          </button>
          
          <AnimatePresence>
            {showMealTypeInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-orange-50 rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMealTypeEmoji}
                      onChange={(e) => setNewMealTypeEmoji(e.target.value)}
                      className="w-16 px-3 py-2 rounded-lg border border-orange-200 text-center text-lg"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      value={newMealTypeName}
                      onChange={(e) => setNewMealTypeName(e.target.value)}
                      placeholder="Название"
                      className="flex-1 px-3 py-2 rounded-lg border border-orange-200 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={newMealTypeCollection}
                      onChange={(e) => setNewMealTypeCollection(e.target.checked)}
                      className="rounded text-orange-500"
                    />
                    Это подборка (как гарниры, десерты)
                  </label>
                  <button
                    onClick={handleAddCustomMealType}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
                  >
                    Добавить
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paired Recipes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <ChefHat className="w-3 h-3" /> Подать с...
              <span className="text-[10px] text-gray-400 font-normal">(из подборок)</span>
            </label>
            {collectionRecipes.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {collectionRecipes.map((recipe) => {
                  const mt = collectionMealTypes.find((m) => m.id === recipe.mealType);
                  const isSelected = pairedRecipeIds.includes(recipe.id);
                  return (
                    <button
                      key={recipe.id}
                      onClick={() => togglePairedRecipe(recipe.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                        isSelected
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <img
                        src={getRecipeImage(recipe)}
                        alt={recipe.name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-800 truncate">{recipe.name}</p>
                        <p className="text-[9px] text-gray-500">{mt?.emoji} {mt?.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Нет блюд в подборках</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== БЛОК: Ингредиенты ========== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-sm">🥘</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Ингредиенты</h3>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <input
              type="text"
              value={ingName}
              onChange={(e) => setIngName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
              placeholder="Продукт (например: Куриная грудка)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ingAmount}
                  onChange={(e) => setIngAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="Кол-во"
                  disabled={ingToTaste}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
                <input
                  type="text"
                  value={ingUnit}
                  onChange={(e) => setIngUnit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="Ед. (г, шт, ст.л.)"
                  disabled={ingToTaste}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ingToTaste}
                  onChange={(e) => {
                    setIngToTaste(e.target.checked);
                    if (e.target.checked) {
                      setIngAmount('');
                      setIngUnit('');
                    }
                  }}
                  className="rounded text-orange-500"
                />
                <span>По вкусу</span>
              </label>
            </div>
            <button
              onClick={handleAddIngredient}
              className="w-full py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <span
                  key={ing.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm"
                >
                  {formatIngredient(ing)}
                  <button onClick={() => handleRemoveIngredient(ing.id)} className="hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== БЛОК: Способ приготовления ========== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-sm">👨‍🍳</span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Способ приготовления</h3>
            <span className="text-xs text-gray-400 font-normal">(необязательно)</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {cookingSteps.length > 0 && (
            <div className="space-y-2">
              {cookingSteps.map((s, index) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{s.title}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{s.text}</p>
                    {s.imageUrl && (
                      <img src={s.imageUrl} alt={s.title} className="mt-2 w-full h-16 object-cover rounded-lg" />
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveStep(s.id)}
                    className="flex-shrink-0 p-1 text-red-400 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <input
              type="text"
              value={stepTitle}
              onChange={(e) => setStepTitle(e.target.value)}
              placeholder={cookingSteps.length === 0 ? 'Шаг' : `Шаг ${cookingSteps.length + 1}`}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
            />
            <textarea
              value={stepText}
              onChange={(e) => setStepText(e.target.value)}
              placeholder={`Что делать на этом шаге...`}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={stepImageUrl}
                onChange={(e) => setStepImageUrl(e.target.value)}
                placeholder="Ссылка на фото"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
              <input
                type="file"
                ref={stepFileInputRef}
                onChange={handleStepFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => stepFileInputRef.current?.click()}
                className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                title="Загрузить фото"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddStep}
              disabled={!stepText.trim()}
              className="w-full py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Добавить шаг
            </button>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {editRecipe ? 'Сохранить изменения' : 'Сохранить блюдо'}
      </button>
    </div>
  );
}
