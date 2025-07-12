import React, { useState } from 'react';
import { ShoppingCart, Coffee, MessageSquare, Smile, Droplets } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { OrderFormData, IceCreamFlavor } from '../types';

const OrderForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    chocolate: 0,
    vanilla: 0,
    stracciatella: 0,
    toppings: [],
    drinks: [],
    coffeeType: '',
    remarks: ''
  });
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoffeeTypes, setShowCoffeeTypes] = useState(false);
  const [showSmiley, setShowSmiley] = useState(false);
  const [drinksOnly, setDrinksOnly] = useState(false);
  const [coffeeExtras, setCoffeeExtras] = useState({
    sugar: false,
    milk: false
  });

  const handleNumberChange = (field: keyof OrderFormData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, value)
    }));
  };

  const handleCheckboxChange = (field: 'toppings' | 'drinks', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
    
    if (field === 'drinks') {
      if (value === 'Kaffee') {
        setShowCoffeeTypes(!formData.drinks.includes('Kaffee'));
        if (formData.drinks.includes('Kaffee')) {
          // Reset coffee extras when deselecting coffee
          setCoffeeExtras({ sugar: false, milk: false });
          setFormData(prev => ({ ...prev, coffeeType: '' }));
        }
      }
    }
  };

  const handleDrinksOnlyToggle = () => {
    const newDrinksOnly = !drinksOnly;
    setDrinksOnly(newDrinksOnly);
    
    if (newDrinksOnly) {
      // Reset ice cream and toppings when switching to drinks only
      setFormData(prev => ({
        ...prev,
        chocolate: 0,
        vanilla: 0,
        stracciatella: 0,
        toppings: []
      }));
    }
  };

  const handleCoffeeExtraChange = (extra: 'sugar' | 'milk') => {
    setCoffeeExtras(prev => ({
      ...prev,
      [extra]: !prev[extra]
    }));
  };

  const getScoopText = (count: number) => {
    if (count === 1) return 'Kugel';
    return 'Kugeln';
  };

  const handleSubmit = async () => {
    if (!formData.customerName.trim()) {
      alert('Bitte geben Sie Ihren Namen ein!');
      return;
    }

    if (!supabase) {
      alert('Supabase ist nicht konfiguriert. Bitte verbinde Dich mit Supabase.');
      return;
    }

    const totalScoops = formData.chocolate + formData.vanilla + formData.stracciatella;
    
    if (!drinksOnly && totalScoops === 0) {
      alert('Bitte wähle mindestens eine Kugel Eis oder aktiviere "Nur ein Getränk und kein Eis"!');
      return;
    }

    if (drinksOnly && formData.drinks.length === 0) {
      alert('Bitte wähle mindestens ein Getränk!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const flavors: IceCreamFlavor[] = [];
      if (!drinksOnly) {
        if (formData.chocolate > 0) flavors.push({ name: 'Schokolade', scoops: formData.chocolate });
        if (formData.vanilla > 0) flavors.push({ name: 'Vanille', scoops: formData.vanilla });
        if (formData.stracciatella > 0) flavors.push({ name: 'Stracciatella', scoops: formData.stracciatella });
      }

      // Build coffee type with extras
      let finalCoffeeType = formData.coffeeType;
      if (formData.coffeeType && (coffeeExtras.sugar || coffeeExtras.milk)) {
        const extras = [];
        if (coffeeExtras.sugar) extras.push('mit Zucker');
        if (coffeeExtras.milk) extras.push('mit Milch');
        if (extras.length > 0) {
          finalCoffeeType = `${formData.coffeeType} (${extras.join(', ')})`;
        }
      }

      const orderData = {
        customer_name: formData.customerName,
        flavors: JSON.stringify(flavors),
        toppings: JSON.stringify(drinksOnly ? [] : formData.toppings),
        drinks: JSON.stringify(formData.drinks),
        coffee_type: finalCoffeeType || null,
        remarks: formData.remarks,
        created_at: new Date().toISOString(),
        drinks_only: drinksOnly
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) {
        console.error('Fehler beim Senden der Bestellung:', error);
        alert('Fehler beim Senden der Bestellung. Bitte versuche es erneut.');
      } else {
        alert('Bestellung erfolgreich gesendet!');
        // Reset form
        setFormData({
          customerName: '',
          chocolate: 0,
          vanilla: 0,
          stracciatella: 0,
          toppings: [],
          drinks: [],
          coffeeType: '',
          remarks: ''
        });
        setShowCoffeeTypes(false);
        setDrinksOnly(false);
        setCoffeeExtras({ sugar: false, milk: false });
      }
    } catch (error) {
      console.error('Fehler:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Receipt = () => {
    const totalScoops = formData.chocolate + formData.vanilla + formData.stracciatella;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-2xl font-bold mb-4 text-center gradient-text">Rechnung</h3>
          
          <div className="space-y-2">
            {!drinksOnly && totalScoops > 0 && (
              <div className="border-b pb-2">
                <h4 className="font-semibold text-green-600">Eis ({totalScoops} {getScoopText(totalScoops)})</h4>
                {formData.chocolate > 0 && (
                  <div className="flex justify-between">
                    <span>{formData.chocolate}x Schokolade</span>
                  </div>
                )}
                {formData.vanilla > 0 && (
                  <div className="flex justify-between">
                    <span>{formData.vanilla}x Vanille</span>
                  </div>
                )}
                {formData.stracciatella > 0 && (
                  <div className="flex justify-between">
                    <span>{formData.stracciatella}x Stracciatella</span>
                  </div>
                )}
              </div>
            )}
            
            {!drinksOnly && formData.toppings.length > 0 && (
              <div className="border-b pb-2">
                <h4 className="font-semibold text-green-600">Toppings</h4>
                {formData.toppings.map(topping => (
                  <div key={topping} className="flex justify-between">
                    <span>{topping}</span>
                  </div>
                ))}
              </div>
            )}
            
            {formData.drinks.length > 0 && (
              <div className="border-b pb-2">
                <h4 className="font-semibold text-green-600">Getränke</h4>
                {formData.drinks.map(drink => (
                  <div key={drink} className="flex justify-between">
                    <span>
                      {drink === 'Kaffee' && formData.coffeeType 
                        ? `${formData.coffeeType}${(coffeeExtras.sugar || coffeeExtras.milk) 
                            ? ` (${[coffeeExtras.sugar && 'mit Zucker', coffeeExtras.milk && 'mit Milch'].filter(Boolean).join(', ')})` 
                            : ''}`
                        : drink}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {drinksOnly && (
              <div className="bg-blue-50 p-2 rounded text-center text-sm text-blue-700">
                Nur Getränk - Kein Eis
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowReceipt(false)}
            className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 gradient-text">
          Bestellung
        </h1>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 border-2 border-green-100">
          {/* Name */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-green-600">
              Ihr Name:
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="Bitte geben Sie Ihren Namen ein"
            />
          </div>

          {/* Eissorten */}
          <div className={`mb-6 transition-opacity ${drinksOnly ? 'opacity-30 pointer-events-none' : ''}`}>
            <h3 className="text-xl font-semibold mb-4 text-green-600 flex items-center">
              <ShoppingCart className="mr-2" />
              Eissorten wählen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Schokolade', key: 'chocolate' },
                { name: 'Vanille', key: 'vanilla' },
                { name: 'Stracciatella', key: 'stracciatella' }
              ].map(flavor => (
                <div key={flavor.key} className="border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{flavor.name}</h4>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleNumberChange(flavor.key as keyof OrderFormData, formData[flavor.key as keyof OrderFormData] as number - 1)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      disabled={drinksOnly}
                    >
                      -
                    </button>
                    <span className="mx-4 text-lg font-semibold">
                      {formData[flavor.key as keyof OrderFormData]} {getScoopText(formData[flavor.key as keyof OrderFormData] as number)}
                    </span>
                    <button
                      onClick={() => handleNumberChange(flavor.key as keyof OrderFormData, formData[flavor.key as keyof OrderFormData] as number + 1)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      disabled={drinksOnly}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Toppings */}
          <div className={`mb-6 transition-opacity ${drinksOnly ? 'opacity-30 pointer-events-none' : ''}`}>
            <h3 className="text-xl font-semibold mb-4 text-green-600">Toppings</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Waffeln', 'Schokoladensoße', 'Sahne', 'Bunte Streusel'].map(topping => (
                <label key={topping} className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.toppings.includes(topping)}
                      onChange={() => handleCheckboxChange('toppings', topping)}
                      disabled={drinksOnly}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                      formData.toppings.includes(topping) 
                        ? 'bg-green-600 border-green-600' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {formData.toppings.includes(topping) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span>{topping}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Getränke */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 flex items-center">
              <Coffee className="mr-2" />
              Getränke
            </h3>
            
            <div className="space-y-2">
              {['Wasser', 'Cola', 'Kaffee'].map(drink => (
                <label key={drink} className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.drinks.includes(drink)}
                      onChange={() => handleCheckboxChange('drinks', drink)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                      formData.drinks.includes(drink) 
                        ? 'bg-green-600 border-green-600' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {formData.drinks.includes(drink) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span>{drink}</span>
                </label>
              ))}
              
              {/* Nur Getränke Option */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={drinksOnly}
                    onChange={handleDrinksOnlyToggle}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                    drinksOnly 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {drinksOnly && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span>Ich möchte nur Getränke und kein Eis</span>
              </label>
            </div>
            
            {showCoffeeTypes && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">Kaffee-Art wählen:</h4>
                <div className="space-y-2 mb-4">
                  {['Espresso', 'Cappuccino', 'Latte Macchiato', 'Americano', 'Crema', 'Lungo'].map(coffeeType => (
                    <label key={coffeeType} className="flex items-center space-x-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="coffeeType"
                          value={coffeeType}
                          checked={formData.coffeeType === coffeeType}
                          onChange={(e) => setFormData(prev => ({ ...prev, coffeeType: e.target.value }))}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                          formData.coffeeType === coffeeType 
                            ? 'bg-green-600 border-green-600' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {formData.coffeeType === coffeeType && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <span>{coffeeType}</span>
                    </label>
                  ))}
                </div>

                {formData.coffeeType && (
                  <div className="border-t pt-3">
                    <h5 className="font-semibold mb-2 text-sm">Extras:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'sugar', label: 'Mit Zucker' },
                        { key: 'milk', label: 'Mit Milch' }
                      ].map(extra => (
                        <label key={extra.key} className="flex items-center space-x-2 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={coffeeExtras[extra.key as keyof typeof coffeeExtras]}
                              onChange={() => handleCoffeeExtraChange(extra.key as 'sugar' | 'milk')}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                              coffeeExtras[extra.key as keyof typeof coffeeExtras] 
                                ? 'bg-green-600 border-green-600' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {coffeeExtras[extra.key as keyof typeof coffeeExtras] && (
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-sm">{extra.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Bemerkungen */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 flex items-center">
              <MessageSquare className="mr-2" />
              Bemerkungen
            </h3>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
              rows={3}
              placeholder="Besondere Wünsche oder Anmerkungen..."
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? 'Wird gesendet...' : 'Bestellung absenden✔️'}
            </button>
            <button
              onClick={() => setShowSmiley(true)}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Rechnung anzeigen✔️
            </button>
          </div>
        </div>
      </div>
      
      {showReceipt && <Receipt />}
      
      {/* Smiley Modal */}
      {showSmiley && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            <div className="text-8xl mb-4">😊</div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Überraschung!</h3>
            <p className="text-gray-600 mb-6">
              Vielen Dank für Deine Bestellung! Wir freuen uns das Du da bist! 🍦
            </p>
            <button
              onClick={() => setShowSmiley(false)}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
