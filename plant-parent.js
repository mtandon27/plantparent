import React, { useState } from 'react';
import { Droplets, Calendar, Leaf, CheckCircle, PlusCircle, Camera } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const PlantParent = () => {
  const [plants, setPlants] = useState([
    {
      id: 1,
      name: "Monstera Deliciosa",
      lastWatered: "2024-02-15",
      wateringInterval: 7,
      photos: [],
      tips: "Loves bright, indirect light. Water when top 2-3 inches of soil is dry.",
      tasks: [
        { id: 1, text: "Water plant", completed: false, due: "2024-02-22" },
        { id: 2, text: "Mist leaves", completed: false, due: "2024-02-20" }
      ]
    }
  ]);

  const [selectedPlant, setSelectedPlant] = useState(plants[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');

  const completeTask = (plantId, taskId) => {
    setPlants(plants.map(plant => {
      if (plant.id === plantId) {
        return {
          ...plant,
          tasks: plant.tasks.map(task => 
            task.id === taskId ? { ...task, completed: true } : task
          )
        };
      }
      return plant;
    }));
  };

  const addPlant = () => {
    if (!newPlantName) return;
    
    const newPlant = {
      id: plants.length + 1,
      name: newPlantName,
      lastWatered: new Date().toISOString().split('T')[0],
      wateringInterval: 7,
      photos: [],
      tips: "Add care instructions for your plant.",
      tasks: []
    };

    setPlants([...plants, newPlant]);
    setNewPlantName('');
    setShowAddForm(false);
  };

  const addPhoto = (plantId) => {
    const mockPhoto = {
      id: Math.random(),
      url: "/api/placeholder/150/150",
      date: new Date().toISOString().split('T')[0]
    };

    setPlants(plants.map(plant => {
      if (plant.id === plantId) {
        return {
          ...plant,
          photos: [...plant.photos, mockPhoto]
        };
      }
      return plant;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="text-green-500" />
          Plant Parent
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          <PlusCircle size={20} />
          Add Plant
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newPlantName}
                    onChange={(e) => setNewPlantName(e.target.value)}
                    placeholder="Enter plant name"
                    className="flex-1 p-2 rounded-lg border"
                  />
                  <button
                    onClick={addPlant}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="grid md:grid-cols-2 gap-6">
        {plants.map((plant, index) => (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-green-50">
                <CardTitle>{plant.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Droplets className="text-blue-500" />
                  Last watered: {plant.lastWatered}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Tasks</h3>
                  {plant.tasks.map(task => (
                    <motion.div
                      key={task.id}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          task.completed ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <span className={task.completed ? 'line-through text-gray-500' : ''}>
                          {task.text} - Due: {task.due}
                        </span>
                        {!task.completed && (
                          <button
                            onClick={() => completeTask(plant.id, task.id)}
                            className="text-green-500 hover:text-green-600"
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Growth Timeline</h3>
                    <button
                      onClick={() => addPhoto(plant.id)}
                      className="text-green-500 hover:text-green-600"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {plant.photos.map(photo => (
                      <motion.img
                        key={photo.id}
                        src={photo.url}
                        alt="Plant progress"
                        className="w-24 h-24 rounded-lg object-cover"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="font-medium mb-1">Care Tips</h3>
                  <p className="text-sm text-gray-600">{plant.tips}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PlantParent;

npm start;
