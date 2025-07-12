import React, { useState } from 'react';
import OrderForm from './components/OrderForm';
import KitchenView from './components/KitchenView';
import { ChefHat, ShoppingCart, Lock } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'order' | 'kitchen'>('order');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [isKitchenUnlocked, setIsKitchenUnlocked] = useState(false);

  const handleKitchenAccess = () => {
    setShowPasswordPrompt(true);
  };

  const checkPassword = () => {
    if (password === 'küche2024') {
      setIsKitchenUnlocked(true);
      setCurrentView('kitchen');
      setShowPasswordPrompt(false);
      setPassword('');
    } else {
      alert('Falsches Passwort!');
      setPassword('');
    }
  };

  const handleViewChange = (view: 'order' | 'kitchen') => {
    if (view === 'kitchen' && !isKitchenUnlocked) {
      handleKitchenAccess();
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-green-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold gradient-text">TiJa Eiscafé</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleViewChange('order')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'order' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                <ShoppingCart size={18} />
                <span>Bestellung</span>
              </button>
              <button
                onClick={() => handleViewChange('kitchen')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'kitchen' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {isKitchenUnlocked ? <ChefHat size={18} /> : <Lock size={18} />}
                <span>Küche</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentView === 'order' ? <OrderForm /> : <KitchenView />}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-center gradient-text">Küchen-Zugang</h3>
            <p className="text-gray-600 mb-4 text-center">
              Bitte gib das Küchen-Passwort ein:
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
              className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none mb-4"
              placeholder="Passwort eingeben..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={checkPassword}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Bestätigen
              </button>
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPassword('');
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;