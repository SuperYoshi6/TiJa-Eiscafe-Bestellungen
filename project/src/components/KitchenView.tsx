import React, { useState, useEffect } from 'react';
import { Clock, Trash2, User, MessageSquare } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Order } from '../types';

const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Aktualisierung alle 1 Sekunde
    const interval = setInterval(() => {
      fetchOrders();
    }, 1000);
    
    // Cleanup nach 30 Minuten alte Bestellungen
    const cleanupInterval = setInterval(() => {
      cleanupOldOrders();
    }, 60000); // Prüfe jede Minute
    
    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, []);

  const fetchOrders = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der Bestellungen:', error);
      } else {
        const formattedOrders = data?.map(order => ({
          id: order.id,
          customerName: order.customer_name,
          flavors: JSON.parse(order.flavors || '[]'),
          toppings: JSON.parse(order.toppings || '[]'),
          drinks: JSON.parse(order.drinks || '[]'),
          coffeeType: order.coffee_type,
          remarks: order.remarks || '',
          createdAt: order.created_at,
          drinksOnly: order.drinks_only || false
        })) || [];
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOldOrders = async () => {
    if (!supabase) return;
    
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .lt('created_at', thirtyMinutesAgo);

      if (error) {
        console.error('Fehler beim Löschen alter Bestellungen:', error);
      }
    } catch (error) {
      console.error('Fehler beim Cleanup:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Fehler beim Löschen der Bestellung:', error);
      } else {
        setOrders(orders.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeSinceOrder = (dateString: string) => {
    const orderTime = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Gerade eben';
    if (diffMinutes === 1) return '1 Minute';
    return `${diffMinutes} Minuten`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Bestellungen werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">
            Küche - Bestellungen
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-600">
              <Clock className="mr-2" />
              <span className="text-sm">
                Auto-Update alle 1 Sekunde
              </span>
            </div>
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <span className="text-green-800 font-semibold">
                {orders.length} {orders.length === 1 ? 'Bestellung' : 'Bestellungen'}
              </span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Keine Bestellungen
            </h2>
            <p className="text-gray-500">
              Sobald neue Bestellungen eingehen, werden sie hier angezeigt.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border-2 border-green-200 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-green-600">
                      <User className="mr-2" />
                      <h3 className="text-xl font-bold">{order.customerName}</h3>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(order.createdAt)} ({getTimeSinceOrder(order.createdAt)} her)
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => order.id && deleteOrder(order.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                      title="Bestellung löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Eis - nur anzeigen wenn nicht "Nur Getränke" */}
                  {!order.drinksOnly && order.flavors.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">Eis</h4>
                      {order.flavors.map((flavor, index) => (
                        <div key={index} className="text-sm">
                          {flavor.scoops}x {flavor.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Toppings - nur anzeigen wenn nicht "Nur Getränke" */}
                  {!order.drinksOnly && order.toppings.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700 mb-2">Toppings</h4>
                      {order.toppings.map((topping, index) => (
                        <div key={index} className="text-sm">
                          {topping}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Getränke */}
                  {order.drinks.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">Getränke</h4>
                      {order.drinks.map((drink, index) => (
                        <div key={index} className="text-sm">
                          {drink === 'Kaffee' && order.coffeeType ? order.coffeeType : drink}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nur Getränke Hinweis */}
                  {order.drinksOnly && (
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700 mb-2">🥤 Nur Getränke</h4>
                      <p className="text-sm text-blue-600">Kein Eis bestellt</p>
                    </div>
                  )}
                </div>

                {/* Bemerkungen */}
                {order.remarks && (
                  <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-700 mb-2 flex items-center">
                      <MessageSquare className="mr-2" size={16} />
                      Bemerkungen
                    </h4>
                    <p className="text-sm text-yellow-800">{order.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenView;