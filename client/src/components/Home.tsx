import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const serverUrl = 'https://passanger-meal.onrender.com';

interface Drink {
    id: string;
    title: string;
    price: number;
    img: string;
}

interface Label {
    id: string;
    label: string;
}

interface Meal {
    id: string;
    title: string;
    starter: string;
    desert: string;
    price: number;
    labels: string[];
    img: string;
    drinks: Drink[];
}

interface Passenger {
    id: string;
    name: string;
    selectedMeals: Meal[];
}

const Home: React.FC = () => {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
    const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
    const [selectedDrinks, setSelectedDrinks] = useState<{ [mealId: string]: Drink | undefined }>({});
    const [allMeals, setAllMeals] = useState<Meal[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [showPassengers, setShowPassengers] = useState(false); // State to toggle showing passengers
    const mealsPerPage = 2;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(`${serverUrl}/dataset`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Dataset response:", response);
                setAllMeals(response.data.meals);
                setMeals(response.data.meals);
                setLabels(response.data.labels);
            } catch (error) {
                console.error('Error fetching data', error);
                navigate('/');
            }

            try {
                const response = await axios.get(`${serverUrl}/passengers`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Passengers response:", response);
                // Initialize passengers with selectedMeals array
                const initialPassengers = response.data.map((passenger: Passenger) => ({
                    ...passenger,
                    selectedMeals: []
                }));
                setPassengers(initialPassengers); // Ensure passengers is initialized with selectedMeals array
            } catch (error) {
                console.error('Error fetching passengers', error);
                navigate('/');
            }
        };

        fetchData();
    }, [navigate]);

    // Calculate the indices of the meals to be displayed on the current page
    const indexOfLastMeal = currentPage * mealsPerPage;
    const indexOfFirstMeal = indexOfLastMeal - mealsPerPage;
    const currentMeals = meals.slice(indexOfFirstMeal, indexOfLastMeal);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Add meal to selected meals for the selected passenger
    const addMealForPassenger = (meal: Meal) => {
        if (selectedPassenger) {
            const updatedPassenger = {
                ...selectedPassenger,
                selectedMeals: [...selectedPassenger.selectedMeals, meal]
            };
            const updatedPassengers = passengers.map(p => (p.id === updatedPassenger.id ? updatedPassenger : p));
            setPassengers(updatedPassengers);
            setSelectedMeals(updatedPassenger.selectedMeals);
        }
    };

    // Remove meal from selected meals for the selected passenger
    const removeMealForPassenger = (meal: Meal) => {
        if (selectedPassenger) {
            const updatedPassenger = {
                ...selectedPassenger,
                selectedMeals: selectedPassenger.selectedMeals.filter(m => m.id !== meal.id)
            };
            const updatedPassengers = passengers.map(p => (p.id === updatedPassenger.id ? updatedPassenger : p));
            setPassengers(updatedPassengers);
            setSelectedMeals(updatedPassenger.selectedMeals);
        }
    };

    // Select a passenger and display their selected meals
    const selectPassenger = (passenger: Passenger) => {
        setSelectedPassenger(passenger);
        setSelectedMeals(passenger.selectedMeals); // Load selected meals for the chosen passenger
    };

    // Add drink to selected drinks for a meal
    const addToSelectedDrinks = (mealId: string, drink: Drink) => {
        setSelectedDrinks({
            ...selectedDrinks,
            [mealId]: drink
        });
    };

    // Filter meals based on label
    const filterMeals = (labelId: string) => {
        if (labelId === 'all') {
            setMeals(allMeals); // Reset meals to all meals from API
        } else {
            const filteredMeals = allMeals.filter(meal => meal.labels.includes(labelId));
            setMeals(filteredMeals);
        }
    };

    // Calculate total cost for a meal including selected drink
    const calculateMealCost = (meal: Meal) => {
        const drinkPrice = selectedDrinks[meal.id]?.price || 0;
        return meal.price + drinkPrice;
    };

    // Calculate total cost for all selected meals across all passengers
    const calculateTotalCost = () => {
        let totalCost = 0;
        passengers.forEach(passenger => {
            totalCost += passenger.selectedMeals.reduce((acc, meal) => {
                const drinkPrice = selectedDrinks[meal.id]?.price || 0;
                return acc + meal.price + drinkPrice;
            }, 0);
        });
        return totalCost;
    };

    return (
        <div className='home'>
            <div className='home-container'>
                <div className='main-section'>
                    <div className='navigate-labels'>
                        <button onClick={() => filterMeals('all')}>Show All</button>
                        {labels.map((label) => (
                            <button key={label.id} onClick={() => filterMeals(label.id)}>{label.label}</button>
                        ))}
                    </div>
                    {currentMeals.map((meal) => (
                        <div key={meal.id} className='meal-card'>
                            <img src={meal.img} alt={meal.title} className='meal-image' />
                            <div className='meal-card-desc'>
                                <h3>{meal.title}</h3>
                                <p>{meal.starter}</p>
                                <p>{meal.desert}</p>
                                <p>Selected Drink: {selectedDrinks[meal.id]?.title || 'None'}</p> {/* Display selected drink */}
                                <div className='drink-list'>
                                    {meal.drinks.map((drink) => (
                                        <div key={drink.id} className='drink-item'>
                                            <p onClick={() => addToSelectedDrinks(meal.id, drink)}
                                                className={selectedDrinks[meal.id]?.id === drink.id ? 'selected' : ''} >{drink.title}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p>Price: ${calculateMealCost(meal).toFixed(2)}</p>
                                    {selectedPassenger && selectedPassenger.selectedMeals.some(m => m.id === meal.id) ? (
                                        <button onClick={() => removeMealForPassenger(meal)}>Remove from Order</button>
                                    ) : (
                                        <button onClick={() => addMealForPassenger(meal)}>Add to Order</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className='pagination'>
                        {Array.from({ length: Math.ceil(meals.length / mealsPerPage) }, (_, index) => (
                            <button key={index} onClick={() => paginate(index + 1)} className='pagination-button'>
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='order-summary'>
                    <div className={`passengers ${showPassengers ? 'open' : ''}`}>
                        <h3 onClick={() => setShowPassengers(!showPassengers)}>Riga - St Petersburg</h3>
                        {showPassengers && (
                            <div className='passenger-list'>
                                {passengers.map((passenger) => (
                                    <div key={passenger.id} onClick={() => selectPassenger(passenger)}>
                                        {passenger.name}
                                        <span className='selected-meals-count'>{passenger.selectedMeals.length}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <h3>Order Summary</h3>
                    {passengers.map((passenger) => (
                        <div key={passenger.id}>
                            <h4>{passenger.name}'s Order:</h4>
                            <ul>
                                {passenger.selectedMeals.map((meal) => (
                                    <li key={meal.id}>{meal.title}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <p>Total Cost: ${calculateTotalCost().toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
